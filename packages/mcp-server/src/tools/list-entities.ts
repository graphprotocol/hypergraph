import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { SpacesConfig } from '../config.js';
import { formatEntityList } from '../formatters/entities.js';
import { resolveSpace, resolveTypes } from '../fuzzy.js';
import type { PrefetchedStore, RelationFilter } from '../store.js';

export const registerListEntitiesTool = (server: McpServer, store: PrefetchedStore, _config: SpacesConfig): void => {
  server.registerTool(
    'list_entities',
    {
      title: 'List Entities',
      description:
        'List all entities of a specific type in a space. Returns entities with their properties and relations. Use this to browse all entities of a given type (e.g., all Events, all Persons). Space and type names are fuzzy-matched. Returns up to 50 results by default — use limit/offset for large sets.',
      inputSchema: {
        space: z.string().describe('Name of the space to list entities from (e.g., "AI")'),
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
      },
      annotations: {
        readOnlyHint: true,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ space, type, limit, offset, filters, sort_by, sort_order, related_to }) => {
      const DEFAULT_LIMIT = 50;
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

      const types = store.getTypes(resolved.id);
      const matchedTypes = resolveTypes(type, types);

      if (matchedTypes.length === 0) {
        const uniqueNames = [...new Set(types.map((t) => t.name))];
        return {
          content: [
            {
              type: 'text' as const,
              text: `Type "${type}" not found in ${resolved.name}. Available types: ${uniqueNames.join(', ')}.`,
            },
          ],
          isError: true,
        };
      }

      const typeIds = matchedTypes.map((t) => t.id);
      const typeName = matchedTypes[0].name;
      const fullResults = store.getEntitiesByType(resolved.id, typeIds);

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
              text: `No ${typeName} entities found in ${resolved.name}.`,
            },
          ],
        };
      }

      let text = formatEntityList(sliced, store, {
        spaceName: resolved.name,
        typeName: typeName,
        total: relationFiltered.length,
        limit: effectiveLimit,
        ...(offset !== undefined && { offset }),
        ...(filters?.length && { filters }),
        ...(sort_by !== undefined && { sortBy: sort_by, sortOrder: sort_order }),
      });

      if (allWarnings.length > 0) {
        text = `> ⚠ ${allWarnings.join('\n> ⚠ ')}\n\n` + text;
      }

      return { content: [{ type: 'text' as const, text }] };
    },
  );
};
