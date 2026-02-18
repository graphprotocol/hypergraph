import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { Effect } from 'effect';
import { loadConfig } from './config.js';
import { ConfigError, PrefetchError } from './errors.js';
import { prefetchAll } from './prefetch.js';

const startup = Effect.gen(function* () {
  const config = yield* loadConfig();

  yield* Effect.logInfo(`Loading ${config.spaces.length} spaces...`);

  const prefetchedData = yield* prefetchAll(config);

  yield* Effect.logInfo(`Prefetched ${prefetchedData.length} spaces, ready`);

  const server = new McpServer({ name: 'hypergraph-mcp', version: '0.1.0' });

  // Tools will be registered in Plan 02

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
