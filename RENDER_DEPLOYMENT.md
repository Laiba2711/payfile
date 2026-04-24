# Deploying PayFile to Render (Dockerized)

This guide deploys the entire PayFile / SatoshiBin stack to [Render](https://render.com) using the `render.yaml` blueprint in this repo.

## What you're deploying

| Service | Render type | Plan needed | Notes |
|---|---|---|---|
| `payfile-frontend` | Web Service (Docker) | Starter ($7/mo) | Multi-stage nginx build of the Vite SPA |
| `payfile-backend` | Web Service (Docker) | Starter | Express API |
| `bitcart-api` | Private Service (Docker) | Starter + 1 GB disk | Only reachable from other Render services |
| `bitcart-worker` | Background Worker (Docker) | Starter | Processes Bitcart jobs |
| `bitcart-admin` | Web Service (Docker) | Starter | Public admin UI (lock behind Render auth if sensitive) |
| `bitcart-btc` | Private Service (Docker) | Starter + 1 GB disk | BTC Electrum-backed daemon |
| `bitcart-trx` | Private Service (Docker) | Starter + 1 GB disk | TRX daemon |
| `bitcart-redis` | Render Key Value | Starter | Replaces the local Redis container |
| **Postgres** | External (Neon) | Free tier fine | Single DB for both Bitcart (`neondb`) and PayFile (`payfile`) — already set up |

> **Cost check:** Starter plan is ~$7/mo per service + ~$0.25/GB/mo for disks. Roughly **$50–60/mo total** for this stack. Render does not support persistent disks on free plans, so Bitcart daemons cannot run on the free tier.

## Prerequisites

1. **GitHub repo** — push this project to a GitHub repo that Render can read.
2. **Neon Postgres** — already done. Have the connection parts handy: host, db name, user, password. Two databases on the same Neon project: `neondb` (Bitcart) and `payfile` (PayFile app).
3. **Brevo API key** — for email (existing Brevo account is fine).
4. **Tron Grid API key** — free at <https://www.trongrid.io>.

## Step 1 — Push to GitHub

```bash
git add render.yaml frontend/Dockerfile RENDER_DEPLOYMENT.md
git commit -m "Add Render blueprint and production frontend Dockerfile"
git push origin main
```

## Step 2 — Create the Blueprint on Render

1. Go to <https://dashboard.render.com> → **New +** → **Blueprint**.
2. Connect the GitHub repo.
3. Render will detect `render.yaml` and list the 9 services. Click **Apply**.
4. Render creates all services and prompts you for the `sync: false` (manual) env vars.

## Step 3 — Fill in the manual env vars

Render's UI will ask for each variable whose `sync: false`. Paste these values:

**On `payfile-backend`:**
- `DATABASE_URL` — your Neon Postgres URL targeting the `payfile` database (e.g. `postgresql://USER:PASS@HOST.neon.tech/payfile?sslmode=require`)
- `OWNER_EMAIL` — the email that should be auto-promoted to admin
- `BITCART_API_KEY` — (leave blank for now; we'll generate after Bitcart is up)
- `BITCART_STORE_ID` — (blank for now)
- `BITCART_WALLET_ID`, `BITCART_USDT_TRC20_WALLET_ID` — (blank for now)
- `ADMIN_BTC_ADDRESS`, `ADMIN_USDT_TRC20_ADDRESS`, `ADMIN_USDT_ADDRESS` — your payout addresses
- `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`

**On `bitcart-api` AND `bitcart-worker` (same values for both):**
- `DB_HOST` — `ep-xxx.region.aws.neon.tech`
- `DB_DATABASE` — `neondb`
- `DB_USER` — `neondb_owner`
- `DB_PASSWORD` — your Neon password

**On `bitcart-trx`:**
- `TRX_API_KEY` — your TronGrid key

## Step 4 — First deploy + wait for migrations

Trigger the deploy. Expected order:

1. `bitcart-redis` (managed, ~30s)
2. `bitcart-btc`, `bitcart-trx` (private services, ~1 min — daemons start syncing)
3. `bitcart-api` — **takes 3–5 min on first boot** because alembic runs 25+ migrations against Neon over the internet. This is normal.
4. `bitcart-worker`, `bitcart-admin` — start after `bitcart-api` is healthy.
5. `payfile-backend` — start after its dependencies are up.
6. `payfile-frontend` — static-like build; fast.

> ⚠️ If `bitcart-api` shows "failing healthcheck" during the first few minutes, **don't restart it** — alembic is still running. Render's default healthcheck grace period should cover it; if you hit a limit, extend it in the service's Settings → Health & Alerts.

## Step 5 — Configure Bitcart (one-time)

Once `bitcart-admin` is live at `https://bitcart-admin-xxxx.onrender.com`:

1. Open the admin URL → **Register** an account. This first account becomes the superuser.
2. **Account → Settings → Generate API Key** → copy it.
3. **Stores → Create Store** → copy the store ID from the URL.
4. **Wallets → Add Wallet**:
   - Type **BTC** → mainnet → copy the wallet ID.
   - Type **USDTTRX** → mainnet → copy the wallet ID.
5. Paste the four IDs into `payfile-backend` env vars in Render:
   - `BITCART_API_KEY`
   - `BITCART_STORE_ID`
   - `BITCART_WALLET_ID`
   - `BITCART_USDT_TRC20_WALLET_ID`
6. Render auto-redeploys the backend. On boot, `setupBitcart.js` will register the webhook URL + secret with Bitcart — watch `payfile-backend` logs for `[Bitcart Setup] ✅ Store configured`.

## Step 6 — Smoke-test

- Frontend: `https://payfile-frontend-xxxx.onrender.com` — landing page renders.
- Backend health: `https://payfile-backend-xxxx.onrender.com/api/health` → `{"status":"OK"}`.
- Register a user → verify email arrives from Brevo.
- Upload a file → list it → open in a different browser → pay on Bitcart → verify payout in Bitcart Admin → Payouts.

## Gotchas / things to know

- **Render does NOT support `docker-compose`.** Each service is independent. `render.yaml` replaces `docker-compose.yml` for deployment.
- **Inter-service URLs**: inside Render, services talk to each other at `http://<service-name>:<port>` over a private network. That's why `BITCART_HOST=http://bitcart-api:8000` works — no public DNS.
- **Render injects `$PORT`** — every web/private service must bind to it. The blueprint's `dockerCommand` fields already handle this for Bitcart (`-b 0.0.0.0:$PORT`). Your Node backend already reads `process.env.PORT`, which server.js does at `server.js:22`.
- **No MongoDB anywhere.** PayFile app data lives in Neon Postgres (schema managed by Prisma). `prisma migrate deploy` runs on every backend boot so schema changes land automatically.
- **Bitcart daemons need disks.** Don't skip `disk:` in `render.yaml` — BTC/TRX state (wallet xpubs, chain tips) needs to persist across deploys.
- **Bitcart Admin is publicly exposed by default.** If sensitive, put it behind a Render IP allow-list or Cloudflare Access.
- **First deploy is slow** (5–10 min total) because Bitcart pulls ~800 MB of images and alembic runs over Neon. Subsequent deploys are fast (code-only).
- **Logs:** every service has a Logs tab in the Render dashboard. Same content as `docker logs <container>` locally.

## Updating the deployment

Push to `main`. Render auto-deploys affected services. Bitcart images are pinned to `:stable` tag — Render re-pulls each deploy. To roll back, use **Manual Deploy → specific commit** on each affected service.

## Rolling back the local Docker stack

This repo still has a working local `docker-compose.yml`. Render deployment does not affect local dev — `./deploy.sh` continues to work, pointing at the same Neon project (no local MongoDB — everything is Postgres now).
