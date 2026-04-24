## Production frontend image: builds Vite SPA, serves via nginx.
## Used by Render (runtime: docker). For local dev use Dockerfile.dev instead.

# ── Stage 1: build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
# VITE_API_URL is baked into the bundle at build time. Render injects it
# via envVars in render.yaml.
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

# ── Stage 2: serve ────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine

# SPA fallback: rewrite unknown paths to /index.html so React Router works.
RUN printf 'server {\n  listen       $PORT;\n  server_name  _;\n  root         /usr/share/nginx/html;\n  index        index.html;\n  location / {\n    try_files $uri $uri/ /index.html;\n  }\n  gzip on;\n  gzip_types text/plain text/css application/javascript application/json image/svg+xml;\n}\n' > /etc/nginx/conf.d/app.conf.template

COPY --from=build /app/dist /usr/share/nginx/html

# Render injects PORT at runtime; substitute it into the nginx conf and exec.
CMD ["/bin/sh", "-c", "envsubst '$PORT' < /etc/nginx/conf.d/app.conf.template > /etc/nginx/conf.d/app.conf && rm -f /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
