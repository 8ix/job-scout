# Job Scout

Self-hosted job opportunity tracking system. Receives scored job listings from n8n workflows, stores them in PostgreSQL, and exposes them through a Next.js dashboard.

**Recommended deployment:** Run via Docker using the pre-built image from GitHub Container Registry (ghcr.io).

## Stack

- **Next.js 16** (App Router) with TypeScript
- **Prisma ORM** with PostgreSQL 17
- **Tailwind CSS** for styling
- **NextAuth.js** for dashboard session auth
- **Docker Compose** for deployment

---

## Docker deployment (recommended)

Job Scout is intended to run via Docker. Use the pre-built image from [ghcr.io/8ix/job-scout](https://github.com/8ix/job-scout/pkgs/container/job-scout). The image supports `linux/amd64` and `linux/arm64` (Raspberry Pi 4/5).

### First-time setup

1. **Clone the repo** (or create the required files manually):

   ```bash
   git clone https://github.com/8ix/job-scout.git
   cd job-scout
   ```

2. **Create `.env`** from the example:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set at least:

   - `API_KEY` — Secret for n8n API authentication
   - `NEXTAUTH_SECRET` — `openssl rand -base64 32`
   - `NEXTAUTH_URL` — Your public URL (e.g. `https://jobs.yourdomain.com` or `http://localhost:3000`)
   - `DASHBOARD_USERNAME` and `DASHBOARD_PASSWORD` — Login credentials for the dashboard

3. **Start the stack** using the pre-built image:

   ```bash
   docker compose -f docker-compose.ghcr.yml up -d
   ```

   This will:

   - Pull `ghcr.io/8ix/job-scout:latest` and PostgreSQL
   - Run database migrations
   - Start the app on port 3000

4. **Verify**:

   ```bash
   curl http://localhost:3000/api/health
   ```

### Updating to the latest version

To pull and run the newest image (e.g. after a new release):

```bash
docker compose -f docker-compose.ghcr.yml pull
docker compose -f docker-compose.ghcr.yml up -d
```

The migrate container runs automatically before the app starts, so schema changes are applied on each update.

### Docker Compose file

Use `docker-compose.ghcr.yml`, which pulls the image instead of building locally. For local development builds, use `docker-compose.yml`.

---

## Quick start (development)

```bash
npm install

# Start a local PostgreSQL (or use Docker)
docker run -d --name job-scout-db \
  -e POSTGRES_USER=jobscout \
  -e POSTGRES_PASSWORD=jobscout \
  -e POSTGRES_DB=jobscout \
  -p 5432:5432 \
  postgres:17-alpine

npx prisma migrate dev
npm run dev
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
