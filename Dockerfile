# ---- Builder stage ----
FROM node:22-alpine AS build

# 1. Set up pnpm & workspace root
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@8.15.5 --activate

#   Copy root manifests first (leverage cache)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY tsconfig.base.json ./
COPY scripts ./scripts

#   Copy workspace packages
COPY packages ./packages
COPY apps ./apps

# 2. Install dependencies
RUN pnpm install --frozen-lockfile

# 3. Build all workspace packages
RUN pnpm --filter @graphprotocol/hypergraph run build
RUN pnpm --filter server run build

# 4. Create a standalone server deployment
RUN pnpm --filter server deploy --legacy dist

# ------------------------------------------------------------
# ---- Runtime stage ----
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Copy the standalone deployment from the build stage
COPY --from=build /app/dist .

# Copy the generated Prisma client
COPY --from=build /app/apps/server/generated ./generated

# Copy the SQLite database file and set DATABASE_URL for Prisma
COPY --from=build /app/apps/server/prisma/dev.db ./dev.db

# Point Prisma at the bundled SQLite database
ENV DATABASE_URL="file:./dev.db"

EXPOSE 3030
CMD ["node", "dist/index.js"]