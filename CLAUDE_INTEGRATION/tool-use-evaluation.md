# Claude API Tool Use Approach Evaluation

> Evaluated by agent: `tool-use-advocate`

## 1. Architecture

```
+------------------+       +------------------+       +------------------+       +-------------------------+
|  Editor Browser  | ----> | Chat Backend     | ----> | Claude API       | ----> | Geo GraphQL API         |
|                  |       | (Express/Hono)   |       | (Tool Use)       |       | Graph.TESTNET_API_ORIGIN|
|  - Chat UI       |       |                  |       |                  |       |   /graphql              |
|  - Message list  |       | - Conversation   |       | - System prompt  |       |                         |
|  - Input box     |       |   state mgmt     |       | - Tool schemas   |       | Queries:                |
|                  |       | - Tool execution |       | - Reasoning      |       |  entities(filter, ...)  |
|                  |       | - Auth/rate limit |       |                  |       |  entity(id)             |
+------------------+       +------------------+       +------------------+       |  search(query, ...)     |
                                  ^    |                    |    ^               |  spaces(filter)         |
                                  |    |                    |    |               |  typesList(spaceId)     |
                                  |    v                    v    |               +-------------------------+
                            +------------------+    +-----------------+
                            | Conversation     |    | tool_use blocks |
                            | Store (DB/Redis) |    | in response     |
                            +------------------+    +-----------------+
```

**Conversation Loop Detail:**

```
Editor: "Find all events with sponsors"
    |
    v
Backend -> Claude API (messages + tools)
    |
    v
Claude returns: stop_reason = "tool_use"
  content: [
    {type: "text", text: "I'll search for events..."},
    {type: "tool_use", id: "toolu_01...", name: "list_entities", input: {...}}
  ]
    |
    v
Backend executes GraphQL query, returns tool_result
    |
    v
Claude API (messages + tool_result)
    |
    v
Claude returns: stop_reason = "end_turn"
  content: [
    {type: "text", text: "I found 12 events with sponsors: ..."}
  ]
    |
    v
Backend -> Editor (formatted response)
```

The key architectural insight: the backend is the **orchestrator**. It holds conversation state, executes tools against the real GraphQL API, and streams responses back to the editor. Claude never directly touches the GraphQL API; the backend mediates all access.

## 2. Tool Definitions

These are concrete JSON Schema tool definitions ready for the Claude API `tools` parameter. They map directly to the existing Hypergraph SDK query functions.

### Tool: `search_entities`

Maps to `searchManyPublic()` in `packages/hypergraph/src/entity/search-many-public.ts`.

```json
{
  "name": "search_entities",
  "description": "Full-text search across entities in the knowledge graph. Returns entities whose names or content match the search query. Use this when the user wants to find entities by name or keyword, not when they need to list/filter entities by type or properties.",
  "input_schema": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "description": "The search text to match against entity names and content"
      },
      "spaceId": {
        "type": "string",
        "description": "UUID of the space to search within. Required."
      },
      "typeIds": {
        "type": "array",
        "items": { "type": "string" },
        "description": "Optional array of type IDs to restrict search to specific entity types"
      },
      "first": {
        "type": "integer",
        "default": 20,
        "description": "Maximum number of results to return (default 20, max 100)"
      },
      "offset": {
        "type": "integer",
        "default": 0,
        "description": "Number of results to skip for pagination"
      }
    },
    "required": ["query", "spaceId"]
  }
}
```

### Tool: `get_entity`

Maps to `findOnePublic()` in `packages/hypergraph/src/entity/find-one-public.ts`.

```json
{
  "name": "get_entity",
  "description": "Get a single entity by its ID, including all its properties (text, boolean, number, datetime, point) and relations to other entities. Use this to get full details about a specific entity after finding it via search or list.",
  "input_schema": {
    "type": "object",
    "properties": {
      "id": {
        "type": "string",
        "description": "The UUID of the entity to retrieve"
      },
      "spaceId": {
        "type": "string",
        "description": "The UUID of the space the entity belongs to"
      }
    },
    "required": ["id", "spaceId"]
  }
}
```

### Tool: `list_entities`

Maps to `findManyPublic()` in `packages/hypergraph/src/entity/find-many-public.ts`. This is the most complex tool because it exposes the full filter system from `translate-filter-to-graphql.ts`.

```json
{
  "name": "list_entities",
  "description": "List entities of a specific type in a space, with optional filtering by property values, relations, and logical operators (AND/OR/NOT). Supports pagination and ordering. Use this when the user wants to browse, filter, or sort entities by type.",
  "input_schema": {
    "type": "object",
    "properties": {
      "spaceId": {
        "type": "string",
        "description": "UUID of the space to query. Can also pass spaceIds array instead."
      },
      "spaceIds": {
        "type": "array",
        "items": { "type": "string" },
        "description": "Array of space UUIDs to query across multiple spaces"
      },
      "typeIds": {
        "type": "array",
        "items": { "type": "string" },
        "description": "Required. Array of entity type UUIDs to filter by. Get these from get_entity_types first."
      },
      "filter": {
        "type": "object",
        "description": "GraphQL EntityFilter object. Supports: values.some (propertyId + text/boolean/float comparisons), relations.some (typeId + toEntityId), backlinks.some (typeId + fromEntityId), and/or/not logical operators.",
        "additionalProperties": true
      },
      "first": {
        "type": "integer",
        "default": 20,
        "description": "Maximum number of results (default 20, max 100)"
      },
      "offset": {
        "type": "integer",
        "default": 0,
        "description": "Number of results to skip for pagination"
      },
      "orderBy": {
        "type": "object",
        "properties": {
          "propertyId": {
            "type": "string",
            "description": "UUID of the property to order by"
          },
          "direction": {
            "type": "string",
            "enum": ["ASC", "DESC"]
          }
        },
        "description": "Optional ordering by a specific property"
      }
    },
    "required": ["typeIds"]
  }
}
```

### Tool: `list_spaces`

Maps to `findManyPublic()` in `packages/hypergraph/src/space/find-many-public.ts`.

```json
{
  "name": "list_spaces",
  "description": "List spaces in the knowledge graph, optionally filtered by member or editor. Returns space ID, name, type (PERSONAL/DAO), avatar, and member/editor lists. Use this to help the user find which space to query.",
  "input_schema": {
    "type": "object",
    "properties": {
      "memberId": {
        "type": "string",
        "description": "Filter spaces where this address is a member"
      },
      "editorId": {
        "type": "string",
        "description": "Filter spaces where this address is an editor"
      },
      "spaceType": {
        "type": "string",
        "enum": ["PERSONAL", "DAO"],
        "description": "Filter by space type"
      }
    }
  }
}
```

### Tool: `get_entity_types`

Maps to the `typesList` GraphQL query.

```json
{
  "name": "get_entity_types",
  "description": "List all entity types defined in a space. Returns type entities with their IDs and names. Use this to discover what kinds of entities exist in a space before using list_entities. Type IDs are needed for the typeIds parameter in list_entities and search_entities.",
  "input_schema": {
    "type": "object",
    "properties": {
      "spaceId": {
        "type": "string",
        "description": "UUID of the space to get types from"
      },
      "first": {
        "type": "integer",
        "default": 50,
        "description": "Maximum number of types to return"
      }
    },
    "required": ["spaceId"]
  }
}
```

## 3. Cost Analysis

### Token Estimates Per Query

Based on the tool schemas above, here are realistic token counts:

| Component | Tokens (approx) |
|---|---|
| System prompt (domain context, instructions) | ~800 |
| Tool definitions (5 tools, JSON Schema) | ~1,200 |
| User message | ~50 |
| Claude reasoning + tool_use response | ~200 |
| Tool result (GraphQL response, 10 entities) | ~1,500 |
| Claude final natural language response | ~300 |
| **Total input tokens per query** | **~3,500** |
| **Total output tokens per query** | **~500** |

For multi-step queries (2 tool calls): ~6,000 input / ~800 output.

### Per-Query Cost

| Model | Single-step | Multi-step | Notes |
|---|---|---|---|
| **Haiku 4.5** ($1/$5 per MTok) | $0.006 | $0.010 | Best for simple lookups |
| **Sonnet 4.5** ($3/$15 per MTok) | $0.018 | $0.032 | Good balance of capability/cost |
| **Opus 4.6** ($15/$75 per MTok) | $0.090 | $0.160 | Overkill for structured queries |

### Prompt Caching Savings

Claude's prompt caching caches the system prompt + tool definitions across requests. These ~2,000 tokens are constant per conversation:

- **Cache write**: 25% premium on first request
- **Cache hit**: 90% discount on subsequent requests (~1,800 tokens saved)
- **Effective savings**: ~$0.005/query on Sonnet for cached system prompt
- **5-minute TTL** means within a conversation, most requests hit cache

With caching, Sonnet drops from ~$0.018 to ~$0.013 per single-step query.

### Monthly Cost Estimate: 10 Editors x 50 Queries/Day

| Model | Monthly (no cache) | Monthly (with cache) |
|---|---|---|
| **Haiku 4.5** | $90 | $65 |
| **Sonnet 4.5** | $270 | $195 |
| **Opus 4.6** | $1,350 | $975 |

**Recommendation**: Use **Haiku 4.5** for the MVP. At ~$65/month for 10 editors, it is extremely cost-effective. Haiku is highly capable at structured tool use (selecting the right tool, passing correct parameters). Upgrade to Sonnet only if editors need more nuanced natural language summarization.

### Comparison: API Tokens vs Subscriptions

| Approach | Monthly Cost | Notes |
|---|---|---|
| Claude API (Haiku, 10 editors) | ~$65 | Pay per use, scales linearly |
| Claude API (Sonnet, 10 editors) | ~$195 | Better summarization |
| 10x Claude Pro subscriptions | $200 | $20/user, requires MCP setup per user |

The API approach is **cheaper than subscriptions** at this scale, and gives you full control over the experience.

## 4. Frontend Options

### Option A: Custom React Chat UI (Recommended)

**Effort**: 2-3 days for MVP, 1-2 weeks polished

**Why it wins for non-technical editors**:
- Embed directly in the existing Hypergraph React app ecosystem
- Pre-configure space context (editor doesn't need to know space IDs)
- Custom result rendering (entity cards, tables, not raw JSON)
- Use existing `@tanstack/react-query` patterns from `hypergraph-react`
- Stream responses with Claude's streaming API for real-time feel

**MVP Components**:
```
ChatContainer
  - MessageList (renders assistant/user messages)
  - EntityCard (renders entity results inline)
  - MessageInput (text input + send button)
```

The backend is a single Express endpoint that handles the Claude conversation loop. This fits naturally alongside the existing `apps/server` Express app.

### Option B: LibreChat (Self-Hosted)

- **Pros**: Full-featured chat UI, conversation history, supports Claude
- **Cons**: Does NOT natively support custom tool execution against your GraphQL API. You'd need to fork it or write a plugin. Heavy dependency for what we need.
- **Verdict**: Overly complex for this use case.

### Option C: Open WebUI

- **Pros**: Clean UI, supports multiple providers
- **Cons**: Claude tool use support is limited/experimental. Would need custom "pipe" or "function" plugin to handle tool execution.
- **Verdict**: Not a good fit.

### Recommendation

Build a **custom React chat UI**. The effort is modest (a chat interface is ~200-300 lines of React), and it gives complete control over how results are displayed to editors.

## 5. Result Formatting

### Strategy: Claude Summarizes, UI Renders Structured Data

The tool execution returns raw GraphQL results. There are two layers of formatting:

**Layer 1 - Claude's Natural Language Summary** (always present):
Claude sees the raw tool results and produces a conversational summary. For example:
> "I found 8 events in the Geo Genesis space. Here are the first 5:
> 1. **ETHDenver 2025** - Sponsored by Coinbase and Paradigm
> 2. **Devconnect Istanbul** - Sponsored by Ethereum Foundation
> ..."

This is great for non-technical editors because they get context, not data dumps.

**Layer 2 - Structured Entity Cards** (UI-rendered):
The backend should also pass the raw structured data to the frontend alongside Claude's text. The UI can render:
- Entity cards with name, type badge, key properties
- Clickable links to view entity details
- Collapsible property tables for full data

**Implementation approach**: When the backend executes a tool and gets results, it sends both:
1. The tool_result to Claude (for summarization)
2. The raw structured data to the frontend (for rich rendering)

This dual-channel approach means editors get Claude's natural language explanation AND clickable, browsable results.

## 6. Multi-Step Queries

### Example: "Find all events in space X that have sponsors from company Y"

```
Step 1: Editor asks the question

Step 2: Claude decides it needs to find company Y first
  -> tool_use: search_entities({query: "company Y", spaceId: "X"})

Step 3: Backend executes GraphQL search, returns results
  -> tool_result: [{id: "abc123", name: "Company Y", ...}]

Step 4: Claude now uses the company ID to filter events
  -> tool_use: list_entities({
       spaceId: "X",
       typeIds: ["239bc639938e427cbebbd562d82ae272"],  // Event type
       filter: {
         relations: {
           some: {
             typeId: { is: "926b00ee68b54462a27f3806af705118" },  // sponsors
             toEntityId: { is: "abc123" }
           }
         }
       }
     })

Step 5: Backend executes GraphQL query, returns filtered events
  -> tool_result: [{id: "def456", name: "ETHDenver", sponsors: [...]}]

Step 6: Claude synthesizes final response
  -> "I found 3 events sponsored by Company Y: ..."
```

This multi-step reasoning is where Claude's tool use **excels**. The model naturally decomposes complex queries into sequential tool calls. The conversation loop handles this transparently -- the backend keeps executing tools until Claude returns `stop_reason: "end_turn"`.

### Parallel Tool Calls

Claude can also emit multiple `tool_use` blocks in a single response. For example, "Compare events in space A and space B" could trigger two parallel `list_entities` calls. The backend executes both and returns both results.

## 7. Safety & Reliability

### Read-Only Tools Only

All 5 tools map to **read-only GraphQL queries**. No mutations are exposed. The tool definitions don't include any write operations, and the backend enforces this at the execution layer.

### Query Validation Before Execution

The backend validates tool inputs before executing GraphQL:
- **spaceId/entityId format**: Must be valid UUIDs
- **typeIds**: Must be non-empty arrays of valid UUIDs
- **first**: Clamp to max 100 to prevent excessive result sets
- **filter**: Validate structure matches expected GraphQL filter shape

### Error Handling

```typescript
try {
  const result = await executeGraphQLQuery(toolName, toolInput);
  return { type: "tool_result", content: JSON.stringify(result) };
} catch (error) {
  return {
    type: "tool_result",
    content: JSON.stringify({
      error: true,
      message: error instanceof Error ? error.message : "Query failed",
    }),
    is_error: true
  };
}
```

Claude handles `is_error: true` tool results gracefully, explaining the error to the user in natural language.

### Rate Limiting

- **Per-editor**: Max 100 queries/hour
- **Global**: Max 1000 queries/hour to the GraphQL API
- **Conversation length**: Limit to 50 turns per conversation
- **Implementation**: Standard Express rate-limit middleware

## 8. Strengths

1. **Structured tool schemas = reliable query execution**: Claude's tool use is highly reliable for selecting the right tool and passing correct parameters. Far more reliable than generating raw GraphQL strings.

2. **No per-editor subscriptions**: $65/month for 10 editors via API, vs $200/month for 10 Claude Pro subscriptions.

3. **Full control over the experience**: Custom UI, custom result formatting, custom error messages. You own the entire stack.

4. **Natural multi-step query decomposition**: Claude naturally breaks complex questions into sequential tool calls.

5. **System prompt customization**: Inject space-specific context, known type IDs, and property names. Makes Claude far more effective.

6. **Streaming support**: Claude's streaming API lets you show responses token-by-token.

7. **Model flexibility**: Start with Haiku, upgrade to Sonnet/Opus without architecture changes.

8. **Conversation history**: Follow-up questions like "Show me more details about the second one" work naturally.

## 9. Weaknesses

1. **Engineering effort**: 1-2 weeks for MVP, 3-4 weeks for production quality.

2. **Conversation management complexity**: Must handle state persistence, context window limits, stale conversation cleanup, tool execution loop.

3. **API cost exposure**: Costs scale linearly with usage. Needs cost monitoring and circuit breakers.

4. **Tool schema maintenance**: When the GraphQL API changes, tool schemas must be updated manually.

5. **No ecosystem leverage**: Unlike MCP, every feature must be built from scratch.

6. **Context window management**: Long conversations grow expensive. Need summarization or truncation.

## 10. Conclusion

**The Tool Use approach should be the PRIMARY approach for the editor-facing interface.**

It provides the best combination of editor-friendliness (web browser), cost-efficiency (API tokens), and reliability (structured tools). The existing Hypergraph SDK provides all the GraphQL query infrastructure -- the tools simply wrap existing functions.

### MVP Definition

**Week 1: Backend**
- Express endpoint: `POST /api/chat` accepting `{ message, conversationId }`
- 5 tool implementations wrapping existing Hypergraph SDK functions
- In-memory conversation store
- Basic rate limiting

**Week 2: Frontend**
- Simple React chat component (MessageList + Input)
- Streaming response rendering
- Entity cards for structured results
- Space selector dropdown

**Week 3: Polish**
- System prompt tuning with known type IDs and property names
- Error handling and empty state messaging
- Conversation history persistence
- Cost monitoring

### Model Recommendation

Start with **Haiku 4.5**. It handles structured tool selection extremely well at 1/15th the cost of Opus. If editors need better summarization, route the final response step to Sonnet while keeping tool selection on Haiku.
