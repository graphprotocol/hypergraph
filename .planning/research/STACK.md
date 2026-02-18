# Stack Research

**Domain:** MCP server bridging a GraphQL API (Geo Protocol) to Claude Code / Claude Desktop
**Researched:** 2026-02-18
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| `@modelcontextprotocol/sdk` | ^1.26.0 (v1.x) | MCP server framework | Official TypeScript SDK. v1.x is the current stable branch; v2 (package split into `@modelcontextprotocol/server` etc.) is anticipated Q1 2026 but not yet released. Pin to v1.x for production stability. v1.x will receive bug fixes for 6+ months after v2 ships. **Confidence: HIGH** (Context7 + npm + GitHub releases) |
| `zod` | ^3.25.0 | Schema validation for MCP tool inputs | Required peer dependency of `@modelcontextprotocol/sdk`. The SDK internally uses `zod/v4` but maintains backward compatibility with `zod>=3.25`. Since the monorepo does not currently use zod, install `^3.25.0` which provides both `zod/v3` and `zod/v4` subpath exports. **Confidence: HIGH** (Context7 migration docs + npm) |
| `graphql-request` | ^7.3.1 | GraphQL HTTP client | Already used throughout the Hypergraph SDK (`packages/hypergraph/src/entity/*.ts`, `packages/hypergraph/src/space/*.ts`). Lightweight, zero-config, perfect for server-side use. Reusing the same client avoids introducing a second GraphQL layer. **Confidence: HIGH** (already in monorepo at ^7.2.0) |
| TypeScript | ^5.9.2 | Language | Already the monorepo standard. No change needed. **Confidence: HIGH** |
| Node.js | 20+ | Runtime | Already required by the monorepo. MCP SDK stdio transport requires Node.js. **Confidence: HIGH** |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `graphql` | ^16.10.0 | GraphQL language core (peer dep of `graphql-request`) | Always -- `graphql-request` requires it as a peer dependency. Already in the lockfile. **Confidence: HIGH** |
| `@geoprotocol/geo-sdk` | ^0.9.0 | Geo Protocol constants (`Graph.TESTNET_API_ORIGIN`, `SystemIds`, `ContentIds`) | For API endpoint URLs and well-known entity/property IDs. Already a monorepo devDependency. **Confidence: HIGH** |
| `effect` | ^3.17.13 | Functional error handling (optional) | Only if the MCP server wants to use the same Effect patterns as the rest of the monorepo. For a 5-tool read-only server, plain async/await with try/catch is simpler and sufficient. Defer Effect integration to a later phase. **Confidence: MEDIUM** |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| `@modelcontextprotocol/inspector` (npx) | Interactive browser-based debugging for MCP servers | Run with `npx @modelcontextprotocol/inspector node dist/index.js`. Opens at `http://localhost:6274`. Allows testing each tool individually with custom inputs. No install needed -- use via npx. **Confidence: HIGH** (official tooling, Context7 docs) |
| `vitest` | ^3.2.4 | Unit testing | Already the monorepo test runner. Test tool handlers by calling them directly (no need to spawn stdio subprocess). **Confidence: HIGH** |
| `tsx` | ^4.20.4 | TypeScript executor for development | Already in monorepo devDeps. Use for `pnpm dev` script: `tsx src/index.ts`. Avoids build step during development. **Confidence: HIGH** |
| `tsc` (via `typescript`) | Build step | Use plain `tsc` to compile to `dist/`. The MCP server is a simple Node.js entry point; no bundler needed. Matches `packages/hypergraph` pattern. **Confidence: HIGH** |
| `biome` | ^2.2.0 | Linting/formatting | Already the monorepo standard. No additional config needed. **Confidence: HIGH** |

## Installation

```bash
# From monorepo root
cd packages/mcp-server

# Core dependencies
pnpm add @modelcontextprotocol/sdk zod graphql-request graphql @geoprotocol/geo-sdk

# Dev dependencies (already available from workspace root, but declare for clarity)
pnpm add -D typescript tsx @types/node vitest
```

Note: `pnpm` workspace hoisting means many devDependencies are already available. Declare them explicitly in the package's `package.json` for correctness.

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| `@modelcontextprotocol/sdk` v1.x | `@modelcontextprotocol/server` (v2) | When v2 reaches stable release (expected Q1 2026). Migration is straightforward: change import paths from `@modelcontextprotocol/sdk/server/mcp.js` to `@modelcontextprotocol/server`. The v1 -> v2 migration doc is already published. |
| `graphql-request` | `graffle` (successor to graphql-request) | Graffle was unveiled at GraphQLConf 2025 as the successor with a plugin-first architecture. It is not yet widely adopted and would diverge from existing SDK patterns. Revisit when Graffle reaches 1.0. |
| `graphql-request` | Apollo Client / urql | These are frontend-focused clients with caching, React bindings, etc. For a server-side MCP tool that makes simple query calls, `graphql-request` is the right weight class. Apollo Client adds ~40KB of unnecessary bundle. |
| `graphql-request` | Raw `fetch()` | Possible but loses typed response handling and error normalization that `graphql-request` provides. Not worth the boilerplate. |
| `tsc` (build) | `tsup` / `tsdown` | If bundling is needed later (e.g., for npm publishing or single-file distribution). For a monorepo-internal package run via `node dist/index.js`, plain `tsc` is simpler and consistent with `packages/hypergraph`. |
| `zod` ^3.25 | `zod` ^4.x | Possible since the SDK supports zod v4 via subpath imports. However, installing `zod@^3.25` gives access to both `zod/v3` and `zod/v4` subpath exports, which is the approach the MCP SDK itself uses for backward compatibility. Using `^3.25` avoids any edge-case incompatibilities. |
| Plain async/await | Effect for tool handlers | Effect is powerful but adds complexity for a 5-tool read-only server. Start simple. Add Effect later if error handling becomes complex (e.g., retry logic, circuit breakers). |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `mcp-graphql` (generic MCP-GraphQL bridge) | Exposes raw GraphQL execution to the LLM. The Geo API has UUID-based property IDs and complex filter syntax that the LLM will frequently get wrong. No domain context, no guardrails. | Build curated tools with human-readable parameter names and pre-built GraphQL queries. |
| Apollo MCP Server | Requires Docker, uses static `.graphql` operation files. Cannot leverage existing Hypergraph SDK query builders (`buildSearchQuery`, `buildEntityQuery`, `buildSpacesQuery`). Heavier than needed. | Custom MCP server reusing existing query builder functions from `packages/hypergraph/src/entity/` and `packages/hypergraph/src/space/`. |
| `@modelcontextprotocol/server` (v2 package) | Not yet released as stable. The `main` branch of the typescript-sdk repo has the migration guide, but npm only has v1.x as stable. Using unreleased packages in production is risky. | `@modelcontextprotocol/sdk` v1.26.0. Plan for migration when v2 ships. |
| Express / HTTP server for initial transport | Adds unnecessary complexity for the initial use case (Claude Code via stdio). Streamable HTTP transport can be added later for web clients. | `StdioServerTransport` for Phase 1. |
| `graphql-codegen` | Overkill for 5 hand-written queries. The queries are simple and stable. Code generation adds build complexity for minimal type-safety gain over manually typed results. | Type the GraphQL response shapes by hand (matching existing patterns in `find-one-public.ts`, `search-many-public.ts`). |
| Jest | The monorepo uses Vitest. Introducing Jest would create a split testing ecosystem with different config, assertion libraries, and mocking patterns. | `vitest` (already configured in monorepo root `vitest.config.ts`). |

## Stack Patterns by Variant

**If building for Claude Code / Claude Desktop only (Phase 1):**
- Use `StdioServerTransport` exclusively
- Single entry point: `src/index.ts` with `#!/usr/bin/env node` shebang
- No HTTP server, no Express, no port configuration
- Configure in Claude Desktop's `claude_desktop_config.json` or Claude Code's `.claude/settings.json`

**If adding web client support later (Phase 2+):**
- Add `StreamableHTTPServerTransport` (v1.x: from `@modelcontextprotocol/sdk/server/streamableHttp.js`)
- Can coexist with stdio in the same codebase (different entry points or runtime flag)
- Consider embedding in the existing `apps/server` Express app as a middleware route

**If v2 of the MCP SDK ships during development:**
- Migration is mechanical: change import paths, uninstall `@modelcontextprotocol/sdk`, install `@modelcontextprotocol/server`
- Tool registration API (`registerTool` / `.tool()`) is unchanged between v1 and v2
- Plan ~1 hour of migration work

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| `@modelcontextprotocol/sdk@^1.26.0` | `zod@>=3.25.0` | SDK imports from `zod/v4` internally but accepts v3.25+ schemas. Do NOT use `zod<3.25`. |
| `@modelcontextprotocol/sdk@^1.26.0` | `typescript@>=5.0` | SDK is built with TS 5.x. Monorepo uses 5.9.2; fully compatible. |
| `graphql-request@^7.3.1` | `graphql@>=16.0.0` | `graphql` is a peer dependency. Monorepo lockfile already has graphql 16.x. |
| `@geoprotocol/geo-sdk@^0.9.0` | N/A | Standalone. Used for constants only (`Graph.TESTNET_API_ORIGIN`). |
| `zod@^3.25.0` | `effect/Schema` | Zod and Effect Schema are separate validation libraries. The MCP server uses zod for tool input schemas (required by MCP SDK). The existing SDK uses Effect Schema for entity decoding. These do not conflict. |

## Import Paths (v1.x)

These are the correct import paths for the current stable SDK. Document here to avoid confusion with v2 docs on `main` branch:

```typescript
// MCP Server (v1.x -- current stable)
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

// If adding HTTP transport later (v1.x)
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

// Zod for tool input schemas
import { z } from 'zod';
// Or explicitly use v4 API:
// import { z } from 'zod/v4';

// GraphQL client (same pattern as existing SDK code)
import { request } from 'graphql-request';
```

**After v2 migration (future):**
```typescript
import { McpServer, StdioServerTransport } from '@modelcontextprotocol/server';
```

## Sources

- [Context7: /modelcontextprotocol/typescript-sdk](https://context7.com/modelcontextprotocol/typescript-sdk) -- v1.x branch import paths, tool registration API, migration guide (HIGH confidence)
- [Context7: /modelcontextprotocol/typescript-sdk v1.x branch](https://context7.com/modelcontextprotocol/typescript-sdk/__branch__v1.x) -- Confirmed v1.x `registerTool` and `.tool()` patterns (HIGH confidence)
- [@modelcontextprotocol/sdk on npm](https://www.npmjs.com/package/@modelcontextprotocol/sdk) -- v1.26.0 latest, zod peer dependency (HIGH confidence)
- [MCP TypeScript SDK GitHub](https://github.com/modelcontextprotocol/typescript-sdk) -- v2 migration docs on main branch, v1.x stable branch (HIGH confidence)
- [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector) -- Official debugging tool documentation (HIGH confidence)
- [Zod npm](https://www.npmjs.com/package/zod) -- v4.3.6 latest, v3.25+ subpath compatibility (HIGH confidence)
- [graphql-request npm](https://www.npmjs.com/package/graphql-request) -- v7.3.1 latest (HIGH confidence)
- [Apollo MCP Server docs](https://www.apollographql.com/docs/apollo-mcp-server) -- Evaluated and rejected (MEDIUM confidence)
- [mcp-graphql GitHub](https://github.com/blurrah/mcp-graphql) -- Generic MCP-GraphQL bridge, evaluated and rejected (MEDIUM confidence)
- [Building MCP Tools with GraphQL (Apollo blog)](https://www.apollographql.com/blog/building-mcp-tools-with-graphql-a-better-way-to-connect-llms-to-your-api) -- Architecture patterns for GraphQL + MCP (MEDIUM confidence)
- Existing monorepo code: `packages/hypergraph/src/entity/search-many-public.ts`, `find-one-public.ts`, `find-many-public.ts`, `packages/hypergraph/src/space/find-many-public.ts` -- Query builder patterns to reuse (HIGH confidence, primary source)

---
*Stack research for: MCP server wrapping Geo Protocol GraphQL API*
*Researched: 2026-02-18*
