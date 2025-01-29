import * as Schema from 'effect/Schema';

export const SignatureWithRecovery = Schema.Struct({
  hex: Schema.String,
  recovery: Schema.Number,
});

export type SignatureWithRecovery = Schema.Schema.Type<typeof SignatureWithRecovery>;
