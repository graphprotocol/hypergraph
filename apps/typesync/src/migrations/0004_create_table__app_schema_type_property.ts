import { SqlClient } from '@effect/sql';
import { Effect } from 'effect';

export default Effect.flatMap(
  SqlClient.SqlClient,
  (sql) => sql`
    CREATE TABLE IF NOT EXISTS app_schema_type_property (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      app_schema_type_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      type_name TEXT NOT NULL,
      nullable BOOLEAN,
      optional BOOLEAN,
      description TEXT,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (app_schema_type_id) REFERENCES app_schema_type(id) ON DELETE CASCADE,

      CONSTRAINT unq__app_schema_type_property__app_schema_type_id_name UNIQUE (app_schema_type_id, name)
    )
  `,
);
