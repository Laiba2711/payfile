#!/bin/sh
# Inject DOMAIN into nginx config and start nginx
DOMAIN="${DOMAIN:-localhost}"

echo "[nginx] Starting with domain: ${DOMAIN}"

# Replace the placeholder string with the actual domain value
sed "s/PAYFILE_DOMAIN/${DOMAIN}/g" \
  /etc/nginx/conf.d/default.conf.template \
  > /etc/nginx/conf.d/default.conf

# Test the generated config
nginx -t || { echo "[nginx] Config test FAILED"; cat /etc/nginx/conf.d/default.conf; exit 1; }

echo "[nginx] Config OK — starting nginx..."
exec nginx -g "daemon off;"
