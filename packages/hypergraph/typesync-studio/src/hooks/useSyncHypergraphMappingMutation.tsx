'use client';

import { Mapping, Typesync } from '@graphprotocol/hypergraph';
import { publishOps, useHypergraphApp } from '@graphprotocol/hypergraph-react';
import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import { Schema } from 'effect';

const TypesyncHypergraphSchemaDecoder = Schema.decodeUnknownSync(Typesync.TypesyncHypergraphSchema);

export const UseSyncHypergraphMappingMutationVariables = Schema.Struct({
  schema: Typesync.TypesyncHypergraphSchema,
  space: Schema.UUID,
});
export type UseSyncHypergraphMappingMutationVariables = typeof UseSyncHypergraphMappingMutationVariables.Type;

export function useSyncHypergraphMappingMutation(
  options: Omit<
    UseMutationOptions<Typesync.TypesyncHypergraphSchema, Error, UseSyncHypergraphMappingMutationVariables, unknown>,
    'mutationKey' | 'mutationFn'
  > = {},
) {
  const { getSmartSessionClient } = useHypergraphApp();

  return useMutation({
    mutationKey: ['Hypergraph', 'Typesync', 'Studio', 'Mapping', 'sync'] as const,
    async mutationFn(variables: UseSyncHypergraphMappingMutationVariables) {
      try {
        // Smart session client is required to publish the ops
        const smartSessionClient = await getSmartSessionClient();
        if (!smartSessionClient) {
          throw new Error('Missing smartSessionClient');
        }

        // 1. Publish the schema changes to the Knowledge Graph
        //    a. generate the updated mapping from the updated schema def. returns the Ops of the types/properties to publish to the KG
        const [mapping, ops] = Mapping.generateMapping(variables.schema);
        //    b. publish these ops to the KG
        await publishOps({
          ops: ops.map((op) => op),
          space: variables.space,
          name: 'Schema Publish updates',
          walletClient: smartSessionClient,
        });

        // 2. Publish the updated mapping to the mapping.ts file in the users repo.
        //    -> this returns an updated instance of the `TypesyncHypergraphSchema` with hydrated `knowledgeGraphId` from the updated mapping
        const response = await fetch('http://localhost:3000/api/v1/mapping/sync', {
          method: 'POST',
          // endpoint expects the Schema and the updated Mapping
          body: JSON.stringify({
            schema: variables.schema,
            mapping,
          }),
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        });
        if (response.status !== 200) {
          throw new Error(`Failure posting Typesync Hypergraph Schema [${response.status}]`);
        }

        const json = await response.json();

        return TypesyncHypergraphSchemaDecoder(json);
      } catch (err) {
        console.error('Failure syncing Typesync Hypergraph Schema to schema.ts file', { err });
        throw err;
      }
    },
    ...options,
  });
}
