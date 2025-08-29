import { Connect } from '@graphprotocol/hypergraph';
import { Config } from 'effect';

export const hypergraphChainConfig = Config.string('HYPERGRAPH_CHAIN').pipe(
  Config.map((chain) => (chain === 'geogenesis' ? Connect.GEOGENESIS : Connect.GEO_TESTNET)),
  Config.withDefault(Connect.GEO_TESTNET),
);

export const hypergraphRpcUrlConfig = Config.string('HYPERGRAPH_RPC_URL').pipe(
  Config.orElse(() => hypergraphChainConfig.pipe(Config.map((chain) => chain.rpcUrls.default.http[0]))),
);
