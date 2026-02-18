# Feature Research

**Domain:** MCP server bridging a GraphQL knowledge graph API for non-technical editors
**Researched:** 2026-02-18
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Curated, high-level tools** (not raw GraphQL) | Every production MCP-GraphQL server (Apollo, Mirumee/Saleor, WunderGraph) exposes purpose-built tools, not a generic `query-graphql` passthrough. Editors should never construct GraphQL. | MEDIUM | 5 tools already designed: `search_entities`, `get_entity`, `list_entities`, `list_spaces`, `get_entity_types`. Wraps existing SDK functions (`searchManyPublic`, `findOnePublic`, `findManyPublic`). |
| **Human-readable output** (no UUIDs, no raw JSON) | Core project requirement. Philschmid's MCP best practices: "Outcomes over operations" -- return prose like "Order #12345 shipped via FedEx" not `{"status":"shipped","carrier":"fedex"}`. Every competitor that targets non-technical users (Neo4j+Claude, WunderGraph) formats output as natural language or structured-but-readable text. | MEDIUM | Server-side formatting layer that resolves UUID property IDs to human names, renders entity properties as labeled text blocks, and omits internal identifiers. Claude then summarizes further. |
| **Space name resolution** (accept names, not UUIDs) | 3 pre-configured spaces. Non-technical editors do not know UUIDs. WunderGraph and Apollo both accept human-friendly identifiers. Philschmid best practice: "Flatten your arguments" -- use `Literal["Geo Genesis", "Construction"]` not `z.string().uuid()`. | LOW | Config map of `{ "Geo Genesis": "uuid-1", ... }`. Tools accept space name strings and resolve internally. Enums in Zod schema guide the model. |
| **Input validation with Zod schemas** | MCP spec requirement. Every MCP server (Apollo, mcp-graphql, Mirumee) validates inputs. The TypeScript SDK natively supports Zod. Philschmid: "Flatten your arguments" with constrained types reduces hallucination. | LOW | Already standard in the MCP TypeScript SDK `registerTool()` API. Use enums for space names, clamp pagination limits, validate entity IDs. |
| **Read-only enforcement** | Apollo disables mutations by default. mcp-graphql disables mutations by default. The Geo Protocol GraphQL API has no mutations at all, so this is architecturally guaranteed, but the MCP server should still declare `readOnlyHint: true` annotations. | LOW | Set `annotations: { readOnlyHint: true }` on every tool. No mutation queries possible against the Geo Protocol API. |
| **Pagination support** | Every GraphQL MCP server supports pagination. Large result sets would overwhelm context windows. Philschmid: "Paginate large results -- never overwhelm context windows." MCP spec supports `has_more`/`next_offset` metadata. | LOW | `first` (default 20, max 100) and `offset` params already designed into tool schemas. Return `hasMore` and `totalCount` metadata. |
| **Descriptive tool metadata** | MCP spec requires `name`, `description`, recommends `title`. Apollo auto-generates descriptions from GraphQL comments. Mirumee uses "annotated type hints with descriptive docstrings." Philschmid: "Instructions as context -- every piece of text becomes part of agent reasoning." | LOW | Clear `title`, `description`, parameter descriptions, and usage guidance ("Use this when the user wants to find entities by name or keyword"). Already drafted in the tool-use-evaluation.md. |
| **Actionable error messages** | MCP spec distinguishes protocol errors vs tool execution errors with `isError: true`. Philschmid: "Return helpful error messages rather than exceptions: 'User not found. Try searching by email instead.' Agents treat errors as observations for self-correction." | LOW | Return `isError: true` with human-readable guidance: "No entities found matching 'xyz' in Geo Genesis. Try a broader search term or check the space name." |
| **stdio transport** | Project requirement for Claude Code. Every MCP server targeting desktop clients (Apollo via Rover CLI, mcp-graphql, Mirumee) supports stdio. It is the simplest transport -- server runs as a child process. | LOW | `@modelcontextprotocol/sdk` supports stdio out of the box. One line: `server.connect(new StdioServerTransport())`. |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Domain vocabulary in tool descriptions** | Unlike generic mcp-graphql which exposes raw schema, inject GRC-20 domain terms (entities, triples, types, relations, spaces) into tool descriptions and error messages. Editors ask questions in domain language and the model maps to the right tool. No competitor does this for knowledge graphs on GRC-20. | LOW | Careful copywriting in tool `description` fields. "Search for entities (people, organizations, events, topics) in a knowledge graph space" not "Execute a search query against the entities endpoint." |
| **Pre-configured space context** | Editors never pick a space UUID. The 3 target spaces are baked into config with friendly names. Generic MCP-GraphQL servers (mcp-graphql, Apollo) require the user to know their schema. WunderGraph does persisted operations but not pre-configured scoping. | LOW | Config file lists allowed spaces with names. Tool parameter uses `z.enum(["Geo Genesis", "..."])` so Claude sees the choices. Depends on: space name resolution (table stakes). |
| **Property name resolution** (UUID-to-label mapping) | Geo Protocol uses UUID-based property IDs internally. No competitor MCP server handles this because it is Geo-specific. Without resolution, output shows `propertyId: "a1b2c3..."` instead of `"Name: John Doe"`. This is THE key differentiator for human readability. | HIGH | Requires either (a) a cached property-to-label mapping fetched at startup via `get_entity_types` / schema introspection, or (b) inline resolution using the existing `Constants.PropertyIdSymbol` from the Hypergraph SDK. This is the hardest feature. |
| **Relation traversal in natural language** | Editors ask "Who sponsors ETHDenver?" not "Find relations where typeId = X and fromEntityId = Y." The server translates natural entity names into multi-step lookups (search entity -> get relations -> resolve related entities). Mirumee did this for e-commerce (product -> category -> attributes) but no one has done it for knowledge graphs via MCP. | MEDIUM | The existing `buildRelationsSelection` helper and `translateFilterToGraphql` provide the GraphQL layer. The MCP tool needs to accept relation type names (not UUIDs) and resolve them. Depends on: property name resolution. |
| **Structured output alongside text** | MCP spec (2025-06-18 draft) added `structuredContent` + `outputSchema`. Return both a formatted text block (for Claude to summarize) and typed JSON (for programmatic consumers). Apollo does this via GraphQL return types. Most custom MCP servers do not yet use this. | MEDIUM | Use `registerTool()` with `outputSchema` (Zod). Return `{ content: [{ type: "text", text: formattedText }], structuredContent: { entities: [...] } }`. Enables future UI clients to render rich entity cards. |
| **Type-aware listing** | Instead of requiring editors to know type UUIDs, let them say "list all Events" or "show me People." The server resolves type names to type IDs internally using a cached type registry per space. Generic servers force users to provide type IDs. | MEDIUM | On startup (or first call per space), fetch `typesList` and cache `{ "Event": "uuid", "Person": "uuid", ... }`. `list_entities` accepts `typeName: z.string()` instead of `typeIds: z.array(z.string().uuid())`. Depends on: pre-configured space context. |
| **Tool annotations** (`readOnlyHint`, `idempotentHint`, `openWorldHint`) | MCP spec defines behavioral annotations that help clients (Claude Desktop, Cursor) make safety decisions. Mirumee uses these. Most custom servers skip them. Including them signals production quality and earns trust from security-conscious clients. | LOW | Set on every tool: `{ readOnlyHint: true, idempotentHint: true, openWorldHint: true }`. `openWorldHint: true` because the server reaches out to the Geo Protocol API. Trivial to implement. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Raw GraphQL execution tool** (`query-graphql`) | "Let the LLM write any query for maximum flexibility." mcp-graphql does this as its primary feature. | Editors see UUID property IDs, nested filter syntax, and cryptic error messages. LLM must construct valid Geo-specific GraphQL with `EntityFilter`, `UuidFilter`, relation traversals. Error rate is high. Destroys human-readable experience. | Curated high-level tools that abstract away GraphQL entirely. The LLM never generates GraphQL. |
| **Schema introspection tool** (`introspect-schema`) | "Let the LLM discover the API dynamically." mcp-graphql and Apollo both offer this. | Geo Protocol schema is large. Dumping it into context consumes ~2,000+ tokens and confuses non-technical workflows. Editors do not care about schema structure. Introspection is a developer tool, not an editor tool. | Pre-configured tools with baked-in domain knowledge. If schema changes, update the server, not the prompt. |
| **Write/mutation tools** | "Editors should be able to create and edit entities through chat." | 1) Geo Protocol has no GraphQL mutations (writes use a separate REST endpoint). 2) Write operations via LLM are dangerous without human review. 3) Adds authentication complexity. 4) Scope creep -- the project is explicitly read-only. | Keep read-only. If write support is needed later, build it as a separate MCP server with explicit confirmation flows and human-in-the-loop approval (per MCP spec security recommendations). |
| **Multi-model / provider-agnostic design** | "Support OpenAI, Gemini, etc. alongside Claude." | MCP is the abstraction layer -- it already works with any MCP-compatible client regardless of model. Building model-specific adapters inside the server adds complexity for zero benefit. The server speaks MCP protocol; what model the client uses is not its concern. | Rely on MCP protocol standardization. Any MCP client (Claude Desktop, Cursor, VS Code Copilot, LibreChat) works without server changes. |
| **Conversation state / memory in the server** | "Remember what the editor asked last time." | MCP tools are stateless request/response. The client (Claude Desktop, Claude Code) manages conversation state and context window. Adding server-side state creates synchronization bugs, stale data, and architectural complexity. | Let the MCP client handle conversation context. Tools are pure functions: input -> output. |
| **Complex filter DSL exposed to editors** | "Let editors build advanced filters: AND/OR/NOT, nested property comparisons." | Non-technical editors cannot reason about filter algebra. Exposing the full `EntityFilter` graph structure leads to hallucinated filters and confusing errors. | Expose simple, flat parameters: `typeName`, `query` (text search), `limit`. For complex queries, let Claude decompose into multiple simple tool calls (search -> filter in context -> get details). Multi-step is more reliable than one complex filter. |
| **Streamable HTTP transport** (for now) | "Support web clients and remote access." | Adds Express server, CORS, auth token management, deployment infrastructure. The project scope is stdio for Claude Code. Premature infrastructure. | Start with stdio only. Add Streamable HTTP in a later phase if web client demand materializes. Already noted as Phase 2 in the mcp-server-evaluation.md. |
| **Caching layer** (Redis, in-memory TTL cache) | "Cache GraphQL responses for performance." | Geo Protocol data changes infrequently but unpredictably. Cache invalidation is hard. For 3 pre-configured spaces with ~50 queries/day, the GraphQL API can handle the load directly. Adds operational complexity for marginal latency improvement. | Direct pass-through to GraphQL API. Cache only the type registry and property-to-label mappings (which change rarely). Full result caching is premature optimization. |

## Feature Dependencies

```
[Space Name Resolution]
    └──requires──> [Pre-configured Space List in Config]

[Property Name Resolution]
    └──requires──> [Type Registry Cache]
                       └──requires──> [get_entity_types tool or startup introspection]

[Type-Aware Listing]
    └──requires──> [Type Registry Cache]
                       └──requires──> [get_entity_types tool or startup introspection]

[Relation Traversal in Natural Language]
    └──requires──> [Property Name Resolution]
    └──requires──> [Type Registry Cache]

[Human-Readable Output]
    └──requires──> [Property Name Resolution]
    └──requires──> [Space Name Resolution]

[Structured Output]
    └──enhances──> [Human-Readable Output] (text layer for Claude, structured layer for future UIs)

[Tool Annotations]
    └──enhances──> [Read-Only Enforcement] (declares safety intent to clients)

[Pre-configured Space Context]
    └──enhances──> [Space Name Resolution] (limits choices to known spaces)
    └──enhances──> [Type-Aware Listing] (type registry scoped to known spaces)
```

### Dependency Notes

- **Human-Readable Output requires Property Name Resolution:** Without mapping UUID property IDs to labels ("Name", "Description", "Date"), output is gibberish to editors. This is the critical path.
- **Type-Aware Listing requires Type Registry Cache:** To accept "Event" instead of a UUID, the server must have fetched and cached the type-to-UUID mapping for each space.
- **Relation Traversal requires both Property Name Resolution and Type Registry Cache:** Following relations means resolving relation type names to UUIDs, then resolving the target entity's properties to human labels.
- **Pre-configured Space Context enhances multiple features:** By limiting to 3 known spaces, the type registry and property map are bounded and cacheable at startup.
- **Structured Output enhances Human-Readable Output:** They are complementary layers. Text content goes to Claude for summarization; structured content goes to future programmatic consumers.

## MVP Definition

### Launch With (v1)

Minimum viable product -- what's needed to validate the concept with editors.

- [ ] **5 curated tools** with Zod schemas and descriptive metadata -- the core interface
- [ ] **Space name resolution** -- editors say "Geo Genesis" not a UUID
- [ ] **Human-readable text output** -- formatted entity summaries, no raw JSON or UUIDs in output
- [ ] **Property name resolution** -- map UUID property IDs to human labels (the hard part)
- [ ] **Type registry cache** -- fetch type names per space at startup for type-aware queries
- [ ] **Input validation** -- Zod schemas with enums for space names, clamped pagination
- [ ] **Actionable error messages** -- human-friendly guidance on errors
- [ ] **stdio transport** -- runs as Claude Code child process
- [ ] **Tool annotations** -- `readOnlyHint: true` on all tools (trivial, signals quality)

### Add After Validation (v1.x)

Features to add once editors are actively using the server.

- [ ] **Type-aware listing** -- accept type names ("Event", "Person") instead of type UUIDs. Add when editors report friction with `get_entity_types` -> copy UUID -> `list_entities` workflow.
- [ ] **Relation traversal in natural language** -- "Who sponsors ETHDenver?" as a single question. Add when editors report multi-step queries are tedious.
- [ ] **Structured output** (`outputSchema` + `structuredContent`) -- Add when a web UI or programmatic client needs to consume tool results alongside text.
- [ ] **Streamable HTTP transport** -- Add when web-based clients (LibreChat, custom UI) are needed for non-Claude-Code users.

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] **Rate limiting** -- Add when usage scales beyond a single team (~50 queries/day). Unnecessary for 3 pre-configured spaces.
- [ ] **Usage analytics / telemetry** -- Add when management needs visibility into which tools editors use most.
- [ ] **Multi-space search** (search across all 3 spaces simultaneously) -- Requires merging and deduplicating results. Add when editors request cross-space discovery.
- [ ] **Write operations** (via separate server) -- Only if editorial workflow demands it. Requires human-in-the-loop confirmation.

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Curated tools (5) | HIGH | MEDIUM | P1 |
| Space name resolution | HIGH | LOW | P1 |
| Human-readable output | HIGH | MEDIUM | P1 |
| Property name resolution | HIGH | HIGH | P1 |
| Type registry cache | HIGH | MEDIUM | P1 |
| Input validation (Zod) | HIGH | LOW | P1 |
| Actionable error messages | MEDIUM | LOW | P1 |
| stdio transport | HIGH | LOW | P1 |
| Tool annotations | LOW | LOW | P1 |
| Descriptive tool metadata | MEDIUM | LOW | P1 |
| Pagination support | MEDIUM | LOW | P1 |
| Type-aware listing | HIGH | MEDIUM | P2 |
| Relation traversal (NL) | HIGH | MEDIUM | P2 |
| Structured output | MEDIUM | MEDIUM | P2 |
| Streamable HTTP transport | MEDIUM | MEDIUM | P3 |
| Domain vocabulary | MEDIUM | LOW | P1 |
| Pre-configured space context | HIGH | LOW | P1 |
| Rate limiting | LOW | LOW | P3 |

**Priority key:**
- P1: Must have for launch -- editors cannot use the server without these
- P2: Should have, add when initial validation proves the concept works
- P3: Nice to have, future consideration based on usage patterns

## Competitor Feature Analysis

| Feature | mcp-graphql (generic) | Apollo MCP Server | WunderGraph MCP Gateway | Agoda APIAgent | Our Approach |
|---------|----------------------|-------------------|------------------------|---------------|--------------|
| Tool generation | 2 generic tools (introspect + query) | Auto-generated from .graphql files or persisted queries | Schema-aware from persisted operations | Auto-generated from schema introspection | 5 hand-curated, domain-specific tools |
| Schema handling | Full introspection exposed | Controlled via operation files or persisted query manifests | Persisted operations only | DuckDB post-processing for large results | No schema exposure. Domain knowledge baked into tool descriptions. |
| Human-readable output | Raw GraphQL JSON | Depends on operation definitions | Depends on operation definitions | DuckDB SQL for concise results | Server-side formatting layer: property names resolved, UUIDs hidden, labeled text blocks |
| Security model | Mutations disabled by default | Pre-approved persisted queries, auth propagation | Persisted operations as trust boundary | Schema-constrained tools | Read-only by architecture (no mutations in API). Tool annotations declare `readOnlyHint`. |
| Non-technical user friendliness | LOW -- requires GraphQL knowledge | MEDIUM -- operations pre-defined but generic | MEDIUM -- natural language but generic | MEDIUM -- zero-code but generic | HIGH -- space names, type names, property labels, domain vocabulary, no UUIDs |
| Setup complexity | LOW -- single command | MEDIUM -- Rover CLI + GraphOS | MEDIUM -- Cosmo Router setup | LOW -- point at schema URL | LOW -- `npx` or direct `node` with config |
| Transport | stdio | stdio + Streamable HTTP | HTTP | stdio + HTTP | stdio (v1), Streamable HTTP (v2) |
| Deployment | Local | Local or containerized cloud | Cloud (Cosmo Router) | Local or cloud proxy | Local (v1) |

## Sources

- [mcp-graphql (generic MCP server for GraphQL)](https://github.com/blurrah/mcp-graphql) -- Features: introspect-schema + query-graphql tools, mutations disabled by default. Confidence: HIGH (direct repository inspection).
- [Apollo MCP Server docs](https://www.apollographql.com/docs/apollo-mcp-server) -- Features: operation files, persisted query manifests, schema introspection modes, auth, Streamable HTTP. Confidence: HIGH (official docs).
- [Apollo blog: "The Future of MCP is GraphQL"](https://www.apollographql.com/blog/the-future-of-mcp-is-graphql) -- Positioning GraphQL as the ideal MCP orchestration layer. Confidence: HIGH.
- [Mirumee: "From GraphQL Schema to MCP Server"](https://mirumee.com/blog/from-graphql-schema-to-mcp-server) -- Patterns: typed client generation, fragment reuse, relay pagination, tool annotations (`readOnlyHint`, `idempotentHint`). Confidence: HIGH.
- [WunderGraph MCP Gateway](https://wundergraph.com/mcp-gateway) -- Features: persisted operations, schema-aware discovery, natural language access. Confidence: MEDIUM (marketing page, not deep docs).
- [Agoda APIAgent](https://github.com/agoda-com/api-agent) -- Features: zero-code schema-to-MCP, DuckDB post-processing, recipe learning. Confidence: MEDIUM (new project, Feb 2026).
- [Philschmid: MCP Server Best Practices](https://www.philschmid.de/mcp-best-practices) -- Six practices: outcomes over operations, flatten arguments, instructions as context, curate ruthlessly, name for discovery, paginate. Confidence: HIGH.
- [MCP Specification (draft): Tools](https://modelcontextprotocol.io/specification/draft/server/tools) -- Annotations, structured output, outputSchema, error handling spec. Confidence: HIGH (official specification).
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk) via Context7 -- `registerTool()` API, Zod v4, `outputSchema`, `annotations` config fields. Confidence: HIGH.
- [CData: MCP Server Best Practices 2026](https://www.cdata.com/blog/mcp-server-best-practices-2026) -- Access control, idempotency, structured outputs. Confidence: MEDIUM (could not fetch full content).
- [Neo4j + Claude + MCP for knowledge graphs](https://neo4j.com/blog/developer/knowledge-graphs-claude-neo4j-mcp/) -- Natural language interface to graph databases for non-developers. Confidence: MEDIUM.

---
*Feature research for: MCP server bridging GraphQL knowledge graph API*
*Researched: 2026-02-18*
