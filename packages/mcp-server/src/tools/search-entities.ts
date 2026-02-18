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
        'Search for entities by name within a knowledge graph space. Returns matching entities with their properties and relationships. Use this when an editor wants to find specific entities by name or keyword.',
      inputSchema: {
        space: z.string().describe('Name of the space to search in (e.g., "AI")'),
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

      let typeIds: string[] | undefined;
      let typeName: string | undefined;

      if (type) {
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

        typeIds = matchedTypes.map((t) => t.id);
        typeName = matchedTypes[0].name;
      }

      const fullResults = store.searchEntities(resolved.id, query, typeIds);

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
