---
title: Quickstart
description: Create your first Hypergraph-powered application in minutes with TypeSync.
version: 0.0.1
tags: [quickstart, typesync]
---

# 🚀 Quickstart: An existing example app

In order to get started as fast as possible we have created an example app that you can clone and use as a starting point.

```bash
git clone https://github.com/geobrowser/hypergraph-app-template.git
cd hypergraph-app-template
pnpm install
pnpm dev
```

Open the browser, navigate to `http://localhost:5173` and you should see the app running.

# 🚀 Quickstart: Your First Hypergraph App

In case you want to define your own schema and mapping you can follow the guide below.

It will walk you through creating a new, fully-functional React application powered by Hypergraph using our scaffolding tool, **TypeSync**. In just a few minutes, you'll have a local development environment up and running.

This approach is perfect for developers who want to quickly build an application on top of Hypergraph without needing to set up the entire monorepo infrastructure.

## Prerequisites

- Node.js >= 22
- pnpm >= 10 (install with `npm install -g pnpm`)

## 1. Get the Hypergraph Toolkit

First, clone the Hypergraph repository, which contains TypeSync.

```bash
git clone https://github.com/graphprotocol/hypergraph.git
cd hypergraph
```

Next, install dependencies and build the required packages. This step ensures that TypeSync and all its components are ready to use.

```bash
pnpm install
pnpm build
```

## 2. Launch TypeSync

TypeSync is a visual tool that helps you define your data schema and then generates a complete starter application based on your design.

Navigate to the `typesync` app and start its development server:

```bash
cd apps/typesync
pnpm dev
```

This will start the TypeSync server. You can now access the **TypeSync Studio** in your browser at `http://localhost:4000`.

## 3. Scaffold Your Application

In the TypeSync Studio:

1.  Give your new application a name and a short description.
2.  Use the visual editor to define your data models (we call them "types"). For example, you could create a `Post` type with a `title` (Text) and `content` (Text) properties.
3.  When you're ready, click "Generate App".

TypeSync will create a new directory for your application (e.g., `./my-awesome-app`) within the `hypergraph` monorepo, containing all the files and dependencies you need.

## 4. Run Your New App

Once your app is generated, open a **new terminal tab**. Navigate into the newly created app directory, install its dependencies, and start the local development server.

```bash
# In a new terminal, from the `hypergraph/apps/typesync` directory
cd ../../my-awesome-app  # Adjust the path to match your app's name
pnpm install
pnpm dev
```

Your new Hypergraph-powered React application will now be running, typically at `http://localhost:5173`.

You're all set! You can now start building your application by editing the files in the `src` directory. The generated `src/schema.ts` file contains the Hypergraph schema you defined in TypeSync.

---

### Edit on GitHub :bust_in_silhouette:

[✏️ Improve this page](https://github.com/graphprotocol/hypergraph/edit/main/docs/docs/quickstart.md)

```

```
