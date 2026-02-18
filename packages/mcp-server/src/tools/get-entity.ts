import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { formatEntity } from '../formatters/entities.js';
import type { PrefetchedStore } from '../store.js';

export const registerGetEntityTool = (server: McpServer, store: PrefetchedStore): void => {
  server.registerTool(
    'get_entity',
    {
      title: 'Get Entity',
      description:
        'Get full details for a single entity by its ID. Returns all properties with human-readable labels, relationships, and metadata. Use this after finding an entity via search or list to inspect its complete data.',
      inputSchema: {
        id: z.string().describe('The entity ID to look up (from search or list results)'),
      },
      annotations: {
        readOnlyHint: true,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ id }) => {
      const entity = store.getEntity(id);

      if (!entity) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `Entity "${id}" not found. Provide a valid entity ID from search results.`,
            },
          ],
          isError: true,
        };
      }

      const text = formatEntity(entity, store);
      return { content: [{ type: 'text' as const, text }] };
    },
  );
};
