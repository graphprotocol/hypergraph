import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { SpacesConfig } from '../config.js';
import { formatEntityList } from '../formatters/entities.js';
import { resolveSpace, resolveType } from '../fuzzy.js';
import type { PrefetchedStore } from '../store.js';

export const registerListEntitiesTool = (server: McpServer, store: PrefetchedStore, _config: SpacesConfig): void => {
  server.registerTool(
    'list_entities',
    {
      title: 'List Entities',
      description:
        'List all entities of a specific type in a knowledge graph space. Returns entities with their properties and relationships. Use this when an editor wants to browse all entities of a given type (e.g., all Events, all Persons).',
      inputSchema: {
        space: z.string().describe('Name of the space to list entities from (e.g., "AI Space")'),
        type: z.string().describe('Entity type name to filter by (e.g., "Event", "Person", "Organization")'),
        limit: z.number().optional().describe('Optional: maximum number of results to return'),
        offset: z.number().optional().describe('Optional: number of results to skip (for pagination)'),
      },
      annotations: {
        readOnlyHint: true,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ space, type, limit, offset }) => {
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

      const fullResults = store.getEntitiesByType(resolved.id, matchedType.id);

      const start = offset ?? 0;
      const sliced = limit !== undefined ? fullResults.slice(start, start + limit) : fullResults.slice(start);

      if (sliced.length === 0) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `No ${matchedType.name} entities found in ${resolved.name}.`,
            },
          ],
        };
      }

      const text = formatEntityList(sliced, store, {
        spaceName: resolved.name,
        typeName: matchedType.name,
        total: fullResults.length,
        ...(limit !== undefined && { limit }),
        ...(offset !== undefined && { offset }),
      });

      return { content: [{ type: 'text' as const, text }] };
    },
  );
};
