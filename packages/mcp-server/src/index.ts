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
        'Start with search_entities — always omit "space" for your first search to query all spaces at once. Entity topics often don\'t match space names: a company named "Geo" lives in the "Crypto" space, not the "Geo" space. Use the type shown in search results to confirm you have the right entity.',
        '',
        'For queries like "find all people who work at Geo project":',
        '1. search_entities(query: "Geo", type: "Project") — find the target entity (type hint comes from the user\'s words)',
        '2. get_related_entities(entity_id: <id>, direction: "incoming", relation_type: "Works at") — find entities that point TO it',
        '',
        'Use direction: "incoming" to find entities that reference a target (people who work AT a company, events AT a venue).',
        'Use direction: "outgoing" to follow links FROM an entity (the company an employee works at).',
        'Omit relation_type to discover all relation types first, then refine.',
        '',
        'All name inputs (spaces, types, relation types) support fuzzy matching.',
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
