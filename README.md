# Graph Framework

## Development

### Setup

```sh
pnpm install
docker-compose up
```

```sh
# in another tab
cd apps/server
cp .env.example .env
pnpm prisma migrate dev
```

### Development

```sh
docker-compose up
# in another tab
cd apps/events
pnpm dev
# in another tab
cd apps/server
pnpm dev
```

## Upgrading Dependencies

```sh
pnpm up --interactive
cd apps/events
pnpm up --interactive
cd packaes/graph-framework
pnpm up --interactive
```
