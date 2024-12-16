## Glossary

- **Space**: A place for grouping information.
- **Private Space**: Information of a space that is not publicly accessible, but only accessible to members of a space.
- **Public Space**: Information of a space that is publicly accessible.
- **Personal Space**: A space controlled by a single person.

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

### Design A

An object based schema definition where relations must be defined on the entity type. This design assumes that the local schema doesn't deal with entities having multiple types. This fact is only dealt with in the mappings file and therefor the local schema stays a lot simpler.

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
      map: 'user_owned_events',
      types: 'Event',
    }),
    participatingEvents: type.Relation({
      map: 'event_participants',
      types: 'Event',
    }),
  },
  Event: {
    name: type.Text,
    owners: type.Relation({
      map: 'user_owned_events',
      types: 'User',
    }),
    participants: type.Relation({
      map: 'event_participants',
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

Version 1:

```ts
const item = createEntity(
  ['User', 'Event'],
  {
    name: "John Doe",
  },
  'abc' // optional space ID where the entity should be published in
)
```

Version 2:

```ts
const entity = createEntity({
  types: ['User', 'Event'],
  attributes: {
    name: "John Doe",
  },
  spaceId: 'abc',  // optional space ID where the entity should be published in
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

### Publishing an entity

This will automatically retrieve the latest public version of the entity, create a diff and based on that create an OPS to publish the difference.

```ts
publishEdit(entity.id);
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

### Setting an attribute on an entity

It's possible to set an attribute on an entity and publish it directly. Since there is no entry in the schema or mappings file we need to set and publish the attribute directly. If we only store the attribute locally on the next publish the attribute would not be taken into account since we don't know what's the public attribute ID.

```ts
setAndPublishEntityAttribute({
  id: entity.id,
  key: 'name',
  value: 'John Doe',
  attributeId: 'abc',
});
```

### Querying entities

Here we want to match the SDK for the public GraphQL. Still in progress here: https://www.notion.so/Data-block-query-strings-152273e214eb808898dac2d6b1b3820c

TODO how do we distinguish between local and public queries?
