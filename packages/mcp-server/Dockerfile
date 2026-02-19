# syntax=docker/dockerfile:1.4

# Installation stage.
FROM node:22-alpine AS base
WORKDIR /workspace
# Install pnpm via corepack.
ADD package.json .
RUN npm install --global corepack@latest
RUN corepack enable && corepack prepare --activate
ENV CI=true
# Fetch all node modules purely based on the pnpm lock file.
COPY pnpm-lock.yaml .
RUN pnpm fetch
# Copy the entire workspace into the scope and perform the actual installation.
COPY . .
RUN pnpm install

# Build stage.
FROM base AS build
RUN \
  pnpm --filter @graphprotocol/mcp-server build && \
  pnpm --filter @graphprotocol/mcp-server deploy --prod deployment --legacy && \
  mkdir -p deployment/out && \
  mv deployment/dist deployment/node_modules deployment/package.json deployment/out && \
  cp -r packages/mcp-server/config deployment/out/config

# Slim runtime image.
FROM node:22-alpine AS runtime
WORKDIR /app
COPY --from=build /workspace/deployment/out .
EXPOSE 3000
CMD ["node", "dist/http.js"]
