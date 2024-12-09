## Use Cases

This section describes the different use cases for schema development including interaction with the public schema.

### Initial development on an existing schema

1. Run sync via a CLI command to create a local schema incl. mappings

### Initial development on a fresh schema and publish it

1. Define a schema (without mappings)
2. Build with it locally
3. Publish
    1. Generate new IDs for the Entity & Relation types
    2. Show the types that would be generated and ask for confirmation
    3. Invoke API to publish the new Schema changes. Depending on the approval process this might now happen immediately or we need to wait for approval.

### Update a schema

1. Update you local schema - mapping might be missing
2. Build with it
3. Publish
    1. Check for if the public schema has matching types where the name and type matches e.g. `age: number`. If yes, pick these. If not the create new IDs
    2. Show a diff of the changes and ask for confirmation
    3. Invoke API to publish the new Schema changes. Depending on the approval process this might now happen immediately or we need to wait for approval.

### Sync from public schema without local changes

1. Invoke sync via a CLI command
2. Show a diff of the changes which fields & mappings would be added based on the public schema and ask for confirmation
3. Apply the changes

### Sync from public schema with local changes

1. Invoke sync via a CLI command
2. Try to match new mappings to fields based on name and type. If there there is a match to a new local field use this one and only create a mapping, if not create new fields and mappings.
3. Show a diff of the changes and ask for confirmation
4. Apply the changes

## Rules

- Each entity can have multiple types.
- Custom fields can be undefined.
- A relation is only valid of a from, to and index exists.
- All relations are many to many. They can have a hint with the `one max` field about the cardinality.
- Relation can have additional fields.
- System properties e.g. `Created by` can't be undefined.

## Open Questions

- Does every mapping include the space ID as well or only the type ID, attribute ID and relation ID? This depends of we want sync entities and relations from only one or multiple spaces.
- Can a local schema type/field map to multiple public schema types/fields? e.g. local `User` maps to the public schema type `User` and `Person`. Therefor the email field should be mapped to the attribute `email` of the `User` type and the attribute `email` of the `Person` type which both might have the same ID, but can be two different fields as well.
- What to do in case there are conflicting attributes e.g. `Location` and `Sensor` both have an `temperature` field and one is a number and the other a string. Do we merge them or how to map them to different fields? The most reasonable solution I can think of is to map them manually in the mappings file.

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

For this design I haven't explored if we can show TypeScript type errors for invalid relations. If we want to go down this route this would be a good thing to explore next. In any case if relations don't match then the schema should be invalid.

### Design B

Also an object based schema definition where relations are defined separately from the entity types.

```ts
export const schema = {
  types: {
    User: {
      name: type.Text,
      email: type.Text,
    },
    Event: {
      name: type.Text,
    },
  },
  relations: {
    ownedEvents: {
      from: 'User',
      to: 'Event',
    }
  },
};
```

In case of a conflict we can use the `map` field to define the relation name.

```ts
export const schema = {
  types: {
    ...
  },
  relations: {
    ownedEvents: {
      from: 'User',
      to: 'Event',
      map: 'user_owned_events',
    },
    participatingEvents: {
      from: 'Event',
      to: 'User',
      map: 'event_participants',
    },
  },
};
```

### Design C

While I have very little idea if typechecking is possible on relationships in this design and I'm personally not a big fan of class based schemas I wanted to add it for the sake of completeness.

```ts
import { Entity, Field, Relationship } from '@graph-protocol/graph-framework';

@Entity('Person')
class Person {
  @Attribute()
  name: string;

  @Attribute()
  age: number;

  @Relationship('worksAt')
  employers: Organization[];
}

@Entity('Organization')
class Organization {
  @Attribute()
  name: string;

  @Relationship('worksAt')
  employees: Person[];
}
```

## Mappings

- Mappings are optional. Context: So developers can start with a local schema and only create the mappings when they feel confident about the schema and publish it.
- When syncing from public schema we must match the type ID, attribute ID and relation ID.

### Design 1

In this design we can map a local entity to multiple public schema types. We only define the attributes that are mapped to the public schema.

We indicate which local type maps to which public schema type with the `types` field.
In addition we define the attributes that are mapped to the public schema. Each attribute maps to a space ID, a type ID and an attribute ID to clearly identify the attribute.

```ts
const mappings = {
  'User': {
    types: ["xyz", "wzx"], // these are the IDs of the types the local entity represents. xyz is `Person` and wzx is `User`
    attributes: {
      name: [{
        spaceId: 'abc',
        typeId: 'xyz', // public schema type: `Person`
        attributeId: 'asd', // attribute `name: string` on the public schema with the ID `asd`
      }],
      age: [{
        spaceId: 'abc',
        typeId: 'xyz', // public schema type: `Person`
        attributeId: 'gfd', // attribute `age: number` on the public schema with the ID `gfd`
      }],
    }
  }
}
```

Relations are defined next to the attributes.

```ts
const mappings = {
  'User': {
    types: ["xyz", "wzx"], // these are the IDs of the types the local entity represents. xyz is `Person` and wzx is `User`
    attributes: {
      ...
    },
    relations: {
      attendingEvents: [{
        spaceId: 'abc',
        relationId: 'asd'
      }],
      authoredEvents: [{
        spaceId: 'abc',
        relationId: 'qwe'
      }]
    }
  }
}
```

#### Handling Special Cases 

How to handle mappings that should be merged? In this example the `name` attribute should be mapped to the `Person` and `User` type since they have the same attribute ID on both types.

```ts
const mappings = {
  'User': {
    id: "abc",
    types: ["xyz", "wzx"], // these are the IDs of the types the local entity represents. xyz is `Person` and wzx is `User`
    attributes: {
      name: [{
        spaceId: 'abc',
        typeId: 'xyz', // public schema type: `Person`
        attributeId: 'asd',
      },
      {
        spaceId: 'abc',
        typeId: 'wzx', // public schema type: `User`
        attributeId: 'asd',
      }],
    }
  }
}
```

Here the situation in case they have the same name, same type, but different attribute IDs.

```ts
const mappings = {
  'User': {
    id: "abc",
    types: ["xyz", "wzx"], // these are the IDs of the types the local entity represents. xyz is `Person` and wzx is `User`
    attributes: {
      name: [{
        spaceId: 'abc',
        typeId: 'xyz', // public schema type: `Person`
        attributeId: 'asd',
      },
      {
        spaceId: 'abc',
        typeId: 'wzx', // public schema type: `User`
        attributeId: 'lal', // this is a different attribute ID than the one on the `Person` type
      }],
    }
  }
}
```

How to handle mappings which are conflicting? e.g.
- attribute `name` on `Person` is a string (id: `asd`) and
- attribute `name` on `User` is a number (id: `lal`).

```ts
const mappings = {
  'User': {
    id: "abc",
    types: ["xyz", "wzx"], // these are the IDs of the types the local entity represents. xyz is `Person` and wzx is `User`
    attributes: {
      name: [{
        spaceId: 'abc',
        typeId: 'xyz', // public schema type: `Person`
        attributeId: 'asd',
      }],
      nameOnUser: [{
        spaceId: 'abc',
        typeId: 'wzx', // public schema type: `User`
        attributeId: 'lal',
      }],
    }
  }
}
```

Also local relations can be mapped to multiple public schema relations:

```ts
const mappings = {
  'User': {
    types: ["xyz", "wzx"],
    attributes: {
      ...
    },
    relations: {
      attendingEvents: [{ // here we map the local relation to two public schema relations
        spaceId: 'abc',
        relationId: 'asd'
      }, {
        spaceId: 'abc',
        relationId: 'qwe'
      }],
      authoredEvents: [{
        spaceId: 'abc',
        relationId: 'qwe'
      }]
    }
  }
}
```

While I think this design is feasible from a technical point of view, I'm concerned about the usability of the mappings file.

## APIs

### Create entity

```ts
const entity = await create('User', {
  name: 'John Doe',
  age: 30,
});
```

Create entity user with a new event

```ts
const entity = await create('User', {
  name: 'John Doe',
  age: 30,
  ownedEvents: [{
    name: 'Event 1',
  }],
});
```

Create entity and connect it to an existing event

```ts
const entity = await create('User', {
  name: 'John Doe',
  age: 30,
  ownedEvents: ['abc'],
});
```

Mixing is allowed

```ts
const entity = await create('User', {
  name: 'John Doe',
  age: 30,
  ownedEvents: [
    'abc', // connect to existing event
    { name: 'Event 1' } // create new event
  ],
});
```

### Query entities

We agreed that we explicitly query for the fields we want to get. Not sure if this is necessary. For relations I believe it's a good idea otherwise we don't know how many levels of relations we want to get and a simple query could become quite expensive.

```ts
/* 
[
  { name: 'John Doe', age: 30 },
  { name: 'Jane Doe', age: 25 }
]
*/
const entities = await query({
  type: 'User',
  fields: ['name', 'age'],
});
```

Query with relations
```ts
/*
[
  { name: 'John Doe', age: 30, ownedEvents: [{ name: 'Event 1' }, { name: 'Event 2' }] },
  { name: 'Jane Doe', age: 25, ownedEvents: [{ name: 'Event 3' }] }
]
*/
const entities = await query({
  type: 'User',
  fields: ['name', 'age'],
  relations: {
    ownedEvents: {
      type: 'Event',
      fields: ['name'],
    }
  }
});
```

Filters:

```ts
const entities = await query({
  type: 'User',
  fields: ['name', 'age'],
  filters: {
    age: {
      '>': 20,
    }
  }
});
```

## CLI command

- Always ask for confirmation when ever applying changes showing a diff of the changes.
- This step can be skipped with a CLI flag that to skip the confirmation. Important for CI/CD pipelines.

## CRDT Document Structure Thoughts

In an automerge document I would store a list of entities based on their id. We don't want the ID to be included in the entry to avoid duplication as well as them getting out of sync. When querying we can inject the ID into the query results.

This ensures that concurrent changes will apply per entity. Adding and removing entities also will merge well.

Whenever an entity is remove, also all relations to that entity should be removed in the same Automerge change. In case a client does inject relations that are pointing to a removed entity clients can simply ignore them.

While entities and relations could be stored in the same structure, it's probably better to separate them in order to construct query results, find relations and validate them. From, to and index are required for a relation to be valid.

```ts
const automergeDocument = {
  entities: {
    '123': { name: 'John Doe', age: 30 },
    '234': { name: 'Jane Doe', age: 25, gender: 'female' },
  },
  relations: {
    '987': { from: '123', to: '234', index: 'abc' },
    // relation with additional isAdmin field
    '876': { from: '234', to: '123', index: 'def', isAdmin: true },
  }
}
```