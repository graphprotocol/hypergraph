import * as Schema from 'effect/Schema';
import { Field } from '../entity/entity.js';
import type { AnyNoContext, EntityWithRelation } from '../entity/types.js';

export const Text = Schema.String;
// biome-ignore lint/suspicious/noShadowRestrictedNames: is part of a namespaces module and therefor ok
export const Number = Schema.Number;
export const Checkbox = Schema.Boolean;
// biome-ignore lint/suspicious/noShadowRestrictedNames: is part of a namespaces module and therefor ok
export const Date = Schema.Date;
export const Url = Schema.URL;
export const Point = Schema.transform(Schema.String, Schema.Array(Number), {
  strict: true,
  decode: (str: string) => {
    return str.split(',').map((n: string) => globalThis.Number(n));
  },
  encode: (points: readonly number[]) => points.join(','),
});

export const Relation = <S extends AnyNoContext>(schema: S) =>
  Field({
    select: Schema.Array(schema) as unknown as Schema.Schema<ReadonlyArray<EntityWithRelation<S>>>,
    insert: Schema.optional(Schema.Array(Schema.String)),
    update: Schema.Undefined,
  });
