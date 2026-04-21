#!/usr/bin/env bash
# =============================================================================
# SatoshiBin / PayFile — Production Deployment Script
# Usage: ./deploy.sh yourdomain.com your@email.com
# =============================================================================
set -e

DOMAIN=${1:-""}
EMAIL=${2:-""}
COMPOSE="docker compose"

# ── Colour helpers ─────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
info()    { echo -e "${CYAN}[INFO]${NC}  $1"; }
success() { echo -e "${GREEN}[OK]${NC}    $1"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $1"; }
error()   { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# ── Prerequisite checks ────────────────────────────────────────────────────────
info "Checking prerequisites..."
command -v docker  >/dev/null 2>&1 || error "Docker not found. Install: https://docs.docker.com/get-docker/"
command -v openssl >/dev/null 2>&1 || error "openssl not found."
docker compose version >/dev/null 2>&1 || COMPOSE="docker-compose"
success "Docker and compose found."

# ── Require .env ───────────────────────────────────────────────────────────────
if [ ! -f ".env" ]; then
  cp .env.example .env
  error ".env not found — copied .env.example to .env. Fill it in and re-run."
fi

# ── Load .env ──────────────────────────────────────────────────────────────────
export $(grep -v '^#' .env | grep -v '^$' | xargs)

# ── Domain resolution ──────────────────────────────────────────────────────────
DOMAIN=${DOMAIN:-${DOMAIN_ENV:-""}}
EMAIL=${EMAIL:-${OWNER_EMAIL:-""}}

if [ -z "$DOMAIN" ]; then
  warn "No domain provided. Running in HTTP-only / localhost mode."
  SSL=false
else
  info "Domain: $DOMAIN"
  SSL=true
fi

# ── Write DOMAIN to .env if not already there ──────────────────────────────────
if ! grep -q "^DOMAIN=" .env; then
  echo "DOMAIN=${DOMAIN}" >> .env
  info "Added DOMAIN=${DOMAIN} to .env"
else
  sed -i.bak "s|^DOMAIN=.*|DOMAIN=${DOMAIN}|" .env && rm -f .env.bak
fi

# Update FRONTEND_URL and BACKEND_URL
if [ "$SSL" = true ]; then
  sed -i.bak "s|^FRONTEND_URL=.*|FRONTEND_URL=https://${DOMAIN}|" .env && rm -f .env.bak
  sed -i.bak "s|^BACKEND_URL=.*|BACKEND_URL=https://${DOMAIN}|"   .env && rm -f .env.bak
fi

# ── Create required directories ────────────────────────────────────────────────
info "Creating required directories..."
mkdir -p nginx/certbot/conf nginx/certbot/www nginx/certbot/conf/live

# ── Generate JWT secret if placeholder ────────────────────────────────────────
JWT_VAL=$(grep "^JWT_SECRET=" .env | cut -d'=' -f2)
if [ -z "$JWT_VAL" ] || [ "$JWT_VAL" = "your_jwt_secret_here" ]; then
  NEW_SECRET=$(openssl rand -hex 32)
  sed -i.bak "s|^JWT_SECRET=.*|JWT_SECRET=${NEW_SECRET}|" .env && rm -f .env.bak
  success "Generated new JWT_SECRET."
fi

# ── Generate webhook secret if placeholder ─────────────────────────────────────
WH_VAL=$(grep "^BITCART_WEBHOOK_SECRET=" .env | cut -d'=' -f2)
if [ -z "$WH_VAL" ] || [ "$WH_VAL" = "your_webhook_secret_here" ]; then
  NEW_WH=$(openssl rand -hex 16)
  sed -i.bak "s|^BITCART_WEBHOOK_SECRET=.*|BITCART_WEBHOOK_SECRET=${NEW_WH}|" .env && rm -f .env.bak
  success "Generated new BITCART_WEBHOOK_SECRET."
fi

# ── SSL Certificate Setup ──────────────────────────────────────────────────────
if [ "$SSL" = true ]; then
  CERT_PATH="nginx/certbot/conf/live/${DOMAIN}/fullchain.pem"

  if [ -f "$CERT_PATH" ]; then
    success "SSL certificate already exists for ${DOMAIN}."
  else
    info "Obtaining SSL certificate for ${DOMAIN} via Let's Encrypt..."

    # Step 1: Start nginx in HTTP-only mode to answer ACME challenge
    # We temporarily replace the nginx template with an HTTP-only version
    cat > nginx/templates/default.conf.template.tmp << HTTPCONF
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    location / { return 200 "Initialising SSL...\n"; add_header Content-Type text/plain; }
}
HTTPCONF
    # Start just nginx and certbot for the ACME challenge
    $COMPOSE up -d nginx certbot || true
    sleep 5

    # Step 2: Request the certificate
    docker run --rm \
      -v "$(pwd)/nginx/certbot/conf:/etc/letsencrypt" \
      -v "$(pwd)/nginx/certbot/www:/var/www/certbot" \
      certbot/certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        --email "${EMAIL}" \
        --agree-tos \
        --no-eff-email \
        -d "${DOMAIN}" \
        -d "www.${DOMAIN}" \
        --non-interactive \
      && success "SSL certificate obtained for ${DOMAIN}!" \
      || error "Certbot failed. Make sure ${DOMAIN} points to this server's IP and port 80 is open."

    # Clean up temp config
    rm -f nginx/templates/default.conf.template.tmp

    $COMPOSE down
  fi
fi

# ── For localhost/no-domain: generate self-signed cert ────────────────────────
if [ "$SSL" = false ]; then
  warn "No domain — generating self-signed certificate for localhost."
  mkdir -p nginx/certbot/conf/live/localhost
  if [ ! -f "nginx/certbot/conf/live/localhost/fullchain.pem" ]; then
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
      -keyout nginx/certbot/conf/live/localhost/privkey.pem \
      -out    nginx/certbot/conf/live/localhost/fullchain.pem \
      -subj   "/C=US/ST=State/L=City/O=SatoshiBin/CN=localhost" 2>/dev/null
    cp nginx/certbot/conf/live/localhost/fullchain.pem \
       nginx/certbot/conf/live/localhost/chain.pem
  fi
  DOMAIN="localhost"
  sed -i.bak "s|^DOMAIN=.*|DOMAIN=localhost|" .env && rm -f .env.bak
  success "Self-signed cert ready."
fi

# ── Build and start all services ───────────────────────────────────────────────
info "Building Docker images..."
$COMPOSE build --no-cache

info "Starting all services..."
$COMPOSE up -d

# ── Wait for backend health ────────────────────────────────────────────────────
info "Waiting for backend to be healthy..."
for i in $(seq 1 30); do
  if docker inspect --format='{{.State.Health.Status}}' payfile_backend 2>/dev/null | grep -q "healthy"; then
    success "Backend is healthy."
    break
  fi
  sleep 3
  if [ "$i" -eq 30 ]; then
    warn "Backend health check timed out. Check: docker logs payfile_backend"
  fi
done

# ── Summary ────────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}============================================================${NC}"
echo -e "${GREEN}  ✅  SatoshiBin deployed successfully!${NC}"
echo -e "${GREEN}============================================================${NC}"
if [ "$SSL" = true ]; then
  echo -e "  🌐  App:           https://${DOMAIN}"
else
  echo -e "  🌐  App:           http://localhost"
fi
echo -e "  🔧  Bitcart Admin: http://127.0.0.1:4000  (localhost only)"
echo -e "  📋  Logs:          docker compose logs -f"
echo -e "  ⏹️   Stop:          docker compose down"
echo -e "  🔄  Update:        git pull && ./deploy.sh ${DOMAIN} ${EMAIL}"
echo ""
echo -e "${YELLOW}  Next steps:${NC}"
echo -e "  1. Open Bitcart Admin (http://127.0.0.1:4000) and create your store + wallets"
echo -e "  2. Copy the Store ID and Wallet IDs into .env"
echo -e "  3. Restart backend: docker compose restart backend"
echo -e "${GREEN}============================================================${NC}"
