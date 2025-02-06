export { createWalletClient } from './create-wallet-client.js';
export { generateDeleteOps } from './generate-delete-ops.js';
export {
  HypergraphAppProvider,
  useHypergraphApp,
  useHypergraphAuth,
} from './HypergraphAppContext.js';
export {
  HypergraphSpaceProvider,
  useCreateEntity,
  useDeleteEntity,
  useHardDeleteEntity,
  useHypergraphSpace,
  useQueryEntities,
  useQueryEntity,
  useUpdateEntity,
} from './HypergraphSpaceContext.js';
export { useGenerateCreateOps } from './internal/use-generate-create-ops.js';
export { usePublicQuery as _useQueryPublicGeo } from './internal/use-query-public-geo.js';
export { usePublicQuery as _useQueryPublicKg } from './internal/use-query-public-kg.js';
export { publishOps } from './publish-ops.js';
export type { Mapping } from './types.js';
export { useQuery } from './use-query.js';
