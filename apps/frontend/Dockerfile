FROM node:24 AS builder

WORKDIR /app

# Install dependencies
COPY apps/frontend/package.json ./package.json
# Don't rely on the repo root lockfile (monorepo lock can break installs here).
# Use npm install with legacy peer deps to resolve workspace peer/dependency issues.
RUN npm install --legacy-peer-deps --silent

# Copy source and build
COPY . .
RUN npm run build

FROM nginx:alpine AS runner

# Copy built assets into nginx html folder
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]