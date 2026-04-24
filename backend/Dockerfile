FROM node:20-alpine AS build
WORKDIR /app

# Prisma's query and schema engines are prebuilt against libssl; Alpine doesn't
# ship it by default. Without this, `prisma migrate deploy` fails at startup
# with "Could not parse schema engine response" and the container crash-loops.
RUN apk add --no-cache openssl

# Install deps (including prisma CLI — needed at runtime for `prisma migrate deploy`).
COPY package*.json ./
RUN npm ci

# Prisma schema must be present before `prisma generate` can run.
COPY prisma ./prisma
RUN npx prisma generate

COPY . .

RUN mkdir -p /app/uploads

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 5000

# Healthcheck honours $PORT (Render injects it). Falls back to 5000 locally.
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- "http://localhost:${PORT:-5000}/api/health" || exit 1

# Auto-apply any pending Prisma migrations on boot, then start the server.
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
