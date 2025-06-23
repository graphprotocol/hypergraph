import { fileURLToPath } from 'node:url';
import * as NodeContext from '@effect/platform-node/NodeContext';
import * as SqliteClient from '@effect/sql-sqlite-node/SqliteClient';
import * as Migrator from '@effect/sql-sqlite-node/SqliteMigrator';
import * as SqlClient from '@effect/sql/SqlClient';
import * as SqlError from '@effect/sql/SqlError';
import * as SqlResolver from '@effect/sql/SqlResolver';
import * as SqlSchema from '@effect/sql/SqlSchema';
import * as EffectArray from 'effect/Array';
import * as Chunk from 'effect/Chunk';
import * as Console from 'effect/Console';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as Order from 'effect/Order';
import * as Schema from 'effect/Schema';
import * as Stream from 'effect/Stream';

import * as TypesyncDomain from '../domain/Domain.js';
import * as Domain from './Domain.js';

const SqlLive = SqliteClient.layer({
  filename: '.typesync.db',
});
const MigratorLive = Migrator.layer({
  loader: Migrator.fromFileSystem(fileURLToPath(new URL('migrations', import.meta.url))),
  // Where to put the `_schema.sql` file
  schemaDirectory: 'src/migrations',
}).pipe(Layer.provide(SqlLive));

const DatabaseLive = Layer.mergeAll(SqlLive, MigratorLive).pipe(Layer.provide(NodeContext.layer));

export class DatabaseService extends Effect.Service<DatabaseService>()('/typesync/services/db', {
  dependencies: [DatabaseLive],
  effect: Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient;

    const FetchAppById = yield* SqlResolver.findById('FetchAppById', {
      Id: Schema.Number,
      Result: Domain.App,
      ResultId(result) {
        return result.id;
      },
      execute(ids) {
        return sql`SELECT * FROM app WHERE ${sql.in('id', ids)}`;
      },
    });
    const InsertApp = yield* SqlResolver.ordered('CreateApp', {
      Request: TypesyncDomain.InsertAppSchema.pipe(Schema.pick('name', 'description', 'directory')),
      Result: Domain.App,
      execute(requests) {
        return sql`
          INSERT INTO app
          ${sql.insert(requests)}
          RETURNING *
        `;
      },
    });
    const UpdateApp = SqlSchema.single({
      Request: Domain.UpdateApp,
      Result: Domain.App,
      execute(request) {
        return sql`UPDATE app SET ${sql.update(request, ['id'])} WHERE ${sql('id')} = ${request.id} RETURNING *`;
      },
    });
    const DeleteApp = yield* SqlResolver.void('DeleteApp', {
      Request: Schema.Number,
      execute(ids) {
        return sql`DELETE FROM app WHERE ${sql.in('id', ids)}`;
      },
    });

    const InsertAppEvent = yield* SqlResolver.ordered('CreateAppEvent', {
      Request: Domain.InsertAppEventSchema,
      Result: Domain.AppEvent,
      execute(requests) {
        return sql`
          INSERT INTO app_event
          ${sql.insert(requests)}
          RETURNING *
        `;
      },
    });
    const DeleteAllAppEventsBelongingToApp = yield* SqlResolver.void('DeleteAllAppEventsBelongingToApp', {
      Request: Domain.AppIdentifier,
      execute(requests) {
        return sql`DELETE FROM app_event WHERE ${sql.in('app_id', requests)}`;
      },
    });

    const InsertAppSchemaType = yield* SqlResolver.ordered('CreateAppSchemaType', {
      Request: Domain.InsertAppSchemaType,
      Result: Domain.AppSchemaType,
      execute(requests) {
        return sql`
          INSERT INTO app_schema_type
          ${sql.insert(requests)}
          RETURNING *
        `;
      },
    });
    const DeleteAllAppSchemaTypesBelongingToApp = yield* SqlResolver.void('DeleteAllAppSchemaTypesBelongingToApp', {
      Request: Domain.AppIdentifier,
      execute(requests) {
        return sql`DELETE FROM app_schema_type WHERE ${sql.in('app_id', requests)}`;
      },
    });

    const InsertAppSchemaTypeProperty = yield* SqlResolver.ordered('CreateAppSchemaTypeProperty', {
      Request: Domain.DBNativeInsertAppSchemaTypeProperty,
      Result: Domain.DBNativeAppSchemaTypeProperty,
      execute(requests) {
        return sql`
          INSERT INTO app_schema_type_property
          ${sql.insert(requests)}
          RETURNING *
        `;
      },
    });
    const DeleteAllAppSchemaTypePropertiesBelongingToApp = yield* SqlResolver.void(
      'DeleteAllAppSchemaTypePropertiesBelongingToApp',
      {
        Request: Domain.AppIdentifier,
        execute(requests) {
          return sql`DELETE FROM app_schema_type_property WHERE app_schema_type_id IN (SELECT id FROM app_schema_type WHERE ${sql.in('app_id', requests)})`;
        },
      },
    );

    const fetchAppSchema = (app_id: Domain.App['id']) =>
      Effect.all({
        // fetch all types belonging to the app
        types: SqlSchema.findAll({
          Request: Domain.AppIdentifier,
          Result: Domain.AppSchemaType,
          execute(request) {
            return sql`SELECT * FROM app_schema_type WHERE ${sql.in('app_id', [request])} ORDER BY id`;
          },
        })(app_id),
        // fetch all type properties for each type belonging to the app
        properties: SqlSchema.findAll({
          Request: Domain.AppIdentifier,
          Result: Domain.DBNativeAppSchemaTypeProperty,
          execute(request) {
            return sql`SELECT * FROM app_schema_type_property WHERE app_schema_type_id IN (SELECT id FROM app_schema_type WHERE ${sql.in('app_id', [request])}) ORDER BY app_schema_type_id, id`;
          },
        })(app_id),
      }).pipe(
        Effect.map(({ types, properties }) => {
          const propertiesByType = EffectArray.reduce(
            properties,
            new Map<number, Array<Domain.AppSchemaTypePropery>>(),
            (map, property) => {
              const existing = map.get(property.app_schema_type_id) ?? [];
              return map.set(property.app_schema_type_id, [
                ...existing,
                {
                  ...property,
                  nullable: Domain.mapSqliteNativeToBoolean(property.nullable),
                  optional: Domain.mapSqliteNativeToBoolean(property.optional),
                },
              ]);
            },
          );
          const OrderPropertyById = Order.mapInput(
            Order.number,
            (property: Domain.AppSchemaTypePropery) => property.id,
          );

          const schema = Domain.AppSchema.pipe(Schema.pick('types'));
          return {
            types: EffectArray.map(types, (type) => ({
              id: type.id,
              name: type.name,
              properties: EffectArray.sort(propertiesByType.get(type.id) ?? [], OrderPropertyById),
            })),
          } as const satisfies typeof schema.Type;
        }),
      );

    return {
      sql,
      Apps: {
        fetchAll() {
          return SqlSchema.findAll({
            Result: Domain.App,
            Request: Schema.Void,
            execute() {
              return sql`SELECT * FROM app ORDER BY updated_at DESC, name`;
            },
          })();
        },
        fetchById(id: Domain.App['id']) {
          return Effect.all({
            app: Effect.withRequestCaching(true)(FetchAppById.execute(id)),
            schema: fetchAppSchema(id),
          }).pipe(
            Effect.map(({ app, schema }) => {
              if (Option.isNone(app)) {
                return Option.none<Domain.AppSchema>();
              }
              return Option.some(
                Domain.AppSchema.make({
                  ...app.value,
                  ...schema,
                }),
              );
            }),
          );
        },
        create(insert: TypesyncDomain.InsertAppSchema) {
          return InsertApp.execute({
            name: insert.name,
            directory: insert.directory,
            description: insert.description,
          }).pipe(
            Effect.tapError((err) =>
              Effect.gen(function* () {
                yield* Console.error('failure creating app record', { err });
                return new SqlError.SqlError({ cause: err, message: 'Failure creating app record' });
              }),
            ),
            // insert an app_event for the app creation
            Effect.tap((created) =>
              Effect.gen(function* () {
                yield* InsertAppEvent.execute({
                  app_id: created.id,
                  event_type: 'app_created',
                  metadata: `App "${created.name}" created at: ${created.created_at}`,
                } as const);
                // return the created App instance
                return created;
              }),
            ),
            // insert the app_schema_type and associated properties
            Effect.flatMap((created) =>
              Effect.gen(function* () {
                const createdTypesWithProperties = yield* Stream.fromIterable(insert.types).pipe(
                  Stream.mapEffect((type) =>
                    Effect.gen(function* () {
                      const createdType = yield* InsertAppSchemaType.execute({ app_id: created.id, name: type.name });
                      // create a stream of type properties to create
                      const properties = yield* Stream.fromIterable(type.properties).pipe(
                        Stream.mapEffect((property) =>
                          InsertAppSchemaTypeProperty.execute({
                            app_schema_type_id: createdType.id,
                            name: property.name,
                            type_name: property.dataType,
                            relation_type_name: TypesyncDomain.propertyIsRelation(property)
                              ? property.relationType
                              : null,
                            description: null,
                            nullable: null,
                            optional: null,
                          }).pipe(
                            Effect.tapError((err) => Console.log('failure creating app_schema_type_property', { err })),
                            Effect.map((createdProperty) => ({
                              ...createdProperty,
                              nullable: Domain.mapSqliteNativeToBoolean(createdProperty.nullable),
                              optional: Domain.mapSqliteNativeToBoolean(createdProperty.optional),
                            })),
                          ),
                        ),
                        Stream.runCollect,
                      );

                      return {
                        id: createdType.id,
                        name: createdType.name,
                        properties: Chunk.toReadonlyArray(properties),
                      } as const satisfies Domain.AppSchema['types'][number];
                    }),
                  ),
                  Stream.runCollect,
                );

                return Domain.AppSchema.make({
                  id: created.id,
                  name: created.name,
                  description: created.description,
                  directory: created.directory,
                  created_at: created.created_at,
                  updated_at: created.updated_at,
                  status: created.status,
                  types: Chunk.toReadonlyArray(createdTypesWithProperties),
                });
              }),
            ),
          );
        },
        update(data: Omit<Domain.UpdateApp, 'updated_at'>) {
          return UpdateApp({
            ...data,
            updated_at: new Date().toUTCString(),
          });
        },
        delete(id: Domain.App['id']) {
          // delete app, and all related records.
          // does not need to be done in order as sqlite loosely associates foreign keys.
          return Effect.all([
            DeleteAllAppSchemaTypePropertiesBelongingToApp.execute(id),
            DeleteAllAppSchemaTypesBelongingToApp.execute(id),
            DeleteAllAppEventsBelongingToApp.execute(id),
            DeleteApp.execute(id),
          ]).pipe(
            Effect.tapError((e) => Console.error('failure deleting app and related records', { err: e })),
            Effect.map(() => true),
          );
        },
      },
      AppEvents: {
        fetchAppEvents(app_id: Domain.App['id']) {
          return SqlSchema.findAll({
            Result: Domain.AppEvent,
            Request: Domain.AppIdentifier,
            execute(request) {
              return sql`SELECT * FROM app_event WHERE ${sql.in('app_id', [request])} ORDER BY updated_at DESC`;
            },
          })(app_id);
        },
        create(event: Domain.InsertAppEventSchema) {
          return InsertAppEvent.execute({
            app_id: event.app_id,
            event_type: event.event_type,
            metadata: event.metadata,
          });
        },
      },
      AppSchema: {
        fetchAppSchema,
      },
    } as const;
  }),
}) {}

export const DatabaseServiceLive = DatabaseService.Default;
