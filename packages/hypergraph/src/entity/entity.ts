import * as Data from 'effect/Data';
import type { AnyNoContext } from './types.js';
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

export { Class, Field };

export class EntityNotFoundError extends Data.TaggedError('EntityNotFoundError')<{
  id: string;
  type: AnyNoContext;
  cause?: unknown;
}> {}
