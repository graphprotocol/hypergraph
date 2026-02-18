import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { SpacesConfig } from '../config.js';
import { formatEntityList } from '../formatters/entities.js';
import { resolveSpace, resolveType } from '../fuzzy.js';
import type { PrefetchedStore } from '../store.js';

export const registerSearchEntitiesTool = (server: McpServer, store: PrefetchedStore, _config: SpacesConfig): void => {
  server.registerTool(
    'search_entities',
    {
      title: 'Search Entities',
      description:
        'Search for entities by name within a knowledge graph space. Returns matching entities with their properties and relationships. Use this when an editor wants to find specific entities by name or keyword.',
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

      let typeId: string | undefined;
      let typeName: string | undefined;

      if (type) {
        const types = store.getTypes(resolved.id);
        const matchedType = resolveType(type, types);

        if (!matchedType) {
          return {
            content: [
              {
                type: 'text' as const,
                text: `Type "${type}" not found in ${resolved.name}. Available types: ${types.map((t) => t.name).join(', ')}.`,
              },
            ],
            isError: true,
          };
        }

        typeId = matchedType.id;
        typeName = matchedType.name;
      }

      const fullResults = store.searchEntities(resolved.id, query, typeId);

      const start = offset ?? 0;
      const sliced = limit !== undefined ? fullResults.slice(start, start + limit) : fullResults.slice(start);

      if (sliced.length === 0) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `No entities found matching "${query}" in ${resolved.name}.`,
            },
          ],
        };
      }

      const text = formatEntityList(sliced, store, {
        spaceName: resolved.name,
        ...(typeName !== undefined && { typeName }),
        total: fullResults.length,
        ...(limit !== undefined && { limit }),
        ...(offset !== undefined && { offset }),
      });

      return { content: [{ type: 'text' as const, text }] };
    },
  );
};
