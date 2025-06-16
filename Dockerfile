# syntax=docker/dockerfile:1.4

# Installation stage.
FROM node:22-alpine AS base
WORKDIR /workspace
RUN apk add --update --no-cache openssl python3 make g++
# Install pnpm.
ADD package.json .
# TODO: Remove this once it's no longer needed.
# - https://github.com/pnpm/pnpm/issues/9014#issuecomment-2618565344
# - https://github.com/nodejs/corepack/issues/612
RUN npm install --global corepack@latest
RUN corepack enable && corepack prepare --activate
# Skip prisma code generation during install.
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=true
ENV CI=true
# Fetch all node modules purely based on the pnpm lock file.
COPY pnpm-lock.yaml .
RUN --mount=type=cache,id=workspace,target=/root/.local/share/pnpm/store pnpm fetch
# Copy the entire workspace into the scope and perform the actual installation.
COPY . .
RUN --mount=type=cache,id=workspace,target=/root/.local/share/pnpm/store pnpm install

# Build stage for the server.
FROM base AS build
# TODO: Remove this when we switch to an actual database.
ENV DATABASE_URL="file:./dev.db"
RUN \
  # TODO: This initalizes the database. But we should probably remove this later.
  pnpm --filter server prisma migrate reset --force && \
  # Build the monorepo packages
  pnpm build && \
  # Generate the prisma client
  pnpm --filter server prisma generate && \
  # Build the server.
  pnpm --filter server build && \
  # Create an isolated deployment for the server.
  pnpm --filter server deploy --prod deployment --legacy && \
  # Move the runtime build artifacts into a separate directory.
  mkdir -p deployment/out && mv deployment/dist deployment/node_modules deployment/package.json deployment/out && \
  # Add prisma client in dist
  mv deployment/prisma/generated/client/libquery_engine-linux-musl-arm64-openssl-3.0.x.so.node deployment/out/dist/libquery_engine-linux-musl-arm64-openssl-3.0.x.so.node

# Slim runtime image.
FROM node:22-alpine AS server
WORKDIR /app
COPY --from=build /workspace/deployment/out .
# TODO: Remove this when we switch to an actual database.
ENV DATABASE_URL="file:./dev.db"
EXPOSE 3030
CMD ["node", "dist/index.js"]
