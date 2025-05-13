---
title: Quickstart
description: Spin up the Hypergraph monorepo locally, including sync server, event workers, and example app.
version: 0.0.1
tags: [quickstart]
---

# 🚀 Quickstart

Follow these steps to run the **Hypergraph monorepo** on your machine.

## 1. Clone the repository

```bash
git clone https://github.com/graphprotocol/hypergraph.git
cd hypergraph
```

## 2. Setup

Install dependencies and initialize the database:

```bash
pnpm install
cd apps/server
cp .env.example .env
pnpm prisma migrate dev
```

## 3. Development

Start a watcher to rebuild packages on change:

```bash
pnpm build --watch
```

Then, in separate terminal tabs, run the services:

```bash
# Terminal tab 1: event workers
cd apps/events
pnpm dev

# Terminal tab 2: sync server
cd apps/server
pnpm dev
```

**Note:** Whenever you modify the Prisma schema, regenerate the client with:

```bash
cd apps/server
pnpm prisma migrate dev
```

## 4. Run the Next.js example

Ensure packages are built, then:

```bash
cd apps/next-example
pnpm dev
```

Visit `http://localhost:3000` to see the example app in action.

## 5. Upgrade dependencies

Keep everything up to date with:

```bash
pnpm up --interactive --latest -r
```

---

### Edit on GitHub  :bust_in_silhouette:

[✏️ Improve this page](https://github.com/graphprotocol/hypergraph/edit/main/docs/docs/quickstart.md) 