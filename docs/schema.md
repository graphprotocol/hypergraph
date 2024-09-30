# Schema

## Schema definition

Must allow to recursively define a schema.

Data types:

- `string`
- `number`
- `boolean`
- `text`
- `object`
- `list`

```ts
const schema = Schema({
  events: List({
    name: String,
    date: Date,
    location: {
      name: String,
      address: String,
    },
    participants: List({
      name: String,
      email: String,
      phone: String,
    }),
  }),
});
```

## Queries

Two possible designs:

- useQuery({ events: { filter: {} }}) hook
- doc.events.useQuery({ filter: { ... } })

## Mutations

- const createEvent = useMutation({ events: 'create' })
- doc.events.create() / from the schema automatically mutations are derived?

## Following Relations

- internal relations (nested objects)
- external relations (other collections)

## Migrations

Introduce a way to add a migration to a schema. This could be relative on how to extend a type and then there must be a function that does the migration from one version to the other and comply to the input/output of the schema.

## Other open questions

- useQuery design for Objects, List, Values and Relations (Triples)
- useMutation design for Objects, List, Values and Relations (Triples)
- How to handle relations
- Should there be a design that is optimized for relational model and/or graph model?

## Inspiration

- GraphQL schema definitions

## TODOs

- add a version React.Context instead of createSchema (accepts the yDoc and the schema)
