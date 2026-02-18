# MCP Server Approach Evaluation

> Evaluated by agent: `mcp-advocate`

## 1. Architecture

An MCP server acts as a protocol bridge between an AI client (Claude Desktop, LibreChat, etc.) and the Geo Protocol GraphQL API. The server exposes curated "tools" that the AI model can invoke on behalf of the editor.

```
+------------------+       MCP Protocol        +------------------+       GraphQL        +-------------------+
|                  |  (stdio or Streamable HTTP)|                  |    over HTTPS        |                   |
|  Editor's AI     | <----------------------->  |  Hypergraph MCP  | <------------------> |  Geo Protocol     |
|  Client          |   tool calls / results     |  Server          |   queries only       |  GraphQL API      |
|                  |                            |                  |                      |  (TESTNET/MAINNET)|
| - Claude Desktop |                            | Tools:           |                      |                   |
| - LibreChat      |                            |  search_entities |                      | Query types:      |
| - Custom Web UI  |                            |  get_entity      |                      |  entities         |
|                  |                            |  list_entities   |                      |  entity           |
+------------------+                            |  list_spaces     |                      |  search           |
                                                |  get_space       |                      |  spaces           |
                                                |  introspect      |                      |  relations        |
                                                +------------------+                      +-------------------+
                                                       |
                                                       | Reads config from
                                                       v
                                                +------------------+
                                                | Config           |
                                                | - API origin     |
                                                | - Allowed spaces |
                                                | - Rate limits    |
                                                +------------------+
```

**How it works:**
1. Editor opens their AI client and types a natural language query like "Find all events in the Geo Genesis space"
2. The AI model decides to call the `search_entities` or `list_entities` tool
3. The MCP server receives the tool call, translates it to a GraphQL query using the existing `graphql-request` patterns from the Hypergraph SDK, and sends it to `Graph.TESTNET_API_ORIGIN/graphql`
4. Results are returned to the AI, which formats a human-readable response

**Transport options:**
- **stdio**: For local desktop clients (Claude Desktop). The MCP server runs as a child process.
- **Streamable HTTP**: For remote/web clients (LibreChat, custom UI). The MCP server runs as an Express endpoint, which aligns well with the existing `apps/server` Express setup.

## 2. Editor Access Options

### Option A: Claude Desktop ($20/mo per seat for Pro, $100/mo for Max, $200/mo for Team)

- **Setup**: Editor installs Claude Desktop, adds MCP server config to `claude_desktop_config.json`
- **Pros**: Zero server infrastructure needed (stdio transport), polished UX, handles conversation management
- **Cons**: Requires per-seat Anthropic subscription, editor must install local software, macOS/Windows only (no mobile/web), config is JSON file editing (non-trivial for non-technical users)
- **Suitability for non-technical editors**: MODERATE. Initial setup needs developer help. Once configured, daily use is straightforward.

### Option B: LibreChat (self-hosted, API token costs only)

- **Setup**: Deploy LibreChat instance, configure MCP server as Streamable HTTP endpoint, editors access via web browser
- **Pros**: Web-based (no local install), multi-model support, shared infrastructure, lower per-query cost
- **Cons**: Requires hosting/maintenance, API token management, less polished than Claude Desktop, MCP support in LibreChat is still maturing
- **Suitability for non-technical editors**: HIGH. Just a URL + login credentials.

### Option C: Custom Web UI with MCP Client

- **Setup**: Build a React app (could extend existing `apps/` structure) with `@modelcontextprotocol/client-js` and an LLM backend
- **Pros**: Full control over UX, can embed domain-specific context, deepest integration with Hypergraph ecosystem
- **Cons**: Significant development effort (weeks to months), ongoing maintenance burden, reinventing conversation UI
- **Suitability for non-technical editors**: HIGHEST (if done well), but highest cost to build.

### Comparison Summary

| Criterion                  | Claude Desktop | LibreChat | Custom UI |
|---------------------------|----------------|-----------|-----------|
| Setup effort (initial)    | Low            | Medium    | High      |
| Setup effort (per editor) | Medium         | Low       | Low       |
| Ongoing maintenance       | None           | Medium    | High      |
| Per-editor monthly cost   | $20-200        | ~$2-5*    | ~$2-5*    |
| Non-technical friendliness| Moderate       | High      | Highest   |
| Mobile/web access         | No             | Yes       | Yes       |

*API token cost estimate for ~100 queries/day/editor at ~1K tokens/query using Claude Sonnet.

## 3. Build vs Buy

### Can we use existing MCP servers as-is?

**mcp-graphql (generic)**: Exposes `introspect-schema` and `query-graphql` tools. This would work technically -- editors could ask Claude to query the Geo Protocol API and it would construct raw GraphQL. However:
- The AI must construct correct GraphQL every time, including the Geo-specific filter syntax (`EntityFilter`, `UuidFilter`, relation traversals)
- No guardrails against malformed queries or confusing UUID-based property IDs
- No domain context about what spaces, entities, or types mean in the GRC-20 context
- **Verdict: Usable as a quick proof-of-concept, but insufficient for production editor use.**

**Apollo MCP Server**: Creates tools from `.graphql` operation files. This is closer to what we need -- we could define curated `.graphql` operations like `SearchEntities.graphql`, `GetEntity.graphql`, etc. However:
- Requires Docker or manual setup
- Static operation files, no dynamic query building
- Doesn't leverage the existing Hypergraph SDK's filter translation logic (`translate-filter-to-graphql.ts`)
- **Verdict: Better than raw GraphQL, but still misses domain-specific intelligence.**

### What custom work is needed?

The Geo Protocol schema has significant domain complexity:
- **UUID-based property IDs**: Properties are identified by UUIDs, not human-readable names. The existing SDK maps schema field names to property IDs via `Constants.PropertyIdSymbol` annotations.
- **Relation traversal**: Relations use `typeId` (UUID) to distinguish relation types, with `toEntityId`/`fromEntityId` for graph traversal. The `buildRelationsSelection` helper generates aliased GraphQL fragments.
- **Filter translation**: The `translateFilterToGraphql` function converts user-friendly filters into the nested GraphQL filter structure with `values.some.propertyId` patterns.
- **Space-scoped queries**: Almost all queries require a space context (`spaceId` or `spaceIds`).

### Recommendation: Build curated tools, reuse SDK internals

The strongest approach is a **custom MCP server with curated, high-level tools** that wrap the existing Hypergraph SDK functions:

```typescript
// Example tool registrations
server.registerTool('search_entities', {
  description: 'Search for entities by text query within a space',
  inputSchema: z.object({
    query: z.string().describe('Search text'),
    spaceId: z.string().uuid().describe('Space UUID to search within'),
    first: z.number().optional().default(20),
  })
}, async ({ query, spaceId, first }) => {
  // Reuse existing search-many-public.ts logic
  const result = await graphqlRequest(buildSearchQuery(...), { query, spaceId, first });
  return { content: [{ type: 'text', text: formatResults(result) }] };
});

server.registerTool('get_entity', { ... });   // Wraps find-one-public.ts
server.registerTool('list_entities', { ... }); // Wraps find-many-public.ts
server.registerTool('list_spaces', { ... });   // Wraps space/find-many-public.ts
```

**Estimated effort**: 2-3 days for a working MCP server with 5-6 curated tools, using existing SDK query builders. The TypeScript MCP SDK (`@modelcontextprotocol/sdk`) is the right choice given this is a TypeScript monorepo.

## 4. Cost Model

### Claude Desktop (per-seat subscription)

- Pro plan: $20/mo/editor = $200-400/mo for 10-20 editors
- Team plan: $25-30/mo/editor = $250-600/mo for 10-20 editors
- Max plan: $100-200/mo/editor = $1,000-4,000/mo (unnecessary for this use case)

### API tokens via self-hosted UI (LibreChat or custom)

- Estimated per-query cost (Claude Sonnet): ~$0.003-0.01/query (schema introspection + tool call + response)
- Editor usage estimate: 50-200 queries/day/editor
- Monthly per-editor: $5-60/mo depending on usage intensity
- For 10-20 editors: $50-1,200/mo
- Infrastructure hosting: ~$20-50/mo for a small VM

### Cost comparison for 10-20 editors

| Approach | Low usage (50 q/day) | Medium usage (100 q/day) | High usage (200 q/day) |
|----------|---------------------|-------------------------|----------------------|
| Claude Desktop Pro | $200-400/mo flat | $200-400/mo flat | $200-400/mo flat |
| Self-hosted (Sonnet) | $70-170/mo | $110-310/mo | $200-620/mo |
| Self-hosted (Haiku) | $30-80/mo | $50-130/mo | $80-270/mo |

**Analysis**: Claude Desktop is cost-competitive at medium-to-high usage and requires zero infrastructure. Self-hosted is cheaper at low usage and for large teams, but requires DevOps effort. For a team of 10-20 editors, **Claude Desktop Pro is the simplest starting point** at $200-400/mo total, with self-hosted as a scale-up option.

## 5. Safety & Control

### Read-only by default

The Geo Protocol GraphQL API **has no mutations** -- the generated schema contains only a `Query` type, no `Mutation` type. All data writes go through a separate REST endpoint (`/space/{id}/edit/calldata`). This is a significant safety advantage: **it is architecturally impossible for an MCP tool to accidentally modify data through the GraphQL API.**

### Additional safety layers

1. **Tool-level restrictions**: Curated tools only expose specific query patterns. No raw GraphQL execution tool is needed.
2. **Space allowlisting**: The MCP server config can restrict which space IDs are queryable, preventing editors from accessing spaces they shouldn't see.
3. **Rate limiting**: Implement per-session rate limits to prevent runaway queries.
4. **Input validation**: Use Zod schemas (as the MCP SDK supports) to validate all tool inputs, preventing injection via UUIDs.
5. **No authentication needed for reads**: The Geo Protocol API's public queries don't require authentication tokens, simplifying the server. For spaces with access control, the MCP server could be extended with editor-specific auth.

### Risk assessment: LOW

The read-only API, combined with curated tools and input validation, makes this a very safe integration pattern.

## 6. Strengths

1. **Protocol standardization**: MCP is becoming the de facto standard for LLM-tool integration. Anthropic, OpenAI, Google, and Microsoft have all adopted or announced MCP support. Investing here means the server works across multiple AI clients without changes.

2. **Multi-client support**: The same MCP server works with Claude Desktop, VS Code Copilot, Cursor, LibreChat, and any future MCP-compatible client. No lock-in to a single AI provider.

3. **Schema discovery via introspection**: The MCP protocol supports `tools/list` which allows any client to discover available tools and their schemas. This means editors get autocomplete-like guidance without documentation.

4. **Ecosystem momentum**: The MCP TypeScript SDK is actively maintained (v1.12+ as of early 2026), with growing community adoption. The risk of the protocol being abandoned is low.

5. **Composability**: MCP tools can be combined with other MCP servers. An editor could simultaneously use the Hypergraph MCP server for data queries and, say, a Slack MCP server for notifications.

6. **Minimal server-side state**: MCP tools are stateless request/response pairs. No session management, no WebSocket complexity for the basic use case.

7. **Alignment with existing codebase**: The Hypergraph project is TypeScript throughout, and the MCP TypeScript SDK uses the same patterns (Zod for schemas, Express for HTTP transport). Building an MCP server fits naturally into the monorepo as a new `packages/mcp-server` or `apps/mcp-server`.

## 7. Weaknesses

1. **Setup complexity for non-technical users**: Claude Desktop MCP configuration requires editing a JSON file with the correct server path and arguments. For stdio transport, the editor needs Node.js installed locally. This is a real barrier for non-technical editors.
   - **Mitigation**: Provide a one-click installer script, or use Streamable HTTP transport so the server runs remotely.

2. **MCP protocol maturity**: While MCP is rapidly maturing, it's still pre-1.0 in practical terms. Breaking changes between SDK versions are possible. The Streamable HTTP transport replaced the older SSE transport only recently.
   - **Mitigation**: Pin SDK versions, wrap transport layer to isolate from protocol changes.

3. **Limited UI customization**: MCP is a protocol, not a UI framework. The conversation experience depends entirely on the client. You cannot control how results are formatted, add custom buttons, show maps for geographic entities, or embed rich previews.
   - **Mitigation**: For rich UI needs, MCP would need to be paired with a custom frontend, which reduces the "buy vs build" advantage.

4. **No streaming of partial results**: The current MCP tool call model is request/response. For queries that return large datasets, the editor sees nothing until the full result is ready.
   - **Mitigation**: Implement pagination in tools (which the existing SDK already supports via `first`/`offset` parameters).

5. **Debugging opacity**: When a tool call fails, the error message surfaces through the AI's interpretation, not directly to the editor. Debugging requires checking MCP server logs.
   - **Mitigation**: Structured error responses in tool results, server-side logging.

6. **No offline capability**: MCP requires a running server (either local via stdio or remote via HTTP). The local-first ethos of Hypergraph doesn't fully carry through to the MCP layer.

7. **Context window consumption**: Every tool call result consumes tokens in the AI's context window. For queries returning many entities, results may need aggressive summarization, losing detail.

## 8. Conclusion

**The MCP server approach should be a SECONDARY interface, primarily serving developers.**

For non-technical editors, the setup friction is too high. However, the MCP server is an excellent complement to a primary web-based chat UI because:
- It reuses the exact same tool implementations
- It gives developers a native integration in Claude Code / VS Code
- The protocol is future-proof with wide industry adoption

**Recommended phased plan:**
- **Phase 1 (Week 1)**: Build tool handlers as shared modules (used by both the chat backend and MCP server)
- **Phase 2 (Week 2)**: Expose tools via MCP server with stdio + Streamable HTTP transports
- **Phase 3 (Month 2)**: Add space allowlisting, rate limiting, usage analytics

**When NOT to use MCP alone**: If the project requires non-technical editors as primary users. MCP should be paired with a custom frontend for the best editor experience.

## References

- [mcp-graphql](https://github.com/blurrah/mcp-graphql) - Generic MCP server for GraphQL
- [Apollo MCP Server](https://www.apollographql.com/docs/apollo-mcp-server) - Apollo's official MCP server
- [mcp-graphql-claude](https://github.com/jambelg/mcp-graphql-claude) - Purpose-built for Claude + GraphQL
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [From GraphQL Schema to MCP Server (Mirumee/Saleor)](https://mirumee.com/blog/from-graphql-schema-to-mcp-server)
