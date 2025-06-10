import type { Id as Grc20Id } from '@graphprotocol/grc-20';

/**
 * Mappings for a schema type and its properties/relations
 *
 * @since 0.0.1
 */
export type MappingEntry = {
  /**
   * Array of the `Id.Id` of the type in the Knowledge Graph.
   * Is an array because a type can belong to multiple spaces/extend multiple types.
   *
   * @since 0.0.1
   */
  typeIds: Array<Grc20Id.Id>;
  /**
   * Record of property names to the `Id.Id` of the type in the Knowledge Graph
   *
   * @since 0.0.1
   */
  properties?: {
    [key: string]: Grc20Id.Id;
  };
  /**
   * Record of schema type relation names to the `Id.Id` of the relation in the Knowledge Graph
   *
   * @since 0.0.1
   */
  relations?: {
    [key: string]: Grc20Id.Id;
  };
};

/**
 * @example
 * ```ts
 * import { Id } from '@graphprotocol/grc-20'
 * import type { Mapping } from '@graphprotocol/typesync'
 *
 * const mapping: Mapping = {
 *   Account: {
 *     typeIds: [Id.Id('a5fd07b1-120f-46c6-b46f-387ef98396a6')],
 *     properties: {
 *       username: Id.Id('994edcff-6996-4a77-9797-a13e5e3efad8'),
 *       createdAt: Id.Id('64bfba51-a69b-4746-be4b-213214a879fe')
 *     }
 *   },
 *   Event: {
 *     typeIds: [Id.Id('0349187b-526f-435f-b2bb-9e9caf23127a')],
 *     properties: {
 *       name: Id.Id('3808e060-fb4a-4d08-8069-35b8c8a1902b'),
 *       description: Id.Id('1f0d9007-8da2-4b28-ab9f-3bc0709f4837'),
 *     },
 *     relations: {
 *       account: Id.Id('a5fd07b1-120f-46c6-b46f-387ef98396a6')
 *     }
 *   }
 * }
 * ```
 *
 * @since 0.0.1
 */
export type Mapping = {
  [key: string]: MappingEntry;
};
