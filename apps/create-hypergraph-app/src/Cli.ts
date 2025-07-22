import { execSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Command, Prompt } from '@effect/cli';
import { FileSystem, Path } from '@effect/platform';
import type { PlatformError } from '@effect/platform/Error';
import { NodeFileSystem } from '@effect/platform-node';
import { Cause, Console, Data, Effect, Array as EffectArray, String as EffectString, Schema } from 'effect';
import type { NonEmptyReadonlyArray } from 'effect/Array';

import * as Utils from './Utils.js';

const appNamePrompt = Prompt.text({
  message: 'What is your app named?',
  default: 'my-hypergraph-app',
});

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

const PackageManager = Schema.Literal('pnpm', 'bun', 'yarn', 'npm');
type PackageManager = typeof PackageManager.Type;
const packageManangerPrompt = Prompt.select({
  message: 'What package manager do you want to use?',
  choices: [
    { title: 'pnpm', value: 'pnpm' },
    { title: 'bun', value: 'bun' },
    { title: 'yarn', value: 'yarn' },
    { title: 'npm', value: 'npm' },
  ] as NonEmptyReadonlyArray<Prompt.Prompt.SelectChoice<PackageManager>>,
});
const installDepsPropmpt = Prompt.toggle({
  message: 'Do you want us to install deps?',
  active: 'Yes',
  inactive: 'No',
  initial: false,
});

const initializeGitRepoPrompt = Prompt.toggle({
  message: 'Initialize a git repository?',
  active: 'Tes',
  inactive: 'No',
  initial: true,
});

const prompts = Prompt.all([
  appNamePrompt,
  templatePrompt,
  packageManangerPrompt,
  installDepsPropmpt,
  initializeGitRepoPrompt,
]);

const createHypergraphApp = Command.prompt(
  'create-hypergraph-app',
  prompts,
  ([appName, template, pkgMananger, installDeps, initializeGitRepo]) =>
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

      yield* Console.log(`Scaffolding ${template} hypergraph app in ${targetDirectory}...`);

      // retrieve template directory based on selected template
      const templateDir = path.resolve(fileURLToPath(import.meta.url), '..', '..', framework.directory);
      const templatDirExists = yield* fs.exists(templateDir);
      if (!templatDirExists) {
        return yield* Console.error('Selected template does not exist');
      }

      /**
       * Updates the name of the template package.json to the user-entered name in the prompt
       */
      function updatePackageJson(directory: string) {
        return Effect.gen(function* () {
          const packageJsonPath = path.join(directory, 'package.json');
          // read the cloned package.json
          const packageJson = yield* fs.readFileString(packageJsonPath).pipe(Effect.map(JSON.parse));

          const validatedPackageName = Utils.validatePackageName(appName);
          const name = validatedPackageName.normalizedName;
          // update the name and description
          packageJson.name = name;

          // rewrite file
          yield* fs.writeFileString(packageJsonPath, JSON.stringify(packageJson, null, 2));
        });
      }

      function copyTemplate(src: string, dest: string): Effect.Effect<void, PlatformError> {
        return Effect.gen(function* () {
          const skipDir = new Set(['node_modules', '.tanstack', 'dist']);

          yield* fs.makeDirectory(dest, { recursive: true });
          const entries = readdirSync(src, { withFileTypes: true });

          for (const entry of entries) {
            // Skip .git directory
            if (EffectString.startsWith('.git')(entry.name)) continue;
            // Skip the node_modules, .tanstack and dist directories
            if (entry.isDirectory() && skipDir.has(entry.name)) continue;

            const srcPath = path.join(src, entry.name);
            const destPath = path.join(dest, entry.name);

            if (entry.isDirectory()) {
              yield* copyTemplate(srcPath, destPath);
            } else {
              yield* fs.copyFile(srcPath, destPath);
            }
          }
        });
      }

      const installDepsInScaffoldedApp = Effect.async<void, InstallDepsError>((resume) => {
        try {
          execSync(`${pkgMananger} install`, {
            stdio: 'inherit',
            cwd: targetDirectory,
          });
          return resume(Effect.void);
        } catch (err) {
          return resume(Effect.fail(new InstallDepsError({ cause: err })));
        }
      });

      const initializeGit = Effect.gen(function* () {
        yield* Effect.try({
          try: () => {
            execSync('git init', {
              stdio: 'inherit',
              cwd: targetDirectory,
            });
          },
          catch: (err) => new InitializeGitRepoError({ cause: err }),
        });

        yield* Effect.try({
          try: () => {
            execSync('git add .', {
              stdio: 'inherit',
              cwd: targetDirectory,
            });
          },
          catch: (err) => new InitializeGitRepoError({ cause: err }),
        });

        yield* Effect.try({
          try: () => {
            execSync('git commit -m "Initial commit - Scaffold Hypergraph app"', {
              stdio: 'inherit',
              cwd: targetDirectory,
            });
          },
          catch: (err) => new InitializeGitRepoError({ cause: err }),
        });
      });

      return yield* copyTemplate(templateDir, targetDirectory).pipe(
        Effect.tapErrorCause((cause) =>
          Console.error('Failure copying the template directory files into your target directory', Cause.pretty(cause)),
        ),
        Effect.andThen(() => updatePackageJson(targetDirectory)),
        // Initialize the git repo if user selected to
        Effect.andThen(() => Effect.when(initializeGit, () => initializeGitRepo)),
        Effect.tapErrorCause((cause) => Console.error('Failure initializing the git repository', Cause.pretty(cause))),
        // Install the deps with the selected package manager if user selected to
        Effect.andThen(() => Effect.when(installDepsInScaffoldedApp, () => installDeps)),
        Effect.tapErrorCause((cause) =>
          Console.error(`Failure installing deps with ${pkgMananger}`, Cause.pretty(cause)),
        ),
        // success. inform user
        Effect.andThen(() =>
          Console.log(
            `🎉 Successfully scaffolded your hypergraph enabled app ${appName}!`,
            '\r\n',
            'To start the app, run:',
            '\r\n',
            `cd ${appName}`,
            installDeps ? '\r\n' : `\r\n${pkgMananger} install`,
            '\r\n',
            `${pkgMananger} run dev`,
          ),
        ),
      );
    }),
).pipe(
  Command.withDescription('Command line interface to scaffold a Hypergraph-enabled application'),
  Command.provide(NodeFileSystem.layer),
);

export const run = Command.run(createHypergraphApp, {
  name: 'create-hypergraph-app',
  version: '0.0.1',
});

class InitializeGitRepoError extends Data.TaggedError(
  'Hypergraph/create-hypergraph-app/errors/InitializeGitRepoError',
)<{
  readonly cause: unknown;
}> {}
class InstallDepsError extends Data.TaggedError('Hypergraph/create-hypergraph-app/errors/InstallDepsError')<{
  readonly cause: unknown;
}> {}
