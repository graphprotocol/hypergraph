import { readdirSync } from 'node:fs';
import type { PlatformError } from '@effect/platform/Error';
import * as FileSystem from '@effect/platform/FileSystem';
import * as Path from '@effect/platform/Path';
import * as NodeFileSystem from '@effect/platform-node/NodeFileSystem';
import * as NodePath from '@effect/platform-node/NodePath';
import { Cause, Chunk, Console, Data, Effect, pipe, Stream } from 'effect';

const workspaceDepsToReplace = {
  '@graphprotocol/hypergraph': {
    packageJson: 'packages/hypergraph/package.json',
  },
  '@graphprotocol/hypergraph-react': {
    packageJson: 'packages/hypergraph-react/package.json',
  },
} as const satisfies Record<
  '@graphprotocol/hypergraph' | '@graphprotocol/hypergraph-react',
  { packageJson: `packages/${string}/package.json` }
>;
const ignore = new Set(['.git', 'node_modules', '.tanstack', 'dist', 'publish', 'build', '.next']);

class CopyTemplateDirService extends Effect.Service<CopyTemplateDirService>()(
  '/Hypergraph/create-hypergraph/services/CopyTemplateDirService',
  {
    dependencies: [NodeFileSystem.layer, NodePath.layer],
    effect: Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;

      const cwd = process.cwd();
      const appsDir = path.join(cwd, '..', '..', 'apps');

      const getTemplateDirectories = () =>
        Effect.gen(function* () {
          return yield* Stream.fromIterable(readdirSync(appsDir, { withFileTypes: true })).pipe(
            Stream.filter((entry) => entry.name.startsWith('template-') && entry.isDirectory()),
            Stream.map((entry) => entry.name),
            Stream.runCollect,
          );
        });

      function fetchWorkspaceDepCurrentVersion(packagejson: `packages/${string}/package.json`) {
        return pipe(
          fs.readFileString(path.resolve(cwd, '..', '..', packagejson)),
          Effect.tapError((err) => Console.error('Failure reading remplate package.json', { cause: err, packagejson })),
          Effect.map((_) => JSON.parse(_)),
          Effect.map((json) => String(json.version)),
        );
      }
      function fetchAllWorkspaceDepsCurrentVersion() {
        return Stream.fromIterable(Object.entries(workspaceDepsToReplace)).pipe(
          Stream.mapEffect(([dep, { packageJson }]) =>
            Effect.gen(function* () {
              const version = yield* fetchWorkspaceDepCurrentVersion(packageJson);

              return [dep, version] as const;
            }),
          ),
          Stream.runCollect,
        );
      }

      const updatePackageJsonWorkspaceDeps = (
        packageJsonPath: string,
        destPackageJsonPath: string,
        replaced: Record<string, string>,
      ) =>
        Effect.gen(function* () {
          // read the package.json
          // update the hypergraph workspace deps with the current version
          const packageJson = yield* fs.readFileString(packageJsonPath).pipe(Effect.map(JSON.parse));

          packageJson.dependencies = {
            ...packageJson.dependencies,
            ...replaced,
          };

          yield* fs.writeFileString(destPackageJsonPath, JSON.stringify(packageJson, null, 2));
        });

      const copy = (src: string, dest: string, replaced: Record<string, string>): Effect.Effect<void, PlatformError> =>
        Effect.gen(function* () {
          yield* fs.makeDirectory(dest, { recursive: true });
          const entries = readdirSync(src, { withFileTypes: true });

          for (const entry of entries) {
            if (entry.isDirectory() && ignore.has(entry.name)) continue;

            const srcPath = path.join(src, entry.name);
            const destPath = path.join(dest, entry.name);

            if (entry.isDirectory()) {
              yield* copy(srcPath, destPath, replaced);
            } else {
              // update the package.json
              if (entry.name === 'package.json') {
                yield* updatePackageJsonWorkspaceDeps(srcPath, destPath, replaced);
                continue;
              }
              yield* fs.copyFile(srcPath, destPath);
            }
          }
        });

      return {
        copyTemplates() {
          return Effect.gen(function* () {
            const workspaceDeps = yield* fetchAllWorkspaceDepsCurrentVersion();
            const workspaceDepsMap = Chunk.reduce(
              workspaceDeps,
              {} as Record<string, string>,
              (map, [currDep, currVersion]) => {
                map[currDep] = currVersion;

                return map;
              },
            );

            // iterate through all templates, copy all files, update package.json deps
            yield* Stream.fromIterableEffect(getTemplateDirectories())
              .pipe(
                Stream.runForEach((template) =>
                  Effect.gen(function* () {
                    yield* Console.info('Copying template:', template, 'into dist');

                    const templateDir = path.resolve(appsDir, template);
                    const templateDirExists = yield* fs.exists(templateDir);
                    if (!templateDirExists) {
                      throw new TemplateDirDoesNotExistError({ template: templateDir });
                    }

                    const templateDestDir = path.resolve(process.cwd(), 'dist', template);

                    yield* copy(templateDir, templateDestDir, workspaceDepsMap);
                  }),
                ),
              )
              .pipe(
                Effect.tapErrorCause((cause) =>
                  Console.error('Failure copying template to dist', { cause: Cause.pretty(cause) }),
                ),
                Effect.andThen(() => Console.info('Completed copying template directories to dist with updated deps')),
              );
          });
        },
      } as const;
    }),
  },
) {}

class TemplateDirDoesNotExistError extends Data.TaggedError(
  'Hypergraph/create-hypergraph/errors/TemplateDirDoesNotExistError',
)<{
  readonly template: string;
}> {}

const program = pipe(
  Console.log('Copying templates to dist dir'),
  () =>
    Effect.gen(function* () {
      const copy = yield* CopyTemplateDirService;

      yield* copy.copyTemplates();
    }),
  Effect.provide(CopyTemplateDirService.Default),
);

Effect.runPromise(program);
