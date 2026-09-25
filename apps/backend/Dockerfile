FROM node:22-alpine AS base

# --- Stage 1: Prune ---
FROM base AS pruner
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune @votura/backend --docker

# --- Stage 2: Install & Build ---
FROM base AS installer
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY --from=pruner /app/out/json/ .
RUN npm install

COPY --from=pruner /app/out/full/ .

RUN npx turbo run build --filter=@votura/backend...

# --- Stage 3: Runtime ---
FROM node:22-alpine AS runner
WORKDIR /app

# Non-Root-User für mehr Sicherheit
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 expressjs

# Nur das Nötigste aus der installer-Stage übernehmen
COPY --from=installer --chown=expressjs:nodejs /app .
COPY --chown=expressjs:nodejs apps/backend/docker-entrypoint.mjs /usr/local/bin/votura-entrypoint.mjs
RUN mkdir -p /app/logs /app/packages/db/logs /app/apps/backend/logs \
    && chown -R expressjs:nodejs /app/logs /app/packages/db/logs /app/apps/backend/logs

USER expressjs

EXPOSE 4000
ENV NODE_ENV=production
ENV PORT=4000

ENTRYPOINT ["node", "/usr/local/bin/votura-entrypoint.mjs"]