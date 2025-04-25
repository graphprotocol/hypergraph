import * as Data from 'effect/Data';
import * as Schema from 'effect/Schema';
import type { AnyNoContext, EntityWithRelation } from './types.js';
import * as VariantSchema from './variant-schema.js';

const {
  Class,
  Field,
  // FieldExcept,
  // FieldOnly,
  // Struct,
  // Union,
  // extract,
  // fieldEvolve,
  // fieldFromKey
} = VariantSchema.make({
  variants: ['select', 'insert', 'update'],
  defaultVariant: 'select',
});

export { Class };

export const Text = Schema.String;
// biome-ignore lint/suspicious/noShadowRestrictedNames: is part of a namespaces module and therefor ok
export const Number = Schema.Number;
export const Checkbox = Schema.Boolean;

export class EntityNotFoundError extends Data.TaggedError('EntityNotFoundError')<{
  id: string;
  type: AnyNoContext;
  cause?: unknown;
}> {}

export const Relation = <S extends AnyNoContext>(schema: S) =>
  Field({
    select: Schema.Array(schema) as unknown as Schema.Schema<ReadonlyArray<EntityWithRelation<S>>>,
    insert: Schema.optional(Schema.Array(Schema.String)),
    update: Schema.Undefined,
  });
