import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { SpacesConfig } from '../config.js';
import { formatAllSpacesTypesList, formatTypesList } from '../formatters/types.js';
import { resolveSpace } from '../fuzzy.js';
import type { PrefetchedStore } from '../store.js';

export const registerGetEntityTypesTool = (server: McpServer, store: PrefetchedStore, _config: SpacesConfig): void => {
  server.registerTool(
    'get_entity_types',
    {
      title: 'Get Entity Types',
      description:
        'List all entity types in a space (e.g., Event, Person, Organization) with their property schemas. Use this when you need to know what data a specific space contains, or to refine a list_entities call with the correct type name. Space name is fuzzy-matched. Omit space to get types from all spaces at once.',
      inputSchema: {
        space: z
          .string()
          .optional()
          .describe('Name of the knowledge graph space to browse types in (e.g., "AI"). Omit to get types from all spaces.'),
      },
      annotations: {
        readOnlyHint: true,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ space }) => {
      if (!space) {
        const allSpaces = store.getSpaces().map((s) => ({
          name: s.name,
          types: store.getTypes(s.id),
        }));
        const text = formatAllSpacesTypesList(allSpaces);
        return { content: [{ type: 'text' as const, text }] };
      }

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
      const text = formatTypesList(types, resolved.name);
      return { content: [{ type: 'text' as const, text }] };
    },
  );
};
