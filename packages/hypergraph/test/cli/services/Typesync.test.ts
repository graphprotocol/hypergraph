import { describe, it } from '@effect/vitest';
import { Effect } from 'effect';

import { TypesyncSchemaStreamBuilder } from '../../../src/cli/services/Typesync.js';

describe('TypesyncSchemaStreamBuilder', () => {
  it.effect('Should return a stream of the parsed Schema from the given schema.ts and mapping.ts files', ({ expect }) =>
    Effect.gen(function* () {}),
  );
});
