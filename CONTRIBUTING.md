# Contributing

## Setup

```sh
pnpm install
cd apps/server
cp .env.example .env
# add the PRIVY_APP_SECRET & PRIVY_APP_ID to the apps/server/.env file
pnpm prisma migrate dev
```

## Development

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

To develop the Typesync CLI, you can run:

```sh
cd apps/typesync
pnpm dev
```

To develop the Typesync frontend run:

```sh
# open the vite.config.ts and comment out the server object that specifies the port to be 3000
cd apps/typesync
pnpm run dev:cli
# in another tab
cd apps/typesync
pnpm dev:client
```

To develop the create-hypergraph, run:

```sh
cd apps/create-hypergraph
pnpm run dev
```

You can run the Next example app with:

```sh
# Notes:
# - You need to build the packages first and every time you make changes to the packages
cd apps/next-example
pnpm dev
```

To run the docs locally, you can run:

```sh
cd docs
pnpm start
```

## Changesets

Changesets are used to create a changelog and publish a new version of the package. In order to document your changes, you can run the following command:

```sh
pnpm changeset
```

It will open a prompt to ask you which packages are affected and the type of change you are making.


## Upgrading Dependencies

```sh
pnpm up --interactive --latest -r
```

## Publishing

Update the version in the `package.json` files (hypergraph, hypergraph-react, typesync)

```sh
pnpm changeset version

pnpm build
# publish hypergraph
cd packages/hypergraph/publish
pnpm publish
# publish hypergraph-react
cd packages/hypergraph-react/publish
pnpm publish
# publish typesync
cd apps/typesync
pnpm publish --tag latest
```

## Deploying your own SyncServer to Railway

Setup a service and attach a volume under `/data` to it.

Since cache-mounts on Railway need to prefixed with the service ID and BuildKit doesn’t expand variables there. You must give it a literal value for the mount ID.

To do so you can fill in the service ID below and run the command before your `railway up` command.
More info here: https://docs.railway.com/guides/dockerfiles#cache-mounts
Get the service ID by using CMD/CTRL+K and search for `Copy Service ID`.

```sh
sed -i '' \
  's|\(--mount=type=cache,id=\)workspace|\1s/<service-id>-pnpm-store|' \
  Dockerfile
railway up
```

Note: By default horizontal scaling is disabled because of the attached volume.

In the UI setup the following variables for the service:
- set the `DATABASE_URL` to `file:/data/production.sqlite`
- set the `PRIVY_APP_SECRET` to your Privy app secret
- set the `PRIVY_APP_ID` to your Privy app id
- set the `HYPERGRAPH_CHAIN` to your Hypergraph chain

Then restart the service in the UI.

## Deploying your own SyncServer to Fly.io (single instance)

```sh
# change the name of the `app` and `primary_region` in the fly.toml file

# create a volume for the sqlite db file - replace `fra` with your region
fly volumes create data -s 1 -r fra

# set the DATABASE_URL (not sure if it's necessary since already set in the Dockerfile)
fly secrets set DATABASE_URL=file:/data/production.sqlite
# set the Privy app secret, id and chain (fill in your values)
fly secrets set PRIVY_APP_SECRET=<PRIVY_APP_SECRET>
fly secrets set PRIVY_APP_ID=<PRIVY_APP_ID>
fly secrets set HYPERGRAPH_CHAIN=<HYPERGRAPH_CHAIN>

# deploy (ha=false to avoid starting multiple instances)
fly launch --ha=false

# probably not necessary, but better safe than sorry
fly scale count 1
```

Resources:
- https://fly.io/docs/js/prisma/sqlite/
- https://programmingmylife.com/2023-11-06-using-sqlite-for-a-django-application-on-flyio.html
- https://community.fly.io/t/backup-and-restore-sqlite-db-to-server/21232/2

### Multi-region deployments

As an alternative you might want to setup a lite-fs volume for multi-region deployments.

Resources:
- https://github.com/epicweb-dev/node-sqlite-fly-tutorial/tree/main/steps
- https://www.epicweb.dev/tutorials/deploy-web-applications/multi-region-data-and-deployment/prepare-for-multi-region-data-with-litefs
- https://fly.io/docs/litefs/speedrun/
