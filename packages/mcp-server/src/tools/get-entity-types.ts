import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { SpacesConfig } from '../config.js';
import { formatTypesList } from '../formatters/types.js';
import { resolveSpace } from '../fuzzy.js';
import type { PrefetchedStore } from '../store.js';

export const registerGetEntityTypesTool = (server: McpServer, store: PrefetchedStore, _config: SpacesConfig): void => {
  server.registerTool(
    'get_entity_types',
    {
      title: 'Get Entity Types',
      description:
        'List all entity types available in a knowledge graph space. Returns type names and their GRC-20 type IDs. Use this to discover what kinds of entities (e.g., Event, Person, Organization) exist in a space before searching or listing entities.',
      inputSchema: {
        space: z.string().describe('Name of the knowledge graph space to browse types in (e.g., "AI")'),
      },
      annotations: {
        readOnlyHint: true,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ space }) => {
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
