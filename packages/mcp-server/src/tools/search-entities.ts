import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { SpacesConfig } from '../config.js';
import { formatEntityList } from '../formatters/entities.js';
import { resolveSpace, resolveTypes } from '../fuzzy.js';
import type { PrefetchedStore } from '../store.js';

export const registerSearchEntitiesTool = (server: McpServer, store: PrefetchedStore, _config: SpacesConfig): void => {
  server.registerTool(
    'search_entities',
    {
      title: 'Search Entities',
      description:
        'Search for entities by name across all knowledge graph spaces. Omit "space" (recommended for first searches) to search all spaces at once — entity topics often don\'t match space names (e.g., a company named "Geo" is in the "Crypto" space). Provide "space" only to narrow results when you already know where the entity lives. Space and type names are fuzzy-matched. Results are limited to 50 by default — use limit/offset to paginate.',
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
      },
      annotations: {
        readOnlyHint: true,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ space, query, type, limit, offset, filters, sort_by, sort_order }) => {
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

      const start = offset ?? 0;
      const effectiveLimit = limit ?? DEFAULT_LIMIT;
      const sliced = filtered.slice(start, start + effectiveLimit);

      if (sliced.length === 0) {
        // Auto-fallback: if a specific space was requested but returned no results,
        // try searching all spaces and return those results with a notice.
        if (resolvedSpaceId !== undefined) {
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
            let text = formatEntityList(fallbackSliced, store, {
              spaceName: 'all spaces',
              ...(typeName !== undefined && { typeName }),
              total: fallbackFiltered.length,
              limit: effectiveLimit,
              ...(offset !== undefined && { offset }),
              ...(filters?.length && { filters }),
              ...(sort_by !== undefined && { sortBy: sort_by, sortOrder: sort_order }),
              crossSpace: true,
              fallbackNote: `No results found in "${spaceName}". Showing results from all spaces:`,
            });
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

      let text = formatEntityList(sliced, store, {
        spaceName,
        ...(typeName !== undefined && { typeName }),
        total: filtered.length,
        limit: effectiveLimit,
        ...(offset !== undefined && { offset }),
        ...(filters?.length && { filters }),
        ...(sort_by !== undefined && { sortBy: sort_by, sortOrder: sort_order }),
        ...(resolvedSpaceId === undefined && { crossSpace: true }),
      });

      if (warnings.length > 0) {
        text = `> ⚠ ${warnings.join('\n> ⚠ ')}\n\n` + text;
      }

      return { content: [{ type: 'text' as const, text }] };
    },
  );
};
