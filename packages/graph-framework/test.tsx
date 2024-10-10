import * as S from "@effect/schema/Schema";

export const type = {
  Text: S.String,
  Number: S.Number,
  Checkbox: S.Boolean,
  Relation: <K extends readonly string[], C extends "one" | "many">(params: {
    types: K;
    cardinality: C;
  }): Relation<K, C> => {
    const { types, cardinality } = params;
    return {
      _tag: "Relation",
      types,
      cardinality,
    };
  },
};

// Helper type to extract schema type
type SchemaType<T> = T extends S.Schema<any, infer A> ? A : never;

// Generic Relation type
type Relation<K extends readonly string[], C extends "one" | "many" = "one"> = {
  _tag: "Relation";
  types: K;
  cardinality?: C;
};

// Type for the schema structure
export type SchemaDefinition = {
  types: Record<
    string,
    Record<string, S.Schema<any, any> | Relation<any, any>>
  >;
};

// Extract all possible keys from schema types
type EntityKeys<T extends SchemaDefinition> = keyof T["types"] & string;

// Get merged type from array of keys
type MergedEntityType<
  T extends SchemaDefinition,
  Keys extends readonly EntityKeys<T>[],
> = UnionToIntersection<
  {
    [K in Keys[number]]: {
      [P in keyof T["types"][K]]: T["types"][K][P] extends Relation<
        infer R,
        infer C
      >
        ? C extends "many"
          ? MergedEntityType<T, Extract<R[number], EntityKeys<T>>[]>[]
          : MergedEntityType<T, Extract<R[number], EntityKeys<T>>[]>
        : SchemaType<T["types"][K][P]>;
    };
  }[Keys[number]]
>;

// Helper type to convert union to intersection
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;

export function createFunctions<T extends SchemaDefinition>(schema: T) {
  function createEntity<K extends readonly EntityKeys<T>[]>(
    types: [...K],
    data: MergedEntityType<T, K>
  ): MergedEntityType<T, K> {
    return data;
  }
  return { createEntity };
}

const schema = {
  types: {
    Person: {
      name: type.Text,
      age: type.Number,
    },
    User: {
      username: type.Text,
      email: type.Text,
    },
    Event: {
      name: type.Text,
      participants: type.Relation({
        types: ["Person"] as const,
        cardinality: "many",
      }),
      author: type.Relation({
        types: ["User", "Person"] as const,
        cardinality: "one",
      }),
    },
  },
};

const { createEntity } = createFunctions(schema);

const event = createEntity(["Event"], {
  name: "Conference",
  participants: [
    { name: "Alice", age: 30 },
    { name: "Bob", age: 25 },
  ],
  author: {
    // Valid 'User' fields
    username: "johndoe",
    email: "john@example.com",
    // Or valid 'Person' fields
    // name: "John Doe",
    // age: 30,
  },
});
