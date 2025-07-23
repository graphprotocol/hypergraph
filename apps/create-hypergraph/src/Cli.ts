import { execSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Command, Prompt } from '@effect/cli';
import { FileSystem, Path } from '@effect/platform';
import type { PlatformError } from '@effect/platform/Error';
import { NodeFileSystem } from '@effect/platform-node';
import { Ansi, AnsiDoc } from '@effect/printer-ansi';
import { Cause, Data, Effect, Array as EffectArray, String as EffectString, Schema } from 'effect';
import type { NonEmptyReadonlyArray } from 'effect/Array';

import * as Utils from './Utils.js';

const appNamePrompt = Prompt.text({
  message: 'What is your app named?',
  default: 'my-hypergraph-app',
  validate(value) {
    return Utils.validateProjectName(value);
  },
});

const AvailableFrameworkKey = Schema.Union(Schema.Literal('vite-react'));
type AvailableFrameworkKey = typeof AvailableFrameworkKey.Type;

const Framework = Schema.Record({
  key: AvailableFrameworkKey,
  value: Schema.Struct({
    directory: Schema.NonEmptyTrimmedString,
    skipDirectories: Schema.Set(Schema.NonEmptyTrimmedString),
  }),
});
type Framework = typeof Framework.Type;

const availableFrameworks = {
  'vite-react': {
    directory: 'template-vite-react',
    skipDirectories: new Set([...Utils.ALWAYS_SKIP_DIRECTORIES, '.tanstack', 'dist']),
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
  active: 'Yes',
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
          return yield* Effect.logError(
            AnsiDoc.vsep([
              AnsiDoc.text('The selected directory is not empty.').pipe(AnsiDoc.annotate(Ansi.red)),
              AnsiDoc.text(`Please choose an empty directory, or clean ${targetDirectory}`),
            ]),
          );
        }
      } else {
        // create the target directory
        yield* fs.makeDirectory(targetDirectory, { recursive: true });
      }

      yield* Effect.logInfo(AnsiDoc.text(`Scaffolding Hypergraph app ${appName} with template ${template}`));

      // retrieve template directory based on selected template
      const __filename = import.meta.filename;
      const __dirname = path.dirname(fileURLToPath(import.meta.url));

      const templateDir = EffectString.endsWith('Cli.ts')(__filename)
        ? // running locally
          path.resolve(__dirname, '..', '..', framework.directory)
        : // running the published version
          path.resolve(__dirname, framework.directory);
      const templatDirExists = yield* fs.exists(templateDir);
      if (!templatDirExists) {
        return yield* Effect.logError(
          AnsiDoc.text(`Selected template ${template} does not exist`).pipe(AnsiDoc.annotate(Ansi.red)),
        );
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
          yield* fs.makeDirectory(dest, { recursive: true });
          const entries = readdirSync(src, { withFileTypes: true });

          for (const entry of entries) {
            // Skip the node_modules, .tanstack, dist, and .git directories
            if (entry.isDirectory() && framework.skipDirectories.has(entry.name)) continue;

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
            execSync('git init -q', {
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
            execSync('git commit -q -m "Initial commit - Scaffold Hypergraph app"', {
              stdio: 'inherit',
              cwd: targetDirectory,
            });
          },
          catch: (err) => new InitializeGitRepoError({ cause: err }),
        });
      });

      return yield* copyTemplate(templateDir, targetDirectory).pipe(
        Effect.tapErrorCause((cause) =>
          Effect.logError(
            'Failure copying the template directory files into your target directory',
            Cause.pretty(cause),
          ),
        ),
        Effect.andThen(() => updatePackageJson(targetDirectory)),
        // Initialize the git repo if user selected to
        Effect.andThen(() => Effect.when(initializeGit, () => initializeGitRepo)),
        Effect.tapErrorCause((cause) =>
          Effect.logError('Failure initializing the git repository', Cause.pretty(cause)),
        ),
        // Install the deps with the selected package manager if user selected to
        Effect.andThen(() => Effect.when(installDepsInScaffoldedApp, () => installDeps)),
        Effect.tapErrorCause((cause) =>
          Effect.logError(`Failure installing deps with ${pkgMananger}`, Cause.pretty(cause)),
        ),
        // success. inform user
        Effect.andThen(() =>
          Effect.logInfo(
            AnsiDoc.text(`🎉 Successfully scaffolded your hypergraph enabled app ${appName}!`),
            AnsiDoc.hardLine,
            AnsiDoc.text('To start the app, run:'),
            AnsiDoc.hardLine,
            AnsiDoc.text(`cd ${appName}`),
            installDeps ? AnsiDoc.hardLine : AnsiDoc.text(`${pkgMananger} install`),
            AnsiDoc.hardLine,
            AnsiDoc.text(`${pkgMananger} run dev`),
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
  version: '0.0.0-alpha.2',
});

class InitializeGitRepoError extends Data.TaggedError(
  'Hypergraph/create-hypergraph-app/errors/InitializeGitRepoError',
)<{
  readonly cause: unknown;
}> {}
class InstallDepsError extends Data.TaggedError('Hypergraph/create-hypergraph-app/errors/InstallDepsError')<{
  readonly cause: unknown;
}> {}
