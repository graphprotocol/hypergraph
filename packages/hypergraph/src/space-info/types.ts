import * as Schema from 'effect/Schema';

export const SpaceInfoContent = Schema.Struct({
  name: Schema.String,
});

export type SpaceInfoContent = Schema.Schema.Type<typeof SpaceInfoContent>;
