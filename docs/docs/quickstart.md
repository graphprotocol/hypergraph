---
title: Quickstart
description: Create your first Hypergraph-powered application in minutes with TypeSync.
version: 0.0.1
tags: [quickstart, typesync]
---

# 🚀 Quickstart

If you just want to get started and get a feel for how Hypergraph works, we have created an example app that you can clone and use as a starting point.

## Explore the Example app

In order to get started as fast as possible we have created an example app that you can clone and use as a starting point.

```bash
git clone https://github.com/geobrowser/hypergraph-app-template.git
cd hypergraph-app-template
pnpm install
pnpm dev
```

Open the browser, navigate to `http://localhost:5173` and you should see the app running.

## Create a new app using TypeSync

In case you want build an app with your own data types you can follow the guide below.

It will walk you through creating a new, fully-functional React application powered by Hypergraph using our scaffolding tool, **TypeSync**. In just a few minutes, you'll have a local development environment up and running.

### Prerequisites

- Node.js >= 22
- pnpm >= 10 (install with `npm install -g pnpm`)

### 1. Install the Hypergraph CLI

First, clone the Hypergraph repository, which contains TypeSync.

```bash
npm install -g @graphprotocol/hypergraph-cli@latest
```

When using `pnpm` you need to v10 or higher

```bash
pnpm install -g @graphprotocol/hypergraph-cli@latest
pnpm approve-builds -g
# select @tailwindcss/oxide, better-sqlite3, and esbuild
```

### 2. Launch TypeSync

TypeSync is a visual tool that helps you define your data schema and then generates a complete starter application based on your design. Launch it with

```bash
hg typesync --open
```

This will start the TypeSync server. You can now access the **TypeSync** app in your browser at `http://localhost:3000`.

### 3. Scaffold Your Application

In the TypeSync Studio:

1.  Give your new application a name and a short description.
2.  Use the visual editor to define your data models (we call them "types"). For example, you could create a `Post` type with a `name` (Text) and `content` (Text) properties.
3.  When you're ready, click "Generate App".

TypeSync will create a new directory for your application (e.g., `./my-awesome-app`) containing all the files and dependencies you need.

### 4. Run Your New App

Once your app is generated, open a **new terminal tab**. Navigate into the newly created app directory, install its dependencies, and start the local development server.

```bash
cd ./my-awesome-app  # Adjust the path to match your app's name
pnpm install
pnpm dev
```

Your new Hypergraph-powered React application will now be running, typically at `http://localhost:5173`.

You're all set! You can now start building your application by editing the files in the `src` directory. The generated `src/schema.ts` file contains the Hypergraph schema you defined in TypeSync.

---

## Edit on GitHub :bust_in_silhouette:

[✏️ Improve this page](https://github.com/graphprotocol/hypergraph/edit/main/docs/docs/quickstart.md)

```

```
