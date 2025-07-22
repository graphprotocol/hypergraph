import { Command, Options, Span } from '@effect/cli';
import { descriptionList } from '@effect/cli/HelpDoc';
import { Console, Effect, Option, Schema } from 'effect';

const AvailableFrameworkKey = Schema.Union(Schema.Literal('vite-react'));
type AvailableFrameworkKey = typeof AvailableFrameworkKey.Type;

const Framework = Schema.Record({
  key: AvailableFrameworkKey,
  value: Schema.Struct({
    directory: Schema.NonEmptyTrimmedString,
  }),
});
type Framework = typeof Framework.Type;

const availableFrameworks = {
  'vite-react': {
    directory: 'template-vite-react',
  },
} as const satisfies Framework;

const createHypergraphApp = Command.make('create-hypergraph-app', {
  args: {
    template: Options.choice('template', Object.keys(availableFrameworks) as ReadonlyArray<AvailableFrameworkKey>).pipe(
      Options.withAlias('t'),
      Options.withDescription('The template to scaffold'),
      Options.optional,
      Options.withDefault(Option.some<AvailableFrameworkKey>('vite-react')),
      Options.map((templOpt) =>
        Option.getOrElse<AvailableFrameworkKey, AvailableFrameworkKey>(templOpt, () => 'vite-react'),
      ),
    ),
  },
}).pipe(
  Command.withDescription(descriptionList([[]])),
  Command.withHandler(({ args }) =>
    Effect.gen(function* () {
      const template = args.template;

      return yield* Console.log('selected template', { template });
    }),
  ),
);

export const run = Command.run(createHypergraphApp, {
  name: 'create-hypergraph-app',
  version: '0.0.1',
});
