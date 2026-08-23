FROM node:22 AS base
RUN npm install -g turbo

# --- Stage 1: Pruner ---
FROM base AS pruner
WORKDIR /app
COPY . .
RUN turbo prune @votura/frontend --docker

# --- Stage 2: Installer (nur benötigte Dependencies) ---
FROM base AS installer
WORKDIR /app

# Erst nur package.json-Dateien kopieren -> optimales Caching
COPY --from=pruner /app/out/json/ .
RUN npm ci

# Jetzt den echten Source-Code kopieren
COPY --from=pruner /app/out/full/ .
RUN npx turbo run build --filter=@votura/frontend...

# --- Stage 3: Runtime ---
FROM nginx:alpine
COPY --from=installer /app/apps/frontend/dist /usr/share/nginx/html
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]