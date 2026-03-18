FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
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
USER nextjs
# Default: run app. Override with "npx prisma migrate deploy" for migrate.
CMD ["sh", "-c", "cd .next/standalone && exec node server.js"]
