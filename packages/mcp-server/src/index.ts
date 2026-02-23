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
        'IMPORTANT: The same entity type (e.g., "Bounty", "Project") often exists in MULTIPLE spaces. Never assume a type is only in one space. Always use cross-space mode (omit the space parameter) unless the user explicitly asks for a specific space.',
        '',
        'Rule: Never pass the `space` parameter unless the user explicitly names a space (e.g., "search only in the AI space"). Do NOT infer a space from the entity type, query topic, or your own knowledge about where entities "probably" live.',
        '',
        'Anti-pattern (WRONG — misses entities in other spaces):',
        '  list_spaces → get_entity_types(space: "Crypto") → list_entities(space: "Crypto", type: "Bounty")',
        '',
        'Correct pattern (searches all spaces):',
        '  list_entities(type: "Bounty", filters: [{property: "Bounty Budget", operator: "eq", value: "1000"}])',
        '',
        'Recommended workflow:',
        '1. get_entity_types — omit space to see ALL types across ALL spaces at once. This shows you which spaces contain each type.',
        '2. search_entities or list_entities — omit space to search/list across all spaces. Use type + filters for property-based queries (e.g., find all Bounties with budget = 1000: search_entities(type: "Bounty", filters: [{property: "Bounty Budget", operator: "eq", value: "1000"}])).',
        '3. get_entity — get full details for a specific entity by ID.',
        '4. get_related_entities — traverse the graph from an entity.',
        '',
        'For relation queries ("Events in Paris", "articles by Cointelegraph"):',
        '1. search_entities(query: "Geo", type: "Project") — find the target entity first',
        '2. get_related_entities(entity_id: <id>, direction: "incoming", relation_type: "Works at") — find entities pointing TO it',
        '',
        'Use direction: "incoming" to find entities that reference a target (people who work AT a company).',
        'Use direction: "outgoing" to follow links FROM an entity.',
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
