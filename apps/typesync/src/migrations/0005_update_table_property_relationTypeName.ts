import { SqlClient } from '@effect/sql';
import { Effect } from 'effect';

export default Effect.flatMap(
  SqlClient.SqlClient,
  (sql) => sql`
    ALTER TABLE app_schema_type_property ADD COLUMN relation_type_name TEXT;
  `,
);
