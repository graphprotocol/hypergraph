# Graph Framework

## Development

### Setup

```sh
pnpm install
cd apps/server
cp .env.example .env
pnpm prisma migrate dev
```

### Development

```sh
pnpm build --watch
# in another tab
cd apps/events
pnpm dev
# in another tab
cd apps/server
pnpm dev
```

Any time you make changes to the schema, you will need to run the following commands:

```sh
cd apps/server
pnpm prisma migrate dev # this will also generate the Prisma client
```

You can run the next example app with:

```sh
# Notes:
# - You need to build the packages first and every time you make changes to the packages
cd apps/next-example
pnpm dev
```

## Upgrading Dependencies

```sh
pnpm up --interactive --latest -r
```