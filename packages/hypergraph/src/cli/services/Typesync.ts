import { FileSystem, Path } from '@effect/platform';
import { NodeFileSystem } from '@effect/platform-node';
import { AnsiDoc } from '@effect/printer-ansi';
import { Cause, Data, Effect, Array as EffectArray, Option, Stream } from 'effect';
import type { NonEmptyReadonlyArray } from 'effect/Array';
import type { Schema as HypergraphSchema, Mapping } from '../../mapping/Mapping.js';
import { parseSchema } from './schema-parser.js';

/**
 * @internal
 *
 * Runtime check to see if a value looks like a Mapping
 */
function isMappingLike(value: unknown): value is Mapping {
  if (!value || typeof value !== 'object') return false;
  return Object.values(value).every(
    (entry) =>
      entry &&
      typeof entry === 'object' &&
      'typeIds' in entry &&
      // biome-ignore lint/suspicious/noExplicitAny: parsing so type unknown
      EffectArray.isArray((entry as any).typeIds),
  );
}

export class TypesyncSchemaStreamBuilder extends Effect.Service<TypesyncSchemaStreamBuilder>()(
  '/Hypergraph/cli/services/TypesyncSchemaStreamBuilder',
  {
    dependencies: [NodeFileSystem.layer],
    effect: Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;

      const schemaCandidates = (cwd = '.') =>
        EffectArray.make(
          path.resolve(cwd, 'schema.ts'),
          path.resolve(cwd, 'src/schema.ts'),
          path.resolve(cwd, 'app/schema.ts'),
          path.resolve(cwd, 'src/app/schema.ts'),
          // @todo other possible locations?
        );
      const mappingCandidates = (cwd = '.') =>
        EffectArray.make(
          path.resolve(cwd, 'mapping.ts'),
          path.resolve(cwd, 'src/mapping.ts'),
          path.resolve(cwd, 'app/mapping.ts'),
          path.resolve(cwd, 'src/app/mapping.ts'),
          // @todo other possible locations?
        );

      const jiti = yield* Effect.tryPromise({
        async try() {
          const { createJiti } = await import('jiti');
          return createJiti(import.meta.url, { moduleCache: false, tryNative: false });
        },
        catch(cause) {
          return new MappingLoaderError({ cause });
        },
      }).pipe(Effect.cached);

      const loadMapping = Effect.fnUntraced(function* (mappingFilePath: string) {
        return yield* Effect.tryMapPromise(jiti, {
          try(instance) {
            return instance.import(mappingFilePath);
          },
          catch(cause) {
            return cause;
          },
        }).pipe(
          // biome-ignore lint/suspicious/noExplicitAny: type should be import object from jiti
          Effect.map((moduleExports: any) => {
            // Find all exports that look like Mapping objects
            const mappingCandidates = Object.entries(moduleExports).filter(([, value]) => isMappingLike(value));

            if (mappingCandidates.length === 0) {
              return {} as Mapping;
            }

            if (mappingCandidates.length === 1) {
              return mappingCandidates[0][1] as Mapping;
            }

            // Multiple candidates - prefer common names
            const preferredNames = ['mapping', 'default', 'config'];
            for (const preferredName of preferredNames) {
              const found = mappingCandidates.find(([name]) => name === preferredName);
              if (found) {
                return found[1] as Mapping;
              }
            }

            // If no preferred names found, use the first one
            return mappingCandidates[0][1] as Mapping;
          }),
          Effect.mapError(
            (cause) => new MappingLoaderError({ cause, message: `Failed to load mapping file ${mappingFilePath}` }),
          ),
          Effect.tapErrorCause((cause) =>
            Effect.logWarning(
              AnsiDoc.cats([AnsiDoc.text('Failure loading mapping'), AnsiDoc.text(Cause.pretty(cause))]),
            ),
          ),
          Effect.orElseSucceed(() => ({}) as Mapping),
        );
      });

      const findHypergraphSchema = Effect.fnUntraced(function* (candidates: NonEmptyReadonlyArray<string>) {
        return yield* Effect.findFirst(candidates, (_) => fs.exists(_).pipe(Effect.orElseSucceed(() => false)));
      });

      /**
       * Reads the schema.ts file, and maybe reads the mapping.ts file (if exists).
       * Parses the schema and from it, plus the loaded mapping, creates a Stream of the Hypergraph [Schema](../../mapping/Mapping.ts).
       * This represents the state of the schema when the user hits the schema stream endpoint
       *
       * @param schemaFilePath path of the schema.ts file
       * @param mappingFilePath [Optional] path of the mapping.ts file
       * @returns A stream of [Schema](../../mapping/Mapping.ts) pared from the schema.ts file
       */
      const currentSchemaStream = (
        schemaFilePath: string,
        mappingFilePath: Option.Option<string>,
      ): Stream.Stream<HypergraphSchema, never, never> =>
        Stream.fromEffect(
          Effect.gen(function* () {
            const schema = yield* fs.readFileString(schemaFilePath);
            const mapping = yield* Option.match(mappingFilePath, {
              onNone: () => Effect.succeed({} as Mapping),
              onSome: loadMapping,
            });
            return yield* parseSchema(schema, mapping);
          }),
        ).pipe(
          Stream.tapErrorCause((cause) =>
            Effect.logError(
              AnsiDoc.text('Failure parsing current schema into types'),
              AnsiDoc.text(Cause.pretty(cause)),
            ),
          ),
          // if failure, don't bubble to return and just return empty schema
          Stream.orElseSucceed(() => ({ types: [] }) satisfies HypergraphSchema),
        );
      /**
       * Reads the schema.ts file, and maybe reads the mapping.ts file (if exists).
       * Parses the schema and from it, plus the loaded mapping, creates a Stream of the Hypergraph [Schema](../../mapping/Mapping.ts).
       * This stream watches for changes in both the schema.ts file and (if provided) the mapping.ts file.
       * This way, if the user updates either, this will emit an event on the stream of the updated schema.
       *
       * @param schemaFilePath path of the schema.ts file
       * @param mappingFilePath [Optional] path of the mapping.ts file
       * @returns A stream of [Schema](../../mapping/Mapping.ts) pared from the schema.ts file
       */
      const watchSchemaStream = (
        schemaFilePath: string,
        mappingFilePath: Option.Option<string>,
      ): Stream.Stream<HypergraphSchema, never, never> => {
        const schemaWatch = fs.watch(schemaFilePath);
        const mappingWatch = Option.match(mappingFilePath, {
          onNone: () => Stream.empty,
          onSome: (path) => fs.watch(path),
        });

        return Stream.mergeAll([schemaWatch, mappingWatch], { concurrency: 2 }).pipe(
          Stream.buffer({ capacity: 1, strategy: 'sliding' }),
          Stream.mapEffect(() =>
            Effect.gen(function* () {
              const schema = yield* fs.readFileString(schemaFilePath);
              const mapping = yield* Option.match(mappingFilePath, {
                onNone: () => Effect.succeed({} as Mapping),
                onSome: loadMapping,
              });
              return yield* parseSchema(schema, mapping);
            }),
          ),
          Stream.tapErrorCause((cause) =>
            Effect.logError(AnsiDoc.text('Failure parsing schema changes into types'), { cause: Cause.pretty(cause) }),
          ),
          // if failure, don't bubble to return and just return empty schema
          Stream.orElseSucceed(() => ({ types: [] }) satisfies HypergraphSchema),
        );
      };

      const hypergraphSchemaStream = (cwd = '.') =>
        Effect.gen(function* () {
          const schemaFileCandidates = schemaCandidates(cwd);
          const schemaFile = yield* findHypergraphSchema(schemaFileCandidates).pipe(
            Effect.flatMap(
              Option.match({
                onSome(file) {
                  return Effect.succeed(Option.some(file));
                },
                onNone() {
                  return Effect.succeed(Option.none<string>());
                },
              }),
            ),
          );
          if (Option.isNone(schemaFile)) {
            yield* Effect.logWarning(AnsiDoc.text('No Hypergraph schema file found. Searched:'), schemaFileCandidates);
            return Stream.empty;
          }
          const schemaFilePath = schemaFile.value;

          // Fetch the Mapping definition from any mapping.ts in the directory.
          // If exists, use it to get the knowledgeGraphId for each type/property in the parsed schema
          const mappingFilePath = yield* findHypergraphSchema(mappingCandidates(cwd));

          return currentSchemaStream(schemaFilePath, mappingFilePath).pipe(
            Stream.concat(watchSchemaStream(schemaFilePath, mappingFilePath)),
            Stream.map((stream) => {
              const jsonData = JSON.stringify(stream);
              const sseData = `data: ${jsonData}\n\n`;
              return new TextEncoder().encode(sseData);
            }),
          );
        });

      return { hypergraphSchemaStream } as const;
    }),
  },
) {}
export const layer = TypesyncSchemaStreamBuilder.Default;

export class MappingLoaderError extends Data.TaggedError('/Hypergraph/cli/errors/MappingLoaderError')<{
  readonly cause: unknown;
  readonly message?: string;
}> {}
