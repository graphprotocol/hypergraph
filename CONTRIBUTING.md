# Contributing

## Upgrading Dependencies

```sh
pnpm up --interactive --latest -r
```

## Publishing

Update the version in the `package.json` files (hypergraph, hypergraph-react, typesync)

```sh
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
