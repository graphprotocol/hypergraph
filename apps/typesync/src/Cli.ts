import * as Command from '@effect/cli/Command';

import { studio } from './subcommands/studio.js';

const typesync = Command.make('typesync').pipe(
  Command.withDescription(
    'Typesync command line interface for building and interacting with @graphprotocol/hypergraph schemas',
  ),
  Command.withSubcommands([studio]),
);

export const run = Command.run(typesync, {
  name: 'typesync',
  version: '0.0.0-alpha.6',
});
