import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { SpacesConfig } from '../config.js';
import { formatEntityList, formatEntityListCompact } from '../formatters/entities.js';
import { resolveSpace, resolveTypes } from '../fuzzy.js';
import type { PrefetchedStore, RelationFilter } from '../store.js';

export const registerSearchEntitiesTool = (server: McpServer, store: PrefetchedStore, _config: SpacesConfig): void => {
  server.registerTool(
    'search_entities',
    {
      title: 'Search Entities',
      description:
        'Search for entities by name across all knowledge graph spaces. Note: this tool matches entity names, not their content or relations. To find entities related to another entity (e.g., "articles published by Cointelegraph"), use the related_to parameter instead of putting the publisher name in query. For location/relation queries ("Events in Paris", "articles by Cointelegraph"): call `get_entity_types` first to see what relations an entity type has (e.g., Event has `location → City`), then use `related_to` — e.g., `related_to: {entity: "Paris", relation_type: "location", direction: "outgoing"}` with `type: "Event"`. Do NOT put "Paris" in the `query` field. Omit "space" (recommended for first searches) to search all spaces at once — entity topics often don\'t match space names (e.g., a company named "Geo" is in the "Crypto" space). Provide "space" only to narrow results when you already know where the entity lives. Use filters for property-based searches (e.g., Bounty Budget = 1000) rather than fetching all entities and filtering manually. Space and type names are fuzzy-matched. Results are limited to 50 by default — use limit/offset to paginate. Use compact=true for large result sets to get a token-efficient table — then call get_entity for details on specific results.',
      inputSchema: {
        space: z
          .string()
          .optional()
          .describe(
            'Space to search within. Omit this for your first search — searching without a space finds entities regardless of which space they live in.',
          ),
        query: z.string().describe('Search term to match against entity names (case-insensitive substring match)'),
        type: z.string().optional().describe('Optional: filter by entity type name (e.g., "Event", "Person")'),
        limit: z.number().optional().describe('Optional: max results (default: 50). Use offset for pagination.'),
        offset: z.number().optional().describe('Optional: number of results to skip (for pagination)'),
        filters: z
          .array(
            z.object({
              property: z
                .string()
                .describe('Property name to filter on (fuzzy-matched, e.g. "publish_date", "efficacy")'),
              operator: z
                .enum(['eq', 'contains', 'gt', 'gte', 'lt', 'lte', 'exists', 'not_exists'])
                .describe('eq=equals, contains=substring, gt/gte/lt/lte=comparison, exists/not_exists=presence check'),
              value: z.string().optional().describe('Value to compare against (omit for exists/not_exists)'),
            }),
          )
          .optional()
          .describe('Filter entities by property values. All filters are ANDed.'),
        sort_by: z.string().optional().describe('Property name to sort results by (fuzzy-matched)'),
        sort_order: z.enum(['asc', 'desc']).optional().describe('Sort direction (default: asc)'),
        related_to: z
          .object({
            entity: z.string().describe('Name of the entity to filter by relation (case-insensitive substring match on entity names)'),
            relation_type: z.string().optional().describe('Optional: relation type to filter on (fuzzy-matched property name)'),
            direction: z
              .enum(['outgoing', 'incoming'])
              .optional()
              .describe(
                'Direction of relation. "outgoing" (default): result entity points TO the named entity — use this for "articles BY publisher X" where articles have a source/publisher relation. "incoming": named entity points TO the result entity.',
              ),
          })
          .optional()
          .describe(
            'Filter results by their graph relation to a named entity. Example: to find articles published by Cointelegraph, use related_to: { entity: "Cointelegraph", direction: "outgoing" }',
          ),
        compact: z
          .boolean()
          .optional()
          .describe(
            'Optional: return results as a compact table (Name, Type, ID) instead of full entity cards. Recommended for large result sets when you only need to identify entities before fetching details with get_entity.',
          ),
      },
      annotations: {
        readOnlyHint: true,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ space, query, type, limit, offset, filters, sort_by, sort_order, related_to, compact }) => {
      const DEFAULT_LIMIT = 50;
      let resolvedSpaceId: string | undefined;
      let spaceName: string;

      if (space !== undefined) {
        const resolved = resolveSpace(space, store.getSpaces());
        if (!resolved) {
          return {
            content: [
              {
                type: 'text' as const,
                text: `Space "${space}" not found. Available spaces: ${store.getSpaceNames().join(', ')}`,
              },
            ],
            isError: true,
          };
        }
        resolvedSpaceId = resolved.id;
        spaceName = resolved.name;
      } else {
        resolvedSpaceId = undefined;
        spaceName = 'all spaces';
      }

      let typeIds: string[] | undefined;
      let typeName: string | undefined;

      if (type) {
        if (resolvedSpaceId !== undefined) {
          const types = store.getTypes(resolvedSpaceId);
          const matchedTypes = resolveTypes(type, types);

          if (matchedTypes.length === 0) {
            const uniqueNames = [...new Set(types.map((t) => t.name))];
            return {
              content: [
                {
                  type: 'text' as const,
                  text: `Type "${type}" not found in ${spaceName}. Available types: ${uniqueNames.join(', ')}.`,
                },
              ],
              isError: true,
            };
          }

          typeIds = matchedTypes.map((t) => t.id);
          typeName = matchedTypes[0].name;
        } else {
          // Cross-space: collect matching typeIds from all spaces
          const allTypes = store.getSpaces().flatMap((s) => store.getTypes(s.id));
          const matchedTypes = resolveTypes(type, allTypes);
          if (matchedTypes.length > 0) {
            typeIds = [...new Set(matchedTypes.map((t) => t.id))];
            typeName = matchedTypes[0].name;
          }
        }
      }

      const fullResults = store.searchEntities(resolvedSpaceId, query, typeIds);

      const { entities: filtered, warnings } =
        filters?.length || sort_by
          ? store.filterAndSortEntities(fullResults, filters ?? [], sort_by, sort_order)
          : { entities: fullResults, warnings: [] };

      let relationFiltered = filtered;
      const allWarnings = [...warnings];
      if (related_to) {
        const { entities: rf, warnings: rw } = store.filterByRelation(filtered, related_to as RelationFilter);
        relationFiltered = rf;
        allWarnings.push(...rw);
      }

      const start = offset ?? 0;
      const effectiveLimit = limit ?? DEFAULT_LIMIT;
      const sliced = relationFiltered.slice(start, start + effectiveLimit);

      if (sliced.length === 0) {
        // Auto-fallback: if a specific space was requested but returned no results,
        // try searching all spaces and return those results with a notice.
        // Skip fallback when relation filter is active (cross-space fallback with relation filter
        // would require re-applying the filter and complicates the UX).
        if (resolvedSpaceId !== undefined && !related_to) {
          const allTypes = store.getSpaces().flatMap((s) => store.getTypes(s.id));
          let fallbackTypeIds: string[] | undefined;
          if (type) {
            const matchedTypes = resolveTypes(type, allTypes);
            if (matchedTypes.length > 0) {
              fallbackTypeIds = [...new Set(matchedTypes.map((t) => t.id))];
            }
          }
          const fallbackFull = store.searchEntities(undefined, query, fallbackTypeIds);
          const { entities: fallbackFiltered, warnings: fallbackWarnings } =
            filters?.length || sort_by
              ? store.filterAndSortEntities(fallbackFull, filters ?? [], sort_by, sort_order)
              : { entities: fallbackFull, warnings: [] };
          const fallbackSliced = fallbackFiltered.slice(start, start + effectiveLimit);

          if (fallbackSliced.length > 0) {
            const fallbackOptions = {
              spaceName: 'all spaces',
              ...(typeName !== undefined && { typeName }),
              total: fallbackFiltered.length,
              limit: effectiveLimit,
              ...(offset !== undefined && { offset }),
              crossSpace: true,
              fallbackNote: `No results found in "${spaceName}". Showing results from all spaces:`,
            };
            let text = compact
              ? formatEntityListCompact(fallbackSliced, store, fallbackOptions)
              : formatEntityList(fallbackSliced, store, { ...fallbackOptions, ...(filters?.length && { filters }), ...(sort_by !== undefined && { sortBy: sort_by, sortOrder: sort_order }) });
            if (fallbackWarnings.length > 0) {
              text = `> ⚠ ${fallbackWarnings.join('\n> ⚠ ')}\n\n` + text;
            }
            return { content: [{ type: 'text' as const, text }] };
          }
        }

        return {
          content: [
            {
              type: 'text' as const,
              text: `No entities found matching "${query}" in ${spaceName}.`,
            },
          ],
        };
      }

      const mainOptions = {
        spaceName,
        ...(typeName !== undefined && { typeName }),
        total: relationFiltered.length,
        limit: effectiveLimit,
        ...(offset !== undefined && { offset }),
        ...(resolvedSpaceId === undefined && { crossSpace: true }),
      };
      let text = compact
        ? formatEntityListCompact(sliced, store, mainOptions)
        : formatEntityList(sliced, store, { ...mainOptions, ...(filters?.length && { filters }), ...(sort_by !== undefined && { sortBy: sort_by, sortOrder: sort_order }) });

      if (allWarnings.length > 0) {
        text = `> ⚠ ${allWarnings.join('\n> ⚠ ')}\n\n` + text;
      }

      return { content: [{ type: 'text' as const, text }] };
    },
  );
};
