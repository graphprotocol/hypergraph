import type { Entity } from '@graphprotocol/hypergraph';
import { useMutation } from '@tanstack/react-query';
import { useHypergraphApp } from '../HypergraphAppContext.js';
import { preparePublish } from '../prepare-publish.js';
import { publishOps } from '../publish-ops.js';

export function usePublishToPublicSpace(spaceId: string) {
  const { getSmartSessionClient } = useHypergraphApp();

  return useMutation({
    mutationFn: async <S extends Entity.AnyNoContext>(entity: Entity.Entity<S>) => {
      const { ops } = await preparePublish({
        entity,
        publicSpace: spaceId,
      });
      const smartSessionClient = await getSmartSessionClient();
      if (!smartSessionClient) {
        throw new Error('Missing smartSessionClient');
      }
      return await publishOps({
        ops,
        space: spaceId,
        name: 'Published entity',
        walletClient: smartSessionClient,
      });
    },
  });
}
