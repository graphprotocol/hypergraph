import { execSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Args, Command, HelpDoc, Options, Prompt } from '@effect/cli';
import { FileSystem, Path } from '@effect/platform';
import type { PlatformError } from '@effect/platform/Error';
import { NodeFileSystem } from '@effect/platform-node';
import { Ansi, AnsiDoc } from '@effect/printer-ansi';
import { Cause, Data, Effect, Array as EffectArray, Option } from 'effect';

import * as Domain from './Domain.js';
import * as Utils from './Utils.js';

// ========================
// Command Config
// ========================

const appName = Args.directory({ name: 'app-name', exists: 'no' }).pipe(
  Args.withDescription(
    'What is your app named? Will also be the folder where your Hypergraph app will be scaffolded in to',
  ),
  Args.mapEffect(Utils.validateProjectName),
  Args.mapEffect((name) => Effect.map(Path.Path, (path) => path.resolve(name))),
  Args.optional,
);

const template = Options.choice('template', Domain.availableFrameworkKeys).pipe(
  Options.withAlias('t'),
  Options.withDescription('Template to scaffold'),
  Options.optional,
);

const packageManager = Options.choice('package-manager', Domain.PackageManager).pipe(
  Options.withAlias('p'),
  Options.withDescription('The package manager to use to install deps (if selected)'),
  Options.optional,
);

const skipInstallDeps = Options.boolean('skip-install-deps').pipe(
  Options.withDescription('If flag is provided, the deps will not be installed with the given package manager'),
  Options.withDefault(false),
);

const skipInitializeGit = Options.boolean('skip-initialize-git').pipe(
  Options.withDescription('If flag is provided, git will not be initialized in the scaffolded app'),
  Options.withDefault(false),
);

interface RawConfig {
  readonly appName: Option.Option<string>;
  readonly template: Option.Option<Domain.AvailableFrameworkKey>;
  readonly packageManager: Option.Option<Domain.PackageManager>;
  readonly skipInstallDeps: boolean;
  readonly skipInitializeGit: boolean;
}
interface ResolvedConfig {
  readonly appName: string;
  readonly template: Domain.AvailableFrameworkKey;
  readonly packageManager: Domain.PackageManager;
  readonly skipInstallDeps: boolean;
  readonly skipInitializeGit: boolean;
}

const createHypergraphApp = Command.make('create-hypergraph-app', {
  appName,
  template,
  packageManager,
  skipInstallDeps,
  skipInitializeGit,
}).pipe(
  Command.withDescription('Command line interface to scaffold a Hypergraph-enabled application'),
  Command.provide(NodeFileSystem.layer),
  Command.withHandler(handleCommand),
);

export const run = Command.run(createHypergraphApp, {
  name: 'create-hypergraph-app',
  version: '0.4.4',
});

// ========================
// Command Handler
// ========================

function handleCommand(config: Readonly<RawConfig>) {
  return Effect.all({
    appName: resolveAppName(config),
    template: resolveTemplate(config),
    packageManager: resolvePackageManager(config),
    skipInstallDeps: Effect.succeed(config.skipInstallDeps),
    skipInitializeGit: Effect.succeed(config.skipInitializeGit),
  }).pipe(Effect.flatMap(scaffoldHypergraphApp));
}

function scaffoldHypergraphApp(config: Readonly<ResolvedConfig>) {
  return Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;

    const appname = path.basename(config.appName);
    const framework = Domain.availableFrameworks[config.template];

    // check if directory already exists, if exists, and is not empty, throw an error
    const targetDirectory = config.appName;
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

    yield* Effect.logInfo(
      AnsiDoc.text(`Scaffolding Hypergraph app ${path.basename(config.appName)} with template ${config.template}`),
    );

    // retrieve template directory based on selected template
    const __dirname = path.dirname(fileURLToPath(import.meta.url));

    const isDev = process.env.NODE_ENV === 'development' || __dirname.includes('/src/');
    const templateDir = isDev
      ? path.resolve(__dirname, '..', framework.directory)
      : path.resolve(__dirname, framework.directory);
    const templatDirExists = yield* fs.exists(templateDir);
    if (!templatDirExists) {
      return yield* Effect.logError(
        AnsiDoc.text(`Selected template ${config.template} does not exist`).pipe(AnsiDoc.annotate(Ansi.red)),
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

        const validatedPackageName = Utils.validatePackageName(appname);
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

          // Check if the file needs to be renamed (it has an entry in the Utils.renameFileDict)
          const maybeRename = Utils.renameFileDict[entry.name];
          const entryname = entry.isFile() && maybeRename != null ? maybeRename : entry.name;

          const destPath = path.join(dest, entryname);

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
        execSync(`${config.packageManager} install`, {
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
        Effect.logError('Failure copying the template directory files into your target directory', Cause.pretty(cause)),
      ),
      Effect.andThen(() => updatePackageJson(targetDirectory)),
      // Initialize the git repo if user selected to
      Effect.andThen(() => Effect.when(initializeGit, () => !config.skipInitializeGit)),
      Effect.tapErrorCause((cause) => Effect.logError('Failure initializing the git repository', Cause.pretty(cause))),
      // Install the deps with the selected package manager if user selected to
      Effect.andThen(() => Effect.when(installDepsInScaffoldedApp, () => !config.skipInstallDeps)),
      Effect.tapErrorCause((cause) =>
        Effect.logError(`Failure installing deps with ${config.packageManager}`, Cause.pretty(cause)),
      ),
      // success. inform user
      Effect.andThen(() =>
        Effect.logInfo(
          AnsiDoc.text(`🎉 Successfully scaffolded your hypergraph enabled app ${appname}!`),
          AnsiDoc.hardLine,
          AnsiDoc.text('To start the app, run:'),
          AnsiDoc.text(`cd ${appname}`),
          config.skipInstallDeps ? AnsiDoc.text(`${config.packageManager} install`) : AnsiDoc.hardLine,
          AnsiDoc.text(`${config.packageManager} run dev`),
        ),
      ),
    );
  });
}

// ========================
// Command choices resolution
// ========================

/**
 * Resolves the app name from either: the passed in arg to the command, _or_ by prompting the user
 */
function resolveAppName(config: Readonly<RawConfig>) {
  return Option.match(config.appName, {
    onSome(name) {
      return Effect.succeed(name);
    },
    onNone() {
      // user did not pass in the app name as an arg. fetch from a prompt
      return Prompt.text({
        message: 'What is your app named?',
        default: 'my-hypergraph-app',
        validate(value) {
          return Utils.validateProjectName(value).pipe(Effect.mapError((doc) => HelpDoc.toAnsiText(doc)));
        },
      }).pipe(Effect.flatMap((name) => Path.Path.pipe(Effect.map((path) => path.resolve(name)))));
    },
  });
}
/**
 * Resolves the template from either: the passed in --template option to the command, _or_ by prompting the user
 */
function resolveTemplate(config: Readonly<RawConfig>) {
  return Option.match(config.template, {
    onSome(template) {
      return Effect.succeed(template);
    },
    onNone() {
      return Prompt.select<Domain.AvailableFrameworkKey>({
        message: 'Choose your template',
        choices: [
          {
            title: 'Vite + React',
            value: 'vite-react',
            description: 'Scaffolds a vite + react app using @tanstack/react-router',
          },
          {
            title: 'Nextjs',
            value: 'nextjs',
            description: 'Scaffolds a nextjs app',
          },
        ],
      }).pipe(Effect.map((selected) => selected));
    },
  });
}
/**
 * Resolves the package manager from either: the passed in --package-manager option to the command, _or_ by prompting the user
 */
function resolvePackageManager(config: Readonly<RawConfig>) {
  return Option.match(config.packageManager, {
    onSome(pkg) {
      return Effect.succeed(pkg);
    },
    onNone() {
      return Prompt.select<Domain.PackageManager>({
        message: 'What package manager do you want to use?',
        choices: [
          { title: 'pnpm', value: 'pnpm' },
          { title: 'bun', value: 'bun' },
          { title: 'yarn', value: 'yarn' },
          { title: 'npm', value: 'npm' },
        ],
      }).pipe(Effect.map((selected) => selected));
    },
  });
}

class InitializeGitRepoError extends Data.TaggedError(
  'Hypergraph/create-hypergraph-app/errors/InitializeGitRepoError',
)<{
  readonly cause: unknown;
}> {}
class InstallDepsError extends Data.TaggedError('Hypergraph/create-hypergraph-app/errors/InstallDepsError')<{
  readonly cause: unknown;
}> {}
