---
title: Quickstart
description: Build your first Hypergraph app in minutes.
version: 0.0.1
tags: [quickstart, hello-world]
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🚀 Quickstart — Hello Hypergraph!

This guide walks you through spinning up a **local-first, end-to-end-encrypted Hypergraph app** with nothing but TypeScript and React.

## Requirements

• **Node ≥ 18** (we test on 20+)

• **pnpm**   `npm i -g pnpm`

• **Bun**   (optional, but makes the dev server blazingly fast)   `curl -fsSL https://bun.sh/install | bash`

---

## 1 — Create a project

We'll use **Next.js** because it supports React Server Components out of the box, but any React/TS stack works.

```bash title="Terminal"
pnpm create next-app hello-hypergraph --ts --eslint --app --import-alias "@/*"
cd hello-hypergraph
```

---

## 2 — Install the SDK

```bash title="Terminal"
# Core SDK + React helpers
pnpm add @graphprotocol/hypergraph @graphprotocol/hypergraph-react

# Peer deps automatically installed by pnpm, but listed here for clarity
pnpm add react react-dom @automerge/automerge @automerge/automerge-repo @automerge/automerge-repo-react-hooks @tanstack/react-query effect viem
```

---

## 3 — Run a local sync server

A sync server keeps peers in real-time sync and stores encrypted updates.

```bash title="Terminal"
pnpm --filter server dev
```

> ✨ The server defaults to `http://localhost:3030`. Feel free to tweak `syncServerUri` later.

---

## 4 — Wire up the provider

Create `src/app/providers/Hypergraph.tsx`:

```tsx title="src/app/providers/Hypergraph.tsx"
'use client';
import { HypergraphAppProvider } from '@graphprotocol/hypergraph-react';

export function Hypergraph({ children }: { children: React.ReactNode }) {
  // Any persistent browser storage works. LocalStorage is fine for demos.
  const storage = globalThis.localStorage;
  return (
    <HypergraphAppProvider storage={storage}>
      {children}
    </HypergraphAppProvider>
  );
}
```

Wrap your root layout (or `_app.tsx` in pages-router) with the provider:

```tsx title="src/app/layout.tsx"
import { Hypergraph } from '@/app/providers/Hypergraph';
// ... existing imports ...

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Hypergraph>{children}</Hypergraph>
      </body>
    </html>
  );
}
```

---

## 5 — Login & create a Space

Now let's add a very small component that:

1. Prompts the user to connect a wallet (using MetaMask or any EIP-1193 provider).
2. Creates a new **Space** and writes a "Hello World" message into it.

```tsx title="src/app/page.tsx"
'use client';
import { useHypergraphApp } from '@graphprotocol/hypergraph-react';
import { useState } from 'react';

export default function Page() {
  const { login, authenticated, createSpace } = useHypergraphApp();
  const [spaceId, setSpaceId] = useState<string | null>(null);

  const onLogin = async () => {
    // Connect wallet via the browser provider
    await login(window.ethereum);
  };

  const onCreate = async () => {
    const id = await createSpace();
    setSpaceId(id);
  };

  return (
    <main className="p-8 space-y-4">
      {!authenticated ? (
        <button onClick={onLogin} className="btn">Connect Wallet</button>
      ) : (
        <>
          <button onClick={onCreate} className="btn">Create Space</button>
          {spaceId && <p>✅ Created space: <code>{spaceId}</code></p>}
        </>
      )}
    </main>
  );
}
```

> 🧩 **What just happened?**
>
> • `login()` stores an encrypted identity in `localStorage` and opens a WebSocket to the sync server.
> • `createSpace()` generates the keys for a new Space, persists them locally, and emits a `createSpace` event to the server so other members can subscribe.

---

## Next steps

* Read **Core Concepts** to understand Spaces, Identities, Inboxes, and the Knowledge Graph.
* Explore the **API Reference** for low-level methods and event payloads.
* Open `apps/next-example` in this repo to see a more fleshed-out demo.

---

### Edit on GitHub  :bust_in_silhouette:

[✏️ Improve this page](https://github.com/graphprotocol/hypergraph/edit/main/docs/docs/quickstart.md) 