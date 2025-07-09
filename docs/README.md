# Website

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

> **Note:** This project is part of a monorepo managed with [pnpm workspaces](https://pnpm.io/workspaces). All commands should be run from the monorepo root using pnpm's workspace filtering.

### Installation

Install all dependencies from the monorepo root:

```
pnpm install
```

### Local Development

Start the Docusaurus dev server for the docs site:

```
pnpm --filter docs start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

### Build

Build the static site:

```
pnpm --filter docs build
```

This command generates static content into the `build` directory and can be served using any static content hosting service.

### Deployment

Using SSH:

```
USE_SSH=true pnpm --filter docs deploy
```

Not using SSH:

```
GIT_USER=<Your GitHub username> pnpm --filter docs deploy
```

If you are using GitHub Pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.
