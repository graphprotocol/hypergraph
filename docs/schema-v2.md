## Glossary

- **Space**: A place for grouping information.
- **Private Space**: Information is only accessible to it's members and is directly governed by it's members.
- **Personal Space**: Information is publicly available and is directly governed by it's members.
- **Public Space**: Information is publicly available and is governed by the community.

The table below should help to understand the relationship between the different space types.

<table>
  <tr>
    <td colspan="2" rowspan="2"></td>
    <td colspan="2">Visibility</td>
  </tr>
  <tr>
    <td>Private</td>
    <td>Public</td>
  </tr>
  <tr>
    <td rowspan="2">Governance</td>
    <td>Private</td>
    <td>Private</td>
    <td>Personal</td>
  </tr>
  <tr>
    <td>Public</td>
    <td>(does not exist)</td>
    <td>Public</td>
  </tr>
</table>

## Relationship between Schema and Code

The general idea is that the type definitions (schema) are also data.

When building an app though you need to define the types in code. Therefor these are requirements we need to define:

- Local schema as defined in the code allows the dev to full customize names & structure of the schema. 
- Maximum interoperability with the Graph
- Every type and attribute has a corresponding entity that has been published to the public schema. When you define a schema in the code, it doesn't mean it exists in a public schema.

## Spaces and Ownership

While traditional apps are silos with the Graph, the users and organizations should be the owners of their data.

When using an app you still should publish to your personal or public spaces that you control.
There can be app specific spaces, but the expected use-case is that these are use to define types in the graph.

For the public schemas there is a global index and we need to specify to an indexer what spaces to index for a specific app. It's not yet clear or well defined how this works.

## Schema Design

## Schema Design

- Relations are defined directly on the entity type (see an alternative Design below)
- We want immediate feedback on invalid relations.
- Handling invalid Relations
  - In case the from or to is missing we ignore the relation completely.
  - In case the index is missing, we set an index at the end of the list. Later we can provide a callback to choose different behavior. Note: he data service should be validating this already, but can happen in case of end-to-end encrypted sync.
  - In case the index is not unique we pick one of them and move it between this and the next item.

### Design

An object based schema definition where relations must be defined on the entity type.

```ts
export const schema = {
  User: {
    name: type.Text,
    email: type.Text,
    ownedEvents: type.Relation({
      types: 'Event',
    }),
  },
  Event: {
    name: type.Text,
    owners: type.Relation({
      types: 'User',
    }),
  },
};
```

Relations can be named to allow for multiple relations to the same type.

```ts
export const schema = {
  User: {
    name: type.Text,
    email: type.Text,
    ownedEvents: type.Relation({
      key: 'user_owned_events',
      types: 'Event',
    }),
    participatingEvents: type.Relation({
      key: 'event_participants',
      types: 'Event',
    }),
  },
  Event: {
    name: type.Text,
    owners: type.Relation({
      key: 'user_owned_events',
      types: 'User',
    }),
    participants: type.Relation({
      key: 'event_participants',
      types: 'User',
    }),
  },
};
```

## Mapping

The mapping should be simple and without unnecessary nesting.

```ts
type AttributeId = string;

type TypeMapping = {
  id: string;          // Public type ID
  spaceId: string;    // Public space ID (optional)
  attributes: {
    [localAttributeName: string]: AttributeId;
  }
}

type Mappings = [localTypeName: string]: TypeMapping
```

Example:
```ts
const mappings = {
  User: { // matches the local type name
    id: 'xyz', // matches the public type ID
    spaceId: 'abc', // matches the public space ID
    attributes: {
      name: 'gfd',
      email: 'asd',
    }
  },
  Event: {
    typeID: 'wzx',
    attributes: {
      name: 'asd',
    },
  },
};
```

This allows for simpler reasoning, but leaves room for edge-cases that lead to impossible types e.g. when creating an entity with attributes that don't match. Such edge-cases should by not allowing them and they should result in an Error.

## Syncing Types (Local <-> Public)

Use cases:

1. Use an existing schema (use types from any different spaces)
2. Use an existing schema (use types from any different spaces) and extend it with new attributes
3. Use an existing schema (use types from any different spaces), but change types of attributes
4. Don't use any existing schema

Publishing also must consider if the proposal for a schema change is rejected.

-> To be defined

## API

We expect that in an app you mostly going to interact with the entities from one space. There we want to provide an API to set a default space ID for querying and creating entities.

```ts
import { setDefaultSpaceId, subscribeToSpace } from '@graph-protocol/graph-framework';

setDefaultSpaceId('abc'); // this will automatically subscribe to the space

// in order to manually subscribe to other spaces as well we can use the subscribeToSpace function
// this is important to get updates for the entities
subscribeToSpace('cde');
```

When using React we can leverage a provider to provide the necessary information to the app.

```tsx
import { GraphProvider } from '@graph-protocol/graph-framework';

<GraphProvider defaultSpaceId={'abc'} spaces={['cde', 'fgh']}>
  <App />
</GraphProvider>
```

Note: if a function uses an spaceId that is not set as the default space ID or one of the spaces then it will throw an error.

### Create a new entity

```ts
const entity = createEntity({
  types: ['User', 'Event'],
  data: {
    name: "John Doe",
  },
  space: 'abc',  // optional space ID where the entity should be published in
})
```

#### Error cases

In case you have two types with the same attribute names, but different types TypeScript should throw an error.

e.g.

```ts
export const schema = {
  Sensor: {
    temperature: type.Number,
  },
  Location: {
    temperature: type.Text,
  },
};

const entity = createEntity({
  types: ['Sensor', 'Location'], // throws an error since the attribute temperature is of different types
  attributes: {
    temperature: "John Doe",
  },
})
```

### Publishing edits

The idea behind it is that users will do several operations on various entities and then publish them all at once. We assume publishing operations per space is the most common use-case. That's why we want to provide a review process where the user can review the operations and remove parts that should not be published.

The result is a multi-step process with 2 API calls:

Step 1: `createEdit` calculates the `ops` based on the diff between the local and the latest public version, allows to add meta data e.g. name, additional authors
Step 2: user can review the `ops` and remove parts that should not be published
Step 3: `publish` submit the `edit`

In case the app knows the exact intentions manual review could be skipped or ops removed from the edit before presented to the user for review.

```ts
const edit = createEdit({
  name: 'Add a new event',
  authors: ["7UiGr3qnjZfRuKs3F3CX61", …]
});

const edit = createEdit({
  name: 'Add a new event',
  authors: ["7UiGr3qnjZfRuKs3F3CX61", …],
  space: 'abc', // optional spaceId to define the space where the edit should be published in
});
```

```ts
publish(edit);
```

### Update an entity

Update the attributes of an entity. TODO unclear if we can provide type-safety in this case.

```ts
updateEntity({
  id: entity.id,
  attributes: {
    name: "Jane Doe",
  },
});
```

Update the types and attributes of an entity.

```ts
updateEntity({
  id: entity.id,
  types: ['User', 'Sensor'], // optional to overwrite the types. This overwrites the entire list of types
  attributes: {
    name: "Jane Doe",
    temperature: 123,
  },
});
```

### Setting an attribute/relation on an entity without a schema

It's possible to set an attribute on an entity and publish it directly. Since there is no entry in the mappings file we use the attribute ID as key and set the value as value. This way with the next `createEdit` the attribute will be taken into account.

```ts
setTriple({
  entity: entity.id,
  attribute: 'abc',
  value: 'John Doe',
});
```

Adding/removing relations that are not defined in the schema still needs to be defined.

### Querying entities

Here we want to match the SDK for the public GraphQL. Still in progress here: https://www.notion.so/Data-block-query-strings-152273e214eb808898dac2d6b1b3820c

TODO how do we distinguish between local and public queries?

