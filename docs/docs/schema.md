# Schema

The Hypergraph schema allows you to define the data model for your application. It is based on the GRC-20 specification and allows you to define Types with properties and relations to other Types.

## Mapping

The public knowledge graph is based on property IDs. In order to integrate with the public knowledge graph you need to map your own schema to IDs from the public graph's schema. Until you interact with the public knowledge graph or before publishing your schema to the public knowledge graph you can use any valid UUID as a property ID.

## Hypergraph Schema Browser

Building your app using a schema that is already actively used in Hypergraph's knowledge graph unlocks composability between your dataset and other datasets used in Hypergraph's knowledge graph. 

You can search for schemas used within the Hypergraph knowledge graph using the [Hypergraph Schema Browser](https://schema-browser.vercel.app/). You can also use the TypeSync tool to generate a mapping for your schema.

**Warning:** TypeSync is not supported in the latest version of the `hypergraph` package. We are working on a new version of TypeSync.

## Example

Here is an example of a schema for an Event entity with the properties `name` and `description`.

```ts
import { Entity, Type, Id } from '@graphprotocol/hypergraph';

export const Event = Entity.Schema(
  {
    name: Type.String,
    description: Type.String,
  },
  {
    types: [Id('event-type-id')],
    properties: {
      name: Id('name-property-id'),
      description: Id('description-property-id'),
    },
  },
);
```

## Relations

In order to define relations between Types, you can use the `Type.Relation` type.

```ts
import { Entity, Type, Id } from '@graphprotocol/hypergraph';

export const Company = Entity.Schema(
  { name: Type.String },
  {
    types: [Id('company-type-id')],
    properties: {
      name: Id('name-property-id'),
    },
  },
);

export const Event = Entity.Schema(
  {
    name: Type.String,
    description: Type.String,
  },
  {
    types: [Id('event-type-id')],
    properties: {
      name: Id('name-property-id'),
      description: Id('description-property-id'),
      sponsors: Id('sponsors-property-id'),
    },
  },
);
```

## Available Types

- `Type.String` (string)
- `Type.Number` (number)
- `Type.Date` (date)
- `Type.Boolean` (boolean)
- `Type.Point` (serialized to a string with a comma separated list of numbers)
- `Type.Relation` (relation to another Type)

Example:

```ts
import { Entity, Type, Id } from '@graphprotocol/hypergraph';

export const Company = Entity.Schema(
  {
    name: Type.String,
    employees: Type.Number,
    founded: Type.Date,
    active: Type.Boolean,
    location: Type.Point,
  },
  {
    types: [Id('company-type-id')],
    properties: {
      name: Id('name-property-id'),
      employees: Id('employees-property-id'),
      founded: Id('founded-property-id'),
      active: Id('active-property-id'),
      location: Id('location-property-id'),
    },
  },
);
```

## Optional Fields

You can make a field optional by wrapping it in `Type.optional`.

```ts
import { Entity, Type, Id } from '@graphprotocol/hypergraph';

export const Company = Entity.Schema(
  {
  name: Type.String,
  description: Type.optional(Type.String),
  founded: Type.optional(Type.Date),
  },
  {
    types: [Id('company-type-id')],
    properties: {
      name: Id('name-property-id'),
      description: Id('description-property-id'),
      founded: Id('founded-property-id'),
    },
  },
);
```

## Creating and publishing new Properties and Types

We created a script to create and publish new properties and types to the public knowledge graph. You can find it at [https://github.com/geobrowser/create-types-and-properties](https://github.com/geobrowser/create-types-and-properties).