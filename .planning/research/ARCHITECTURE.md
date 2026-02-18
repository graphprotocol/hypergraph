# Architecture Research

**Domain:** MCP server bridging a GraphQL API (Geo Protocol) for knowledge graph querying
**Researched:** 2026-02-18
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
+------------------+       MCP Protocol (stdio)       +----------------------------------------------+
|                  | <-------------------------------> |        packages/mcp-server/                  |
|  Claude Code     |    tool calls / results           |                                              |
|  (or any MCP     |                                   |  +-----------+  +-------------------------+  |
|   client)        |                                   |  |  Server   |  |      Tool Layer         |  |
|                  |                                   |  |  Entry    |->|  search_entities        |  |
+------------------+                                   |  |  Point    |  |  get_entity             |  |
                                                       |  |           |  |  list_entities          |  |
                                                       |  |  McpServer|  |  list_spaces            |  |
                                                       |  |  + Stdio  |  |  get_entity_types       |  |
                                                       |  +-----------+  +------------+------------+  |
                                                       |                              |               |
                                                       |                 +------------v------------+  |
                                                       |                 |    GraphQL Client       |  |
                                                       |                 |    (graphql-request)    |  |
                                                       |                 +------------+------------+  |
                                                       |                              |               |
                                                       |  +-----------+  +------------v------------+  |
                                                       |  |  Config   |->|   Query Builders        |  |
                                                       |  |  (spaces, |  |   (build GraphQL        |  |
                                                       |  |  API URL) |  |    strings + variables) |  |
                                                       |  +-----------+  +-------------------------+  |
                                                       |                                              |
                                                       |                 +-------------------------+  |
                                                       |                 |  Response Formatters    |  |
                                                       |                 |  (UUID -> human names,  |  |
                                                       |                 |   property resolution)  |  |
                                                       |                 +-------------------------+  |
                                                       +----------------------------------------------+
                                                                              |
                                                                              | HTTPS (graphql-request)
                                                                              v
                                                       +----------------------------------------------+
                                                       |     Geo Protocol GraphQL API                 |
                                                       |     (read-only, no auth needed)              |
                                                       |     Queries: entities, entity, search,       |
                                                       |              spaces, typesList                |
                                                       +----------------------------------------------+
```

### Component Responsibilities

| Component | Responsibility | Communicates With |
|-----------|----------------|-------------------|
| **Server Entry Point** (`server.ts`) | Initializes `McpServer`, registers all tools, connects stdio transport | Tool Layer (registers handlers), MCP Client (via stdio) |
| **Tool Layer** (`tools/*.ts`) | Validates inputs (Zod), orchestrates query building + execution + formatting for each tool | Query Builders, GraphQL Client, Response Formatters, Config |
| **Config** (`config.ts`) | Stores 3 pre-configured space IDs with human names, API origin URL, default pagination limits | Tool Layer (reads config), Query Builders (reads API URL) |
| **Query Builders** (`queries/*.ts`) | Constructs GraphQL query strings and variable objects from tool parameters | GraphQL Client (provides query + variables) |
| **GraphQL Client** (`graphql-client.ts`) | Thin wrapper around `graphql-request` sending queries to the Geo Protocol API | Geo Protocol GraphQL API (HTTPS) |
| **Response Formatters** (`formatters/*.ts`) | Transforms raw GraphQL responses (UUID property IDs, nested valuesList) into human-readable text | Tool Layer (returns formatted content) |

## Recommended Project Structure

```
packages/mcp-server/
├── src/
│   ├── server.ts              # Entry point: creates McpServer, registers tools, connects stdio
│   ├── config.ts              # Space IDs, API origin, constants
│   ├── graphql-client.ts      # Thin graphql-request wrapper with error handling
│   ├── tools/                 # One file per MCP tool
│   │   ├── search-entities.ts # Full-text search tool
│   │   ├── get-entity.ts      # Single entity by ID tool
│   │   ├── list-entities.ts   # Filter/paginate by type tool
│   │   ├── list-spaces.ts     # List program spaces tool
│   │   └── get-entity-types.ts# Discover types in a space tool
│   ├── queries/               # GraphQL query construction
│   │   ├── entities.ts        # Query builders for entities/entity
│   │   ├── search.ts          # Query builder for search
│   │   ├── spaces.ts          # Query builder for spaces
│   │   └── types.ts           # Query builder for typesList
│   └── formatters/            # Transform GraphQL responses to text
│       ├── entity.ts          # Format entity with resolved property names
│       ├── space.ts           # Format space info
│       └── types.ts           # Format type listing
├── package.json
└── tsconfig.json
```

### Structure Rationale

- **`tools/`:** Each file corresponds to one MCP tool registration. This is the standard pattern for MCP servers -- one file per tool keeps each handler self-contained and testable. Each tool file owns its Zod input schema, calls into queries/ and formatters/, and returns `{ content: [{ type: 'text', text }] }`.
- **`queries/`:** Separates GraphQL string construction from tool logic. This mirrors the existing pattern in `packages/hypergraph/src/entity/` where `buildEntitiesQuery`, `buildSearchQuery`, and `buildSpacesQuery` are distinct functions. The MCP server's query builders will be simpler (no schema AST walking) because they operate on raw property IDs rather than Effect Schema annotations.
- **`formatters/`:** The critical differentiator from a generic GraphQL MCP server. The Geo Protocol API returns `valuesList` arrays with `{ propertyId: UUID, text, boolean, float, ... }`. Without formatting, results are unreadable UUIDs. Formatters resolve property IDs to human names and flatten the nested valuesList into key-value pairs.
- **`config.ts`:** Centralizes the 3 program space IDs and their human-readable names. This is where the "editors never deal with UUIDs" promise lives. Tool descriptions reference space names from config; tool handlers map space names to IDs.
- **`graphql-client.ts`:** A single point for HTTP requests, error wrapping, and (eventually) rate limiting. Keeps `graphql-request` usage isolated so it can be swapped if needed.

## Architectural Patterns

### Pattern 1: Tool-Per-File Registration

**What:** Each MCP tool is defined in its own file with co-located Zod schema, handler function, and registration metadata. The server entry point imports and registers each tool in sequence.

**When to use:** Always for MCP servers with more than 2-3 tools. Standard practice in the MCP ecosystem.

**Trade-offs:** More files, but each tool is independently testable and modifiable. Adding a new tool never touches existing tool files.

**Example:**
```typescript
// tools/search-entities.ts
import { z } from 'zod';
import { searchEntities } from '../queries/search.js';
import { formatEntityList } from '../formatters/entity.js';
import { SPACES } from '../config.js';
import type { McpServer } from '@modelcontextprotocol/server';

export const registerSearchEntities = (server: McpServer) => {
  server.registerTool(
    'search_entities',
    {
      title: 'Search Entities',
      description: `Full-text search across entities in the knowledge graph.
Available spaces: ${SPACES.map(s => `"${s.name}" (${s.description})`).join(', ')}`,
      inputSchema: z.object({
        query: z.string().describe('Search text'),
        space: z.string().describe('Space name (e.g., "Science", "Governance")'),
        first: z.number().optional().default(20).describe('Max results (default 20)'),
        offset: z.number().optional().default(0).describe('Pagination offset'),
      }),
    },
    async ({ query, space, first, offset }) => {
      const spaceId = resolveSpaceId(space);
      const result = await searchEntities({ query, spaceId, first, offset });
      const text = formatEntityList(result);
      return { content: [{ type: 'text', text }] };
    },
  );
};
```

### Pattern 2: Human-Name-to-UUID Resolution Layer

**What:** Tool parameters accept human-readable names (space names, type names) while the config/resolution layer maps them to UUIDs before query construction. This is the core abstraction that makes the server editor-friendly.

**When to use:** Whenever the underlying API uses opaque identifiers that end users should not need to know.

**Trade-offs:** Requires a maintained mapping table. For 3 spaces this is trivial. For entity types, the mapping is populated dynamically by querying `typesList` per space.

**Example:**
```typescript
// config.ts
export const SPACES = [
  { name: 'Science', id: 'abc-123-...', description: 'Science program space' },
  { name: 'Governance', id: 'def-456-...', description: 'Governance program space' },
  { name: 'Arts', id: 'ghi-789-...', description: 'Arts program space' },
] as const;

export const resolveSpaceId = (nameOrId: string): string => {
  const space = SPACES.find(
    s => s.name.toLowerCase() === nameOrId.toLowerCase() || s.id === nameOrId,
  );
  if (!space) {
    throw new Error(`Unknown space "${nameOrId}". Available: ${SPACES.map(s => s.name).join(', ')}`);
  }
  return space.id;
};
```

### Pattern 3: Query Builder Separation

**What:** GraphQL query strings and variable construction are separated from tool logic and HTTP execution. Query builders are pure functions: parameters in, `{ query: string, variables: Record<string, unknown> }` out.

**When to use:** When query construction involves conditional fragments, dynamic aliases, or variable assembly. This is exactly the pattern used in the existing Hypergraph SDK (`buildEntitiesQuery`, `buildSearchQuery`, `buildSpacesQuery` in `packages/hypergraph/src/entity/` and `packages/hypergraph/src/space/`).

**Trade-offs:** Slightly more indirection, but query builders become independently testable without network calls. Critical for the `list_entities` tool which has the most complex query (conditional orderBy, filter translation, space selection modes).

**Example:**
```typescript
// queries/entities.ts
export const buildListEntitiesQuery = (params: {
  spaceId: string;
  typeIds: string[];
  first: number;
  offset: number;
  filter?: Record<string, unknown>;
}) => {
  const query = `
    query entities($spaceId: UUID!, $typeIds: [UUID!]!, $first: Int, $offset: Int, $filter: EntityFilter!) {
      entities(
        spaceId: $spaceId
        typeIds: { in: $typeIds }
        filter: $filter
        first: $first
        offset: $offset
      ) {
        id
        name
        valuesList(filter: { spaceId: { is: $spaceId } }) {
          propertyId
          text
          boolean
          float
          datetime
        }
      }
    }
  `;
  return {
    query,
    variables: {
      spaceId: params.spaceId,
      typeIds: params.typeIds,
      first: params.first,
      offset: params.offset,
      filter: params.filter ?? {},
    },
  };
};
```

## Data Flow

### Request Flow (Tool Call)

```
MCP Client (Claude Code)
    |
    | stdio: tools/call { name: "search_entities", arguments: { query: "climate", space: "Science" } }
    v
Server Entry Point (McpServer routes to registered handler)
    |
    v
Tool Handler (tools/search-entities.ts)
    |
    | 1. Validate input with Zod schema
    | 2. Resolve "Science" -> UUID via config.ts
    v
Query Builder (queries/search.ts)
    |
    | 3. Build GraphQL query string + variables object
    v
GraphQL Client (graphql-client.ts)
    |
    | 4. POST to Geo Protocol API /graphql
    v
Geo Protocol GraphQL API
    |
    | 5. Returns JSON: { entities: [{ id, name, valuesList: [...] }] }
    v
GraphQL Client (returns parsed JSON)
    |
    v
Response Formatter (formatters/entity.ts)
    |
    | 6. Resolve propertyId UUIDs to names, flatten valuesList,
    |    assemble human-readable text block
    v
Tool Handler
    |
    | 7. Return { content: [{ type: 'text', text: "Found 12 entities:\n1. ..." }] }
    v
MCP Client (Claude receives text, summarizes for editor)
```

### Error Flow

```
Any step fails
    |
    v
Tool Handler catches error
    |
    | - Zod validation error -> "Invalid input: [field] [reason]"
    | - Space not found       -> "Unknown space. Available: Science, Governance, Arts"
    | - GraphQL network error -> "Could not reach Geo Protocol API: [status]"
    | - GraphQL query error   -> "Query failed: [error message]"
    v
Return { content: [{ type: 'text', text: error.message }], isError: true }
    |
    v
MCP Client (Claude explains error to editor in natural language)
```

### Key Data Flows

1. **Space name resolution:** Editor says "Science space" -> tool receives `space: "Science"` -> `config.resolveSpaceId("Science")` -> UUID `"abc-123-..."` -> used in GraphQL `$spaceId` variable. This is the most critical flow because it eliminates UUID exposure for the most common parameter.

2. **Property ID resolution in responses:** GraphQL returns `valuesList: [{ propertyId: "8f151ba4...", text: "John" }]` -> formatter looks up property ID in a mapping (either hardcoded for known properties like `name`, or fetched dynamically) -> outputs `"Name: John"` instead of raw UUID. The existing SDK does this via Effect Schema annotations (`PropertyIdSymbol`), but the MCP server will use a simpler lookup table since it operates without schema definitions.

3. **Pagination flow:** Tool receives `first: 20, offset: 0` -> passes through to GraphQL -> if results suggest more exist, formatter appends "Showing 1-20. Use offset: 20 to see more." -> Claude can automatically paginate by calling the tool again with increased offset.

4. **Type discovery flow:** Editor asks "what types of entities exist?" -> `get_entity_types` queries `typesList(spaceId)` -> returns type names and IDs -> Claude uses these IDs in subsequent `list_entities` calls with `typeIds` parameter. This is the bootstrapping flow that lets editors work with type names.

## Build Order and Dependencies

The components have clear dependency ordering. Building them in the wrong order means you cannot test intermediate results.

### Phase 1: Foundation (build first, everything depends on these)

| Order | Component | Why First |
|-------|-----------|-----------|
| 1 | `config.ts` | Every other component reads space IDs and API origin from config. Zero external dependencies. |
| 2 | `graphql-client.ts` | Every query builder needs an executor. Thin wrapper around `graphql-request` with error handling. |
| 3 | `server.ts` (skeleton) | Minimal entry point that creates `McpServer` and connects stdio. No tools yet -- just proves the process starts and the MCP handshake works. |

### Phase 2: First Tool End-to-End (proves the architecture)

| Order | Component | Why This Order |
|-------|-----------|----------------|
| 4 | `queries/spaces.ts` | Simplest query (no filters, no valuesList parsing). |
| 5 | `formatters/space.ts` | Simplest formatter (spaces have direct name/type fields, no propertyId resolution needed). |
| 6 | `tools/list-spaces.ts` | First complete tool. Tests the full flow: Zod validation -> query building -> HTTP execution -> formatting -> MCP response. This is the "hello world" that proves everything works. |

### Phase 3: Type Discovery (needed before entity tools)

| Order | Component | Why This Order |
|-------|-----------|----------------|
| 7 | `queries/types.ts` | `typesList` query for a space. |
| 8 | `formatters/types.ts` | Format type names and IDs. |
| 9 | `tools/get-entity-types.ts` | Editors need type IDs before they can use `list_entities`. Claude uses this tool to discover types. |

### Phase 4: Entity Tools (the core value)

| Order | Component | Why This Order |
|-------|-----------|----------------|
| 10 | `queries/search.ts` | Search query builder. |
| 11 | `queries/entities.ts` | Entities query builder (most complex: filters, ordering, pagination). |
| 12 | `formatters/entity.ts` | Entity formatter (resolves propertyId UUIDs to names from valuesList). Shared by all entity tools. |
| 13 | `tools/search-entities.ts` | Uses search query builder + entity formatter. |
| 14 | `tools/get-entity.ts` | Single entity by ID. Uses entities query builder + entity formatter. |
| 15 | `tools/list-entities.ts` | Most complex tool. Filter translation, pagination, ordering. Built last because it depends on the most query builder logic. |

### Dependency Graph

```
config.ts ─────────────────────────────────────┐
                                                |
graphql-client.ts ─────────────────────────┐    |
                                           |    |
queries/spaces.ts ──┐                      |    |
formatters/space.ts ├─> tools/list-spaces.ts    |
                    |                      |    |
queries/types.ts ───┤                      |    |
formatters/types.ts ├─> tools/get-entity-types  |
                    |                      |    |
queries/search.ts ──┤                      |    |
queries/entities.ts ┤   formatters/entity.ts    |
                    ├─> tools/search-entities    |
                    ├─> tools/get-entity         |
                    └─> tools/list-entities      |
                                           |    |
server.ts ─────────────────────────────────┘────┘
  (imports and registers all tools)
```

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 1-10 editors (MVP) | Single process, stdio transport, in-memory config. No caching needed -- GraphQL queries are fast. |
| 10-50 editors | Still per-process via stdio (each Claude Code session spawns its own MCP server process). Consider caching `typesList` results in memory per session to avoid redundant queries. |
| 50+ editors | Consider Streamable HTTP transport so one server process handles multiple clients. Add response caching (entity type listings change rarely). Rate limiting per client. |

### Scaling Priorities

1. **First bottleneck: typesList queries.** Every session calls `get_entity_types` early. The type list for a space changes rarely. Cache it in-memory for the session lifetime (process lives as long as the Claude Code session).
2. **Second bottleneck: large result sets consuming tokens.** When `list_entities` returns 100 entities, the text response is large and consumes Claude's context window. Enforce default `first: 20` and format results concisely. This is a context-window problem, not a server performance problem.

## Anti-Patterns

### Anti-Pattern 1: Exposing Raw GraphQL as a Tool

**What people do:** Register a generic `execute_graphql` tool that lets Claude write arbitrary GraphQL.
**Why it is wrong:** Claude must construct correct Geo Protocol filter syntax (`values.some.propertyId`, nested `EntityFilter`, UUID-based identifiers). Error rate is high. Results are raw JSON with UUID property IDs -- unreadable. No safety guardrails.
**Do this instead:** Register curated tools with specific Zod schemas per operation. The query complexity is hidden inside query builders. The LLM only sees human-friendly parameters.

### Anti-Pattern 2: Reusing the Hypergraph SDK's Schema-Driven Query Builders Directly

**What people do:** Import `findManyPublic()` from `packages/hypergraph/src/entity/find-many-public.ts` and call it from MCP tool handlers.
**Why it is wrong:** The Hypergraph SDK's query functions require Effect Schema types with `PropertyIdSymbol` and `TypeIdsSymbol` annotations (defined via `typesync`). The MCP server does not have these schemas -- it operates on raw space IDs, type IDs, and property IDs. Calling `findManyPublic()` requires constructing a full Effect Schema at runtime, which defeats the purpose of a lightweight bridge.
**Do this instead:** Write simplified query builders in the MCP server that construct the same GraphQL query strings (copy the query structure from the SDK) but accept raw parameters instead of annotated schemas. The query patterns from `buildEntitiesQuery`, `buildSearchQuery`, and `buildSpacesQuery` are the blueprints; the MCP server reimplements them without the Effect Schema layer.

### Anti-Pattern 3: Returning Raw JSON from Tools

**What people do:** Return `JSON.stringify(graphqlResult)` as the tool response text.
**Why it is wrong:** The Geo Protocol API returns `valuesList` arrays where each property is identified by a UUID. Without resolution, Claude sees `{ propertyId: "8f151ba4de204e3c9cb499ddf96f48f1", text: "John" }` and cannot tell editors what "8f151ba4..." means. The tool becomes no better than a raw API client.
**Do this instead:** Format responses into readable text before returning. Resolve property IDs to names. Structure output as a human-readable list (e.g., `"1. John Doe (Person) - Location: New York, Role: Researcher"`). Claude can then summarize and answer follow-up questions about the results.

### Anti-Pattern 4: Hardcoding All Property ID Mappings

**What people do:** Maintain a massive static mapping of every property UUID to its human name across all 3 spaces.
**Why it is wrong:** Properties change as spaces evolve. Maintaining a static map is fragile and requires redeployment for every schema change.
**Do this instead:** For well-known system properties (name, description, types relation), hardcode the IDs from `@geoprotocol/geo-sdk` (`SystemIds`, `ContentIds`). For space-specific properties, consider a dynamic approach: query the property entities themselves (they have names) and cache the mapping per session. Start with hardcoded known properties and add dynamic resolution if editors encounter unnamed UUIDs.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Geo Protocol GraphQL API | HTTP POST via `graphql-request` to `{apiOrigin}/graphql` | Read-only, no authentication needed for public queries. Default `apiOrigin` is `Graph.TESTNET_API_ORIGIN` from `@geoprotocol/geo-sdk`. |
| `@geoprotocol/geo-sdk` | Import `SystemIds`, `ContentIds`, `Graph` constants | Provides well-known property UUIDs (e.g., `SystemIds.IMAGE_URL_PROPERTY`) and API origin constants. Lightweight dependency -- no runtime services. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| MCP Server <-> Hypergraph SDK | **No direct import.** Copy query patterns, not code. | The SDK uses Effect Schema annotations for type-safe query building. The MCP server builds equivalent queries from raw parameters. If the SDK refactors its query format, the MCP server's queries may need updating. |
| Tool Layer <-> Query Builders | Function call: tool passes params, query builder returns `{ query, variables }` | Pure functions, easy to test. |
| Tool Layer <-> Formatters | Function call: tool passes raw GraphQL response, formatter returns string | Formatters are stateless. They may receive a property-name lookup table from config or a cache. |
| Server Entry Point <-> Tool Files | `registerXxx(server)` function calls at startup | Each tool file exports a single registration function. Server imports all and calls them. |

## Sources

- [MCP TypeScript SDK - Official Repository](https://github.com/modelcontextprotocol/typescript-sdk) - HIGH confidence. Server registration API (`McpServer`, `registerTool`, `StdioServerTransport`), Zod schema integration verified via Context7.
- [MCP TypeScript SDK - Server Documentation (Context7)](https://github.com/modelcontextprotocol/typescript-sdk/blob/main/docs/server.md) - HIGH confidence. Tool registration patterns, content response format, logging API.
- Existing codebase: `packages/hypergraph/src/entity/find-many-public.ts`, `search-many-public.ts`, `find-one-public.ts` - HIGH confidence. Query builder patterns (`buildEntitiesQuery`, `buildSearchQuery`), GraphQL variable construction, `graphql-request` usage.
- Existing codebase: `packages/hypergraph/src/space/find-many-public.ts` - HIGH confidence. Space query pattern (`buildSpacesQuery`), filter construction.
- Existing codebase: `packages/hypergraph/src/utils/translate-filter-to-graphql.ts` - HIGH confidence. Filter translation from user-friendly format to nested GraphQL `EntityFilter`.
- Existing codebase: `packages/hypergraph/src/utils/convert-property-value.ts` - HIGH confidence. Property value extraction from `valuesList` by type (text, boolean, float, datetime, point, schedule).
- Existing codebase: `packages/hypergraph/src/config.ts` - HIGH confidence. API origin configuration pattern (`getApiOrigin()`, defaults to `Graph.TESTNET_API_ORIGIN`).
- [Apollo MCP Server](https://www.apollographql.com/docs/apollo-mcp-server) - MEDIUM confidence. Demonstrates the GraphQL-to-MCP-tools bridge pattern, but is a generic solution unlike the curated approach needed here.
- [mcp-graphql by blurrah](https://github.com/blurrah/mcp-graphql) - MEDIUM confidence. Generic MCP-GraphQL bridge showing the anti-pattern of raw query exposure.
- `/home/john_malkovich/work/hypergraph/CLAUDE_INTEGRATION/MAIN.md` - HIGH confidence. Project requirements, chosen architecture, tool definitions, space configuration plan.
- `/home/john_malkovich/work/hypergraph/CLAUDE_INTEGRATION/mcp-server-evaluation.md` - HIGH confidence. Detailed evaluation of MCP approach, safety analysis, build-vs-buy assessment.

---
*Architecture research for: MCP server bridging Geo Protocol GraphQL API*
*Researched: 2026-02-18*
