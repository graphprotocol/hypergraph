import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { SpacesConfig } from '../config.js';
import { formatEntityList, formatEntityListCompact } from '../formatters/entities.js';
import { resolveSpace, resolveTypes } from '../fuzzy.js';
import type { PrefetchedStore, RelationFilter } from '../store.js';

export const registerListEntitiesTool = (server: McpServer, store: PrefetchedStore, _config: SpacesConfig): void => {
  server.registerTool(
    'list_entities',
    {
      title: 'List Entities',
      description:
        'List all entities of a specific type. Omit space (recommended) to list across ALL spaces at once — the same type name (e.g., "Bounty") often exists in multiple spaces and you\'d miss results by specifying one. Provide space only to narrow when you\'re sure all entities are in one space. Use filters to narrow by property values (e.g., {"property":"Bounty Budget","operator":"eq","value":"1000"}). Space and type names are fuzzy-matched. Returns up to 50 results by default — use limit/offset for large sets. Use compact=true for token-efficient output on large result sets.',
      inputSchema: {
        space: z.string().optional().describe('Only provide this when the user explicitly names a space to restrict to. Do NOT guess a space from the type name or topic. Omitting this (the default) lists across all spaces.'),
        type: z.string().describe('Entity type name to filter by (e.g., "Event", "Person", "Organization")'),
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
    async ({ space, type, limit, offset, filters, sort_by, sort_order, related_to, compact }) => {
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

      const allTypes = resolvedSpaceId !== undefined
        ? store.getTypes(resolvedSpaceId)
        : store.getSpaces().flatMap((s) => store.getTypes(s.id));
      const matchedTypes = resolveTypes(type, allTypes);

      if (matchedTypes.length === 0) {
        const uniqueNames = [...new Set(allTypes.map((t) => t.name))];
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

      const typeIds = [...new Set(matchedTypes.map((t) => t.id))];
      const typeName = matchedTypes[0].name;
      const fullResults = resolvedSpaceId !== undefined
        ? store.getEntitiesByType(resolvedSpaceId, typeIds)
        : store.searchEntities(undefined, '', typeIds);

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
        return {
          content: [
            {
              type: 'text' as const,
              text: `No ${typeName} entities found in ${spaceName}.`,
            },
          ],
        };
      }

      const mainOptions = {
        spaceName,
        typeName,
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
