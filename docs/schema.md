# Schema

## Schema definition

### Data types

- `string`
- `number`
- `boolean`
- `text` // rich text
- `object` (initially can NOT contain relationship or graphRelationship)
- `list` (initially can NOT contain relationship or graphRelationship)
- `relationship`
- `graphRelationship`

All fields can be optional, required or nullable. By default all fields are required.

A schema example (one to one mapping to Effect):

```ts
const schema: Schema({
  entities: {
    user: {
      id: t.String, // always mandatory to set and can only be a string
      name: t.String,
    },
    event: {
      id: t.String, // always mandatory to set and can only be a string
      title: t.String,
      description: t.Text,
      attendees: t.Number,
      active: t.Boolean,
    },
  },
});
```

Nullable/Undefined/Optional example (one to one mapping to Effect):

```ts
const schema: Schema = {
  entities: {
    event: {
      id: t.String,
      title: t.NullOr(t.String),
      description: t.UndefinedOr(t.String),
      notes: t.optionalElement(t.String),
    },
  },
};
```

Object example:

```ts
const schema: Schema = {
  entities: {
    event: {
      id: t.String,
      location: t.Object({
        name: t.String,
        address: t.String,
      }),
    },
  },
};
```

List example:

```ts
const schema: Schema = {
  entities: {
    event: {
      id: t.String,
      tags: t.List(t.String),
      participants: t.List(
        t.Object({
          name: t.String,
          email: t.String,
          phone: t.String,
        })
      ),
    },
  },
};
```

Space internal Relationship example:

```ts
const schema: Schema = {
  entities: {
    event: {
      id: t.String,
      hosts: t.Relationship({
        type: "user",
        field: "id",
        relationship: "hosted by",
      }),
    },
  },
};
```

Public Graph Relation example:

```ts
const schema: Schema = {
  entities: {
    event: {
      id: t.String,
      hosts: t.GraphRelationship({
        type: "user",
        field: "id",
        relationship: "hosted by",
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
      <App />
    </SpaceProvider>
  );
}

function Events() {
  const { events } = useQuery({ type: "event" });
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
- `useQueryById` to get a single entity by ID

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
const events = useQuery({ type: "event", where: { attendees: { gt: 0 } } });
// all events that include the substring "foo" in the title
const events = useQuery({
  type: "event",
  where: { title: { includes: "foo" } },
});
// all events that include the substring "foo" in the title and attendees greater than 0
const events = useQuery({
  type: "event",
  where: { title: { includes: "foo" }, attendees: { gt: 0 } },
});
// all events ordered alphabetically by title
const events = useQuery({ type: "event", orderBy: { title: "asc" } });
// all events ordered by attendees in descending order
const events = useQuery({ type: "event", orderBy: { attendees: "desc" } });
// all events ordered by attendees in descending order and include the hosts
const events = useQuery({
  type: "event",
  orderBy: { attendees: "desc" },
  include: { hosts: true },
});
// all events including the hosts and their friends
const events = useQuery({
  type: "event",
  orderBy: { attendees: "desc" },
  include: {
    hosts: {
      // NOTE we could allow a where clause or orderBy here as well, but probably not for the first version e.g.
      // where: { name: { includes: "foo" } },
      include: { friends: true },
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
const event = useQueryById({
  type: "event",
  id: "abc",
  include: { hosts: true },
});
// get a single event by id and include the hosts
const event = useQueryById({
  type: "event",
  id: "abc",
  include: { hosts: true },
});
```

## Mutations

```ts
const createEvent = useCreateMutation({ type: "event" });
createEvent({ id: "abc", title: "My event", description: "My description" });

const updateEvent = useUpdateMutation({ type: "event" });
updateEvent({ id: "abc", description: "My description" });

const deleteEvent = useDeleteMutation({ type: "event" });
deleteEvent({ id: "abc" });
```

## Migrations (early idea)

Introduce a way to add a migration to a schema. This could be relative on how to extend a type and then there must be a function that does the migration from one version to the other and comply to the input/output of the schema.

```tsx
const schemaV1: Schema({
  entities: {
    user: {
      id: t.String, // always mandatory to set and can only be a string
      name: t.String,
    },
    event: {
      id: t.String, // always mandatory to set and can only be a string
      title: t.String,
      description: t.Text,
      attendees: t.Number,
    },
  },
});

const { schema: schemaV2, migrateSpace: migrateSpaceV2 } : Migration({
  original: schemaV1,
  changes: {
    entities: {
      event: {
        // add a new field
        active: migration.add({ type: t.Boolean, default: false }),
        // remove a field
        description: migration.remove(),
        // change a field
        title: migration.change({ type: t.Number, function: (title) => { return parseInt(title)} }),
      },
    },
  },
});
```

## Open Questions

- Not sure if and how to best distinguish internal and external relationships. I think we want to make a difference between them since the local ones can load in a sync manner, while the external ones need to be fetched async.
- In the schema definition we define `entities`, but in `userQuery` we use `type`. Should we align on one of them?
- I have barely worked with GraphDBs, so I'm not sure this is a good way to define relationships. This feels more like a relational DB (the intuitive API for me).
