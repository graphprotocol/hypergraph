# Technology Stack

**Analysis Date:** 2026-02-18

## Languages

**Primary:**
- TypeScript 5.9.2 - All source code, packages, and applications
- JavaScript - Build scripts and CLI utilities

**Secondary:**
- SQL - Database schema and queries through Prisma

## Runtime

**Environment:**
- Node.js 20+ required (from `packages/create-hypergraph/package.json`)
- ESM (ES Modules) as the module system (`"type": "module"` in all package.json files)

**Package Manager:**
- pnpm 10.12.1 (enforced through `packageManager` field in root `package.json`)
- Lockfile: Present (pnpm-lock.yaml)

## Frameworks

**Core SDK:**
- `@graphprotocol/hypergraph` 0.13.2 - Main SDK for local-first, privacy-preserving dApps
- `@graphprotocol/hypergraph-react` 0.13.2 - React hooks and components for Hypergraph

**Web Frameworks:**
- Vite 7.1.3 - Build tool and dev server for frontend applications (`apps/events`, `apps/connect`, `apps/privy-login-example`)
- Next.js (in `apps/next-example` and `apps/template-nextjs` - version not pinned in root dependencies)
- React 19.1.1 - UI library for frontend applications
- React DOM 19.1.1 - React rendering

**Backend/API:**
- Effect Platform 0.90.10 - Functional programming framework for server APIs (`@effect/platform`, `@effect/platform-node`)
- Express (migration in progress - original implementation, being replaced by Effect Platform HTTP API)

**Router/Navigation:**
- TanStack React Router 1.131.27 - Client-side routing for React applications
- TanStack React Router DevTools 1.131.27 - Development tools for routing

**State Management:**
- XState Store 3.9.2 - Composable state management (imported in multiple apps and packages)
- React Query (TanStack React Query) 5.85.5 - Server state management and data fetching

**Data Sync & Conflict Resolution:**
- Automerge 3.1.1 - CRDT library for conflict-free replicated data (`@automerge/automerge`)
- Automerge Repo 2.2.0 - Repository management for Automerge documents (`@automerge/automerge-repo`)
- Automerge Repo React Hooks 2.2.0 - React integration for Automerge (`@automerge/automerge-repo-react-hooks`)

**Cryptography:**
- Noble Cryptography Suite:
  - `@noble/ciphers` 1.3.0 - Symmetric encryption
  - `@noble/curves` 1.9.7 - Elliptic curve cryptography
  - `@noble/hashes` 1.8.0 - Cryptographic hash functions
  - `@noble/secp256k1` 2.3.0 - SECP256K1 signature scheme
- `@serenity-kit/noble-sodium` 0.2.1 - Libsodium wrapper using Noble primitives

**Blockchain/Web3:**
- Viem 2.34.0 - TypeScript Ethereum client library
- Permissionless 0.2.47 - Account abstraction library (ERC-4337, ERC-7579, SafeAccountClient)
- `@rhinestone/module-sdk` 0.2.8 - ERC-7579 module SDK for smart sessions
- SIWE 3.0.0 - Sign-In with Ethereum message signing (`siwe`)

**Database:**
- Prisma 6.14.0 - ORM and schema management (`@prisma/client`, `prisma` CLI)
- SQLite (default database provider configured in `apps/server/prisma/schema.prisma`)
- PostgreSQL (supported as alternative in schema configuration)

**GraphQL:**
- graphql-request 7.2.0 - Lightweight GraphQL client for querying The Graph network

**Testing:**
- Vitest 3.2.4 - Unit and integration test runner
- `@effect/vitest` 0.25.1 - Effect-aware test utilities
- `@testing-library/react` 16.3.0 - React component testing
- `@testing-library/jest-dom` 6.8.0 - DOM matchers
- JSDOM 26.1.0 - DOM environment for testing

**Code Quality:**
- Biome 2.2.0 - Linting and code formatting
- TypeScript Compiler (tsc) - Type checking in build-only mode
- Babel 7.28.3 - JavaScript transpilation (with `babel-plugin-annotate-pure-calls`)

**Build Tools:**
- tsup 8.4.0 - TypeScript bundler for server app
- tsdown 0.14.1 - Bundler for `create-hypergraph` CLI
- tsx 4.20.4+ - TypeScript executor for development and CLI
- Execa 9.6.0 - Process execution utility

**CLI & Logging:**
- `@effect/cli` 0.69.2 - CLI framework using Effect
- `@effect/printer` 0.45.0 - Pretty-printing output
- `@effect/printer-ansi` 0.45.0 - ANSI color support in logs
- `open` 10.2.0 - Cross-platform URL/file opener

**UI Components & Styling:**
- Tailwind CSS 4.1.12 - Utility-first CSS framework
- TailwindCSS Vite Plugin 4.1.12 - Vite integration
- Radix UI - Unstyled, accessible component primitives:
  - `@radix-ui/react-avatar` 1.1.10
  - `@radix-ui/react-label` 2.1.7
  - `@radix-ui/react-slot` 1.2.3
  - `@radix-ui/react-icons` 1.3.2
- Framer Motion 12.23.12 - Animation library
- Lucide React 0.541.0 - Icon library
- Class Variance Authority 0.7.1 - CSS class composition utility
- clsx 2.1.1 - Class name utility
- tailwind-merge 3.3.1 - Tailwind CSS class merging

**Utilities:**
- uuid 11.1.0 - UUID generation
- `@types/uuid` 10.0.0 - TypeScript definitions for uuid
- isomorphic-ws 5.0.0 - WebSocket client (browser and Node.js compatible)
- cors 2.8.5 - CORS middleware
- bs58check 4.0.0 - Base58Check encoding/decoding
- glob 11.0.3 - File pattern matching

**Authentication:**
- `@privy-io/react-auth` 2.21.4 - Privy authentication for React apps
- `@privy-io/server-auth` 1.32.0 - Privy server-side verification

**Observability:**
- `@effect/opentelemetry` 0.56.6 - OpenTelemetry integration with Effect
- Honeycomb API integration (configuration in `apps/server/src/config/honeycomb.ts`)

**Changelog Management:**
- Changesets 2.29.8 - Changelog and version management

**Development Utilities:**
- JITI 2.5.1 - TypeScript-aware require() for dynamic imports
- Glob 11.0.3 - Glob pattern matching
- pkg-pr-new 0.0.56 - PR automation utility

## Configuration

**Environment:**
- Loaded via Effect's `PlatformConfigProvider.layerDotEnvAdd('.env')` in `apps/server/src/index.ts`
- Configuration managed through Effect's `Config` module for type-safe env var access

**Key Configuration Files:**
- `biome.jsonc` - Linting and formatting configuration (2-space indent, 120-char line width, single quotes)
- `tsconfig.json` - Root TypeScript configuration with project references
- `vitest.config.ts` - Root test configuration with project matrix
- `package.json` - Workspace definition and scripts (root level and per-package)

**Database Configuration:**
- `apps/server/prisma/schema.prisma` - Database schema with Prisma
- Default: SQLite with `file:./dev.db` fallback
- Supports PostgreSQL as alternative provider

## Platform Requirements

**Development:**
- Node.js 20+
- pnpm 10.12.1
- Git (for monorepo management)

**Production:**
- Node.js 20+ runtime
- Database: SQLite (default) or PostgreSQL
- Optional: Honeycomb API key for observability (`HONEYCOMB_API_KEY`)
- Optional: Privy authentication credentials (`PRIVY_APP_ID`, `PRIVY_APP_SECRET`)

## Build System

**Monorepo:**
- pnpm workspaces with `packages/` and `apps/` directories
- Turbo cache enabled for incremental builds (`pnpm build`)
- TypeScript project references for proper dependency resolution

**Build Commands:**
- `pnpm build` - Build all packages and apps (packages first, then apps in parallel)
- `pnpm clean` - Remove all build artifacts and node_modules
- Individual package builds use respective tooling (tsc, tsup, tsdown, Vite)

**Type Checking:**
- `pnpm check` - TypeScript type checking across all projects (tsc -b)
- Build emit disabled; separate compilation step

---

*Stack analysis: 2026-02-18*
