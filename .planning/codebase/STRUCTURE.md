# Codebase Structure

**Analysis Date:** 2026-02-18

## Directory Layout

```
hypergraph/
├── packages/                    # Shared libraries and SDKs
│   ├── hypergraph/             # Core SDK
│   ├── hypergraph-react/       # React bindings
│   ├── create-hypergraph/      # Project scaffolding tool
│   └── typesync-studio/        # Schema editing UI
├── apps/                       # Complete applications
│   ├── server/                 # Sync server (Express-like)
│   ├── events/                 # Demo app
│   ├── privy-login-example/    # Privy auth example
│   ├── connect/                # Geo Connect auth
│   ├── next-example/           # Next.js integration
│   ├── template-nextjs/        # Next.js template
│   └── template-vite-react/    # Vite+React template
├── docs/                       # Docusaurus documentation
├── scripts/                    # Build and utility scripts
├── .claude/                    # Claude AI configuration
├── .planning/                  # Planning documents (GSD)
└── pnpm-workspace.yaml        # Monorepo configuration
```

## Directory Purposes

**packages/hypergraph:**
- Purpose: Main TypeScript SDK for local-first dapps
- Contains: Entity management, spaces, inboxes, cryptography, CLI, type mapping
- Key files: `src/index.ts` (main export), `src/store.ts` (state), `src/store-connect.ts` (auth state)

**packages/hypergraph/src:**
- `entity/` - CRUD operations for typed entities (create, update, delete, find, schema)
- `space/` - Space management (creation, public space queries, events)
- `identity/` - Authentication and key management (Privy, SIWE, CONNECT)
- `inboxes/` - Message inboxes with encryption and validation
- `messages/` - Message encryption/decryption, serialization
- `key/` - Key management utilities
- `connect/` - CONNECT protocol implementation for identity
- `cli/` - Command-line interface (TypeSync schema, import/export)
- `mapping/` - Entity mapping and schema utilities
- `utils/` - Helper functions (ID generation, base58, filtering, etc.)
- `type/` - Type system and schema annotations
- `space-events/` - Space event types and handlers
- `space-info/` - Space metadata queries
- `privy-auth/` - Privy-specific authentication
- `config.ts` - SDK configuration
- `constants.ts` - Constants like property ID symbols
- `types.ts` - Shared type definitions

**packages/hypergraph-react/src:**
- `HypergraphAppContext.tsx` - Main provider, store initialization, auth context
- `HypergraphSpaceContext.tsx` - Space selection context
- `hooks/` - React hooks for entities, spaces, inboxes, message operations
  - `use-entities.tsx` - Query/list entities
  - `use-entity.tsx` - Single entity with updates
  - `use-spaces.ts` - List spaces
  - `use-space.ts` - Get current space
  - `useOwnSpaceInbox.ts` - Space inbox management
  - `useOwnAccountInbox.ts` - Account inbox management
  - `usePublishToSpace.ts` - Publish operations
- `internal/` - Internal hooks (entity public, delete operations)
- `publish-ops.ts` - Publish operation helpers

**apps/server/src:**
- Purpose: Backend sync server for real-time collaboration
- `index.ts` - Entry point with observability setup
- `server.ts` - HTTP/WebSocket server configuration
- `websocket.ts` - WebSocket connection handling and message routing
- `http/` - HTTP API endpoints (Effect-based)
- `services/` - Business logic
  - `spaces.ts` - Space sync logic
  - `account-inbox.ts` - Account inbox sync
  - `space-inbox.ts` - Space inbox sync
  - `connections.ts` - Active connection tracking
  - `database.ts` - Prisma client setup
  - `identity.ts` - Identity verification
  - `privy-auth.ts` - Privy integration
  - `connect-identity.ts` - CONNECT identity
  - `app-identity.ts` - Application identity
- `domain/` - Domain models
- `config/` - Configuration (port, database, Honeycomb)

**apps/events/src:**
- Purpose: Demo application showcasing hypergraph features
- `routes/` - TanStack Router routes
- `components/` - React components for UI
- `schema.ts` - Type definitions for events
- `mapping.ts` - Entity mapping configuration
- `lib/` - Helper utilities

**packages/create-hypergraph/src:**
- Purpose: Project scaffolding tool
- Generates starter projects with proper SDK setup

**packages/typesync-studio/src:**
- Purpose: Web UI for schema editing (TypeSync)
- `Components/Schema/` - Schema editor components
- `routes/` - Application routes
- `hooks/` - Custom React hooks
- `clients/` - API clients

## Key File Locations

**Entry Points:**
- `packages/hypergraph/src/index.ts` - Main SDK exports
- `packages/hypergraph-react/src/index.ts` - React hooks exports
- `apps/server/src/index.ts` - Server startup
- `packages/hypergraph/src/cli/bin.ts` - CLI entry point

**Configuration:**
- `pnpm-workspace.yaml` - Monorepo packages definition
- `packages/hypergraph/src/config.ts` - SDK config (server URI, etc.)
- `apps/server/src/config/` - Server configuration modules
- `tsconfig.json`, `tsconfig.base.json` - TypeScript base config

**Core Logic:**
- `packages/hypergraph/src/store.ts` - XState store for spaces/identities/updates
- `packages/hypergraph/src/entity/` - All entity operations
- `apps/server/src/services/spaces.ts` - Server space sync logic
- `packages/hypergraph-react/src/HypergraphAppContext.tsx` - React provider logic

**Testing:**
- `packages/hypergraph/test/` - hypergraph SDK tests
- `packages/hypergraph-react/test/` - React hooks tests
- `apps/server/test/` - Server tests
- `packages/create-hypergraph/test/` - Scaffolding tests

## Naming Conventions

**Files:**
- Kebab-case for module files: `create-entity.ts`, `find-many-public.ts`
- PascalCase for React components: `HypergraphAppContext.tsx`, `Boot.tsx`
- camelCase for utility functions: `automergeId.ts`, `generateId.ts`
- Index files export public API: `index.ts`

**Directories:**
- Kebab-case for feature folders: `space-events/`, `space-info/`, `space-inbox/`
- Lowercase for functional areas: `entity/`, `inboxes/`, `utils/`
- Internal implementations in `internal/` subdirectories

**Exports:**
- Barrel exports via `index.ts` in each module
- Use ES6 named exports, not default exports
- Public API organized as namespaces: `Entity.*`, `Space.*`, `Identity.*`

## Where to Add New Code

**New Entity Operation:**
- Create file: `packages/hypergraph/src/entity/my-operation.ts`
- Export from: `packages/hypergraph/src/entity/index.ts`
- Tests: `packages/hypergraph/test/entity/my-operation.test.ts`

**New React Hook:**
- Create file: `packages/hypergraph-react/src/hooks/use-my-feature.ts`
- Export from: `packages/hypergraph-react/src/index.ts`
- Tests: `packages/hypergraph-react/test/hooks/use-my-feature.test.ts`

**New Server Endpoint:**
- Add to: `apps/server/src/http/api.ts` (HTTP API definition)
- Implement handler in: `apps/server/src/http/handlers.ts`
- Service logic: `apps/server/src/services/my-service.ts`
- Tests: `apps/server/test/my-feature.test.ts`

**New Utility Function:**
- Create file: `packages/hypergraph/src/utils/my-helper.ts`
- Export from: `packages/hypergraph/src/utils/index.ts`
- Tests: `packages/hypergraph/test/utils/my-helper.test.ts`

**New CLI Command:**
- Add subcommand: `packages/hypergraph/src/cli/subcommands/my-command.ts`
- Register in: `packages/hypergraph/src/cli/Cli.ts`
- Implementation: `packages/hypergraph/src/cli/services/`

## Special Directories

**packages/hypergraph/src/utils/internal/:**
- Purpose: Internal utility implementations
- Generated: No
- Committed: Yes
- Contains: Base58 utilities, deep merge helpers, private helpers

**apps/server/src/http/:**
- Purpose: Effect Platform HTTP API definitions
- Contains: API routes, handlers, middleware
- Pattern: Effect HTTP layer router configuration

**packages/hypergraph/test/:**
- Purpose: Comprehensive test suites for SDK
- Organized by feature: `entity/`, `space/`, `identity/`, etc.
- Uses Vitest with @effect/vitest for Effect code

**docs/:**
- Purpose: Docusaurus documentation site
- Build: `pnpm build` generates HTML
- Committed: Yes

**scripts/:**
- Purpose: Build and utility scripts
- `package.mjs` - Post-build package optimization
- `copy-typesync-studio-dist.ts` - Typesync studio distribution copy

---

*Structure analysis: 2026-02-18*
