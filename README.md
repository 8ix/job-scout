<p align="center">
  <img src="docs/job-scout-logo.png" alt="Job Scout logo — owl scout with magnifying glass and briefcase" width="320" />
</p>

# Job Scout

**Job Scout** is an open-source, self-hosted **API and dashboard** for supporting a serious job search: it stores and organises the leads *you* qualify, instead of trying to own every step of how you find or score jobs.

## Philosophy

Job Scout is **intentionally logic-agnostic**. It has no opinions about how jobs should be scored or filtered—that is entirely up to you.

The screening and filtering logic lives in **your** automation (n8n workflows or whatever orchestration tool you prefer). Job Scout’s job is purely to **receive, store, and present** the results. That keeps the project **clean and composable**: different feeds can use different scoring strategies without that complexity living inside the application.

This follows a **headless / composable architecture** pattern: Job Scout is the **data and presentation layer**; **you bring the intelligence**. The in-app **About this project** page and the **Feeds** page (API overview + per-feed examples) are the fastest way to wire up workflows after deploy.

## What it is (and isn’t)

- **What it is:** A **data store** plus a **web UI** for managing opportunities, applications, disqualified listings, feeds, and **search criteria** (the structured inputs that assemble your scoring system prompt). You send structured data in (typically from automation you control); Job Scout persists it and helps you review, track, and act on it.
- **What it isn’t:** A complete “job hunt in a box.” It does **not** embed your scraping rules, board-specific filters, or scoring brains. Those live **outside** the app—on purpose.

That intentional gap is the point: **bring your own logic** (workflows, scripts, LLMs, whatever fits you). Tools like **[n8n](https://n8n.io/)** are a natural fit: poll or scrape job boards, dedupe, score or classify roles, then **POST** scored **opportunities** or **disqualified** listings straight into the API. You can run **many feeds** with **different strategies** without changing Job Scout’s codebase each time—only your automation changes.

In short: Job Scout is the **stable centre** (storage + management UI); your automation is the **flexible edge** (how each feed finds and judges jobs).

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
| `BLOCKLIST_PUBLIC_READ` | Optional. Set to `true` to allow **unauthenticated** `GET /api/ingest-blocklist` (defaults off; use `X-API-Key` instead). |

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

Typical flow: your automation calls these with `X-API-Key`. Dashboard **feed health** treats the latest **opportunity or disqualified** ingest per configured feed as liveness (no separate heartbeat).

### n8n-facing (API key via `X-API-Key` header)

- `GET /api/ingest-blocklist` — Export enabled global block rules as JSON (`version`, `updatedAt`, `rules[]` with `id`, `pattern`, `scope`, `enabled`) for use in workflows. Same API key as ingest routes unless `BLOCKLIST_PUBLIC_READ=true` (not recommended). Matching `POST /api/opportunities` bodies are rejected with **422** (response includes `pattern`, `scope`, `rejectionId`) and are **not** stored as opportunities; a **rejection** row is created/updated so they appear on the **Disqualified** page with amber styling and the matched pattern for debugging.
- `POST /api/opportunities` — Ingest scored job
- `POST /api/rejections` — Ingest disqualified job listing (stored as a rejection record; dashboard UI labels this **Disqualified**)
- `POST /api/seen-ids` — Batch deduplication check
- `GET /api/prompts/active` — Generated scoring **system** prompt from saved search criteria (no auth; JSON includes `systemPrompt` and `updatedAt`)
- `POST /api/applications` — Create a manual / external application (`source: manual`, optional `appliedVia`, defaults to `External`; `url` is optional—omit or `null` if you have no posting link)
- `PATCH /api/applications/:id` — Update application fields, `status`, or `stage` (same rules as opportunity PATCH; archive/reject via `stage`)
- `GET /api/applications/:id` — Single application with contacts, correspondence (pasted messages), stage logs, scheduled events
- `POST /api/applications/:id/events` — Add screening / interview (`kind`, `scheduledAt`, optional `notes`)
- `PATCH /api/applications/:id/events/:eventId` — Update scheduled event
- `DELETE /api/applications/:id/events/:eventId` — Remove scheduled event

Session **or** API key: `POST/PATCH/DELETE` on `/api/applications*` accept either a logged-in dashboard session or `X-API-Key`.

### CSV import (dashboard session only)

- **Template:** download [`/applications-import-template.csv`](/applications-import-template.csv) from your deployed app (or copy from `public/applications-import-template.csv` in the repo).
- **`POST /api/applications/import`** — `multipart/form-data` with a field named `file` (`.csv`). Creates manual applications on **this** instance. Response: `{ created, skipped, truncated, errors: [{ row, message }] }`. Rows with the same `external_id` as a previous import are **skipped** (dedupe via `jobId`). Spreadsheet columns **Status**, **Interview Date**, and **Last Updated** are ignored; every imported row starts in stage **Applied**. Max row count is enforced (see `MAX_CSV_IMPORT_ROWS` in code).

### Dashboard (session auth)
- `GET /api/preferences/application-goals`, `PATCH /api/preferences/application-goals` — Weekly and/or monthly **meaningful application** targets (score ≥ `DEFAULT_OPPORTUNITY_SCORE_MIN`, counted by `appliedAt` in your chosen IANA timezone and week-start day). Targets `0` disable that cadence. UI: **Dashboard** → Application goals.
- `POST /api/ingest-blocklist`, `PATCH /api/ingest-blocklist/:id`, `DELETE /api/ingest-blocklist/:id` — Manage ingest blocklist (UI: **Blocklist** in the sidebar)
- `GET /api/opportunities`, `PATCH /api/opportunities/:id` (includes enrichment: `appliedVia`, `recruiterContact`, `fullJobSpecification`, etc.)
- `GET /api/opportunities/:id/correspondence`, `POST /api/opportunities/:id/correspondence`, `DELETE /api/opportunities/:id/correspondence?id=…` — Log pasted email/message text on an application with a **received-at** time (session only; UI: **Applications** → application details)
- `GET /api/rejections` (same data as the **Disqualified** page in the UI)
- `GET /api/search-criteria`, `PATCH /api/search-criteria` — Read/update search criteria (UI: **Search criteria**); criteria are merged into the template used for `GET /api/prompts/active`
- `GET /api/settings/application-workflow`, `PATCH /api/settings/application-workflow` — Application stale threshold in days (default **40**); UI: **Settings**
- `POST /api/settings/reset-application-data` — Dangerous multi-scope wipe (requires session + dashboard password + exact confirmation phrase). See Settings page.
- Stale applications are **auto-archived when you open Dashboard or Applications** (throttled to about once per hour per instance; see `AUTO_ARCHIVE_PAGE_LOAD_MIN_INTERVAL_MS`). No cron or env is required for that.
- `GET` or `POST /api/cron/auto-archive-stale-applications` — **Optional**; same auto-archive job on your own schedule. Requires `Authorization: Bearer <CRON_SECRET>` when `CRON_SECRET` is set.
- `GET /api/stats` — includes `totalRejections` (all rows), plus `workflowRejections` vs `blockedRejections` (ingest blocklist) for dashboards; `byScore` bands are scores **6–10** only (see **Score distribution** disclaimer). `GET /api/health`
