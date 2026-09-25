FROM node:22 AS base
RUN npm install -g turbo

# --- Stage 1: Pruner ---
FROM base AS pruner
WORKDIR /app
COPY . .
RUN turbo prune @votura/frontend --docker

# --- Stage 2: Installer ---
FROM base AS installer
WORKDIR /app

COPY --from=pruner /app/out/json/ .
RUN npm ci

COPY --from=pruner /app/out/full/ .

RUN npx turbo run build --filter=@votura/frontend...

# --- Stage 3: Runtime ---
FROM nginx:alpine
COPY --from=installer /app/apps/frontend/dist /usr/share/nginx/html
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY apps/frontend/docker-entrypoint.sh /usr/local/bin/frontend-entrypoint.sh
RUN chmod +x /usr/local/bin/frontend-entrypoint.sh
EXPOSE 80
ENTRYPOINT ["/usr/local/bin/frontend-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]