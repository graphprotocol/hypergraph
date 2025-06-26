import { getAppInfoByIds } from '@/lib/get-app-info-by-ids';
import { Connect } from '@graphprotocol/hypergraph';
import { useIdentityToken } from '@privy-io/react-auth';
import { type UseQueryResult, useQuery } from '@tanstack/react-query';

export type PrivateSpaceData = {
  id: string;
  name: string;
  appIdentities: { address: string; appId: string }[];
  apps: { name: string; id: string }[];
  keyBoxes: {
    id: string;
    ciphertext: string;
    nonce: string;
    authorPublicKey: string;
  }[];
};

export const usePrivateSpaces = (): UseQueryResult<PrivateSpaceData[], Error> => {
  const { identityToken } = useIdentityToken();

  return useQuery<PrivateSpaceData[]>({
    queryKey: ['private-spaces'],
    queryFn: async () => {
      if (!identityToken) return [];
      const accountAddress = Connect.loadAccountAddress(localStorage);
      if (!accountAddress) return [];
      const response = await fetch(`${import.meta.env.VITE_HYPERGRAPH_SYNC_SERVER_ORIGIN}/connect/spaces`, {
        headers: { 'privy-id-token': identityToken, 'account-address': accountAddress },
      });
      const data = await response.json();
      const appIds = new Set<string>();
      for (const space of data.spaces) {
        for (const appIdentity of space.appIdentities) {
          appIds.add(appIdentity.appId);
        }
      }
      const appInfo = await getAppInfoByIds(Array.from(appIds));
      const spaces = data.spaces.map((space: PrivateSpaceData) => {
        const spaceAppIds = new Set<string>();
        for (const appIdentity of space.appIdentities) {
          spaceAppIds.add(appIdentity.appId);
        }
        return {
          ...space,
          apps: Array.from(spaceAppIds).map((appId) => {
            return {
              // @ts-expect-error - need to improve appInfo typing
              name: appInfo[appId]?.name ?? 'Unknown',
              id: appId,
            };
          }),
        };
      });
      return spaces;
    },
  });
};
