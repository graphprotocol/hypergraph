import { Graph } from '@geoprotocol/geo-sdk';

let apiOrigin: string | null = null;

/**
 * Sets the API origin globally for all hypergraph API calls.
 * @param origin - The API origin URL (e.g., "https://api.mainnet.graphprotocol.io")
 */
export const setApiOrigin = (origin: string) => {
  apiOrigin = origin;
};

/**
 * Gets the configured API origin, or defaults to Graph.TESTNET_API_ORIGIN if not set.
 * @returns The API origin URL
 */
export const getApiOrigin = (): string => {
  if (apiOrigin) {
    return apiOrigin;
  }
  // Default to testnet
  return Graph.TESTNET_API_ORIGIN;
};
