import { FileSystem, KeyValueStore, Path } from '@effect/platform';
import { NodeFileSystem } from '@effect/platform-node';
import { AnsiDoc } from '@effect/printer-ansi';
import { Cause, Data, Effect, Array as EffectArray, Option, Stream } from 'effect';
import type { NonEmptyReadonlyArray } from 'effect/Array';
import { type Mapping, propertyIsRelation } from '../../mapping/Mapping.js';
import { toCamelCase, toPascalCase } from '../../mapping/Utils.js';
import {
  type TypesyncHypergraphMapping,
  TypesyncHypergraphSchema,
  TypesyncHypergraphSchemaType,
  type TypesyncHypergraphSchemaTypeProperty,
} from './Model.js';
import { buildMappingFile, buildSchemaFile, parseHypergraphMapping, parseSchema } from './Utils.js';

export class TypesyncSchemaStreamBuilder extends Effect.Service<TypesyncSchemaStreamBuilder>()(
  '/Hypergraph/cli/services/TypesyncSchemaStreamBuilder',
  {
    dependencies: [NodeFileSystem.layer, KeyValueStore.layerMemory],
    effect: Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;
      const kv = yield* KeyValueStore.KeyValueStore;

      const encoder = new TextEncoder();

      const SCHEMA_FILE_PATH_STORAGE_KEY = 'SCHEMA_FILE_PATH';
      const MAPPING_FILE_PATH_STORAGE_KEY = 'MAPPING_FILE_PATH';

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
          } else if (Option.isSome(schemaFilePath)) {
            // store schema file location in KeyValueStore for reference
            yield* kv.set(SCHEMA_FILE_PATH_STORAGE_KEY, schemaFilePath.value);
          }
          // Fetch the Mapping definition from any mapping.ts in the directory.
          // If exists, use it to get the knowledgeGraphId for each type/property in the parsed schema
          const mappingFilePath = yield* findHypergraphSchema(mappingCandidates(cwd));
          if (Option.isSome(mappingFilePath)) {
            // store mapping file location in KeyValueStore for reference
            yield* kv.set(MAPPING_FILE_PATH_STORAGE_KEY, mappingFilePath.value);
          }

          return currentSchemaStream(schemaFilePath, mappingFilePath).pipe(
            Stream.concat(watchSchemaStream(schemaFilePath, mappingFilePath)),
            Stream.map((stream) => {
              const jsonData = JSON.stringify(stream);
              const sseData = `data: ${jsonData}\n\n`;
              return encoder.encode(sseData);
            }),
          );
        });

      /**
       * Write the user-submitted Hypergraph schema to the schema.ts file in the users repo.
       *
       * @param schema the user-submitted Hypergraph schema from the Typesync UI
       * @returns the updated Hypergraph schema
       */
      const syncSchema = (schema: TypesyncHypergraphSchema) =>
        Effect.gen(function* () {
          const cwd = process.cwd();

          const schemaFilePath = yield* kv
            .get(SCHEMA_FILE_PATH_STORAGE_KEY)
            .pipe(Effect.map(Option.getOrElse(() => path.join(cwd, 'src', 'schema.ts'))));
          // update schema file with updated content from the typesync studio UI
          yield* fs.writeFileString(schemaFilePath, buildSchemaFile(schema));

          return TypesyncHypergraphSchema.make({
            types: EffectArray.map(schema.types, (type) =>
              TypesyncHypergraphSchemaType.make({
                name: type.name,
                knowledgeGraphId: type.knowledgeGraphId,
                status: type.knowledgeGraphId != null ? 'published' : 'synced',
                properties: EffectArray.map(type.properties, (prop) => {
                  if (propertyIsRelation(prop)) {
                    return {
                      name: prop.name,
                      knowledgeGraphId: prop.knowledgeGraphId,
                      dataType: prop.dataType,
                      relationType: prop.relationType,
                      status: prop.knowledgeGraphId != null ? 'published' : 'synced',
                    } satisfies TypesyncHypergraphSchemaTypeProperty;
                  }

                  return {
                    name: prop.name,
                    knowledgeGraphId: prop.knowledgeGraphId,
                    dataType: prop.dataType,
                    status: prop.knowledgeGraphId != null ? 'published' : 'synced',
                  } satisfies TypesyncHypergraphSchemaTypeProperty;
                }),
              }),
            ),
          });
        });

      /**
       * Update the mapping.ts file in the users repo with the up-to-date, published to the Knowledge Graph, mapping
       *
       * @param schema the Hypergraph schema
       * @param mapping the up-to-date Hypergraph Mapping with all types/properties having Id
       * @returns the updated schema with connected knowledgeGraphIds
       */
      const syncMapping = (schema: TypesyncHypergraphSchema, mapping: TypesyncHypergraphMapping) =>
        Effect.gen(function* () {
          const cwd = process.cwd();

          const mappingFilePath = yield* kv
            .get(MAPPING_FILE_PATH_STORAGE_KEY)
            .pipe(Effect.map(Option.getOrElse(() => path.join(cwd, 'src', 'mapping.ts'))));
          // update mapping file with updated content from the typesync studio UI
          yield* fs.writeFileString(mappingFilePath, buildMappingFile(mapping));

          // update Schema to update with generated GRC-20 Ids for types/properties
          return TypesyncHypergraphSchema.make({
            types: EffectArray.map(schema.types, (type) => {
              const mappingEntry = mapping[toPascalCase(type.name)];

              let knowledgeGraphId = type.knowledgeGraphId;
              if (!knowledgeGraphId) {
                const typeKnowledgeGraphId = mappingEntry?.typeIds?.[0] ? mappingEntry.typeIds[0] : null;
                if (typeKnowledgeGraphId) {
                  knowledgeGraphId = typeKnowledgeGraphId;
                }
              }

              return TypesyncHypergraphSchemaType.make({
                name: type.name,
                knowledgeGraphId,
                status: knowledgeGraphId != null ? 'published' : 'synced',
                properties: EffectArray.map(type.properties, (prop) => {
                  const propName = toCamelCase(prop.name);

                  if (propertyIsRelation(prop)) {
                    const relKnowledgeGraphId = prop.knowledgeGraphId || mappingEntry?.relations?.[propName] || null;
                    return {
                      name: prop.name,
                      knowledgeGraphId: relKnowledgeGraphId,
                      dataType: prop.dataType,
                      relationType: prop.relationType,
                      status: relKnowledgeGraphId != null ? 'published' : 'synced',
                    } satisfies TypesyncHypergraphSchemaTypeProperty;
                  }

                  const propKnowledgeGraphId = prop.knowledgeGraphId || mappingEntry?.properties?.[propName] || null;
                  return {
                    name: prop.name,
                    knowledgeGraphId: propKnowledgeGraphId,
                    dataType: prop.dataType,
                    status: propKnowledgeGraphId != null ? 'published' : 'synced',
                  } satisfies TypesyncHypergraphSchemaTypeProperty;
                }),
              });
            }),
          });
        });

      return {
        hypergraphSchemaStream,
        syncSchema,
        syncMapping,
      } as const;
    }),
  },
) {}
export const layer = TypesyncSchemaStreamBuilder.Default;

export class MappingLoaderError extends Data.TaggedError('/Hypergraph/cli/errors/MappingLoaderError')<{
  readonly cause: unknown;
  readonly message?: string;
}> {}
