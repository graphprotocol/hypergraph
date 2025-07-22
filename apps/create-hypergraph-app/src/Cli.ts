import { Command, Prompt } from '@effect/cli';
import { FileSystem, Path } from '@effect/platform';
import { NodeFileSystem } from '@effect/platform-node';
import { Console, Data, Effect, Array as EffectArray, Schema } from 'effect';
import type { NonEmptyReadonlyArray } from 'effect/Array';

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

const appNamePrompt = Prompt.text({
  message: 'What is your app named?',
  default: 'my-hypergraph-app',
});
const templatePrompt = Prompt.select({
  message: 'Choose your template',
  choices: [
    {
      title: 'Vite + React',
      value: 'vite-react',
      description: 'Scaffolds a vite + react app using @tanstack/react-router',
    },
  ] as NonEmptyReadonlyArray<Prompt.Prompt.SelectChoice<AvailableFrameworkKey>>,
});

const prompts = Prompt.all([appNamePrompt, templatePrompt]);

const createHypergraphApp = Command.prompt('create-hypergraph-app', prompts, ([appName, template]) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;

    const framework = availableFrameworks[template];

    // check if directory already exists, if exists, and is not empty, throw an error
    const targetDirectory = path.resolve('.', appName);
    const exists = yield* fs.exists(targetDirectory);
    if (exists) {
      const targetDirRead = yield* fs.readDirectory(targetDirectory, { recursive: true });
      if (EffectArray.isNonEmptyArray(targetDirRead)) {
        return yield* Console.error('The selected directory is not empty');
      }
    } else {
      // create the target directory
      yield* fs.makeDirectory(targetDirectory, { recursive: true });
    }

    return yield* Console.log('selected template', { template, appName, targetDirectory });
  }),
).pipe(
  Command.withDescription('Command line interface to scaffold a Hypergraph-enabled application'),
  Command.provide(NodeFileSystem.layer),
);

export const run = Command.run(createHypergraphApp, {
  name: 'create-hypergraph-app',
  version: '0.0.1',
});
