# Hypergraph MCP Server

## What This Is

An MCP server that lets non-technical editors query the Geo Protocol knowledge graph using natural language through Claude Code. Editors ask questions like "show me all events in the AI space" and get human-readable answers — no GraphQL syntax or UUIDs required.

## Core Value

Editors can query and review knowledge graph data across program spaces without technical knowledge — just by chatting with Claude.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] MCP server runs via stdio transport for Claude Code
- [ ] Editors can search entities by name or keyword across program spaces
- [ ] Editors can list all entities of a specific type in a space
- [ ] Editors can get full details on a single entity (properties + relations)
- [ ] Editors can discover what entity types exist in a space
- [ ] Editors can list the configured program spaces by name
- [ ] Space IDs are pre-configured so editors never deal with UUIDs
- [ ] Responses are human-readable, not raw JSON with UUIDs
- [ ] All access is read-only (no mutations)
- [ ] Works with the existing Geo Protocol GraphQL API

### Out of Scope

- Write/mutation operations — read-only for MVP
- Custom frontend or web UI — Claude Code is the interface
- Claude Desktop support — Claude Code with API key is the chosen path
- OAuth or per-editor authentication — shared API key model
- Offline/local-first data access — requires live API connection

## Context

- This is part of the Hypergraph monorepo, built as `packages/mcp-server/`
- A public program is currently active with high data submission volume — editors need this fast
- Work is concentrated in 3 specific spaces (space IDs to be configured):
  - AI space: `41e851610e13a19441c4d980f2f2ce6b`
  - Space 2: TBD
  - Space 3: TBD
- The Geo Protocol GraphQL API is public and read-only (no mutations in the schema)
- Existing evaluation documents in `CLAUDE_INTEGRATION/` contain detailed tool schemas, cost analysis, and architecture decisions
- Need to test whether testnet or mainnet API endpoint is appropriate

## Constraints

- **Transport**: stdio only (Claude Code integration)
- **Read-only**: GraphQL API has no mutations — architecturally safe
- **Monorepo**: Must fit within the existing pnpm workspace, TypeScript, Biome tooling
- **Speed**: Active program means MVP is urgently needed
- **Stack**: TypeScript, `@modelcontextprotocol/sdk`, GraphQL over HTTP

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| MCP server over custom frontend | Claude Code IS the frontend — zero UI work, 1-2 day delivery | — Pending |
| Claude Code over Claude Desktop | API key model (~$0.006/query) vs $20/mo/editor subscription | — Pending |
| Inside monorepo (`packages/mcp-server/`) | Shares tooling, easy to extract later if needed | — Pending |
| Configurable space list | Start with 1 known space, add others when IDs are available | — Pending |
| 5 curated tools over raw GraphQL | Editors get reliable, space-aware queries without GraphQL knowledge | — Pending |

---
*Last updated: 2026-02-18 after initialization*
