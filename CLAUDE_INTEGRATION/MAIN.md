# Claude + Hypergraph GraphQL Integration

## User Requirements

### Problem Statement

A team of editors oversees Geo knowledge graph content using the GRC-20 standard. A public program is currently active with high data submission volume. Editors need a fast way to query and review knowledge graph data across 3 specific spaces without knowing GraphQL syntax or UUID-based identifiers.

### Target Users

- **Non-technical content editors** managing knowledge graph entities
- Editors can install software with documentation provided
- Editors should NOT need:
  - Knowledge of GraphQL syntax
  - Understanding of UUID-based property IDs
  - A personal Claude subscription

### Core User Stories

1. **As an editor**, I want to search for entities by name or keyword so I can find content I need to review
2. **As an editor**, I want to list all entities of a specific type (e.g., "all events") in a space so I can audit content completeness
3. **As an editor**, I want to filter entities by properties (e.g., "events after January 2025") so I can find relevant subsets
4. **As an editor**, I want to explore entity relationships (e.g., "which companies sponsor this event?") so I can verify data connections
5. **As an editor**, I want to discover what entity types exist in the 3 program spaces
6. **As an editor**, I want to ask follow-up questions about results (e.g., "tell me more about the second one")
7. **As an editor**, I want human-readable responses, not raw JSON with UUIDs

### Constraints

- Read-only access (no mutations through this interface)
- Must deliver MVP as fast as possible (active program with high data volume)
- No custom frontend - must use existing software
- Work is concentrated in **3 specific spaces** (space filtering is critical)
- Must work with the existing Geo Protocol GraphQL API at `Graph.TESTNET_API_ORIGIN/graphql`

---

## Approaches Evaluated

Four approaches were evaluated by specialist agents. Detailed findings:

- [MCP Server Approach](./mcp-server-evaluation.md) - evaluated by `mcp-advocate`
- [Claude API Tool Use Approach](./tool-use-evaluation.md) - evaluated by `tool-use-advocate`

### Summary Comparison

| Approach | Time to MVP | Editor Setup | Cost Model | Verdict |
|----------|-------------|-------------|------------|---------|
| **MCP Server + Claude Code** | **1-2 days** | Install CLI + API key | **~$0.006/query** | **CHOSEN** |
| MCP Server + Claude Desktop | 1-2 days | Install app + subscription | $20/mo/editor | Backup option |
| Custom frontend + Tool Use | 2-3 weeks | Just a URL | ~$0.006/query | Too slow for MVP |
| LibreChat + MCP | 3-5 days | Just a URL | ~$0.006/query | Too complex to deploy |

---

## Chosen Plan: MCP Server + Claude Code

### Why This Wins for MVP

1. **Fastest to deliver** - Build only the MCP server (1-2 days). Claude Code IS the frontend
2. **No subscription needed** - Claude Code works with `ANTHROPIC_API_KEY` (pay-per-query)
3. **Claude Code is a chat interface** - Editors type natural language, get answers. It happens to be in a terminal, but the interaction is just chatting
4. **3-space focus** - Pre-configure space IDs in tool descriptions so editors never deal with UUIDs
5. **Zero frontend work** - No React app, no deployment, no hosting

### Architecture

```text
+------------------+                    +------------------+       GraphQL        +-------------------+
|                  |   MCP Protocol     |                  |    over HTTPS        |                   |
|  Claude Code     | <----------------> |  Hypergraph MCP  | <------------------> |  Geo Protocol     |
|  (terminal)      |   stdio transport  |  Server          |   read-only queries  |  GraphQL API      |
|                  |                    |                  |                      |                   |
|  Editor types:   |                    | Tools:           |                      | Queries:          |
|  "show me all    |                    |  search_entities |                      |  entities(...)    |
|   events in the  |                    |  get_entity      |                      |  entity(id)       |
|   science space" |                    |  list_entities   |                      |  search(...)      |
|                  |                    |  list_spaces     |                      |  spaces(...)      |
+------------------+                    |  get_types       |                      |  typesList(...)   |
       |                                +------------------+                      +-------------------+
       |
       | Uses ANTHROPIC_API_KEY
       | (shared team key, ~$0.006/query)
       | Model: claude-haiku-4-5
```

### How Editors Use It

1. Install Claude Code (one-time, with documentation we provide)
2. Set `ANTHROPIC_API_KEY` environment variable (one shared team API key)
3. Open terminal in the hypergraph project directory
4. Run `claude` - starts a chat session
5. Ask questions in plain English:
   - "Show me all the people entities in the science space"
   - "Search for anything related to climate change"
   - "How many events have sponsors?"
   - "Get me the details on entity [name]"
   - "List all entity types available in space X"

Claude Code automatically discovers the MCP tools and uses them to answer.

### What We Build

```text
packages/
  mcp-server/                   # NEW - only thing we build
    src/
      tools/
        search-entities.ts      # Full-text search
        get-entity.ts           # Entity by ID
        list-entities.ts        # Filter/paginate by type
        list-spaces.ts          # List the 3 program spaces
        get-entity-types.ts     # Discover types in a space
      config.ts                 # 3 space IDs + API origin
      server.ts                 # MCP stdio server entry point
    package.json
    tsconfig.json
```

Configuration in `.claude/settings.json` (already in repo):

```json
{
  "mcpServers": {
    "hypergraph": {
      "command": "npx",
      "args": ["tsx", "packages/mcp-server/src/server.ts"],
      "env": {}
    }
  }
}
```

### Tool Definitions (Pre-configured for 3 Spaces)

The tools will have the 3 program space IDs baked into their descriptions so Claude knows about them without the editor needing to provide UUIDs.

| Tool | Purpose | Space-Aware |
|------|---------|-------------|
| `search_entities` | Full-text search by keyword | Defaults to program spaces |
| `get_entity` | Get entity details by ID | Resolves space automatically |
| `list_entities` | Filter/paginate entities by type | Defaults to program spaces |
| `list_spaces` | Show the 3 program spaces with names | Pre-filtered |
| `get_entity_types` | List types available in a space | Per-space |

### Cost Estimate

For **10 editors making ~50 queries/day** (15,000 queries/month):

| Model | Per Query | Monthly | Notes |
|-------|-----------|---------|-------|
| **Haiku 4.5** | ~$0.006 | **~$65** | Recommended - fast and cheap |
| Sonnet 4.5 | ~$0.018 | ~$195 | Upgrade if Haiku isn't smart enough |

With prompt caching, Haiku drops to ~$0.004/query (~$45/mo).

Editors can configure their model in Claude Code with `/model` command.

---

## Implementation Plan

### Day 1: MCP Server Core

- [ ] Initialize `packages/mcp-server` with package.json and tsconfig
- [ ] Implement MCP server entry point using `@modelcontextprotocol/sdk`
- [ ] Implement `list_spaces` tool (returns the 3 program spaces with names)
- [ ] Implement `get_entity_types` tool (list types in a space)
- [ ] Implement `search_entities` tool (full-text search)
- [ ] Configure `.claude/settings.json` with MCP server

### Day 2: Remaining Tools + Testing

- [ ] Implement `get_entity` tool (single entity with properties/relations)
- [ ] Implement `list_entities` tool (filter/paginate, most complex)
- [ ] Test all tools end-to-end with Claude Code
- [ ] Tune tool descriptions for best Claude understanding
- [ ] Write editor setup documentation

### Day 3: Editor Onboarding

- [ ] Create setup guide (install Claude Code, set API key, basic usage)
- [ ] Create example queries document for editors
- [ ] Distribute API key to team
- [ ] Support editors through first queries

---

## Editor Setup Documentation (Draft)

### Quick Start

1. **Install Claude Code**

   ```bash
   npm install -g @anthropic-ai/claude-code
   ```

2. **Set your API key** (provided by team lead)

   ```bash
   export ANTHROPIC_API_KEY="sk-ant-..."
   ```

   Add this to your `~/.bashrc` or `~/.zshrc` to persist across sessions.

3. **Navigate to the project**

   ```bash
   cd /path/to/hypergraph
   ```

4. **Start Claude Code**

   ```bash
   claude
   ```

5. **Ask questions in plain English**

   ```text
   > Show me all entity types in the [space name] space
   > Search for entities related to "climate"
   > List all people entities
   > Get details on the entity named "John Doe"
   > How many events are in [space name]?
   ```

### Tips

- Claude automatically knows about the 3 program spaces - just refer to them by name
- Ask follow-up questions: "tell me more about the third one"
- Use `/model` to switch between faster (Haiku) and smarter (Sonnet) models
- Type `/clear` to start a fresh conversation
- Press Ctrl+C to cancel a running query

---

## Future Upgrades (Post-MVP)

Once the MVP is working and editors are productive, consider:

1. **Claude Desktop option** - Same MCP server works with Claude Desktop ($20/mo/editor) for a more polished GUI experience
2. **Web UI** - If terminal adoption is low, build a simple chat web frontend
3. **Space-aware system prompts** - Inject known type IDs and property names per space
4. **Saved queries** - Common queries as Claude Code skills (`/search-events`, `/audit-people`)
5. **Write operations** - If editors need to fix data, add mutation tools (with confirmation)

---

## Key Decisions

### Why Claude Code over Claude Desktop?

Claude Desktop requires a $20/mo subscription per editor. Claude Code works with API tokens (~$0.006/query). For 10 editors, that's $65/mo vs $200/mo. Plus, the API key is shared - one key, one bill, easy to manage.

### Why MCP over direct Tool Use API?

MCP means we build ONE thing (the server) and it works with Claude Code today, Claude Desktop tomorrow, VS Code next week. The Tool Use API approach requires building a custom backend + frontend. MCP gives us the tool execution layer for free.

### Why not LibreChat?

LibreChat needs deployment, configuration, user management, and its MCP support is still maturing. Claude Code is already a production-quality chat interface that supports MCP natively. Zero deployment needed.

### Why Haiku?

Haiku 4.5 is excellent at structured tool selection (picking the right tool, filling in correct parameters). It's the cheapest option at $1/$5 per million tokens. Editors can upgrade to Sonnet via `/model` if they need better reasoning for complex queries.

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Editors uncomfortable with terminal | Low adoption | Provide thorough docs + example queries; upgrade to Claude Desktop if needed |
| Claude generates wrong tool params | Empty/wrong results | Strong tool descriptions with space names baked in |
| API cost spike | Unexpected bill | Set billing alerts on Anthropic dashboard |
| Geo Protocol API changes | Tools break | Tools wrap simple GraphQL queries; easy to update |
| Editors don't know what to ask | Underutilization | Provide example queries document; `list_spaces` and `get_entity_types` help discovery |

---

## Appendix: Research

Detailed evaluations from specialist agents:

- [MCP Server Approach - Full Evaluation](./mcp-server-evaluation.md)
- [Claude API Tool Use Approach - Full Evaluation](./tool-use-evaluation.md)
