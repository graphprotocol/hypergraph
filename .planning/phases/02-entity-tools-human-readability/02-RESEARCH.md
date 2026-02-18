# Phase 2: Entity Tools + Human Readability - Research

**Researched:** 2026-02-18
**Domain:** MCP entity tools (search_entities, get_entity, list_entities) with property name resolution and human-readable formatting
**Confidence:** HIGH

## Summary

Phase 2 delivers the three entity tools (search_entities, get_entity, list_entities) and enhances get_entity_types to include property schemas. The critical new capability is property name resolution: translating UUID-based property IDs (e.g., `a1b2c3d4`) into human-readable labels (e.g., "Start Date") at prefetch time. The Geo Protocol GraphQL API's `typesList` query already supports a `properties { id, name, dataType, relationValueTypes { id, name } }` subfield on each type entity -- this is the key to building the property name registry. The current prefetch pipeline fetches both types and entities but discards entity `valuesList` data and does not fetch property metadata. Phase 2 must expand both the prefetch and the in-memory store.

The entity tools operate entirely from prefetched in-memory data. No per-request GraphQL calls are needed. The `entities` query already fetches `valuesList` with `propertyId`, `text`, `boolean`, `float`, `datetime`, `point`, and `schedule` fields -- all property value types. Relations are exposed as `relations(filter: { typeId })` on each entity, returning `toEntity { id, name }` and `typeId` (which is the relation property ID). By prefetching both entities with their values AND the type-level property registry (property ID to name mapping), the MCP server can resolve all UUIDs to human-readable labels at display time.

The existing codebase provides proven patterns for all of this: `packages/typesync-studio/src/hooks/useKnowledgeGraph.tsx` demonstrates the `typesList` query with `properties` subfield, `packages/hypergraph/src/entity/find-many-public.ts` demonstrates the `entities` query with `valuesList` and relation handling, and `packages/hypergraph/src/entity/search-many-public.ts` demonstrates the `search` query API. The MCP server's Phase 1 architecture (prefetch -> store -> tool -> formatter) extends naturally to entity tools.

**Primary recommendation:** Expand the prefetch pipeline to fetch type properties alongside types (for the property name registry), retain entity `valuesList` in the store, and fetch entity relations. Build a `Map<propertyId, propertyName>` registry at prefetch time. Entity formatters resolve all property IDs and entity reference IDs to human labels using this registry and the entity name index. The three tools are thin wrappers over store queries + formatters, following the established `registerXxxTool` pattern from Phase 1.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Search behavior
- Hybrid approach: search_entities handles structured filters (by type, by name). For relationship queries (e.g., "Persons who work at Geo"), Claude chains tool calls -- list_entities to get entities, then reasons over results to find matches
- Exact match only -- no fuzzy text matching. Search terms must match exactly (case-insensitive substring)
- get_entity_types enhanced to include property names per type, so editors can discover queryable fields

#### Entity display format
- Show everything: all properties, relationships, and metadata. Editors are doing QA and need the full picture
- Full details in all contexts -- list results and get_entity both show complete property sets
- Entity references resolved to names (e.g., "Works at: Geo" not "Works at: entity-abc-123")
- Image properties return the actual URL so editors can verify
- Property names displayed as stored in the graph -- no normalization or formatting
- Date values displayed as stored -- no reformatting
- Empty/null properties shown explicitly (e.g., "Description: (empty)") so editors can spot missing data
- Entity IDs included in output for reference in follow-up queries

#### Pagination & result limits
- Default: return all matching entities (no automatic pagination)
- Optional limit parameter supported (e.g., "show first 10 Events")
- Optional offset parameter supported (e.g., limit=10, offset=10 for entities 11-20)
- Always include total count in results (e.g., "Found 142 Person entities")
- When limit is used: "Showing 10 of 142 Person entities"
- No sorting -- return entities in graph order (as returned from Geo Protocol API)
- Long text values truncated at 500 chars with indicator ("... (truncated, 2,340 chars total)")

#### Error & empty states
- No results: simple "No results found" -- no suggestions from the tool, Claude handles guidance
- Invalid type name: error listing available types ("Type 'Car' not found in AI Space. Available types: Event, Person, Organization, Project.")
- API errors: wrapped with context ("Could not fetch entity: invalid entity ID 'abc'. Provide a valid entity ID from search results.")
- Data freshness: each response includes timestamp of when data was prefetched

### Claude's Discretion
- Large result set handling (whether to include count/warning for very large responses)
- Exact truncation threshold tuning
- Internal error message wording
- Compression algorithm for property display

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CORE-03 | 5 curated tools: search_entities, get_entity, list_entities, list_spaces, get_entity_types | Phase 1 delivered list_spaces and get_entity_types. Phase 2 adds the remaining 3. Same `registerTool` pattern, same `tools/` directory structure. Each tool: separate file, Zod input schema, read-only annotations. |
| DATA-01 | Property names resolved from UUIDs to human labels at prefetch time | The `typesList` query supports `properties { id, name, dataType }` subfield per type entity (verified in `packages/typesync-studio/src/hooks/useKnowledgeGraph.tsx` SchemaBrowser query). Build `Map<propertyId, propertyName>` at prefetch time from type properties. Entity `valuesList` uses `propertyId` which maps directly to this registry. |
| DATA-03 | Human-readable text output (no raw JSON or UUIDs) | Entity formatter resolves: (1) property IDs to names via property registry, (2) entity reference IDs to entity names via entity name index, (3) type IDs to type names via existing type registry. Output is structured markdown text, not JSON. |
| SPCE-03 | Type-aware listing (accept "Event" not type UUIDs) | Existing `store.getTypes(spaceId)` returns `TypeInfo[]` with `{ id, name }`. list_entities accepts a type name string, resolves to type ID via the type registry (case-insensitive match), then filters entities by `typeIds` in the store. |
| ERRH-01 | Actionable error messages ("No entities found. Try a broader search.") | User decision: "No results found" with no suggestions (Claude handles guidance). Invalid type: error listing available types. Invalid entity ID: wrapped with context. All responses include prefetch timestamp. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@modelcontextprotocol/sdk` | ^1.26.0 | MCP tool registration (already installed) | Same as Phase 1. `registerTool` with Zod schemas and annotations. **Confidence: HIGH** |
| `zod` | ^3.25.0 | Tool input schema validation (already installed) | Required by MCP SDK. `z.string()`, `z.number().optional()` for tool parameters. **Confidence: HIGH** |
| `graphql-request` | ^7.2.0 | GraphQL HTTP client (already installed) | Extends existing prefetch queries. No new dependency needed. **Confidence: HIGH** |
| `effect` | ^3.17.13 | Functional error handling (already installed) | Existing patterns from Phase 1. No new dependency. **Confidence: HIGH** |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| No new libraries needed | - | - | Phase 2 uses only libraries already in `packages/mcp-server/package.json` |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| In-memory substring search | GraphQL `search` query per request | User decided prefetch-and-serve. The `search(query)` API does exist (verified in `search-many-public.ts` and generated types `QuerySearchArgs`) but per-request queries are out of scope per architecture decision. |
| Custom property name resolution | Import `@graphprotocol/hypergraph` Utils | The SDK uses Effect Schema with `PropertyIdSymbol` annotations. MCP server operates on raw data. Copying the query pattern is correct; importing the SDK would pull in complex type-level dependencies. |

**Installation:**
No new packages needed. All dependencies are already in `packages/mcp-server/package.json`.

## Architecture Patterns

### Recommended Project Structure (additions to Phase 1)
```
packages/mcp-server/
  src/
    index.ts              # MODIFY: register 3 new tools
    config.ts             # UNCHANGED
    prefetch.ts           # MODIFY: expand to fetch type properties + entity relations
    graphql-client.ts     # MODIFY: add queries for type properties, entity with relations
    store.ts              # MODIFY: add entity storage, property registry, entity lookup
    errors.ts             # UNCHANGED (or add EntityNotFoundError)
    fuzzy.ts              # UNCHANGED
    tools/
      list-spaces.ts      # UNCHANGED
      get-entity-types.ts # MODIFY: include property names per type
      search-entities.ts  # NEW: search by name within a space
      get-entity.ts       # NEW: single entity by ID with full detail
      list-entities.ts    # NEW: list entities by type within a space
    formatters/
      spaces.ts           # UNCHANGED
      types.ts            # MODIFY: include property names per type
      entities.ts         # NEW: entity formatter with property name resolution
```

### Pattern 1: Property Name Registry (DATA-01 core)
**What:** Build a `Map<string, string>` mapping property UUIDs to human-readable property names at prefetch time. The data source is the `typesList` query's `properties` subfield.
**When to use:** At prefetch time; consumed by entity formatters at display time.
**Example:**
```typescript
// Source: Adapted from packages/typesync-studio/src/hooks/useKnowledgeGraph.tsx
// The typesList query already supports a `properties` subfield per type:
const TYPES_WITH_PROPERTIES_QUERY = /* GraphQL */ `
  query TypesWithProperties($spaceId: UUID!, $first: Int) {
    typesList(spaceId: $spaceId, first: $first) {
      id
      name
      properties {
        id
        name
        dataType
        relationValueTypes {
          id
          name
        }
      }
    }
  }
`;

// Build the registry at prefetch time:
type PropertyInfo = { name: string; dataType: string };
const propertyRegistry = new Map<string, PropertyInfo>();

for (const type of typesResult.typesList ?? []) {
  for (const prop of type.properties ?? []) {
    if (prop.name && prop.id) {
      propertyRegistry.set(prop.id, { name: prop.name, dataType: prop.dataType });
    }
  }
}

// Usage in formatter:
const resolvePropertyName = (propertyId: string): string =>
  propertyRegistry.get(propertyId)?.name ?? propertyId;  // Fallback to raw ID
```

### Pattern 2: Entity Name Index (for reference resolution)
**What:** Build a `Map<string, string>` mapping entity IDs to entity names. Used to resolve entity references in relations (e.g., "Works at: Geo" instead of "Works at: abc-123").
**When to use:** At prefetch time; consumed by entity formatters when displaying relation values.
**Example:**
```typescript
// Entity name index built during prefetch:
const entityNameIndex = new Map<string, string>();
for (const entity of prefetchedEntities) {
  if (entity.name) {
    entityNameIndex.set(entity.id, entity.name);
  }
}

// Usage in relation display:
const resolveEntityName = (entityId: string): string =>
  entityNameIndex.get(entityId) ?? entityId;  // Fallback to raw ID
```

### Pattern 3: Entity Formatter with Full Property Resolution
**What:** Format a single entity as human-readable markdown text with all properties resolved from UUIDs to labels.
**When to use:** In both get_entity and list_entities/search_entities tool responses.
**Example:**
```typescript
// Formats one entity for display
const formatEntity = (
  entity: StoredEntity,
  propertyRegistry: Map<string, PropertyInfo>,
  entityNameIndex: Map<string, string>,
  typeName: string,
): string => {
  const lines: string[] = [];

  lines.push(`### ${entity.name ?? '(unnamed)'}`);
  lines.push(`**Type:** ${typeName}`);
  lines.push(`**ID:** ${entity.id}`);
  lines.push('');

  // Properties section
  lines.push('**Properties:**');
  for (const value of entity.values) {
    const propName = propertyRegistry.get(value.propertyId)?.name ?? value.propertyId;
    const displayValue = resolvePropertyValue(value, entityNameIndex);
    lines.push(`- ${propName}: ${displayValue}`);
  }

  // Relations section
  if (entity.relations.length > 0) {
    lines.push('');
    lines.push('**Relations:**');
    for (const relation of entity.relations) {
      const relName = propertyRegistry.get(relation.typeId)?.name ?? relation.typeId;
      const targetName = entityNameIndex.get(relation.toEntityId) ?? relation.toEntityId;
      lines.push(`- ${relName}: ${targetName}`);
    }
  }

  return lines.join('\n');
};
```

### Pattern 4: Type Name Resolution for list_entities (SPCE-03)
**What:** Accept a human-readable type name ("Event") and resolve it to the corresponding type ID for filtering entities.
**When to use:** In list_entities tool, which accepts `type` as a string parameter.
**Example:**
```typescript
// Resolve type name to type ID (case-insensitive)
const resolveType = (
  typeName: string,
  types: TypeInfo[],
): TypeInfo | undefined => {
  const lower = typeName.toLowerCase();
  return (
    types.find((t) => t.name.toLowerCase() === lower) ??
    types.find((t) => t.name.toLowerCase().startsWith(lower)) ??
    types.find((t) => t.name.toLowerCase().includes(lower))
  );
};
```

### Pattern 5: Expanded Store Interface
**What:** The store grows from Phase 1's space/type-only lookup to include entities, property registry, and entity name index.
**When to use:** The store is the single source of truth for all tool handlers.
**Example:**
```typescript
export type StoredEntity = {
  id: string;
  name: string | null;
  typeIds: string[];
  values: Array<{
    propertyId: string;
    text: string | null;
    boolean: boolean | null;
    float: number | null;
    datetime: string | null;
    point: unknown | null;
    schedule: unknown | null;
  }>;
  relations: Array<{
    typeId: string;
    toEntityId: string;
    toEntityName: string | null;
  }>;
  spaceId: string;
};

export type PropertyInfo = {
  name: string;
  dataType: string;
};

export type TypeInfoWithProperties = TypeInfo & {
  properties: Array<{ id: string; name: string; dataType: string }>;
};

export type PrefetchedStore = {
  // Phase 1 (unchanged)
  getSpaces: () => SpaceInfo[];
  getTypes: (spaceId: string) => TypeInfoWithProperties[];
  getSpaceNames: () => string[];

  // Phase 2 (new)
  getEntities: (spaceId: string) => StoredEntity[];
  getEntitiesByType: (spaceId: string, typeId: string) => StoredEntity[];
  getEntity: (entityId: string) => StoredEntity | undefined;
  searchEntities: (spaceId: string, query: string, typeId?: string) => StoredEntity[];
  resolvePropertyName: (propertyId: string) => string;
  resolveEntityName: (entityId: string) => string;
  resolveTypeName: (typeId: string) => string;
  getPrefetchTimestamp: () => string;
};
```

### Pattern 6: search_entities with In-Memory Filtering
**What:** Case-insensitive substring matching on entity names, operating on prefetched data.
**When to use:** search_entities tool. User decision: exact (case-insensitive substring) match only.
**Example:**
```typescript
const searchEntities = (
  spaceId: string,
  query: string,
  typeId?: string,
): StoredEntity[] => {
  const lower = query.toLowerCase();
  let entities = entitiesBySpace.get(spaceId) ?? [];

  if (typeId) {
    entities = entities.filter((e) => e.typeIds.includes(typeId));
  }

  return entities.filter((e) =>
    e.name?.toLowerCase().includes(lower)
  );
};
```

### Anti-Patterns to Avoid
- **Fetching entity details per request:** All data is prefetched. Tools must never make GraphQL calls at request time. The entire dataset is in memory.
- **Returning raw property IDs in output:** Every `propertyId` MUST be resolved to a human label via the property registry. If no mapping exists, fall back to the raw ID (should be rare; indicates a property not registered in any type).
- **Fetching relations without the `toEntity` name:** The relations query must include `toEntity { id, name }` so entity references can be resolved to names. Fetching only `toEntityId` would require a second lookup.
- **Duplicating entity data across spaces:** An entity can appear in multiple spaces. Store entities keyed by space ID, not globally. Each space gets its own entity list with space-scoped values.
- **Forgetting to show empty/null properties:** User decision: empty properties shown explicitly (e.g., "Description: (empty)"). Iterate over ALL properties from the type's property schema, not just those present in `valuesList`. If a property from the type schema has no matching value in the entity's `valuesList`, display it as "(empty)".

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Property name resolution | Custom GraphQL queries per property ID | Prefetch `typesList { properties { id, name } }` once at startup | Property names are static per type. Fetching them per-request would be wasteful and slow. The typesList query with properties subfield is proven in `useKnowledgeGraph.tsx`. |
| Entity name resolution for relation targets | Per-relation `entity(id)` query | Build entity name index from prefetched entities | All entity names are already in the prefetched data. A simple `Map<entityId, entityName>` provides O(1) lookup. |
| Type name to type ID resolution | Custom search/query | Filter `store.getTypes(spaceId)` by name | With 10-50 types per space, linear scan with case-insensitive comparison is instant. No index needed. |
| Text value truncation | Custom truncation with Unicode awareness | Simple `.slice(0, 500)` with char count suffix | User decision: 500 char truncation. JavaScript's `.slice()` handles multi-byte chars correctly for display purposes. Edge cases with surrogate pairs are extremely unlikely in knowledge graph text content. |

**Key insight:** Phase 2 adds no new external dependencies. All complexity is in expanding the prefetch pipeline to capture more data (type properties, entity values, entity relations) and building in-memory lookup structures. The tools themselves are thin wrappers over store queries + formatters, following the exact same pattern as Phase 1's tools.

## Common Pitfalls

### Pitfall 1: Property Registry Missing Properties for Some Entities
**What goes wrong:** An entity has `valuesList` entries with `propertyId`s that are not in the property registry. The formatter falls back to displaying raw UUIDs, violating DATA-01.
**Why it happens:** The property registry is built from `typesList { properties }`, but some entities may have properties that are not declared on their assigned type (orphaned or cross-type properties). The GRC-20 standard allows entities to have values for properties not in their type schema.
**How to avoid:**
1. Build the property registry from ALL types across all spaces, not just the entity's own type
2. If a property ID still has no mapping, fall back to the raw ID (this is acceptable as the user decided "property names displayed as stored in the graph")
3. Log a warning to stderr for unmapped property IDs during prefetch so issues can be diagnosed
**Warning signs:** Raw UUIDs appearing in tool output where property names were expected.

### Pitfall 2: Entity Relation Targets Not in Prefetched Data
**What goes wrong:** An entity has a relation pointing to `toEntityId: "abc-123"`, but entity "abc-123" was not in the prefetched data (it might be in a different space, or the prefetch limit was exceeded). The entity name index cannot resolve the reference.
**Why it happens:** Relations can point across spaces. The MCP server only prefetches entities from 3 configured spaces. Cross-space references will have unresolvable IDs.
**How to avoid:**
1. Prefetch the relation's `toEntity { id, name }` inline in the entity query, so the name is captured even if the target entity is not in the store
2. If still unresolvable, display the raw entity ID as a fallback (acceptable for cross-space references)
3. The `relations` subfield on entities supports `toEntity { name }` -- include this in the prefetch query
**Warning signs:** Entity IDs appearing in relation displays instead of names.

### Pitfall 3: Store Expansion Breaking Existing Tools
**What goes wrong:** Changing `PrefetchedStore` type or `buildStore` signature breaks `list-spaces.ts` and `get-entity-types.ts` which were already working in Phase 1.
**Why it happens:** TypeScript structural typing means adding fields is safe, but changing existing field types or removing fields breaks consumers.
**How to avoid:**
1. Only ADD new fields to `PrefetchedStore` -- never change or remove existing ones
2. The `TypeInfo` type can be extended to `TypeInfoWithProperties` as a superset -- `getTypes()` returns the extended type, which is assignable to `TypeInfo[]`
3. Run existing tools after store changes to verify they still compile and produce correct output
**Warning signs:** TypeScript compilation errors in Phase 1 tool files after store changes.

### Pitfall 4: Entities Query Hitting 1000-Entity Limit Without Awareness
**What goes wrong:** The prefetch fetches `first: 1000` entities per space. If a space has more than 1000 entities, some are silently missing. Editors ask "why is entity X not showing up?" and the answer is "it wasn't prefetched."
**Why it happens:** The current `ENTITIES_QUERY` uses `first: 1000, offset: 0` with no pagination loop. The user indicated data scale is 100-500 entities per type per space, but this is per-type -- total per space could be several thousand.
**How to avoid:**
1. Either: increase the `first` limit to a higher value (e.g., 5000 or 10000) since data is loaded into memory anyway
2. Or: implement a pagination loop in the prefetch to fetch all entities (loop with offset until no more results)
3. Include the entity count in the response metadata so editors can see "Loaded 1,247 entities from AI Space (prefetched at 2026-02-18T10:00:00Z)"
**Warning signs:** Entity counts that seem lower than expected. Specific entities not appearing in search results.

### Pitfall 5: Value Type Coercion Losing Data
**What goes wrong:** Property values are stored as multiple typed fields (`text`, `boolean`, `float`, `datetime`, `point`, `schedule`) in `valuesList`. The formatter picks the wrong field or fails to handle null fields, showing "null" or skipping values.
**Why it happens:** Each `valuesList` entry has exactly ONE non-null value field. The formatter must check each field and pick the non-null one. If it checks in the wrong order or doesn't handle the fallback, it can produce "null" strings.
**How to avoid:**
1. Check value fields in order of specificity: `text` (most common), `float`, `boolean`, `datetime`, `point`, `schedule`
2. If ALL fields are null, the value is genuinely empty -- display "(empty)" per user decision
3. For `point` and `schedule` values, these are typically JSON strings -- display as-is per user decision ("displayed as stored")
**Warning signs:** Properties showing "null" or "(empty)" when they should have values.

### Pitfall 6: Response Size Blowing Up Context Window
**What goes wrong:** list_entities returns all 500 Person entities with full property sets. Each entity has 15 properties. The response is 50,000+ characters. Claude's context window fills up, or the MCP response becomes unwieldy.
**Why it happens:** User decision: "return all matching entities (no automatic pagination)" and "full details in all contexts." Combined with 100-500 entities per type, this produces very large responses.
**How to avoid:**
1. **Discretion area: Large result set handling.** Recommendation: include a count header ("Found 487 Person entities") and let the full results flow through. The optional `limit` parameter exists for when editors want smaller results.
2. If a response exceeds ~100 entities with full details, include a note at the top: "Showing all 487 results. Use limit parameter to reduce." This is informational, not a hard cap.
3. The 500-char text truncation threshold helps keep individual entity sizes bounded.
**Warning signs:** Tool responses that take many seconds or cause Claude to truncate its own output.

## Code Examples

Verified patterns from official sources and the existing codebase:

### Expanded TypesList Query with Properties
```typescript
// Source: Adapted from packages/typesync-studio/src/hooks/useKnowledgeGraph.tsx
// SchemaBrowserTypes query -- verified in generated types
export const TYPES_WITH_PROPERTIES_QUERY = /* GraphQL */ `
  query TypesWithProperties($spaceId: UUID!, $first: Int) {
    typesList(spaceId: $spaceId, first: $first) {
      id
      name
      properties {
        id
        name
        dataType
        relationValueTypes {
          id
          name
        }
      }
    }
  }
`;

export type TypesWithPropertiesResult = {
  typesList: Array<{
    id: string;
    name: string | null;
    properties: Array<{
      id: string;
      name: string | null;
      dataType: string;
      relationValueTypes: Array<{
        id: string;
        name: string | null;
      }>;
    }> | null;
  }> | null;
};
```

### Expanded Entities Query with Relations
```typescript
// Source: Adapted from packages/hypergraph/src/entity/find-one-public.ts
// and packages/hypergraph/src/utils/relation-query-helpers.ts
export const ENTITIES_WITH_RELATIONS_QUERY = /* GraphQL */ `
  query PrefetchEntitiesWithRelations($spaceId: UUID!, $first: Int, $offset: Int) {
    entities(spaceId: $spaceId, first: $first, offset: $offset) {
      id
      name
      typeIds
      valuesList(filter: { spaceId: { is: $spaceId } }) {
        propertyId
        text
        boolean
        float
        datetime
        point
        schedule
      }
      relationsList(filter: { spaceId: { is: $spaceId } }) {
        typeId
        toEntity {
          id
          name
        }
      }
    }
  }
`;

export type EntitiesWithRelationsResult = {
  entities: Array<{
    id: string;
    name: string | null;
    typeIds: string[];
    valuesList: Array<{
      propertyId: string;
      text: string | null;
      boolean: boolean | null;
      float: number | null;
      datetime: string | null;
      point: unknown | null;
      schedule: unknown | null;
    }>;
    relationsList: Array<{
      typeId: string;
      toEntity: {
        id: string;
        name: string | null;
      };
    }>;
  }>;
};
```

### Property Value Extraction
```typescript
// Source: Adapted from packages/hypergraph/src/utils/convert-property-value.ts
// Pick the non-null value from a valuesList entry
const extractPropertyValue = (value: StoredValue): string | null => {
  if (value.text !== null && value.text !== undefined) return value.text;
  if (value.float !== null && value.float !== undefined) return String(value.float);
  if (value.boolean !== null && value.boolean !== undefined) return String(value.boolean);
  if (value.datetime !== null && value.datetime !== undefined) return value.datetime;
  if (value.point !== null && value.point !== undefined) return JSON.stringify(value.point);
  if (value.schedule !== null && value.schedule !== undefined) return JSON.stringify(value.schedule);
  return null;
};
```

### Tool Registration Pattern (consistent with Phase 1)
```typescript
// Source: Existing packages/mcp-server/src/tools/get-entity-types.ts pattern
import { z } from 'zod';

export const registerSearchEntitiesTool = (
  server: McpServer,
  store: PrefetchedStore,
  config: SpacesConfig,
): void => {
  server.registerTool(
    'search_entities',
    {
      title: 'Search Entities',
      description:
        'Search for entities by name within a knowledge graph space. ' +
        'Returns matching entities with their properties and relationships. ' +
        'Use this when an editor wants to find specific entities by name or keyword.',
      inputSchema: {
        space: z.string().describe('Name of the space to search in (e.g., "AI Space")'),
        query: z.string().describe('Search term to match against entity names (case-insensitive substring match)'),
        type: z.string().optional().describe('Optional: filter by entity type name (e.g., "Event", "Person")'),
        limit: z.number().optional().describe('Optional: maximum number of results to return'),
        offset: z.number().optional().describe('Optional: number of results to skip (for pagination)'),
      },
      annotations: {
        readOnlyHint: true,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ space, query, type, limit, offset }) => {
      // Resolve space, optionally resolve type, search store, format results
      // ...
    },
  );
};
```

### Empty Property Display
```typescript
// User decision: empty properties shown explicitly
// Iterate over type's property schema, not just entity's valuesList
const formatEntityProperties = (
  entity: StoredEntity,
  typeProperties: Array<{ id: string; name: string; dataType: string }>,
  propertyRegistry: Map<string, PropertyInfo>,
): string[] => {
  const lines: string[] = [];
  const valueMap = new Map(entity.values.map((v) => [v.propertyId, v]));

  for (const typeProp of typeProperties) {
    const value = valueMap.get(typeProp.id);
    const propName = typeProp.name;

    if (!value) {
      lines.push(`- ${propName}: (empty)`);
      continue;
    }

    let displayValue = extractPropertyValue(value);
    if (displayValue === null) {
      lines.push(`- ${propName}: (empty)`);
      continue;
    }

    // Truncate long text values
    if (displayValue.length > 500) {
      const totalLen = displayValue.length;
      displayValue = `${displayValue.slice(0, 500)}... (truncated, ${totalLen.toLocaleString()} chars total)`;
    }

    lines.push(`- ${propName}: ${displayValue}`);
  }

  return lines;
};
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Per-request GraphQL for entity data | Prefetch-and-serve from in-memory store | Architecture decision (Phase 1) | All Phase 2 tools operate on prefetched data. No per-request queries. |
| Property names via Effect Schema annotations (`PropertyIdSymbol`) | Property name registry from `typesList { properties }` | Phase 2 design | MCP server avoids the SDK's schema-heavy approach in favor of direct GraphQL property metadata. Simpler, no Effect Schema dependency. |
| Relation handling via aliased `relations_*` fields | Simple `relationsList` with `toEntity { id, name }` | Phase 2 design | The SDK uses complex aliased relation fields for multi-level nesting. MCP server needs only flat relation display (name + target name), so a simple `relationsList` query suffices. |

**Deprecated/outdated:**
- The current `TYPES_LIST_QUERY` in `graphql-client.ts` fetches only `{ id, name }` per type. Phase 2 must replace this with the expanded query that includes `properties`. This is a non-breaking change to the query, not a deprecation.

## Discretion Recommendations

### Large Result Set Handling
**Recommendation:** Include entity count in all responses. For result sets exceeding 100 entities with full detail, add an informational header: "Showing all N results. Use limit parameter for fewer results." No hard cap -- editors doing QA may genuinely need all results.
**Rationale:** The user decided "return all matching entities" as default. The limit/offset parameters exist as opt-in. Adding a warning at 100+ entities helps editors without restricting them.

### Exact Truncation Threshold
**Recommendation:** Use 500 characters as specified in user decisions. This is applied per property value, not per entity.
**Rationale:** 500 chars is approximately 3-4 sentences -- enough to see the start of a description without overwhelming the display. The truncation indicator `"... (truncated, 2,340 chars total)"` tells editors the full length.

### Internal Error Message Wording
**Recommendation:** Follow the exact wording patterns from CONTEXT.md decisions:
- No results: `"No entities found matching '{query}' in {spaceName}."`
- Invalid type: `"Type '{typeName}' not found in {spaceName}. Available types: {comma-separated type names}."`
- Invalid entity ID: `"Entity '{entityId}' not found. Provide a valid entity ID from search results."`
- Data freshness footer: `"Data loaded at {ISO timestamp}"`
**Rationale:** These messages are user-facing through Claude. Keep them concise, factual, and actionable.

### Property Display Compression
**Recommendation:** Display all properties as a flat list with `- PropertyName: Value` format. Group properties before relations. Show type and ID as header fields. No tables for properties (too many columns for varied data types). Use sections within each entity: header (name, type, ID), properties, relations.
**Rationale:** Properties vary widely by type (an Event has different props than a Person). A flat list is the most flexible and readable format. Tables would require fixed column headers that differ per entity type.

### Relation Display in Entity Properties
**Recommendation:** When a property has `dataType: "RELATION"`, the value in `valuesList` will be empty for that property. Instead, the relation is represented in `relationsList`. Group all relations after properties under a "Relations" header, showing `- RelationName: TargetEntityName (TargetEntityId)`.
**Rationale:** The Geo Protocol data model separates property values (in `valuesList`) from relations (in `relations`/`relationsList`). Treating them as a unified "properties" view would require merging two different data sources. Separating them into distinct sections is cleaner and more accurate.

### get_entity_types Enhancement
**Recommendation:** Expand the type table to include a "Properties" column listing property names per type, e.g., `| Event | {id} | Start Date, End Date, Description, Location |`. This helps editors discover what fields exist before querying.
**Rationale:** User decision: "get_entity_types enhanced to include property names per type, so editors can discover queryable fields." The existing markdown table format can add a third column.

## Open Questions

1. **Entity Count per Space vs Prefetch Limit**
   - What we know: The current prefetch uses `first: 1000`. User indicated 100-500 entities per type. With 10-50 types, a space could have 1,000-5,000 total entities.
   - What's unclear: The exact entity counts per space. If any space exceeds the prefetch limit, entities will be silently missing.
   - Recommendation: Increase `first` to 10000 for the entities query, or implement a prefetch pagination loop. Since all data goes into memory anyway, a higher limit has no downside except slightly longer startup time. A pagination loop is more robust.

2. **Entities Without Type Assignments**
   - What we know: Entities have `typeIds` array. Some entities may have empty `typeIds` (no type assigned).
   - What's unclear: How to display entities with no type in list_entities (which filters by type).
   - Recommendation: Entities with no `typeIds` are excluded from type-filtered results. search_entities (which searches by name) can still find them. get_entity (by ID) always returns them.

3. **Property Name Collisions Across Types**
   - What we know: The property registry is global (maps propertyId to name). Two different types could define properties with the same UUID if they share property definitions (GRC-20 allows property reuse across types).
   - What's unclear: Whether property name collisions (different names for the same ID) can occur.
   - Recommendation: Property IDs in GRC-20 are globally unique -- each property entity has one canonical name. Collisions should not occur. Build the registry as a simple `Map<id, name>` without worrying about duplicates.

4. **Relation Properties (properties on the relation itself)**
   - What we know: The `convertRelations` utility in the SDK supports `entity.valuesList` on the relation entity (properties of the relation, not the target entity). The `relationsList` query can include `entity { valuesList { ... } }`.
   - What's unclear: Whether editors need to see relation properties (e.g., "Start Date" on an "Employed By" relation).
   - Recommendation: For Phase 2, display relations as simple `RelationName: TargetName` pairs. Relation properties are an advanced feature that can be added in Phase 3 if editors request it. The `relationsList` query structure already supports it via the `entity` field, so adding it later is non-breaking.

## Sources

### Primary (HIGH confidence)
- Existing codebase: `packages/typesync-studio/src/hooks/useKnowledgeGraph.tsx` -- `typesList` query with `properties { id, name, dataType, relationValueTypes { id, name } }` subfield. This is the proven pattern for fetching type property metadata from the Geo Protocol GraphQL API.
- Existing codebase: `packages/typesync-studio/src/generated/graphql.ts` -- Generated GraphQL types showing: `Entity` type has `valuesList`, `relations`, `relationsList`, `backlinks`, `typeIds`, `properties`. `Property` type has `id`, `name`, `dataType`, `relationValueTypes`. `QuerySearchArgs` accepts `query`, `filter`, `spaceId`, `first`, `offset`. `QueryEntitiesArgs` accepts `filter`, `first`, `offset`. `EntityFilter` supports `name: StringFilter` with `includesInsensitive`.
- Existing codebase: `packages/hypergraph/src/entity/find-one-public.ts` -- Entity query pattern with `valuesList`, relation handling via `buildRelationsSelection`, property value extraction via `convertPropertyValue`.
- Existing codebase: `packages/hypergraph/src/entity/find-many-public.ts` -- Entities query with `spaceId`, `typeIds: {in: $typeIds}`, `first`, `offset`, `filter`, `valuesList`, and relation aliasing.
- Existing codebase: `packages/hypergraph/src/entity/search-many-public.ts` -- Search query pattern: `search(query: $query, spaceId: $spaceId, filter: {...}, first, offset)` returning same entity shape.
- Existing codebase: `packages/hypergraph/src/utils/convert-relations.ts` -- Relation processing: `toEntity { id, name, valuesList }`, relation type IDs, entity property value mapping from relation results.
- Phase 1 implementation: `packages/mcp-server/src/` -- Complete working MCP server with prefetch pipeline, store, fuzzy matching, formatters, and two registered tools. All Phase 2 code extends this foundation.

### Secondary (MEDIUM confidence)
- Phase 1 research: `.planning/phases/01-server-foundation-metadata-tools/01-RESEARCH.md` -- MCP SDK patterns (`registerTool`, `StdioServerTransport`), Effect patterns (`Data.TaggedError`, `Effect.gen`), anti-patterns (no `console.log`, wrap GraphQL errors).

### Tertiary (LOW confidence)
- None. All findings verified against existing codebase patterns and generated GraphQL types.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- No new dependencies. All Phase 2 code uses libraries already installed in Phase 1.
- Architecture: HIGH -- Store expansion, property registry, and entity formatter patterns directly adapted from existing codebase (`useKnowledgeGraph.tsx`, `find-many-public.ts`). The GraphQL queries are proven.
- Pitfalls: HIGH -- Property resolution gaps, relation targets, and prefetch limits are real risks documented from analysis of the existing data model and query patterns.
- Code examples: HIGH -- All examples adapted from verified patterns in the monorepo codebase.

**Research date:** 2026-02-18
**Valid until:** 2026-03-18 (stable ecosystem, no API changes expected)
