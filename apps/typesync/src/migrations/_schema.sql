CREATE TABLE IF NOT EXISTS "effect_sql_migrations" (
  migration_id integer PRIMARY KEY NOT NULL,
  created_at datetime NOT NULL DEFAULT current_timestamp,
  name VARCHAR(255) NOT NULL
);
CREATE TABLE app (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      directory TEXT,
      status TEXT NOT NULL DEFAULT 'draft',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE app_event (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      app_id INTEGER NOT NULL,
      event_type TEXT NOT NULL,
      metadata TEXT NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (app_id) REFERENCES app(id) ON DELETE CASCADE
    );
CREATE TABLE app_schema_type (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      app_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (app_id) REFERENCES app(id) ON DELETE CASCADE,

      CONSTRAINT unq__app_schema_type__app_id_name UNIQUE (app_id, name)
    );
CREATE TABLE app_schema_type_property (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      app_schema_type_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      type_name TEXT NOT NULL,
      nullable BOOLEAN,
      optional BOOLEAN,
      description TEXT,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, relation_type_name TEXT,

      FOREIGN KEY (app_schema_type_id) REFERENCES app_schema_type(id) ON DELETE CASCADE,

      CONSTRAINT unq__app_schema_type_property__app_schema_type_id_name UNIQUE (app_schema_type_id, name)
    );

INSERT INTO effect_sql_migrations VALUES(1,'2025-06-27 18:52:18','create_table__app');
INSERT INTO effect_sql_migrations VALUES(2,'2025-06-27 18:52:18','create_table__app_events');
INSERT INTO effect_sql_migrations VALUES(3,'2025-06-27 18:52:18','create_table__app_schema');
INSERT INTO effect_sql_migrations VALUES(4,'2025-06-27 18:52:18','create_table__app_schema_type_property');
INSERT INTO effect_sql_migrations VALUES(5,'2025-06-27 18:52:18','update_table_property_relationTypeName');