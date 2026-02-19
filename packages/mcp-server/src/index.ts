import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { Effect } from 'effect';
import { loadConfig } from './config.js';
import { ConfigError, PrefetchError } from './errors.js';
import { prefetchAll } from './prefetch.js';
import { registerTools } from './register-tools.js';
import { buildStore } from './store.js';

const startup = Effect.gen(function* () {
  const config = yield* loadConfig();

  yield* Effect.logInfo(`Loading ${config.spaces.length} spaces...`);

  const prefetchedData = yield* prefetchAll(config);

  yield* Effect.logInfo(`Prefetched ${prefetchedData.length} spaces, ready`);

  const store = buildStore(prefetchedData);

  const server = new McpServer(
    {
      name: 'hypergraph-mcp',
      version: '0.1.0',
      description:
        'Read-only access to Geo Protocol knowledge graphs — browse spaces, search entities, inspect properties and relations, and traverse the graph.',
    },
    {
      instructions: [
        'Hypergraph MCP provides read-only access to Geo Protocol knowledge graphs.',
        'Each knowledge graph is organized into spaces (e.g., "AI", "Crypto"), which contain typed entities (e.g., Event, Person, Organization) with properties and relations between them.',
        '',
        'Recommended workflow:',
        '1. list_spaces — discover available spaces',
        '2. get_entity_types — see what entity types exist in a space',
        '3. search_entities or list_entities — find entities by name or browse by type',
        '4. get_entity — get full details for a specific entity',
        '5. get_related_entities — traverse the graph to find connected entities',
        '',
        'All name inputs (spaces, types, relation types) support fuzzy matching — exact, prefix, and substring matches are tried in order.',
        'When no limit is specified, all matching results are returned. Use limit and offset for pagination.',
      ].join('\n'),
    },
  );

  registerTools(server, store, config);

  yield* Effect.logInfo(
    'Registered 6 tools: list_spaces, get_entity_types, search_entities, get_entity, list_entities, get_related_entities',
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
