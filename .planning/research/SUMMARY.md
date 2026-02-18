# Project Research Summary

**Project:** Hypergraph MCP Server (Geo Protocol GraphQL bridge)
**Domain:** MCP server bridging a GraphQL knowledge graph API for non-technical editors
**Researched:** 2026-02-18
**Confidence:** HIGH

## Executive Summary

This project is a custom Model Context Protocol (MCP) server that bridges the Geo Protocol GraphQL API to Claude Code and Claude Desktop, enabling non-technical editors to query and explore the knowledge graph through natural language. The overwhelming consensus from research across the MCP ecosystem (Apollo, Mirumee, WunderGraph, mcp-graphql, Grafbase) is that the right approach is curated, purpose-built tools — not a generic GraphQL passthrough. The core differentiation is a UUID-to-human-name abstraction layer: the Geo Protocol is UUID-native, and editors should never see an opaque identifier. The MCP server earns its value by hiding this complexity completely.

The recommended approach is a layered architecture inside a new `packages/mcp-server/` workspace package: tool handlers (one file per tool) call lightweight query builders that mirror existing Hypergraph SDK patterns, GraphQL responses are transformed by formatters that resolve UUID property IDs to human-readable labels, and a config module maps the 3 pre-configured program space IDs to friendly names. Five curated tools cover the full read-only use case: `search_entities`, `get_entity`, `list_entities`, `list_spaces`, and `get_entity_types`. The server uses stdio transport for Claude Code integration and the `@modelcontextprotocol/sdk` v1.x with `graphql-request` (already in the monorepo).

The two highest risks are: (1) context window exhaustion from large entity lists — mitigated by defaulting to 10-20 results, formatting summaries not raw JSON, and always including pagination metadata; and (2) UUID leakage into the tool interface — mitigated by the resolution layer being built from day one, not retrofitted. A third critical pitfall is `console.log()` corrupting the stdio transport stream, which must be locked down before any tool code is written.

## Key Findings

### Recommended Stack

The stack is almost entirely drawn from what already exists in the monorepo, minimizing new dependencies. The MCP SDK (`@modelcontextprotocol/sdk` v1.26.0) and `zod` (^3.25.0) are the only meaningful additions. The SDK is pinned to v1.x because v2 (package rename to `@modelcontextprotocol/server`) is anticipated in Q1 2026 but not yet stable; migration is documented and mechanical when it arrives. `graphql-request` is already used throughout `packages/hypergraph/src/entity/` and `packages/hypergraph/src/space/`, making it the natural GraphQL client. The `@geoprotocol/geo-sdk` provides `SystemIds`, `ContentIds`, and `Graph.TESTNET_API_ORIGIN` constants for known property UUIDs and the API endpoint. Development tooling (`tsx`, `vitest`, `tsc`, `biome`) is already monorepo-standard.

**Core technologies:**
- `@modelcontextprotocol/sdk` v1.26.0: MCP server framework (stdio transport, tool registration) — official TypeScript SDK, v1.x stable
- `zod` ^3.25.0: Tool input schema validation — required by MCP SDK, provides both v3 and v4 APIs
- `graphql-request` ^7.3.1: GraphQL HTTP client — already in monorepo, lightweight, server-side appropriate
- `@geoprotocol/geo-sdk` ^0.9.0: API origin URL and known UUID constants — already a monorepo devDep
- TypeScript ^5.9.2 / Node.js 20+: Language and runtime — monorepo standard, no change needed

**Key avoid list:** generic `mcp-graphql` bridge (no domain context), Apollo MCP Server (requires Docker, cannot reuse SDK query builders), raw `fetch()` (loses typed error handling), `@modelcontextprotocol/server` v2 (not yet stable).

### Expected Features

The MVP is fully defined: 5 curated tools with Zod schemas, space name resolution (editors say "Geo Genesis" not a UUID), human-readable output (property IDs resolved to labels), a type registry cache fetched at startup, actionable error messages, stdio transport, and tool annotations (`readOnlyHint: true`). All are P1.

**Must have (table stakes):**
- 5 curated domain-specific tools — editors never construct GraphQL
- Space name resolution via config map — 3 program spaces exposed by friendly name
- Human-readable text output — `valuesList` UUIDs resolved to labeled key-value pairs before Claude sees the result
- Property name resolution — the hardest P1 feature; maps UUID property IDs to labels using `SystemIds`/`ContentIds` for known system properties, dynamic lookup for space-specific ones
- Type registry cache — fetch `typesList` per space at startup so type names (not UUIDs) can be used
- Input validation (Zod schemas) — enums for space names, clamped pagination (default 20, max 100)
- Actionable error messages with `isError: true` — "No results for 'xyz'. Try a broader term."
- Pagination metadata — every list response includes total count and next-page hint

**Should have (competitive differentiators):**
- Domain vocabulary in tool descriptions — GRC-20 terms (entities, triples, spaces, types) baked in
- Type-aware listing — accept "Person" or "Event" names instead of type UUIDs (requires type registry cache)
- Relation traversal in natural language — "Who sponsors ETHDenver?" as a single question (requires property + type resolution)
- Structured output (`outputSchema` + `structuredContent`) — for future programmatic consumers alongside text
- Tool annotations (`readOnlyHint`, `idempotentHint`, `openWorldHint`) — signals production quality

**Defer (v2+):**
- Streamable HTTP transport — only after web client demand is confirmed
- Rate limiting / usage analytics — not needed for 3-space, ~50 queries/day launch
- Write operations — separate server, human-in-the-loop confirmation, only if editorial workflow demands it
- Multi-space search — cross-space result merging is a later optimization

**Anti-features to explicitly avoid:** raw GraphQL execution tool, schema introspection tool, server-side conversation state, complex filter DSL exposed to editors.

### Architecture Approach

The architecture is a clean 6-component pipeline inside `packages/mcp-server/`. The server entry point (`server.ts`) registers all tools and connects stdio. Each tool file owns its Zod schema, calls into `queries/` builders and `formatters/`, and returns `{ content: [{ type: 'text', text }] }`. Query builders are pure functions (parameters in, `{ query, variables }` out), mirroring existing SDK patterns in `buildEntitiesQuery`, `buildSearchQuery`, and `buildSpacesQuery` — but rewritten to accept raw parameters rather than Effect Schema annotations. The formatters layer is the key differentiator: it resolves `valuesList` UUID property IDs to human names before results reach Claude. Config centralizes the 3 space IDs with their human names. The GraphQL client is a thin `graphql-request` wrapper with error handling and timeout. The MCP server has NO direct imports from `packages/hypergraph` — it copies query patterns, not code, because the SDK requires Effect Schema types that the MCP server does not define.

**Major components:**
1. **Server entry point** (`server.ts`) — creates `McpServer`, registers all tools, connects `StdioServerTransport`
2. **Tool layer** (`tools/*.ts`) — one file per tool: Zod validation, orchestration, MCP response assembly
3. **Config** (`config.ts`) — space IDs + human names, API origin, pagination defaults; central UUID abstraction
4. **Query builders** (`queries/*.ts`) — pure functions constructing GraphQL strings and variables from tool params
5. **GraphQL client** (`graphql-client.ts`) — `graphql-request` wrapper with error normalization and 10s timeout
6. **Response formatters** (`formatters/*.ts`) — transforms raw `valuesList` into human-readable labeled text

**Build order matters:** config -> graphql-client -> server skeleton -> list_spaces (first e2e proof) -> get_entity_types -> entity tools (search, get, list).

### Critical Pitfalls

1. **Context window exhaustion from unbounded entity lists** — Default `first` to 10-20 (not the SDK's 100). Format each entity as a one-liner summary (name, type, 2-3 key properties). Return total count and next-page hint on every list response. Reserve full property detail for `get_entity` only. Never return raw `valuesList` JSON.

2. **UUID leakage into tool interfaces** — Space IDs: hard-coded in config, exposed only as names. Type IDs: resolved from type registry cache, editors use names. Property IDs: never appear in tool output; resolved by formatters. Entity IDs: the one UUID that must appear, always paired with the entity name. Design this in from day one — retrofitting requires rewriting every tool and formatter.

3. **console.log corrupting stdio transport** — stdout carries JSON-RPC protocol messages; any stray `console.log()` silently corrupts the stream and drops the MCP connection. Configure stderr-only logging before writing any tool code. Add a Biome rule banning `console.log` in the package. Verify by piping stdout through `jq` during development.

4. **Tool description ambiguity causing wrong tool selection** — `search_entities` and `list_entities` are easily confused. Write descriptions that explicitly state when NOT to use each tool. Include example editor queries. Target >95% correct tool selection across 30 representative test queries before shipping.

5. **Raw GraphQL error propagation to Claude** — Wrap every tool handler in try/catch. Classify errors (network, empty result, invalid filter, rate limit) and return human-readable messages as `isError: true` tool results — not protocol-level exceptions. Claude treats returned text as data it can reason about; protocol errors are opaque failures.

## Implications for Roadmap

Based on research, the dependency graph and pitfall-to-phase mapping from ARCHITECTURE.md and PITFALLS.md suggest a 4-phase structure:

### Phase 1: Package Scaffolding and Server Foundation

**Rationale:** Everything depends on the package structure, stdio logging discipline, and config being correct before any tool code is written. The console.log pitfall is fatal if addressed after tool code exists. The config module is a zero-dependency prerequisite for all other components.

**Delivers:** A runnable (but tool-less) MCP server in `packages/mcp-server/` that connects via stdio, responds to the MCP handshake, produces zero stdout except valid JSON-RPC, and loads the 3 space configs. Proof that the process can be started by Claude Code.

**Addresses:** stdio transport (table stakes), package structure setup, Biome `console.log` ban

**Avoids:** console.log corruption (configure stderr-only logging before any other code exists)

### Phase 2: First Tool End-to-End (list_spaces + get_entity_types)

**Rationale:** `list_spaces` is the simplest possible tool (no `valuesList` parsing, no property resolution, no type lookups). Building it proves the full request flow: Zod -> query builder -> HTTP -> formatter -> MCP response. `get_entity_types` comes second because it populates the type registry cache that all entity tools depend on; editors also need it to discover what types exist before they can list entities.

**Delivers:** Two working tools that complete the "bootstrapping" flow. An editor can ask "what spaces exist?" and "what entity types are in the AI space?" and get useful, human-readable answers. The type registry cache is populated for use by Phase 3.

**Addresses:** list_spaces (table stakes), get_entity_types (table stakes), input validation, actionable error messages, tool annotations, descriptive metadata, pre-configured space context (differentiator)

**Avoids:** UUID leakage (space names from config, type names from type registry), context window issues (small result sets for metadata tools)

### Phase 3: Entity Tools (search_entities, get_entity, list_entities)

**Rationale:** These are the core value tools and have the most complexity. They share the entity formatter (which does the critical property ID resolution), so the formatter should be built once and shared. Build order within the phase: `search_entities` first (simplest entity query), then `get_entity` (single entity detail with full properties and relations), then `list_entities` last (most complex: type filtering, pagination, ordering). Property name resolution is the hardest feature in the entire project and lives here.

**Delivers:** The full 5-tool suite. Editors can search the knowledge graph, retrieve entity details, and list entities by type. The human-readable output layer is complete. This is the MVP.

**Addresses:** Human-readable output (P1), property name resolution (P1, hardest feature), type-aware queries (uses registry from Phase 2), input validation, pagination metadata, actionable errors, space allowlist enforcement

**Avoids:** Context window exhaustion (20-entity default, summary format in list tools, full detail only in get_entity), UUID leakage (all propertyIds resolved before output), raw error propagation (try/catch in every handler), nested relation explosion (relations only in get_entity, never in list results), tool description ambiguity (explicit "use ONLY for X, NOT for Y" guidance)

### Phase 4: Tuning, Testing, and Differentiators

**Rationale:** After the MVP is working with real editors, iterate on description accuracy (tool selection testing), add the differentiator features (type-aware listing by name, relation traversal), and validate property mapping completeness. This phase is data-driven: what do editors actually ask that the MVP handles poorly?

**Delivers:** Production-quality server with >95% tool selection accuracy, type-aware listing (accept "Person" not type UUID), optional structured output (`outputSchema`), and validated property name coverage. Ready for broader rollout.

**Addresses:** Type-aware listing (P2), relation traversal in natural language (P2), structured output (P2), tool description refinement based on real query logs, property mapping completeness audit

**Avoids:** Property mapping staleness (plan dynamic schema resolution if hard-coded mappings show gaps), wrong tool selection (refinement loop with representative editor queries)

### Phase Ordering Rationale

- **Foundation before tools:** The console.log corruption pitfall and the config dependency graph both require the package skeleton and logging discipline to exist before any tool code.
- **Simple tools before complex tools:** `list_spaces` proves the architecture without triggering the hardest challenges (property resolution). `get_entity_types` unlocks the type registry that entity tools depend on.
- **Shared formatter before entity tools:** All 3 entity tools share the same entity formatter. Building it once in Phase 3 before any entity tool avoids duplication and ensures consistency.
- **Defer differentiators until MVP is validated:** Type-aware listing, relation traversal, and structured output add meaningful complexity. They belong after the MVP proves valuable to editors.
- **No Streamable HTTP in this roadmap:** Research confirms stdio is sufficient for the stated use case. HTTP transport is explicitly Phase 2+ based on demand.

### Research Flags

Phases likely needing deeper research during planning:

- **Phase 3 (Property name resolution):** The mechanism for resolving UUID property IDs to human labels is the hardest problem in the project. The research identifies two approaches (hardcoded `SystemIds`/`ContentIds` for known properties, dynamic API query for space-specific ones) but the exact completeness of `SystemIds`/`ContentIds` for the 3 target spaces is not validated. Needs hands-on API exploration before implementation.
- **Phase 3 (list_entities filter translation):** The `translateFilterToGraphql` utility in the SDK and `EntityFilter` GraphQL type have complexity that research identifies but does not fully map. Needs API schema inspection during implementation.

Phases with standard patterns (skip research-phase):

- **Phase 1 (Package scaffolding):** Well-documented monorepo patterns. Mirror `packages/hypergraph` structure. No unknowns.
- **Phase 2 (list_spaces, get_entity_types):** Simple queries, existing SDK patterns to follow. Research fully covers these.
- **Phase 4 (Tuning):** Iterative refinement based on real usage; no research needed, just observation and adjustment.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All technologies verified against official docs, npm, and existing monorepo usage. Only new deps are `@modelcontextprotocol/sdk` and `zod` — both well-documented with stable v1.x APIs. |
| Features | HIGH | Multiple production MCP-GraphQL servers analyzed (Apollo, Mirumee, mcp-graphql, WunderGraph, Agoda). Feature set and prioritization supported by both competitor analysis and official MCP spec. |
| Architecture | HIGH | Component structure is well-supported by existing codebase patterns (`packages/hypergraph/src/entity/`, `packages/hypergraph/src/space/`), MCP SDK docs, and project evaluation documents (`CLAUDE_INTEGRATION/MAIN.md`). |
| Pitfalls | HIGH | Pitfalls verified against MCP SDK docs, multiple community sources, and direct codebase analysis. The stdio corruption and UUID leakage pitfalls are confirmed by project-internal evaluation documents. |

**Overall confidence:** HIGH

### Gaps to Address

- **Property ID coverage for target spaces:** Research confirms the approach (use `SystemIds`/`ContentIds` for system properties, dynamic query for space-specific ones) but the actual property set used in the 3 target program spaces was not enumerated. During Phase 3 planning, inspect real entity responses from the Geo Protocol API to map which property UUIDs appear most frequently and confirm `@geoprotocol/geo-sdk` covers them.

- **Space UUIDs for the 3 program spaces:** The config module requires the actual UUID for each of the 3 program spaces. These are referenced in `CLAUDE_INTEGRATION/MAIN.md` but not surfaced in this research. Confirm UUIDs from the project owner before Phase 1 implementation.

- **MCP SDK v1 -> v2 migration timing:** The SDK v2 package rename is anticipated Q1 2026. If it ships during Phase 2 or Phase 3, ~1 hour of mechanical migration is needed. The migration guide is already published. Monitor npm for `@modelcontextprotocol/server` stable release.

- **Relation type UUIDs for natural language traversal:** Phase 4's relation traversal feature requires mapping human relation names ("sponsors", "organizes") to relation type UUIDs in the target spaces. These are space-specific and not covered by `SystemIds`. Defer this discovery to Phase 4 planning.

## Sources

### Primary (HIGH confidence)
- `@modelcontextprotocol/sdk` v1.26.0 on npm + GitHub (Context7: `/modelcontextprotocol/typescript-sdk`) — SDK API, tool registration, stdio transport, zod integration, migration guide
- MCP Tools Specification (https://modelcontextprotocol.io/specification/2025-06-18/server/tools) — annotations, structuredContent, outputSchema, error handling spec
- Existing codebase: `packages/hypergraph/src/entity/find-many-public.ts`, `search-many-public.ts`, `find-one-public.ts`, `packages/hypergraph/src/space/find-many-public.ts` — query builder patterns, `graphql-request` usage
- Existing codebase: `packages/hypergraph/src/utils/translate-filter-to-graphql.ts`, `convert-property-value.ts`, `config.ts` — filter translation, property value extraction, API origin pattern
- Project documents: `CLAUDE_INTEGRATION/MAIN.md`, `CLAUDE_INTEGRATION/mcp-server-evaluation.md` — project requirements, architecture decisions, space configuration
- Apollo MCP Server official docs (https://www.apollographql.com/docs/apollo-mcp-server) — competitor feature analysis, GraphQL-to-MCP patterns

### Secondary (MEDIUM confidence)
- Philschmid: MCP Server Best Practices (https://www.philschmid.de/mcp-best-practices) — six practices for production MCP servers (outcomes over operations, flatten args, paginate, curate)
- Mirumee: "From GraphQL Schema to MCP Server" (https://mirumee.com/blog/from-graphql-schema-to-mcp-server) — tool-per-file pattern, typed client generation, tool annotations
- Grafbase: "Solving context explosion in GraphQL MCP servers" — pagination and summarization patterns for LLM context management
- Nearform: "Implementing MCP — Tips, Tricks and Pitfalls" — stdio corruption and error handling patterns
- mcp-graphql (https://github.com/blurrah/mcp-graphql) — generic bridge anti-pattern analysis
- WunderGraph MCP Gateway (https://wundergraph.com/mcp-gateway) — persisted operations as trust boundary pattern
- Agoda APIAgent (https://github.com/agoda-com/api-agent) — zero-code schema-to-MCP, DuckDB post-processing for concise results
- Neo4j + Claude MCP blog — natural language interface to graph databases for non-developers

### Tertiary (LOW confidence — informational)
- CData: MCP Server Best Practices 2026 — access control, idempotency (could not fetch full content)
- The Hidden Cost of MCPs on Context Window — token budget guidance

---
*Research completed: 2026-02-18*
*Ready for roadmap: yes*
