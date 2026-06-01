# osu-api-proxy

Narrow private proxy for the two osu! API calls Cosette Lite needs during OAuth verification.

It is intentionally not a general-purpose proxy. It exposes only:

- `POST /osu/oauth/token`
- `GET /osu/me`
- `GET /health`

## Local development

```sh
OSU_PROXY_SHARED_SECRET=dev-secret \
OSU2_CLIENT_SECRET=your-osu-client-secret \
pnpm dev:osu-proxy
```

Then configure the web app:

```env
PRIVATE_OSU_PROXY_BASE_URL=http://127.0.0.1:8787
PRIVATE_OSU_PROXY_SHARED_SECRET=dev-secret
```

If `PRIVATE_OSU_PROXY_BASE_URL` is absent, the web app calls osu! directly.

## Docker

Copy `.env.example` to `.env` and fill in real values:

```sh
cp apps/osu-api-proxy/.env.example apps/osu-api-proxy/.env
```

Run the proxy:

```sh
docker compose --env-file apps/osu-api-proxy/.env -f apps/osu-api-proxy/compose.yml up -d --build
```

The compose file publishes the service only on `127.0.0.1:8787`. This is intended for Cloudflare Tunnel on the same machine:

```text
osu-proxy.example.com -> http://127.0.0.1:8787
```
