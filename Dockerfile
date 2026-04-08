# Alpine 3.23 base includes zlib patched for CVE-2026-27171; apk line catches mirror lag.
FROM node:22-alpine3.23 AS deps
WORKDIR /app
RUN apk update && apk upgrade --no-cache zlib
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine3.23 AS build
WORKDIR /app
RUN apk update && apk upgrade --no-cache zlib
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate
RUN npm run build

# Release stage: app + prisma for migrate. Single image for GHCR and local deploy.
FROM build AS release
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
# Standalone does not include static files; copy them so CSS/JS load (fixes 404)
COPY --from=build /app/.next/static /app/.next/standalone/.next/static
COPY --from=build /app/public /app/.next/standalone/public
USER nextjs
# Run migrations, then app. Single container, no separate migrate service.
CMD ["sh", "-c", "npx prisma migrate deploy && cd .next/standalone && exec node server.js"]
