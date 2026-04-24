# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

There is **no root `package.json`** — the README's `npm run install-all` / `npm run dev` do not exist. Install and run each service from its own folder:

```bash
# Backend (Express API, port 5000)
cd backend && npm install && npm run dev     # nodemon
cd backend && npm start                      # production: node server.js

# Frontend (Vite + React, port 5173)
cd frontend && npm install && npm run dev
cd frontend && npm run build && npm run preview
cd frontend && npm run lint                  # ESLint (flat config, eslint.config.js)
```

No test runner is configured for either service.

### Full-stack / Docker

```bash
docker compose up -d                # Brings up: frontend (vite dev), backend, mongodb, full Bitcart stack
./deploy.sh yourdomain.com you@x    # Generates JWT_SECRET + BITCART_WEBHOOK_SECRET on first run, writes DOMAIN/FRONTEND_URL/BACKEND_URL into .env, then docker compose up
./deploy.sh                         # No args → defaults DOMAIN=localhost
```

`deploy.sh` expects `.env` to already exist (copies from `.env.example` and exits if missing). It does **not** issue TLS certs and does **not** start nginx — the `nginx/` and `nginx/certbot/` directories are leftovers from a previous topology and are not wired into `docker-compose.yml`. Frontend is exposed on host `5173`; backend is exposed on host **`5001`** (internal container port is still `5000` — the host-side mapping was moved to `5001` to avoid macOS's AirPlay Receiver on `:5000`). Bitcart admin is bound to `127.0.0.1:4000`, Bitcart API to `127.0.0.1:8000`.

`BACKEND_URL` in `.env` is set to `http://backend:5000` — the Docker-internal service name. Bitcart calls the webhook over the shared `payfile_net` network, so it must NOT be `localhost:5000` (that would resolve inside Bitcart's own container) or a host-port URL.

The frontend container runs `Dockerfile.dev` (Vite dev server, not a built SPA). Its compose config bind-mounts `./frontend:/app` with an anonymous `/app/node_modules` volume — if that anonymous volume becomes stale (image rebuilt but volume preserved), vite will fail with `sh: vite: not found`. Fix: `docker compose up -d --force-recreate --renew-anon-volumes frontend` (or `docker compose down -v` if safe to wipe all volumes).

The **backend** container, by contrast, uses only a named `uploads_data` volume — the image's baked-in code and `node_modules` are used as-is (no bind mount). If you need live-reload dev for the backend, run it outside Docker (`cd backend && npm run dev`) rather than adding a bind mount back, which would re-introduce the "Cannot find module 'express'" crash.

### Bitcart local-dev (testnet) vs. production

The `bitcart/` directory contains a **separate standalone** `docker-compose.yml` for running Bitcart in isolation (testnet). The root `docker-compose.yml` runs the full production Bitcart stack on **mainnet** with `BITCART_CRYPTOS=btc,trx` — only BTC and TRX daemons are started. There is no ETH daemon despite `.env.example` listing `BITCART_USDT_ERC20_WALLET_ID` and `ADMIN_USDT_ERC20_ADDRESS`; see "USDT ERC20 is not wired up" below.

### Admin bootstrapping

Two approaches, both in `backend/scripts/`:

```bash
node backend/scripts/seedAdmin.js      # Hardcoded email/password — edit the file before running
node backend/scripts/promoteAdmin.js   # Promotes an existing email to admin — edit email in file
```

Preferred production path: set `OWNER_EMAIL` in `.env` — `authController.register` auto-promotes that email to `admin` on registration (`backend/controllers/authController.js:20`).

## Architecture

PayFile / SatoshiBin is a MERN marketplace for selling files in exchange for BTC or USDT via a self-hosted Bitcart payment gateway. All payment + payout flow is Bitcart-mediated — there is no direct blockchain interaction in this codebase.

### Payment / payout pipeline

This is the non-obvious core of the system — three cooperating mechanisms ensure payouts always succeed even if Bitcart or the network blips.

1. **Buyer creates purchase** → `POST /api/purchases` creates a Bitcart invoice for `(seller price + commission)` using the wallet matched to currency (`backend/controllers/purchaseController.js`). Internal `tokenId` format is `PAY-XXXXXXXX`. A `pendingExpiresAt` (48h) MongoDB TTL index auto-cleans abandoned pending invoices; it's cleared the moment a purchase is confirmed so real purchases are never deleted.

2. **Bitcart webhook** → `POST /api/purchases/bitcart-webhook` is **HMAC-SHA256 verified** against `BITCART_WEBHOOK_SECRET` using the `x-bitcart-signature-256` header. Because the signature is computed over the exact bytes Bitcart sent, this route is registered with `express.raw()` **before** the global `express.json()` in `backend/server.js:57`. Reordering middleware will break webhook verification.

3. **Three redundant payout triggers** (all call the same idempotent `triggerPurchasePayouts`):
   - Webhook on invoice status `paid` / `complete`
   - Polling: `GET /api/purchases/checkout/:tokenId` sync-checks Bitcart's invoice status when the checkout UI polls
   - `startPayoutRetryJob()` — kicked off from `server.js` at boot, scans every 5 minutes for `status='confirmed', payoutsProcessed=false` purchases older than 2 minutes
   - Admin-manual: `POST /api/admin/retry-payout/:tokenId`

   Idempotency is enforced by three boolean flags on `Purchase`: `sellerPayoutProcessed`, `adminPayoutProcessed`, `payoutsProcessed`. Each payout is gated by its flag, so re-triggering is always safe.

4. **Split payout**: each confirmed purchase creates two Bitcart payouts — seller (price) and admin (commission). Admin destination is picked from `Settings` by currency: `adminBtcAddress` for BTC, `adminUsdtTrc20Address` (falling back to `adminUsdtAddress`) for USDT. Env vars override DB `Settings` for addresses — `.env` is the source of truth for `ADMIN_BTC_ADDRESS`, `ADMIN_USDT_TRC20_ADDRESS`, and `ADMIN_USDT_ADDRESS` (and the same for wallet IDs: `BITCART_WALLET_ID`, `BITCART_USDT_TRC20_WALLET_ID`).

5. **Bitcart auto-configuration**: `backend/scripts/setupBitcart.js` runs on every backend startup — it PATCHes the Bitcart store to enable auto-approve-payouts and registers the webhook URL + secret so subsequent invoices inherit them. It retries because Bitcart may still be booting when the backend comes up. Wallet IDs are verified but missing wallets only warn — they don't block startup.

### Currency code translation — and the ERC20 gap

Internal `Sale.currency` is `'BTC' | 'USDT'` with an optional `network` field. Bitcart uses `'BTC' | 'USDTTRX' | 'USDTETH'`. The translator is `getBitcartCurrencyCode()` in `backend/controllers/purchaseController.js:16`.

**Beware**: the current implementation ignores `network` entirely and always returns `'USDTTRX'` for USDT. USDT ERC20 will **not** work end-to-end even though `.env.example` and the comment in the mapping function reference `USDTETH`:
- No ETH daemon in `docker-compose.yml` (`BITCART_CRYPTOS=btc,trx`)
- No `usdtErc20WalletId` field on the `Settings` model
- No `ADMIN_USDT_ERC20_ADDRESS` resolution in `loadSettings()`

If ERC20 needs to ship, all four sites must change together. Never pass raw `'USDT'` to Bitcart — it will be rejected.

### Models (Neon Postgres via Prisma)

Schema: `backend/prisma/schema.prisma`. Prisma client singleton: `backend/prisma/client.js`. Migrations live in `backend/prisma/migrations/` and are **auto-applied on every backend boot** via `npx prisma migrate deploy` — both the local compose `command` and the Dockerfile `CMD` run it before `node server.js`.

- `User` — auth, role enum (`user`|`admin`), hashed password-reset token with 10-minute expiry
- `File` — uploaded file metadata, owner, physical path under `backend/uploads/`
- `Sale` — price + currency (`BTC`|`USDT`) + network (`NONE`|`TRC20` — Prisma enum can't be empty so `NONE` replaces Mongo's `''`; `utils/enumMap.js` converts back to `''` for the client) + seller payout address
- `Purchase` — links Sale + file + seller; tracks Bitcart invoice/payout IDs and the idempotency flags above. Mongo's TTL index is replaced by `startPendingPurchaseCleanupJob` in `server.js` (every 5 min, deletes pending purchases whose `pendingExpiresAt` has passed).
- `Income` — append-only commission-received log for admin dashboard
- `Settings` — singleton row (always `id = 1`). Admin can override commission rate and payout addresses via the admin UI (env still wins for addresses).

**Response compatibility**: Postgres uses `id`, but the frontend still reads `_id`. Controllers alias `id` as `_id` in the response payload so no frontend changes were needed.

### One Neon project, two databases

| DB | Owner | Schema management |
|---|---|---|
| `neondb` | Bitcart | alembic (auto on bitcart_api boot) |
| `payfile` | PayFile backend | Prisma (auto on backend boot) |

Same Neon host, same credentials, different database names. `BITCART_DB_NAME=neondb` and PayFile's `DATABASE_URL` ends in `/payfile?sslmode=require`. No local MongoDB or local Postgres container exists anywhere.

### Backend error handling

All controllers use `catchAsync` + `AppError` (`backend/utils/`). Errors bubble to `controllers/errorController.js`, which differentiates dev (stack trace) vs production (sanitized messages, handles Mongoose CastError / duplicate-key / validation / JWT). When adding controllers, wrap async handlers in `catchAsync` and throw `new AppError(msg, status)` rather than hand-rolling `res.status(...).json(...)`.

### Auth

JWT bearer tokens, `middleware/auth.js` exports `protect` and `restrictTo(...roles)`. Tokens are stored by the frontend in `localStorage` under keys `token` and `user` (see `frontend/src/App.jsx`). `/api/auth/forgot-password` is rate-limited to 3/hour per IP and uses a SHA-256 hashed reset token with a 10-minute expiry.

### Frontend

React 19 + Vite 8 + Tailwind 4 (v4 via `@tailwindcss/vite`, not postcss). Routing in `App.jsx` with `BrowserRouter` — admin pages sit under `/admin/*` inside an `AdminLayout` nested route and the main `Navbar` is hidden on auth + admin routes. Business logic lives in page-local `hooks/` (`useDashboard`, `useCheckout`, `usePurchase`, `useAdminDashboard`), not Redux or Context — the only Context is `ConfirmContext` (confirm-modal).

Vite dev server proxies `/api` → `http://backend:5000` (Docker service name) or `VITE_API_URL`. File watching uses polling (`vite.config.js`) for Docker volume compatibility.

## Environment variables (non-obvious)

- `FRONTEND_URL` — **comma-separated allow-list** for CORS, not a single URL (`backend/server.js:43`)
- `BACKEND_URL` — used for Bitcart webhook registration; must be the URL Bitcart can reach the backend at. In the current compose it's `http://backend:5000` because Bitcart is on the same `payfile_net` Docker network. If Bitcart is ever moved off-network this must become publicly reachable.
- `BITCART_HOST` — the internal URL (`http://bitcart_api:8000`), resolved via Docker DNS
- `OWNER_EMAIL` — auto-promotes the matching registered email to admin role
- `BITCART_WEBHOOK_SECRET` — must match Bitcart's `notification_secret`; `setupBitcart.js` keeps them in sync automatically
- `BITCART_USDT_ERC20_WALLET_ID` / `ADMIN_USDT_ERC20_ADDRESS` — present in `.env.example` but **not read by any code today** (see "USDT ERC20 is not wired up")

See `.env.example` for the full list and how to obtain Bitcart IDs from the admin panel at `http://127.0.0.1:4000`.
