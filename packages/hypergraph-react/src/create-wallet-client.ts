import { http, createWalletClient as viemCreateWalletClient, type Account, type Chain, type WalletClient } from 'viem';

const DEFAULT_RPC_URL = 'https://rpc-geo-genesis-h0q2s21xx8.t.conduit.xyz';

const GEOGENESIS: Chain = {
  id: 80451,
  name: 'Geo Genesis',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [DEFAULT_RPC_URL],
    },
    public: {
      http: [DEFAULT_RPC_URL],
    },
  },
};

export const createWalletClient = (account: Account): WalletClient => {
  const walletClient = viemCreateWalletClient({
    account,
    chain: GEOGENESIS,
    transport: http(DEFAULT_RPC_URL, { batch: true }),
  });

  return walletClient;
};
