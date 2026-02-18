import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { Effect } from 'effect';
import { loadConfig } from './config.js';
import { ConfigError, PrefetchError } from './errors.js';
import { prefetchAll } from './prefetch.js';
import { buildStore } from './store.js';
import { registerGetEntityTool } from './tools/get-entity.js';
import { registerGetEntityTypesTool } from './tools/get-entity-types.js';
import { registerListEntitiesTool } from './tools/list-entities.js';
import { registerListSpacesTool } from './tools/list-spaces.js';
import { registerSearchEntitiesTool } from './tools/search-entities.js';

const startup = Effect.gen(function* () {
  const config = yield* loadConfig();

  yield* Effect.logInfo(`Loading ${config.spaces.length} spaces...`);

  const prefetchedData = yield* prefetchAll(config);

  yield* Effect.logInfo(`Prefetched ${prefetchedData.length} spaces, ready`);

  const store = buildStore(prefetchedData);

  const server = new McpServer({ name: 'hypergraph-mcp', version: '0.1.0' });

  registerListSpacesTool(server, store);
  registerGetEntityTypesTool(server, store, config);
  registerSearchEntitiesTool(server, store, config);
  registerGetEntityTool(server, store);
  registerListEntitiesTool(server, store, config);

  yield* Effect.logInfo(
    'Registered 5 tools: list_spaces, get_entity_types, search_entities, get_entity, list_entities',
  );

  yield* Effect.tryPromise({
    try: () => server.connect(new StdioServerTransport()),
    catch: (cause) => new Error(`Failed to connect stdio: ${cause}`),
  });
});

const main = startup.pipe(
  Effect.catchAll((error) => {
    let message: string;

    if (error instanceof ConfigError) {
      message = `Configuration error: ${error.message}`;
    } else if (error instanceof PrefetchError) {
      message = `Failed to prefetch space '${error.space}': ${error.cause}`;
    } else {
      message = `Server failed to start: ${String(error)}`;
    }

    return Effect.logError(message).pipe(Effect.andThen(Effect.die(error)));
  }),
);

Effect.runPromise(main).catch(() => process.exit(1));
