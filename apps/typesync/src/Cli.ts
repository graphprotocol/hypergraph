import * as Command from '@effect/cli/Command';

import { studio } from './subcommands/studio.js';

const hypergraph = Command.make('hypergraph').pipe(
  Command.withDescription(
    'Hypergraph command line interface for building and interacting with @graphprotocol/hypergraph schemas',
  ),
  Command.withSubcommands([studio]),
);

export const run = Command.run(hypergraph, {
  name: 'hypergraph',
  version: '0.0.0-alpha',
});
