'use client';

import { TypesyncHypergraphSchema } from '@graphprotocol/hypergraph/typesync';
import { mutationOptions, type UseMutationOptions, useMutation } from '@tanstack/react-query';
import { Schema } from 'effect';

const TypesyncHypergraphSchemaDecoder = Schema.decodeUnknownSync(TypesyncHypergraphSchema);

const useSyncHypergraphSchemaMutationOptions = mutationOptions({
  mutationKey: ['Hypergraph', 'Typesync', 'Studio', 'Schema', 'sync'] as const,
  async mutationFn(variables: TypesyncHypergraphSchema) {
    try {
      const response = await fetch('http://localhost:3000/api/v1/schema/sync', {
        method: 'POST',
        body: JSON.stringify(variables),
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
});

export function useSyncHypergraphSchemaMutation(
  options: Omit<
    UseMutationOptions<TypesyncHypergraphSchema, Error, TypesyncHypergraphSchema, unknown>,
    'mutationKey' | 'mutationFn'
  > = {},
) {
  return useMutation({
    ...useSyncHypergraphSchemaMutationOptions,
    ...options,
  });
}
