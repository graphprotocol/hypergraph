import { Config, Effect } from 'effect';

/**
 * Server configuration
 */
export const serverPortConfig = Config.number('PORT').pipe(Config.withDefault(3030));

export const hypergraphChainConfig = Config.string('HYPERGRAPH_CHAIN').pipe(Config.withDefault('geo-testnet'));

export const hypergraphRpcUrlConfig = Config.string('HYPERGRAPH_RPC_URL').pipe(Config.option);

/**
 * Load all server configuration
 */
export const serverConfig = Effect.all({
  port: serverPortConfig,
  hypergraphChain: hypergraphChainConfig,
  hypergraphRpcUrl: hypergraphRpcUrlConfig,
});
