import type { Entity } from '@graphprotocol/hypergraph';
import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import { useHypergraphApp } from '../HypergraphAppContext.js';
import { preparePublish } from '../prepare-publish.js';
import { publishOps } from '../publish-ops.js';
import type { OmitStrict } from '../types.js';

type Variables<S extends Entity.AnyNoContext> = {
  entity: Entity.Entity<S>;
  spaceId: string;
};

type UsePublishToSpaceOptions<S extends Entity.AnyNoContext> = OmitStrict<
  UseMutationOptions<Awaited<ReturnType<typeof publishOps>>, Error, Variables<S>, unknown>,
  'mutationFn' | 'mutationKey'
>;

export function usePublishToPublicSpace<const S extends Entity.AnyNoContext>(
  options: UsePublishToSpaceOptions<S> = {},
) {
  const { getSmartSessionClient } = useHypergraphApp();

  return useMutation({
    ...options,
    mutationFn: async ({ entity, spaceId }) => {
      const { ops } = await preparePublish<S>({
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
