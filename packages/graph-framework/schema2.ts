import { Schema as S } from "@effect/schema";

// Define your schemas
const Birthday = S.Struct({
  birthday: S.String,
});

const Age = S.Struct({
  age: S.Number,
});

// Define your schema object
const schema = {
  entities: {
    user: [Birthday, Age],
    artist: [Birthday],
  },
} as const;

// Helper function to extract properties from a struct schema
function getProperties(schema: S.Schema<any>): Record<string, S.Schema<any>> {
  const ast = (schema as any).ast;
  if (ast && ast._tag === "Struct") {
    return ast.fields;
  } else {
    throw new Error("Schema is not a Struct");
  }
}

// Function to merge multiple struct schemas into one
function mergeStructSchemas(schemas: S.Schema<any>[]): S.Schema<any> {
  const properties: Record<string, S.Schema<any>> = {};
  for (const schema of schemas) {
    const schemaProperties = getProperties(schema);
    Object.assign(properties, schemaProperties);
  }
  return S.Struct(properties);
}

// Implementation of createSchema
function createSchema<
  T extends {
    entities: Record<string, readonly S.Schema<any>[]>;
  },
>(schema: T): S.Schema<{ [K in keyof T["entities"]]: any }> {
  const entitiesSchemas: Record<string, S.Schema<any>> = {};

  for (const entityName in schema.entities) {
    const entitySchemas = schema.entities[entityName];
    const entitySchema = mergeStructSchemas(entitySchemas);
    entitiesSchemas[entityName] = entitySchema;
  }

  return S.Struct(entitiesSchemas) as any;
}

// Use createSchema
const Schema = createSchema(schema);

// SchemaType should be:
// { user: { birthday: string, age: number }, artist: { birthday: string } }
type SchemaType = S.Schema.Type<typeof Schema>;

// Test the types
const user: SchemaType["user"] = {
  birthday: "1990-01-01",
  age: 30,
};

const artist: SchemaType["artist"] = {
  birthday: "1985-05-15",
};
