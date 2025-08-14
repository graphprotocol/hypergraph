---
title: TypeSync
description: TypeSync is a visual tool that helps you manage your Hypergraph schema and update the schema.ts and mapping.ts for your Hypergraph application.
version: 0.0.1
tags: [typesync, hypergraph-cli, schema]
---

# 🧬 TypeSync

TypeSync is a visual tool that helps you manage your Hypergraph schema and update the schema.ts and mapping.ts for your Hypergraph application.

## Installation

TypeSync automatically comes with the `hypergraph` package. Once you have it installed it will be available via:


```bash
npx hg typesync --open
# or
pnpm hg typesync --open
bunx hg typesync --open
yarn hg typesync --open
```

This will start the TypeSync server. You can now access the TypeSync app in your browser at `http://localhost:3000`. The UI will look like this:

![TypeSync Dashboard](../static/img/typesync/typesync_dashboard.png)

The UI is split into two main sections:
- The left side is a list of existing types in the Knowledge Graph to pick from.
- The right side represents the schema you are currently working on.
  - At the bottom you can find two buttons:
    - `Sync with schema.ts` to sync the current schema to your `schema.ts` file.
    - `Publish Schema` to publish the current schema to the Knowledge Graph.
- The top right corner you can find a button to `Sign in to Geo Account` to sign in to your Geo Account. This is a prerequisite to publish your schema to the Knowledge Graph.

## Recommended Flow

1. Design your schema
2. Sync it to your schema.ts file using the `Sync with schema.ts` button
3. Publish your schema to the Knowledge Graph
  1. Sign in with Geo Connect. To do so click on the `Sign in to Geo Account` button in the top right corner.
  2. In "Connect" select an existing public space or create & select a new public space you want to publish your schema to. Note: Can be any space of your choice and doesn't matter which one.
  3. Click the "Publish Schema" button to publish your schema to the Knowledge Graph.

## Best Practices

If there is an existing type ideally use this one and adept it to your needs. This will allow for more interoperability with other applications.

For properties prefer existing properties, but in case you need a different type best to create a new property.