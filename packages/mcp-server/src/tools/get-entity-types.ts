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
        'List all entity types with their property schemas and relation types. Omit space (recommended — do this first) to see ALL types across ALL spaces at once. The same type name (e.g., "Bounty") can exist in multiple spaces — you must query without a space to discover all of them. The Relations column shows what graph links each type has (e.g., "location → City") — call this before using `related_to` in `search_entities` or `list_entities` to discover the right relation type and direction. Space name is fuzzy-matched.',
      inputSchema: {
        space: z
          .string()
          .optional()
          .describe('Name of the knowledge graph space to browse types in (e.g., "AI"). Omit to get types from all spaces at once — recommended unless you already know which space to look in.'),
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
