import { Id } from '@geoprotocol/geo-sdk';
import { describe, expectTypeOf, it } from 'vitest';
import type { FindManyPublicParams, findManyPublic } from '../../src/entity/find-many-public.js';
import type { FindOnePublicParams, findOnePublic } from '../../src/entity/find-one-public.js';
import * as Entity from '../../src/entity/index.js';
import type { SearchManyPublicParams, searchManyPublic } from '../../src/entity/search-many-public.js';
import * as Type from '../../src/type/type.js';

const Example = Entity.Schema(
  {
    title: Type.String,
  },
  {
    types: [Id('e3c9a9ea4a764d93bcd7bcfd277f1d43')],
    properties: {
      title: Id('2a2c8a861f6c4051868fb0f2eddd86db'),
    },
  },
);

// biome-ignore lint/suspicious/noExplicitAny: fine here
type AsyncReturnTypeWithParams<Fn extends (...args: any) => any, Params extends any[]> = Fn extends (
  ...args: Params
) => infer Result
  ? Awaited<Result>
  : never;

describe('spaceIds type inference for entity helpers', () => {
  it('adds spaceIds for findOnePublic when includeSpaceIds is true', () => {
    type Result = AsyncReturnTypeWithParams<
      typeof findOnePublic,
      [typeof Example, FindOnePublicParams<typeof Example, true>]
    >['entity'];
    expectTypeOf<Result>().toEqualTypeOf<(Entity.Entity<typeof Example> & { spaceIds: string[] }) | null>();
  });

  it('omits spaceIds for findOnePublic by default', () => {
    type Result = AsyncReturnTypeWithParams<
      typeof findOnePublic,
      [typeof Example, FindOnePublicParams<typeof Example>]
    >['entity'];
    expectTypeOf<Result>().toEqualTypeOf<Entity.Entity<typeof Example> | null>();
  });

  it('adds spaceIds for findManyPublic when includeSpaceIds is true', () => {
    type Result = AsyncReturnTypeWithParams<
      typeof findManyPublic,
      [typeof Example, FindManyPublicParams<typeof Example, true>]
    >['data'][number];
    expectTypeOf<Result>().toEqualTypeOf<Entity.Entity<typeof Example> & { spaceIds: string[] }>();
  });

  it('omits spaceIds for findManyPublic by default', () => {
    type Result = AsyncReturnTypeWithParams<
      typeof findManyPublic,
      [typeof Example, FindManyPublicParams<typeof Example>]
    >['data'][number];
    expectTypeOf<Result>().toEqualTypeOf<Entity.Entity<typeof Example>>();
  });

  it('adds spaceIds for searchManyPublic when includeSpaceIds is true', () => {
    type Result = AsyncReturnTypeWithParams<
      typeof searchManyPublic,
      [typeof Example, SearchManyPublicParams<typeof Example, true>]
    >['data'][number];
    expectTypeOf<Result>().toEqualTypeOf<Entity.Entity<typeof Example> & { spaceIds: string[] }>();
  });

  it('omits spaceIds for searchManyPublic by default', () => {
    type Result = AsyncReturnTypeWithParams<
      typeof searchManyPublic,
      [typeof Example, SearchManyPublicParams<typeof Example>]
    >['data'][number];
    expectTypeOf<Result>().toEqualTypeOf<Entity.Entity<typeof Example>>();
  });
});
