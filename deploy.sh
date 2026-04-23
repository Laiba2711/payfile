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
DOMAIN=${DOMAIN:-${DOMAIN_ENV:-"localhost"}}
EMAIL=${EMAIL:-${OWNER_EMAIL:-""}}

info "Domain: $DOMAIN"

# ── Write DOMAIN to .env if not already there ──────────────────────────────────
if ! grep -q "^DOMAIN=" .env; then
  echo "DOMAIN=${DOMAIN}" >> .env
  info "Added DOMAIN=${DOMAIN} to .env"
else
  sed -i.bak "s|^DOMAIN=.*|DOMAIN=${DOMAIN}|" .env && rm -f .env.bak
fi

# Update FRONTEND_URL and BACKEND_URL
# In no-proxy/no-nginx mode, frontend is at port 5173 and backend is at port 5000
if [ "$DOMAIN" = "localhost" ]; then
  sed -i.bak "s|^FRONTEND_URL=.*|FRONTEND_URL=http://localhost:5173|" .env && rm -f .env.bak
  sed -i.bak "s|^BACKEND_URL=.*|BACKEND_URL=http://localhost:5000|" .env && rm -f .env.bak
else
  sed -i.bak "s|^FRONTEND_URL=.*|FRONTEND_URL=http://${DOMAIN}:5173|" .env && rm -f .env.bak
  sed -i.bak "s|^BACKEND_URL=.*|BACKEND_URL=http://${DOMAIN}:5000|" .env && rm -f .env.bak
fi

# ── Create required directories ────────────────────────────────────────────────
info "Creating required directories..."
mkdir -p backend/uploads

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
# ── Summary ────────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}============================================================${NC}"
echo -e "${GREEN}  ✅  SatoshiBin deployed successfully!${NC}"
echo -e "${GREEN}============================================================${NC}"
echo -e "  🌐  Frontend:      http://${DOMAIN}"
echo -e "  🚀  Backend API:   http://${DOMAIN}:5000"
echo -e "  🔧  Bitcart Admin: http://127.0.0.1:4000  (localhost only)"
echo -e "  📋  Logs:          docker compose logs -f"
echo -e "  ⏹️   Stop:          docker compose down"
echo -e "  🔄  Update:        git pull && ./deploy.sh ${DOMAIN}"
echo ""

echo -e "${YELLOW}  Next steps:${NC}"
echo -e "  1. Open Bitcart Admin (http://127.0.0.1:4000) and create your store + wallets"
echo -e "  2. Copy the Store ID and Wallet IDs into .env"
echo -e "  3. Restart backend: docker compose restart backend"
echo -e "${GREEN}============================================================${NC}"
