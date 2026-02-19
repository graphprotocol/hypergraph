import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { SpacesConfig } from './config.js';
import type { PrefetchedStore } from './store.js';
import { registerGetEntityTool } from './tools/get-entity.js';
import { registerGetEntityTypesTool } from './tools/get-entity-types.js';
import { registerGetRelatedEntitiesTool } from './tools/get-related-entities.js';
import { registerListEntitiesTool } from './tools/list-entities.js';
import { registerListSpacesTool } from './tools/list-spaces.js';
import { registerSearchEntitiesTool } from './tools/search-entities.js';

export const registerTools = (server: McpServer, store: PrefetchedStore, config: SpacesConfig) => {
  registerListSpacesTool(server, store);
  registerGetEntityTypesTool(server, store, config);
  registerSearchEntitiesTool(server, store, config);
  registerGetEntityTool(server, store);
  registerListEntitiesTool(server, store, config);
  registerGetRelatedEntitiesTool(server, store);
};
