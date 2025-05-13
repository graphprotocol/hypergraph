---
title: Quickstart
description: Spin up the Hypergraph monorepo locally, including sync server, event workers, and example app.
version: 0.0.1
tags: [quickstart]
---

# 🚀 Quickstart

## Prerequisites

- Node >= 18 (tested on 20+)
- pnpm >= 7 (install via `npm install -g pnpm`)
- Bun (optional, but speeds up the dev server — install via `curl -fsSL https://bun.sh/install | bash`)

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

## 3. Build workspace packages

Before you run *any* app you must compile the TypeScript workspaces so their `dist/` folders exist:

```bash
pnpm build            # one-off build of every package (hypergraph-react, hypergraph, …)
```

> Pro-tip: while iterating on library code you can use the watch script instead of running a full build each time:
>
> ```bash
> pnpm --filter @graphprotocol/hypergraph-react dev   # tsc -w
> ```

After the initial build you can keep a watcher running or rely on the one we start in the next section.

## 4. Development

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

## 5. Run the Next.js example

Ensure packages are built, then:

```bash
cd apps/next-example
pnpm dev
```

Visit `http://localhost:3000` to see the example app in action.

> 💡 **Optional:** If you'd rather skip the `pnpm build --watch` process while hacking on `packages/hypergraph-react`, add the package to `transpilePackages` in `apps/next-example/next.config.ts`:
>
> ```ts title="apps/next-example/next.config.ts"
> const nextConfig = {
>   transpilePackages: ['@graphprotocol/hypergraph-react'],
> };
> export default nextConfig;
> ```

## 6. Upgrade dependencies

Keep everything up to date with:

```bash
pnpm up --interactive --latest -r
```

---

### Edit on GitHub  :bust_in_silhouette:

[✏️ Improve this page](https://github.com/graphprotocol/hypergraph/edit/main/docs/docs/quickstart.md)





```