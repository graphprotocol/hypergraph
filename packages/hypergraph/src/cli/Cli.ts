import * as Command from '@effect/cli/Command';

import { typesync } from './subcommands/typesync.js';

const hypergraph = Command.make('hypergraph').pipe(
  Command.withDescription(
    'Hypergraph command line interface for building and interacting with @graphprotocol/hypergraph schemas',
  ),
  Command.withSubcommands([typesync]),
);

export const run = Command.run(hypergraph, {
  name: 'hypergraph',
  version: '0.3.0',
});
