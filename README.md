# Job Scout

Self-hosted job opportunity tracking system. Receives scored job listings from n8n workflows, stores them in PostgreSQL, and exposes them through a Next.js dashboard.

## Running with Docker

A pre-built image is published to [GitHub Container Registry](https://github.com/8ix/job-scout/pkgs/container/job-scout) and supports amd64 and arm64 — standard servers and Raspberry Pi 4/5.

### Docker Compose (recommended)

Create a `docker-compose.yml` file:

```yaml
services:
  job-scout:
    image: ghcr.io/8ix/job-scout:latest
    container_name: job-scout
    restart: unless-stopped
    ports:
      - "3000:3000"
    env_file:
      - .env
    environment:
      - DATABASE_URL=postgresql://jobscout:jobscout@job-scout-db:5432/jobscout
    depends_on:
      job-scout-db:
        condition: service_healthy

  job-scout-db:
    image: postgres:17-alpine
    container_name: job-scout-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: jobscout
      POSTGRES_PASSWORD: jobscout
      POSTGRES_DB: jobscout
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U jobscout"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
```

Create a `.env` file with:

```
DATABASE_URL=postgresql://jobscout:jobscout@job-scout-db:5432/jobscout
API_KEY=your_secret_api_key
NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32
NEXTAUTH_URL=http://localhost:3000
DASHBOARD_USERNAME=admin
DASHBOARD_PASSWORD=changeme
NODE_ENV=production
```

Then start it:

```bash
docker compose up -d
```

Migrations run automatically on startup. Open http://localhost:3000 in a browser.

### Update to latest

```bash
docker compose pull
docker compose up -d
```

---

## Environment variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (default above works with the included Postgres) |
| `API_KEY` | Secret for n8n API authentication |
| `NEXTAUTH_SECRET` | Session signing secret (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Public URL of the app |
| `DASHBOARD_USERNAME` | Dashboard login |
| `DASHBOARD_PASSWORD` | Dashboard login |

## Development

For local development with `npm run dev`:

```bash
npm install
# Start Postgres (e.g. docker run -d --name job-scout-db -e POSTGRES_USER=jobscout -e POSTGRES_PASSWORD=jobscout -e POSTGRES_DB=jobscout -p 5432:5432 postgres:17-alpine)
npx prisma migrate dev
npm run dev
```

To build and run from source with Docker:

```bash
docker compose -f docker-compose.dev.yml up -d --build
```

## API endpoints

### n8n-facing (API key via `X-API-Key` header)
- `POST /api/opportunities` — Ingest scored job
- `POST /api/rejections` — Ingest rejected job
- `POST /api/heartbeats` — Pipeline heartbeat
- `POST /api/seen-ids` — Batch deduplication check
- `GET /api/prompts/active` — Active scoring prompt (no auth)
- `POST /api/applications` — Create a manual / external application (`source: manual`, optional `appliedVia`, defaults to `External`)
- `PATCH /api/applications/:id` — Update application fields, `status`, or `stage` (same rules as opportunity PATCH; archive/reject via `stage`)
- `GET /api/applications/:id` — Single application with contacts, stage logs, scheduled events
- `POST /api/applications/:id/events` — Add screening / interview (`kind`, `scheduledAt`, optional `notes`)
- `PATCH /api/applications/:id/events/:eventId` — Update scheduled event
- `DELETE /api/applications/:id/events/:eventId` — Remove scheduled event

Session **or** API key: `POST/PATCH/DELETE` on `/api/applications*` accept either a logged-in dashboard session or `X-API-Key`.

### Dashboard (session auth)
- `GET /api/opportunities`, `PATCH /api/opportunities/:id` (includes enrichment: `appliedVia`, `recruiterContact`, `fullJobSpecification`, etc.)
- `GET /api/rejections`
- `GET /api/prompts`, `POST /api/prompts`, `PATCH /api/prompts/:id/activate`
- `GET /api/stats`, `GET /api/health`
