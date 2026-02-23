import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { formatSpacesList } from '../formatters/spaces.js';
import type { PrefetchedStore } from '../store.js';

export const registerListSpacesTool = (server: McpServer, store: PrefetchedStore): void => {
  server.registerTool(
    'list_spaces',
    {
      title: 'List Spaces',
      description:
        'List all available knowledge graph spaces. Use this only when the user explicitly asks about spaces, or when you need to enumerate available data sources. To find entities, use search_entities directly — omitting the space parameter searches all spaces at once.',
      inputSchema: {},
      annotations: {
        readOnlyHint: true,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async () => {
      const note =
        '> **Note:** Spaces organize the data source, not the topic. An entity named "Geo" may live in the "Crypto" space. Use search_entities without a space parameter to find entities across all spaces.\n\n';
      const text = note + formatSpacesList(store.getSpaces());
      return { content: [{ type: 'text' as const, text }] };
    },
  );
};
