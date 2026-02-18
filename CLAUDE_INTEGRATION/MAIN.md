# Claude + Hypergraph GraphQL Integration

## User Requirements

### Problem Statement

A team of editors oversees Geo knowledge graph content using the GRC-20 standard. Currently, querying the GraphQL API requires technical knowledge of GraphQL syntax, UUID-based property/type identifiers, and the Geo Protocol schema structure. This creates a barrier for non-technical editors who need to explore, search, and analyze knowledge graph data as part of their daily workflow.

### Target Users

- **Non-technical content editors** who manage knowledge graph entities (events, people, companies, projects, etc.)
- Editors should NOT need:
  - A terminal or CLI
  - Knowledge of GraphQL syntax
  - Understanding of UUID-based property IDs
  - A personal Claude subscription

### Core User Stories

1. **As an editor**, I want to search for entities by name or keyword so I can find content I need to review
2. **As an editor**, I want to list all entities of a specific type (e.g., "all events") in a space so I can audit content completeness
3. **As an editor**, I want to filter entities by properties (e.g., "events after January 2025") so I can find relevant subsets
4. **As an editor**, I want to explore entity relationships (e.g., "which companies sponsor this event?") so I can verify data connections
5. **As an editor**, I want to discover what spaces and entity types exist so I can navigate the knowledge graph
6. **As an editor**, I want to ask follow-up questions about results (e.g., "tell me more about the second one") so I can drill into details
7. **As an editor**, I want human-readable responses, not raw JSON with UUIDs

### Constraints

- Read-only access (no mutations through this interface)
- No per-editor Claude subscription costs
- Web-based access (browser only, no local software installation)
- Must work with the existing Geo Protocol GraphQL API at `Graph.TESTNET_API_ORIGIN/graphql`

---

## Approaches Evaluated

Four approaches were evaluated by specialist agents. Detailed findings are in the companion files:

- [MCP Server Approach](./mcp-server-evaluation.md) - evaluated by `mcp-advocate`
- [Claude API Tool Use Approach](./tool-use-evaluation.md) - evaluated by `tool-use-advocate`

### Summary Comparison

| Approach | Editor-Friendliness | Subscription Required? | Monthly Cost (10 editors) | Build Effort | Verdict |
|----------|---------------------|----------------------|--------------------------|-------------|---------|
| **MCP Server** | Medium (needs MCP client) | Depends on client | $65-400 | 2-3 days | Secondary |
| **Claude Code Skill** | Low (CLI only) | Yes ($20-200/user) | $200-2000 | Hours | Developer-only |
| **Standalone NL-to-GraphQL** | High (web browser) | No (API tokens) | $65-195 | 1-2 weeks | Fragile |
| **Claude API + Tool Use** | High (web browser) | No (API tokens) | $65-195 | 1-2 weeks | **Primary** |

---

## Recommended Plan: Hybrid (Tool Use + MCP)

### Architecture

```
+------------------+       HTTPS        +------------------+       Claude API      +------------------+
|                  | ----------------->  |                  | ------------------->  |                  |
|  Editor Browser  |                    |  Chat Backend    |   tool_use loop       |  Claude (Haiku)  |
|  (React Chat UI) | <-----------------  |  (Express/Hono)  | <-------------------  |                  |
|                  |   streamed text     |                  |                      +------------------+
+------------------+                    |  Tools:          |
                                        |   search_entities|----+
                                        |   get_entity     |    |    GraphQL
                                        |   list_entities  |----+--> queries     +-------------------+
                                        |   list_spaces    |    |  ------------> | Geo Protocol      |
                                        |   get_entity_types|---+                | GraphQL API       |
                                        +------------------+                     +-------------------+
                                               |
                                        +------+------+
                                        | Also exposed |
                                        | as MCP Server|  (for developers)
                                        +-------------+
```

### Why This Approach Wins

1. **No subscriptions needed** - Uses API tokens (~$65/mo for 10 editors on Haiku 4.5) instead of $200+/mo in Claude Pro seats
2. **Web-based** - Editors open a URL and type questions. Zero technical setup
3. **Reliable queries** - Structured tool schemas mean Claude picks from predefined operations, not generating raw GraphQL
4. **Existing SDK reuse** - The 5 tools map directly to existing functions (`findManyPublic`, `findOnePublic`, `searchManyPublic`, etc.)
5. **Inherently safe** - The Geo Protocol GraphQL API has no mutations; data writes go through a separate REST endpoint

### Tool Definitions

| Tool | Maps To (Existing SDK) | Purpose |
|------|------------------------|---------|
| `search_entities` | `searchManyPublic()` | Full-text search by keyword |
| `get_entity` | `findOnePublic()` | Get entity details by ID |
| `list_entities` | `findManyPublic()` | Filter/paginate entities by type + properties |
| `list_spaces` | `space/findManyPublic()` | Discover available spaces |
| `get_entity_types` | `typesList` query | Discover entity types in a space |

### Conversation Loop

```
Editor: "Find all events with sponsors"
    |
    v
Backend -> Claude API (messages + tool definitions)
    |
    v
Claude returns: stop_reason = "tool_use"
  content: [
    {type: "text", text: "I'll search for events..."},
    {type: "tool_use", name: "list_entities", input: {typeIds: [...], ...}}
  ]
    |
    v
Backend executes GraphQL query via SDK, returns tool_result
    |
    v
Claude API (messages + tool_result)
    |
    v
Claude returns: stop_reason = "end_turn"
  content: [{type: "text", text: "I found 12 events with sponsors: ..."}]
    |
    v
Backend -> Editor (formatted response with entity cards)
```

### Cost Estimate

For **10 editors making ~50 queries/day** (15,000 queries/month):

| Model | Per Query | Monthly | Notes |
|-------|-----------|---------|-------|
| **Haiku 4.5** | ~$0.006 | **~$65** | Recommended for MVP |
| Sonnet 4.5 | ~$0.018 | ~$195 | Better summarization |
| Opus 4.6 | ~$0.090 | ~$975 | Overkill for structured queries |

With prompt caching (system prompt + tool definitions are constant across requests), Haiku drops to ~$0.004/query (~$45/mo).

### Where It Lives in the Monorepo

```
hypergraph/
  apps/
    chat/                    # NEW - React chat frontend for editors
      src/
        components/
          ChatContainer.tsx
          MessageList.tsx
          MessageInput.tsx
          EntityCard.tsx
        api/
          chat.ts            # Client-side API calls
        App.tsx
  packages/
    mcp-server/              # NEW - MCP server (reuses tool handlers)
      src/
        tools/
          search-entities.ts
          get-entity.ts
          list-entities.ts
          list-spaces.ts
          get-entity-types.ts
        server.ts            # MCP protocol handler
    hypergraph/              # EXISTING - SDK with query functions
      src/
        entity/
          find-many-public.ts   # -> list_entities tool
          find-one-public.ts    # -> get_entity tool
          search-many-public.ts # -> search_entities tool
        space/
          find-many-public.ts   # -> list_spaces tool
  apps/
    server/                  # EXISTING - extend with chat endpoint
      src/
        http/
          chat-handler.ts    # NEW - Claude API conversation loop
```

---

## Implementation Phases

### Phase 1 - MVP (Week 1-2)

**Backend:**
- Express endpoint `POST /api/chat` accepting `{ message, conversationId }`
- 5 tool implementations wrapping existing Hypergraph SDK query functions
- In-memory conversation store
- Basic rate limiting (100 queries/hour/editor)
- Haiku 4.5 with prompt caching

**Frontend:**
- Simple React chat component (MessageList + Input)
- Entity cards for structured result display
- Space selector dropdown (pre-populated from `list_spaces`)

### Phase 2 - Polish (Week 3-4)

- Space-aware system prompts (inject known type IDs and property names per space)
- Conversation history persistence (SQLite or Redis)
- Streaming responses for real-time feel
- Error handling with friendly messages
- Cost monitoring

### Phase 3 - MCP + Scale (Month 2)

- Wrap tools as MCP server (Streamable HTTP transport)
- Developer access via Claude Code / VS Code
- Space allowlisting and editor permissions
- Usage analytics dashboard
- Model routing: Haiku for simple queries, Sonnet for complex multi-step reasoning

---

## Key Decisions

### Why not a Claude Code Skill?

Skills are CLI-only. Non-technical editors won't use a terminal. A skill is useful for *developers* querying during development, but not for editors doing daily content work.

### Why not pure MCP?

MCP is a protocol, not a product. It requires editors to install and configure an MCP-compatible client (Claude Desktop, VS Code, etc.). A web chat UI is far more accessible. However, MCP is recommended as a *secondary* interface for developer access.

### Why not raw NL-to-GraphQL generation?

Having Claude generate raw GraphQL strings is fragile. The Geo Protocol schema uses UUID-based property IDs, nested filter structures, and relation traversals that are error-prone when generated free-form. Structured tool schemas constrain Claude to valid operations.

### Why Haiku over Sonnet/Opus?

Haiku 4.5 is highly capable at structured tool selection (choosing the right tool, passing correct parameters). At 1/3 the cost of Sonnet, it handles the core use case well. Sonnet can be added as an upgrade path for complex multi-step reasoning.

### Subscription vs API tokens?

API tokens win at this scale. One Anthropic API key powers all editors at ~$65/mo, vs 10 Claude Pro subscriptions at $200/mo. Editors never need a Claude account.

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Claude generates wrong tool params | Editor gets empty/wrong results | Strong tool descriptions + system prompt with examples |
| API cost spike | Unexpected bill | Rate limits + cost monitoring + max conversation length (50 turns) |
| Geo Protocol API changes | Tools break | GraphQL codegen already in place; run as CI check |
| Context window bloat (long chats) | Expensive + slow | Limit conversation length, implement summarization |
| Editor confusion with UUIDs | Bad UX | System prompt maps human-readable names to type/space IDs |
| Haiku insufficient for complex queries | Poor answers | Route complex queries to Sonnet; start with Haiku and monitor |
