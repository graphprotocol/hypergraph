import { Id } from '@graphprotocol/grc-20';
import { Entity, Type } from '@graphprotocol/hypergraph';
import { describe, expectTypeOf, it } from 'vitest';
import type { useEntities } from '../src/hooks/use-entities.js';
import type { useEntity } from '../src/hooks/use-entity.js';

const Example = Entity.Schema(
  {
    title: Type.String,
  },
  {
    types: [Id('2f60810453e241bc9efd9e0fc984d02e')],
    properties: {
      title: Id('7f52b98b6d7d4131b5d8fd2b2cf597a5'),
    },
  },
);

describe('spaceIds type inference for React hooks', () => {
  it('includes spaceIds for useEntity when includeSpaceIds is true', () => {
    type Result = ReturnType<typeof useEntity<typeof Example, true, 'public'>>;
    expectTypeOf<Result['data']>().toMatchTypeOf<(Entity.Entity<typeof Example> & { spaceIds: string[] }) | null>();
  });

  it('omits spaceIds for useEntity by default', () => {
    type Result = ReturnType<typeof useEntity<typeof Example, false, 'public'>>;
    expectTypeOf<Result['data']>().toMatchTypeOf<Entity.Entity<typeof Example> | null>();
    expectTypeOf<Result['data']>().not.toMatchTypeOf<Entity.Entity<typeof Example> & { spaceIds: string[] }>();
  });

  it('includes spaceIds for useEntities when includeSpaceIds is true', () => {
    type Result = ReturnType<typeof useEntities<typeof Example, true, 'public'>>;
    expectTypeOf<Result['data'][number]>().toMatchTypeOf<Entity.Entity<typeof Example> & { spaceIds: string[] }>();
  });

  it('omits spaceIds for useEntities by default', () => {
    type Result = ReturnType<typeof useEntities<typeof Example, false, 'public'>>;
    expectTypeOf<Result['data'][number]>().toMatchTypeOf<Entity.Entity<typeof Example>>();
    expectTypeOf<Result['data'][number]>().not.toMatchTypeOf<Entity.Entity<typeof Example> & { spaceIds: string[] }>();
  });
});
