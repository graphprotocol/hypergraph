# Schema

## Schema definition

### Data types

- `text` // string
- `number`
- `checkbox` // boolean
- `time` // date and/or time
- `uri`
- `collection`
- `relation`

All fields can be optional, required or nullable. By default all fields are required.

Special attributes:

- `id` - always mandatory and must a string with 32bytes (hex)
- `name` - text
- `description` - text
- `cover` - uri

A schema example (one to one mapping to Effect):

```ts
const schema: Schema({
  entities: {
    user: {
      id: t.Text, // always mandatory to set and can only be a string
      name: t.Text,
    },
    artist: {
      id: t.Text, // always mandatory to set and can only be a string
      name: t.Text,
      description: t.Text,
    },
    event: {
      id: t.Text, // always mandatory to set and can only be a string
      title: t.Text,
      description: t.Text,
      attendees: t.Number,
      active: t.Boolean,
    },
  },
  // TODO how to generate or find the attributeId by name
  relationAttributes: {
    Host: "okd5f77200db45c6ae96193aaef81fe3",
  },
  entityIds: {
    event: "1085f77200db45c6ae96193aaef81fe3",
    user: "abc5f77200db45c6ae96193aaef81fe3",
  }
});
```

Relation example:

```ts
const schema: Schema = {
  entities: {
    user: {
      id: t.Text,
      name: t.Text,
    },
    event: {
      id: t.Text,
      hosts: t.Relation({
        type: "user",
        cardinality: "many", // one or many
        attributeId: "1085f77200db45c6ae96193aaef81fe3",
      }),
    },
  },
};
```

## Space Provider

```tsx
function SpaceDetail() {
  const { spaceId } = useLocationParams();
  return (
    <SpaceProvider schema={schema} id={spaceId}>
      <Events />
    </SpaceProvider>
  );
}

function Events() {
  const events = useQuery({ type: "event" });
  return (
    <div>
      {events.map((event) => (
        <Event key={event.id} event={event} />
      ))}
    </div>
  );
}
```

## Queries

- `useQuery` to get multiple entities
- `useGetById` to get a single entity by ID

### useQuery

The `entity` is always mandatory.

Optional parameters:

- `where` to filter the entities
- `orderBy` to get a single entity by ID
- `include` to include related entities

```ts
// all events in the local db
const events = useQuery({ type: "event" });
// all events with attendees greater than 0
const events = useQuery({
  type: "event",
  where: { attendees: { ">": 0 } },
});
// all events that include the substring "foo" in the title
const events = useQuery({
  type: "event",
  where: { title: { includes: "foo" } },
});
// all events that include the substring "foo" in the title and attendees greater than 0
const events = useQuery({
  type: "event",
  where: { title: { startsWith: "foo" }, attendees: { ">": 0 } },
});
// all events ordered alphabetically by title
const events = useQuery({ type: "event", orderBy: { title: "asc" } });
// all events ordered by attendees in descending order
const events = useQuery({ type: "event", orderBy: { attendees: "desc" } });
// all events ordered by attendees in descending order and include the hosts
const events = useQuery({
  type: "event",
  orderBy: { attendees: "desc" },
  select: {
    title: true,
  },
});
// all events including the hosts and their friends
const events = useQuery({
  type: "event",
  orderBy: { attendees: "desc" },
  select: {
    title: true,
    hosts: {
      // NOTE we could allow a where clause or orderBy here as well, but probably not for the first version e.g.
      where: { name: { includes: "foo" } },
      select: { friends: true },
    },
  },
});
```

### useQueryById

The `entity` and `id` are always mandatory.

Optional parameters:

- `include` to include related entities

```ts
// get a single event by id
const event = useGetById({
  type: "event",
  id: "abc",
  select: { hosts: true },
});
// get a single event by id and include the hosts
const event = useGetById({
  type: "event",
  id: "abc",
  select: { hosts: true },
});
```

## Mutations

```ts
// helper function to create an ID
const id = generateId();

// id is optional for create, but be provided in case you want to reference it in the same operation
const create = useCreateMutation();
const event = create({
  type: "event",
  title: "My event",
  description: "My description",
  hosts: {
    connect: ["abc", "def"],
    create: [{ name: "Alice" }, { name: "Bob" }],
  },
});
const results = create([
  {
    type: "event",
    name: "My event",
    description: "My description",
  },
  {
    types: ["user", "artist"],
    username: "Anna",
    description: "My description",
  },
]);
```

```ts
const update = useUpdateMutation();
update({
  types: ["event"], // I can add or remove types
});
update([{}, {}]); // should it accept different types or only one type?

const delete = useDeleteMutation();
delete({ id: "abc" });
delete([{ id: "abc" }, { id: "abc" }]);
```

## Migrations (early idea)

Introduce a way to add a migration to a schema. This could be relative on how to extend a type and then there must be a function that does the migration from one version to the other and comply to the input/output of the schema.

```tsx
const schemaV1: Schema({
  entities: {
    user: {
      id: t.Text, // always mandatory to set and can only be a string
      name: t.Text,
    },
    event: {
      id: t.Text, // always mandatory to set and can only be a string
      title: t.Text,
      description: t.Text,
      attendees: t.Number,
    },
  },
});

const { schema: schemaV2, migrate: migrateV2 } : Migration({
  original: schemaV1,
  changes: {
    entities: {
      event: {
        // add a new field
        active: migration.add({ type: t.Boolean, default: false }),
        // remove a field
        description: migration.remove(),
        // change a field
        footer: migration.change({ type: t.Number, function: (title) => { return parseInt(title)} }),
      },
    },
  },
});
```

## Open Questions

- What about collections?
- Can an entity have only attributes defined in a type or also additional ones?
