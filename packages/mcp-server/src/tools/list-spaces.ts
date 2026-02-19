import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { formatSpacesList } from '../formatters/spaces.js';
import type { PrefetchedStore } from '../store.js';

export const registerListSpacesTool = (server: McpServer, store: PrefetchedStore): void => {
  server.registerTool(
    'list_spaces',
    {
      title: 'List Spaces',
      description:
        'List all available knowledge graph spaces. Returns space names and IDs. Start here to discover which spaces are available, then use get_entity_types to explore a space.',
      inputSchema: {},
      annotations: {
        readOnlyHint: true,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async () => {
      const text = formatSpacesList(store.getSpaces());
      return { content: [{ type: 'text' as const, text }] };
    },
  );
};
