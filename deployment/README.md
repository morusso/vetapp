# Production deployment

Self-hosted deployment via Docker Compose, fronted by nginx. Unlike
`docker-compose-dev.yml`, this build bakes application code into the images
(no source bind-mounts), runs the Django app under `daphne` instead of
`runserver`, builds the frontend with `next build`/`next start`, and does not
load any demo fixtures.

## 1. One-time setup

**Generate JWT signing keys** (RS256, used to sign/verify access tokens):

```bash
mkdir -p deployment/secrets/jwt
openssl genrsa -out deployment/secrets/jwt/private.pem 2048
openssl rsa -in deployment/secrets/jwt/private.pem -pubout -out deployment/secrets/jwt/public.pem
```

**Get a TLS certificate** for your domain and place it here:

```
deployment/secrets/certs/fullchain.pem
deployment/secrets/certs/privkey.pem
```

Any source works (e.g. `certbot certonly --standalone`, or certs issued by
your host). `deployment/secrets/` is gitignored — nothing under it should be
committed.

**Configure environment variables:**

```bash
cp .env.production.example .env.production
```

Fill in `.env.production`: `SECRET_KEY`, `POSTGRES_PASSWORD`, your domain in
`ALLOWED_HOSTS`/`CORS_ALLOWED_ORIGINS`/`CSRF_TRUSTED_ORIGINS`/`NEXT_PUBLIC_API_URL`,
and real SMTP credentials.

## 2. Build and start

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

The `backend` container runs migrations and `collectstatic` automatically on
startup (see `deployment/docker/prod_files/entrypoint.sh`). Static files land
in the `vetapp_static` named volume, which nginx serves directly at `/static/`.

## 3. Create an admin user

```bash
docker compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser
```

## Notes

- **Settings are split per environment**: `vetapp/settings/base.py` holds
  everything environment-agnostic, `vetapp/settings/dev.py` (the default —
  `DEBUG=True`, permissive `ALLOWED_HOSTS`, no required env vars) is what
  `docker-compose-dev.yml` runs, and `vetapp/settings/prod.py` (`DEBUG=False`,
  HSTS/secure cookies, and hard failures on missing `SECRET_KEY`/`ALLOWED_HOSTS`/
  `CORS_ALLOWED_ORIGINS`/`CSRF_TRUSTED_ORIGINS`) is selected in
  `docker-compose.prod.yml` via `DJANGO_SETTINGS_MODULE=vetapp.settings.prod`.
- **NEXT_PUBLIC_API_URL is baked in at build time.** If you change it, rebuild
  the `frontend` image (`docker compose -f docker-compose.prod.yml build frontend`).
- **Database data** lives in the `vetapp_pgdata` named volume — back it up with
  `docker compose -f docker-compose.prod.yml exec db pg_dump -U vetapp vetapp`.
- **Ollama** (local LLM for drafting client messages) is optional; reminders
  fall back to their static template if it's unreachable. Remove the `ollama`
  service and `OLLAMA_BASE_URL` if you don't need it.
- **Rotating JWT keys** invalidates every outstanding access/refresh token —
  users will need to log in again.
