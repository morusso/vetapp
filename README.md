# vetapp

![Python](https://img.shields.io/badge/python-3.10%2B-blue?logo=python&logoColor=white)
![Django](https://img.shields.io/badge/django-REST%20Framework-092E20?logo=django&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/postgresql-16-4169E1?logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/redis-celery%20%2B%20channels-DC382D?logo=redis&logoColor=white)
![Next.js](https://img.shields.io/badge/next.js-16-black?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/react-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/typescript-5-3178C6?logo=typescript&logoColor=white)
![Docker](https://img.shields.io/badge/docker-compose-2496ED?logo=docker&logoColor=white)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

A veterinary clinic management system — records for clients, animal
patients, visits, medicines and services, along with client notifications.
This is just a concept application (I don't know how apps like this actually
work in the market). The layout was vibe-coded because I'm no UI designer XD.

## Tech stack

**Backend**
- Django + Django REST Framework (API)
- PostgreSQL (database)
- Celery + Redis (async tasks / scheduling, broker + result backend)
- Django Channels + Redis (WebSockets — real-time notifications)
- JWT (RS256, `djangorestframework-simplejwt`) — authentication
- Ollama (optional, local LLM) — helps draft client-facing messages
- pytest — tests

**Frontend**
- Next.js 16 (App Router) + React 19
- TypeScript
- Tailwind CSS 4
- Tiptap — rich text editor (e.g. visit notes)
- Cypress — e2e tests

**Infrastructure**
- Docker Compose (separate files for dev and prod)
- nginx (reverse proxy in the production setup)
- mailcatcher (email capture in dev)

## Repository structure

```
backend/            Django — REST API
  animals/          Animal species, animals, patients, weight history
  clients/          Clinic clients (pet owners)
  clinical_data/    Medicines, medicine batches, visits, visit notes,
                     prescribed medicines, services
  notifications/    Notifications (WebSocket) + AI message drafting
  user/             Users (staff), roles, specializations, JWT
  vetapp/           Project settings (base/dev/prod), routing, Celery

frontend/           Next.js — application panel
  app/(protected)/  Views requiring login: dashboard, clients,
                     animals, patients, visits, medicines, services, users
  app/login/        Login
  components/       Shared components (tables, editor, notifications…)
  lib/               API client and hooks

deployment/         Dockerfiles, nginx config, dev/prod files
docker-compose-dev.yml    Development environment (hot-reload, fixtures)
docker-compose.prod.yml   Production environment (built images, daphne, nginx)
```

## Main functional modules

- **Clients** — pet owners' data.
- **Animals and patients** — species (`AnimalType`), animals (`Animal`)
  assigned to a client, patient record (`Patient`) with weight history.
- **Visits** — `Visit` with notes (`VisitNote`), prescribed medicines
  (`PrescribedMedicine`), and performed services (`VisitService`).
- **Medicines and inventory** — `Medicine` and batches (`MedicineBatch`, e.g.
  expiry dates, quantities).
- **Services** — the clinic's service price list (`Service`).
- **Users and roles** — staff (`User`) with specializations
  (`Specialization`), JWT authentication.
- **Notifications** — real-time notifications (WebSocket) for staff;
  client-facing messages can be assisted by a local AI model (Ollama) — in
  that case clinical data never leaves the infrastructure; when Ollama is
  unreachable, a static message template is used instead.

## Running in development mode

Requires Docker and Docker Compose.

```bash
docker compose -f docker-compose-dev.yml up --build
```

Services (among others):
- backend (Django, `runserver`): http://localhost:8000
- frontend (Next.js dev server): http://localhost:3000
- PostgreSQL: localhost:5432
- mailcatcher (email preview): http://localhost:1080
- flower (Celery task monitoring): http://localhost:5555
- Ollama: 127.0.0.1:11434 (optional, local LLM)

Backend and frontend code is mounted as a volume — changes to files are
reflected immediately (hot-reload).

## Demo data (fixtures)

On every startup in dev mode (`docker-compose-dev.yml`), the `backend`
container automatically runs migrations and loads demo data from
[`deployment/docker/fixtures/data_db_fixture.json`](deployment/docker/fixtures/data_db_fixture.json)
(see `deployment/docker/dev_files/entrypoint.sh`) — no manual seeding needed.

The fixture includes: 3 user accounts, specializations, animal species
(`AnimalType`), sample animals (`Animal`), one patient (`Patient`) and one
client (`Client`), and the periodic Celery task configuration.

**Demo accounts** (all with the password `malax`):

| Email                  | Role                             |
|-------------------------|-----------------------------------|
| `root@vetapp.com`      | administrator (superuser/staff)   |
| `j.doe@vetapp.com`     | staff (John Doe)                  |
| `jane-doe@vetapp.com`  | staff (Jane Doe)                  |

Production data (`docker-compose.prod.yml`) does **not** load fixtures — see
[`deployment/README.md`](deployment/README.md).

## Tests

**Backend** (pytest, Django):
```bash
cd backend
pytest
```

**Frontend** (Cypress e2e):
```bash
cd frontend
npm run e2e        # starts the dev server and runs Cypress tests
# or separately:
npm run cypress:open
```

## Production deployment

Described in detail in [`deployment/README.md`](deployment/README.md) — in
short: generate JWT keys (RS256), obtain a TLS certificate, fill in
`.env.production` (based on `.env.production.example`), then:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

The backend then runs under `daphne`, the frontend is built (`next build`)
and served via `next start`, and the whole stack is exposed through nginx.

## Notes

- API versioning is explicit per resource (`api/v1/...`) — see
  `backend/vetapp/urls.py`.
- Django settings are split into `base.py` / `dev.py` / `prod.py`
  (`backend/vetapp/settings/`).
- The Ollama integration is optional — its absence doesn't block sending
  notifications, it just skips AI assistance when drafting message content.
