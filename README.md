# Job Scout

Self-hosted job opportunity tracking system. Receives scored job listings from n8n workflows, stores them in PostgreSQL, and exposes them through a Next.js dashboard.

## Stack

- **Next.js 14+** (App Router) with TypeScript
- **Prisma ORM** with PostgreSQL 17
- **Tailwind CSS** for styling
- **NextAuth.js** for dashboard session auth
- **Docker Compose** for deployment

## Quick Start (Development)

```bash
# Install dependencies
npm install

# Start a local PostgreSQL (or use Docker)
docker run -d --name job-scout-db \
  -e POSTGRES_USER=jobscout \
  -e POSTGRES_PASSWORD=jobscout \
  -e POSTGRES_DB=jobscout \
  -p 5432:5432 \
  postgres:17-alpine

# Run migrations
npx prisma migrate dev

# Start dev server
npm run dev
```

## Docker Deployment

```bash
# Build and start
docker compose up -d --build

# Check health
curl http://localhost:3000/api/health
```

## Environment Variables

Copy `.env.example` to `.env` and update values:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `API_KEY` | Static secret for n8n API writes |
| `NEXTAUTH_SECRET` | Session signing secret (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Public URL of the application |
| `DASHBOARD_USERNAME` | Single user login username |
| `DASHBOARD_PASSWORD` | Single user login password |
| `NODE_ENV` | `production` or `development` |

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## API Endpoints

### n8n-facing (API key auth via X-API-Key header)
- `POST /api/opportunities` — Ingest scored job
- `POST /api/rejections` — Ingest rejected job
- `POST /api/heartbeats` — Pipeline run heartbeat
- `POST /api/seen-ids` — Batch check: send `{ "source": "Adzuna", "ids": ["id1", "id2", ...] }`, returns only the IDs from the request that already exist (for deduplication)
- `GET /api/prompts/active` — Fetch active scoring prompt (no auth)

### Dashboard-facing (session auth)
- `GET /api/opportunities` — List with filters
- `GET /api/opportunities/:id` — Single opportunity
- `PATCH /api/opportunities/:id` — Update status
- `GET /api/rejections` — List rejections
- `GET /api/prompts` — List prompt versions
- `POST /api/prompts` — Create prompt version
- `PATCH /api/prompts/:id/activate` — Activate a prompt
- `GET /api/heartbeats` — List heartbeats
- `GET /api/stats` — Aggregated dashboard stats
- `GET /api/health` — Health check (no auth)
