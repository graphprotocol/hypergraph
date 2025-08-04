import { FileSystem, Path } from '@effect/platform';
import { NodeFileSystem } from '@effect/platform-node';
import { AnsiDoc } from '@effect/printer-ansi';
import { Cause, Data, Effect, Array as EffectArray, Option, Stream } from 'effect';
import type { NonEmptyReadonlyArray } from 'effect/Array';
import type { Mapping } from '../../mapping/Mapping.js';
import type { TypesyncHypergraphSchema } from './Model.js';
import { parseHypergraphMapping, parseSchema } from './Utils.js';

export class TypesyncSchemaStreamBuilder extends Effect.Service<TypesyncSchemaStreamBuilder>()(
  '/Hypergraph/cli/services/TypesyncSchemaStreamBuilder',
  {
    dependencies: [NodeFileSystem.layer],
    effect: Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;

      const encoder = new TextEncoder();

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
          Effect.map(parseHypergraphMapping),
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
        schemaFilePath: Option.Option<string>,
        mappingFilePath: Option.Option<string>,
      ): Stream.Stream<TypesyncHypergraphSchema, never, never> =>
        Stream.fromEffect(
          Effect.gen(function* () {
            const schema = yield* Option.match(schemaFilePath, {
              onNone: () => Effect.succeed(''),
              onSome: fs.readFileString,
            });
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
          Stream.orElseSucceed(() => ({ types: [] }) satisfies TypesyncHypergraphSchema),
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
        schemaFilePath: Option.Option<string>,
        mappingFilePath: Option.Option<string>,
      ): Stream.Stream<TypesyncHypergraphSchema, never, never> => {
        const schemaWatch = Option.match(schemaFilePath, {
          // @todo watch the root here so if a schema is created, it will get picked up
          onNone: () => Stream.empty,
          onSome: fs.watch,
        });
        const mappingWatch = Option.match(mappingFilePath, {
          onNone: () => Stream.empty,
          onSome: fs.watch,
        });

        return Stream.mergeAll([schemaWatch, mappingWatch], { concurrency: 2 }).pipe(
          Stream.buffer({ capacity: 1, strategy: 'sliding' }),
          Stream.mapEffect(() =>
            Effect.gen(function* () {
              const schema = yield* Option.match(schemaFilePath, {
                onNone: () => Effect.succeed(''),
                onSome: fs.readFileString,
              });
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
          Stream.orElseSucceed(() => ({ types: [] }) satisfies TypesyncHypergraphSchema),
        );
      };

      const hypergraphSchemaStream = (cwd = '.') =>
        Effect.gen(function* () {
          const schemaFileCandidates = schemaCandidates(cwd);
          // Fetch the Schema definition from any schema.ts in the directory.
          // If exists, use it to parse the Hypergraph schema
          const schemaFilePath = yield* findHypergraphSchema(schemaFileCandidates);
          if (Option.isNone(schemaFilePath)) {
            yield* Effect.logDebug(
              AnsiDoc.text('No Hypergraph schema file found. Searched:'),
              AnsiDoc.cats(schemaFileCandidates.map((candidate) => AnsiDoc.text(candidate))),
            );
          }
          // Fetch the Mapping definition from any mapping.ts in the directory.
          // If exists, use it to get the knowledgeGraphId for each type/property in the parsed schema
          const mappingFilePath = yield* findHypergraphSchema(mappingCandidates(cwd));

          return currentSchemaStream(schemaFilePath, mappingFilePath).pipe(
            Stream.concat(watchSchemaStream(schemaFilePath, mappingFilePath)),
            Stream.map((stream) => {
              const jsonData = JSON.stringify(stream);
              const sseData = `data: ${jsonData}\n\n`;
              return encoder.encode(sseData);
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
