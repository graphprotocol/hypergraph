# Pitfalls Research

**Domain:** MCP server bridging a GraphQL API for non-technical knowledge graph editors
**Researched:** 2026-02-18
**Confidence:** HIGH (verified against MCP SDK docs, codebase analysis, and multiple community sources)

## Critical Pitfalls

### Pitfall 1: Context Window Exhaustion from Unbounded Entity Lists

**What goes wrong:**
A query like "show me all events in the AI space" returns hundreds or thousands of entities. Each entity includes a `valuesList` array with multiple property entries (each containing `propertyId`, `text`, `boolean`, `float`, `datetime`, `point`, `schedule` fields), plus nested relation data. The raw JSON for 100 entities with 10 properties each easily exceeds 50,000 tokens. Claude's context fills up, the model starts dropping information, follow-up questions fail, and the editor's session becomes useless.

**Why it happens:**
The existing SDK defaults to `first: 100` in `findManyPublic` and `searchManyPublic`. Developers building the MCP server naturally mirror this default. But MCP tool results go into the LLM's context window, not a scrollable UI. What is a reasonable page size for a programmatic API is catastrophic for an LLM conversation.

**How to avoid:**
1. Default `first` to 10-20 entities in MCP tool results, regardless of what the underlying SDK supports.
2. Return **summarized** results, not raw GraphQL responses. Each entity should be compressed to: name, type, 2-3 key properties as a one-liner. Full details only via `get_entity` on a specific entity.
3. Always return pagination metadata: `"Showing 1-20 of 847 results. Ask for the next page to see more."`
4. Implement a `format_entity_summary()` function in the MCP server that strips UUIDs, collapses `valuesList` into human-readable key-value pairs, and omits null/empty fields.
5. Consider hard-capping tool output at a token budget (e.g., 4,000 tokens per tool response) and truncating with a "results truncated" message.

**Warning signs:**
- During testing, Claude gives vague or incomplete summaries of results
- Claude says "I see many entities" but cannot enumerate them
- Follow-up questions like "tell me about the third one" fail because the context is already full
- Claude Code shows high token usage warnings
- Editors complain about slow or empty responses

**Phase to address:**
Phase 1 (Core tool implementation). The output formatting layer is foundational -- every tool depends on it. Building tools that return raw JSON and trying to fix formatting later is a rewrite.

---

### Pitfall 2: UUID Leakage into Tool Interfaces

**What goes wrong:**
The Geo Protocol data model is UUID-native: property IDs like `a126ca530c8e48d5b88882c734c38935`, type IDs like `a288444f06a340379ace66fe325864d0`, space IDs like `41e851610e13a19441c4d980f2f2ce6b`, and entity IDs are all opaque UUIDs. If tool input schemas or output formatting expose these UUIDs, three things break:
1. Claude must pass UUIDs between tool calls, and one wrong character means silent failures or wrong results.
2. Editors see UUID-laden responses and cannot make sense of them.
3. Claude hallucinates plausible-looking UUIDs that do not correspond to real entities, leading to "entity not found" errors that confuse editors.

**Why it happens:**
The underlying GraphQL API and SDK use UUIDs everywhere. The natural implementation approach is to expose the SDK's interface directly through MCP tools. The `valuesList` response format returns `propertyId` UUIDs alongside values, and the `translateFilterToGraphql` function translates human-readable field names to UUID-based `propertyId` filters. If the MCP server skips this translation layer, UUIDs leak into the tool interface.

**How to avoid:**
1. **Space IDs**: Hard-code the 3 program space IDs in tool configuration. Expose them via `list_spaces` with human-readable names. Tool descriptions should list spaces by name: `"Available spaces: AI Space, Science Space, Arts Space"`. Claude picks by name; the server resolves to UUID internally.
2. **Type IDs**: The `get_entity_types` tool should return type names, not type IDs. Store a name-to-typeId mapping server-side. When `list_entities` needs a type filter, accept a type name and resolve it internally.
3. **Property IDs**: Never expose `propertyId` UUIDs in tool outputs. The `valuesList` response from GraphQL must be transformed into `{ "Name": "John Doe", "Email": "john@example.com" }` format before returning to Claude. This requires maintaining a `propertyId -> humanReadableName` mapping, which the existing SDK's `PropertyIdSymbol` annotations already provide for typed schemas.
4. **Entity IDs**: These are the one UUID that must be exposed (for `get_entity` lookups). But always pair them with entity names: `"John Doe (id: abc123...)"`. Consider using short IDs or entity names as the primary reference.

**Warning signs:**
- Tool output contains strings like `"propertyId": "a126ca530c8e48d5b88882c734c38935"`
- Claude asks the editor "which space ID would you like to query?" instead of "which space?"
- Claude passes UUIDs between tool calls and gets "not found" errors
- Test conversations show Claude fabricating UUIDs

**Phase to address:**
Phase 1 (Core tool implementation). UUID abstraction must be designed into the tool interface from the start. Retrofitting it requires changing every tool's input schema and output formatter.

---

### Pitfall 3: Tool Description Ambiguity Causing Wrong Tool Selection

**What goes wrong:**
Claude selects `search_entities` when `list_entities` was appropriate, or vice versa. An editor asks "show me all people in the AI space" and Claude calls `search_entities` with query "people" (full-text search) instead of `list_entities` with type filter "Person" (structured query). The results are different: search returns entities with "people" in their text; list returns all entities of type Person. The editor gets wrong or incomplete results without realizing it.

**Why it happens:**
MCP tool selection is driven entirely by tool descriptions and parameter schemas. If the descriptions for `search_entities` and `list_entities` overlap semantically, the model guesses. With 5+ tools, the probability of misselection compounds. The Grafbase team identified this as a core problem: "confusing tool descriptions can cause LLMs to misbehave." Research shows that with chained calls, each decision having 0.9 accuracy, 5 chained decisions yield only 0.59 overall accuracy.

**How to avoid:**
1. Write tool descriptions that explicitly state **when to use** and **when NOT to use** each tool:
   - `search_entities`: "Use ONLY for free-text keyword search. Use this when the editor asks to 'search for', 'find anything about', or 'look up' a keyword. Do NOT use this to list all entities of a type."
   - `list_entities`: "Use to list entities filtered by type, property values, or relations. Use this when the editor asks to 'show all', 'list', or 'how many' of a specific entity type. Do NOT use this for keyword search."
2. Include example queries in descriptions: `"Example: 'show me all events' -> use list_entities with typeFilter='Event'"`
3. Bake space names directly into descriptions so Claude never needs to guess: `"The available spaces are: 'AI Space' (for AI-related content), 'Science Space' (for science content), 'Arts Space' (for arts content)."`
4. Test tool selection with 20-30 representative editor queries before shipping. Track which tool Claude picks and adjust descriptions until accuracy exceeds 95%.

**Warning signs:**
- In testing, Claude calls `search_entities` for type-based queries
- Claude calls multiple tools for a single query (shotgun approach)
- Claude asks clarifying questions that it should not need to ask (e.g., "should I search or list?")
- Results feel "close but wrong" -- related but not what was asked

**Phase to address:**
Phase 1 (Core tool implementation) for initial descriptions. Phase 2 (Testing and tuning) for iterative refinement based on real editor queries.

---

### Pitfall 4: console.log Corrupting stdio Transport

**What goes wrong:**
The MCP server runs via stdio transport, where `stdout` carries JSON-RPC protocol messages. Any `console.log()` statement -- whether from the MCP server code, imported SDK modules, or third-party libraries -- writes to stdout and corrupts the protocol stream. The MCP client (Claude Code) receives malformed JSON, fails to parse it, and the entire server connection drops. The editor sees a cryptic "MCP server disconnected" error.

**Why it happens:**
This is the single most reported MCP server bug. The existing Hypergraph SDK code uses `console.warn()` in `findManyPublic` and `findOnePublic` for invalid entity logging. If the MCP server imports and calls these functions, those warnings go to stderr (safe), but any debug logging added during development that uses `console.log()` is fatal. The problem is insidious because it works fine during development with HTTP transport or direct testing, and only fails when connected via stdio.

**How to avoid:**
1. Redirect all logging to stderr from the very first line of the server entry point: use a logger that writes to stderr exclusively.
2. Set up an ESLint/Biome rule to ban `console.log` in the MCP server package (allow `console.error` and `console.warn` which go to stderr).
3. Never import library code that writes to stdout. Verify by running the MCP server manually and piping stdout to a file -- it should contain only valid JSON-RPC messages.
4. Use the MCP SDK's built-in logging facilities rather than raw console methods.
5. Add an integration test that starts the server via stdio and verifies all output on stdout is valid JSON-RPC.

**Warning signs:**
- Server works via HTTP transport but fails via stdio
- Claude Code reports "failed to connect to MCP server" or "invalid JSON"
- Server works initially but fails when a certain code path adds logging
- Intermittent disconnections (not every code path triggers the log)

**Phase to address:**
Phase 1 (Server scaffolding). This must be configured before any tool implementation begins. Fixing it after writing tool code means auditing every import and function call.

---

### Pitfall 5: Raw GraphQL Error Propagation to Claude

**What goes wrong:**
When the Geo Protocol GraphQL API returns an error (network timeout, malformed query, schema mismatch, API downtime), the MCP server propagates the raw GraphQL error to Claude. Claude receives something like `"errors": [{"message": "Cannot query field 'entitiesOrderedByProperty' on type 'Query'", "locations": [{"line": 2, "column": 3}]}]` and either presents this verbatim to the editor (confusing) or misinterprets it as a data result (dangerous). Worse, Claude may attempt to "fix" the error by calling the tool again with different parameters, entering a retry loop that consumes tokens rapidly.

**Why it happens:**
The `graphql-request` library throws on GraphQL errors. Without explicit error handling in each tool handler, these exceptions become MCP protocol errors. The MCP protocol surfaces errors to the client, but the model interprets them through its own understanding, which may be wrong.

**How to avoid:**
1. Wrap every tool handler in a try/catch that converts errors to human-readable messages: `"The knowledge graph API is temporarily unavailable. Please try again in a moment."` or `"No results found for that query. Try a different search term or check the space name."`
2. Distinguish between error types:
   - Network errors -> "API is down, try later"
   - Empty results -> "No entities match that criteria" (not an error)
   - Invalid filters -> "I could not understand that filter. Try a simpler query."
   - Rate limits -> "Too many queries. Please wait a moment."
3. Return errors as successful tool results with explanatory text, NOT as MCP protocol errors. This gives Claude natural language to work with rather than protocol-level failures.
4. Add timeout handling (5-10 second timeout per GraphQL request) to prevent hanging tool calls.
5. Set `isError: true` on the tool result content when returning error messages, so Claude knows the result is an error and does not present error text as if it were data.

**Warning signs:**
- Claude shows editors messages containing "GraphQL" or "query syntax"
- Claude enters retry loops, calling the same tool repeatedly
- Token usage spikes during error conditions
- Editors report "Claude said something about an error and then stopped"

**Phase to address:**
Phase 1 (Core tool implementation). Each tool handler needs error handling from the start. Adding it later means finding every failure mode by hitting them in production.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Return raw `valuesList` arrays instead of human-readable objects | Ship faster -- no property name mapping needed | Every tool output contains UUIDs, Claude struggles to present results, editors get confused | Never -- this is the entire value proposition of the MCP server |
| Hard-code property ID mappings instead of querying schema dynamically | No need to build schema introspection, faster initial build | When schema changes (new properties, renamed fields), the MCP server silently returns stale data | MVP only -- plan to replace with dynamic schema resolution in Phase 2 |
| Skip pagination metadata in tool responses | Simpler tool output format | Editors cannot tell if they are seeing all results or a subset, leading to false "nothing found" conclusions | Never -- even "Showing 10 of 10 total" is valuable |
| Use `first: 100` default from SDK without overriding | One fewer configuration to set | Context window blowout on populated spaces (see Critical Pitfall 1) | Never -- MCP and programmatic APIs have fundamentally different output budgets |
| Inline all tool implementations in `server.ts` | Faster prototyping, no module structure | Cannot unit-test tool logic, cannot reuse handlers for a future web UI or Streamable HTTP transport | Day 1 prototype only -- extract to `tools/` modules before shipping |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Geo Protocol GraphQL API | Sending queries without a `spaceId` or `spaceIds` filter, resulting in cross-space results or errors | Always include space filtering in every query. The API requires space context for `valuesList` filtering (`filter: {spaceId: {is: $spaceId}}`). Pre-configure the 3 allowed space IDs. |
| Geo Protocol GraphQL API | Assuming entity `name` is always populated | The `name` field can be empty for entities that use a different property as their display name. The MCP server should fall back to the first non-empty text property in `valuesList` if `name` is null/empty. |
| Geo Protocol GraphQL API | Requesting relations without specifying `typeId` filters | Relations in the Geo Protocol are typed by `typeId` UUID. Querying relations without filtering by `typeId` returns all relation types mixed together, producing confusing output. Each relation query must specify the relation type. |
| MCP SDK (TypeScript) | Using v1 `server.tool()` API which is deprecated in v2 | Use `server.registerTool()` with a config object. The v2 API requires `z.object()` wrapping (not raw shapes). Pin to v1.x for now; stable v2 expected Q1 2026. |
| MCP SDK stdio transport | Importing modules that trigger side-effect logging on import | Audit all imports in the server entry point. Any module that logs on import (common in SDK initializers, config loaders) will corrupt stdio. Import lazily or redirect stdout before importing. |
| Claude Code MCP config | Using `"command": "node"` with TypeScript source files | Use `"command": "npx"` with `"args": ["tsx", "packages/mcp-server/src/server.ts"]` or compile to JavaScript first. Raw `node` cannot run `.ts` files without a loader. |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Fetching all entity properties when only name is needed | Tool responses are slow (2-5s) and bloated; GraphQL query selects `valuesList` with all fields for every entity in a list | For list/search tools, query only `id`, `name`, and 1-2 key properties. Reserve full `valuesList` for `get_entity` (single entity detail). | At 50+ entities per query -- response time and token consumption become unacceptable |
| No caching of type-name-to-UUID mappings | Every `list_entities` call with a type filter triggers a separate GraphQL query to resolve the type name to a type ID, doubling API calls | Cache `get_entity_types` results in memory for the server's lifetime (types change rarely). Invalidate on server restart. | At 10+ queries per minute -- noticeable latency and unnecessary API load |
| Nested relation fetching on list queries | Including relations in multi-entity list results causes O(N*M) data expansion (N entities times M relations each). A list of 20 entities with 5 relations each produces 100+ nested objects | Never include relations in list tool results. Only fetch relations in `get_entity` (single entity detail). For list results, mention "has 5 sponsors" as a count, not the full relation data. | At any scale with entities that have relations -- the data expansion is immediate |
| No request timeout on GraphQL calls | A slow or unresponsive API causes the MCP tool call to hang indefinitely. Claude Code waits, the editor waits, tokens are consumed by the hanging context | Set a 10-second timeout on all `graphql-request` calls. Return a clear timeout message to Claude. | Intermittent -- depends on API health, but will happen in production |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Exposing raw GraphQL execution as an MCP tool | Claude (or a prompt injection attack via entity content) could craft arbitrary GraphQL queries, potentially discovering schema structure or querying unintended spaces | Never expose a raw `execute_graphql` tool. Only expose curated, parameterized tools. All queries are constructed server-side with validated inputs. |
| Not validating space IDs from tool inputs | Even with curated tools, if `spaceId` is accepted as a free-form string parameter, Claude could be manipulated (via prompt injection in entity content) to query a space outside the 3 allowed spaces | Validate all `spaceId` inputs against the allowlist of 3 configured spaces. Reject any request for an unlisted space with a clear error message. |
| Logging full API responses to a shared log file | Entity data may contain personal information or sensitive content. Logging full responses exposes this data to anyone with log access. | Log only metadata (query type, entity count, response time). Never log entity content. If debug logging is needed, use a separate debug mode with access controls. |
| Shared `ANTHROPIC_API_KEY` without billing alerts | A runaway query loop or unexpected usage spike leads to an unbounded bill. With a shared key across 10+ editors, individual usage is untracked. | Set billing alerts and hard spending limits on the Anthropic dashboard. Consider per-editor API keys if budget accountability is needed later. |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Returning entity counts without context | Editor asks "how many events are there?" and gets "847 entities found" with no breakdown by type or space | Return structured counts: "AI Space: 312 events, 89 people, 45 organizations. Science Space: 201 events..." Help the editor understand distribution. |
| Not handling "no results" gracefully | Editor searches for a misspelled term and gets an empty response. Claude says "no results found" with no guidance. | Return suggestions: "No entities match 'climte'. Did you mean 'climate'? You can also try: list all entity types to discover what is available." |
| Presenting entity details as flat text dumps | `get_entity` returns a wall of text with 20+ properties, many irrelevant or empty | Group properties by category (basic info, dates, relations). Omit null/empty properties. Put the most important properties first (name, type, description). |
| Not indicating data freshness | Editor sees results and assumes they are current, but the API may have stale data or the cache may be outdated | Include a timestamp or freshness indicator: "Results from Geo Protocol API as of [timestamp]." This is especially important for a protocol with active data submission. |
| Overwhelming editors with all 3 spaces when they usually work in one | Every query mentions all 3 spaces, requiring the editor to specify which one each time | If an editor consistently asks about one space, the tool descriptions should make the default space clear. Consider a `set_default_space` tool or a hint like "Most editors work in the AI Space. Specify a different space if needed." |

## "Looks Done But Isn't" Checklist

- [ ] **search_entities:** Often missing space filtering -- verify that search results only come from the 3 allowed spaces, not the entire knowledge graph
- [ ] **list_entities:** Often missing type name resolution -- verify that editors can say "list all people" and the tool resolves "Person" to the correct type UUID internally
- [ ] **get_entity:** Often missing property name mapping -- verify that output uses human-readable property names like "Email" not UUIDs like `a126ca530c8e48d5b88882c734c38935`
- [ ] **get_entity:** Often missing relation summarization -- verify that relations show target entity names, not just entity IDs
- [ ] **All tools:** Often missing pagination metadata -- verify every list response includes total count and a "next page" hint
- [ ] **All tools:** Often missing error messages -- verify that API timeouts, empty results, and malformed inputs produce helpful messages, not raw errors
- [ ] **Tool descriptions:** Often missing negative examples -- verify descriptions say when NOT to use each tool, not just when to use it
- [ ] **stdio transport:** Often corrupted by logging -- verify the server produces zero stdout output except valid JSON-RPC messages (run `node server.js 2>/dev/null | jq .` and verify no parse errors)
- [ ] **Space allowlist:** Often bypassed by free-form inputs -- verify that passing an arbitrary UUID as spaceId is rejected

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Context window exhaustion from large results | LOW | Reduce `first` default, add output summarization, redeploy. No schema changes needed. |
| UUID leakage in tool interfaces | MEDIUM | Requires rewriting tool output formatters and possibly input schemas. If editors have already learned to work with UUIDs, changing the interface is disruptive. |
| Wrong tool selection due to ambiguous descriptions | LOW | Update tool descriptions and redeploy. No code changes to tool logic. Test with representative queries. |
| console.log corrupting stdio | LOW | Find and remove/redirect the offending log statement. Add a lint rule to prevent recurrence. |
| Raw GraphQL error propagation | MEDIUM | Add try/catch to each tool handler. Requires touching every tool file, but the pattern is mechanical. |
| No pagination (editors think they see all data) | MEDIUM | Add pagination metadata to tool outputs. Requires changing the output format, which may confuse editors who learned the old format. |
| Hard-coded property mappings going stale | HIGH | Requires building dynamic schema resolution, which may mean querying the API for type definitions at startup or caching schema metadata. This is a significant feature, not a quick fix. |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Context window exhaustion | Phase 1: Core tool implementation | Run 10 representative queries. Check that no single tool response exceeds 4,000 tokens. Check that follow-up questions work within the same conversation. |
| UUID leakage | Phase 1: Core tool implementation | Review every tool's output format. Grep for UUID patterns (`[0-9a-f]{32}`) in tool responses. Only entity IDs should appear, always paired with names. |
| Tool description ambiguity | Phase 1 + Phase 2: Testing and tuning | Run 30 representative editor queries. Log which tool Claude selects. Target >95% correct tool selection rate. |
| console.log corruption | Phase 1: Server scaffolding | Start server via stdio, pipe stdout to `jq`. Zero parse errors. Add lint rule. Run in CI. |
| Raw error propagation | Phase 1: Core tool implementation | Simulate API errors (network timeout, 500, malformed response). Verify each produces a human-readable message, not a stack trace. |
| Space allowlist bypass | Phase 1: Core tool implementation | Attempt to pass a random UUID as spaceId in every tool. Verify rejection. |
| Missing pagination metadata | Phase 1: Core tool implementation | Run a list query on a space with >20 entities. Verify the response includes total count and "next page" guidance. |
| Property mapping staleness | Phase 2 or Phase 3: Dynamic schema resolution | Compare hard-coded property names with current API schema. Plan migration to dynamic resolution if schemas change. |
| Nested relation explosion | Phase 1: Core tool implementation | Run `get_entity` on an entity with 10+ relations. Verify response is under 2,000 tokens. Run `list_entities` and verify relations are NOT included. |
| Shared API key cost runaway | Phase 1: Setup | Verify Anthropic billing alerts are configured before distributing the API key to editors. |

## Sources

- [MCP TypeScript SDK documentation](https://github.com/modelcontextprotocol/typescript-sdk) (Context7, HIGH confidence)
- [Grafbase: Solving context explosion in GraphQL MCP servers](https://grafbase.com/blog/managing-mcp-context-graphql) (MEDIUM confidence -- verified approach matches MCP spec)
- [Phil Schmid: MCP Server Best Practices](https://www.philschmid.de/mcp-best-practices) (MEDIUM confidence -- practical guidance, verified against SDK docs)
- [Nearform: Implementing MCP - Tips, Tricks and Pitfalls](https://nearform.com/digital-community/implementing-model-context-protocol-mcp-tips-tricks-and-pitfalls/) (MEDIUM confidence)
- [MCP Tools Specification](https://modelcontextprotocol.io/specification/2025-06-18/server/tools) (HIGH confidence -- official spec)
- [Merge: MCP Tool Descriptions Best Practices](https://www.merge.dev/blog/mcp-tool-description) (MEDIUM confidence)
- [The Hidden Cost of MCPs on Your Context Window](https://selfservicebi.co.uk/analytics%20edge/improve%20the%20experience/2025/11/23/the-hidden-cost-of-mcps-and-custom-instructions-on-your-context-window.html) (MEDIUM confidence)
- [15 Best Practices for Building MCP Servers in Production](https://thenewstack.io/15-best-practices-for-building-mcp-servers-in-production/) (MEDIUM confidence)
- [MCP Security Survival Guide](https://towardsdatascience.com/the-mcp-security-survival-guide-best-practices-pitfalls-and-real-world-lessons/) (MEDIUM confidence)
- [MCP Transport Future](http://blog.modelcontextprotocol.io/posts/2025-12-19-mcp-transport-future/) (HIGH confidence -- official MCP blog)
- Codebase analysis of `packages/hypergraph/src/entity/find-many-public.ts`, `search-many-public.ts`, `find-one-public.ts`, `constants.ts`, `convert-relations.ts`, `relation-query-helpers.ts`, `translate-filter-to-graphql.test.ts` (HIGH confidence -- direct code review)
- Existing project evaluation documents: `CLAUDE_INTEGRATION/MAIN.md`, `CLAUDE_INTEGRATION/mcp-server-evaluation.md` (HIGH confidence -- project-internal)

---
*Pitfalls research for: MCP server bridging Geo Protocol GraphQL API for non-technical editors*
*Researched: 2026-02-18*
