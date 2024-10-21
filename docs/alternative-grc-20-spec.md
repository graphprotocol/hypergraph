# Goals for the specification

- The underlying data structure should be a triple store
- Data must be stored in a way that is easy to read and write
- Linkability between data must be possible
- Data can have metadata like a format or unit
- No nesting of data. Nested data must always be normalized and referenced by an ID
- Data can be versioned
- Structures/Types should support usability

## Introduction

We introduce a handful of concepts to achieve these goals.

- ID
- Attribute Type
- Attribute
- Entity
- Entity Type
- Relation
- Metadata

## Concepts

### ID

Attributes, entities, entity types and relations are all identified by a globally unique ID.

All IDs must be globally unique and 32 bytes. They're created using the UUID4 standard and stripping out the dashes (bringing the length from 36 bytes to 32 bytes). If an entity is coming from a system that already has globally unique IDs of arbitrary length, they can be deterministically converted into valid globally unique 32 byte IDs by taking an sha2 hash of the string, seeding that into a UUID4 generator and stripping the dashes.

Example ID: 8108bb24a07449dc8553620d882e5636

### Attribute Type

A value is a single piece of data and be of the following types that are hardcoded in the specification. It can be:

- text (UTF-8 encoded)
- number (64-bit floating point)
- boolean (true or false)
- point (tuple of two numbers)
- time (ISO 8601 including duration support)

All values are nullable. There is no distinction between a value that is not present and a value that is null. In fact if a value is set to null it should be removed.

Note: We want to avoid nested structures so that we can reference each entity.

### Attributes

It consists out of an id, name and value.

- id (generated from the hash of the name and value -> uuid4(sha2(hash({ name: name, value: value })))
- name (string)
- value type (string, number, boolean, point, time)

It's very important that the id is generated from the name and value. This way we can ensure that the same attribute is always represented by the same id! Indexer and clients must validate the ID. This makes attribute IDs deterministic and unique. This also makes attributes immutable.

Note: It's important to not just concatenate the name and value, but rather canonicalize both in a structure and then hash the structure to avoid collision attacks of the value type space ever gets expanded e.g.

- "descriptionb" + "string"
- "description" + "bstring"

must result in a different hash.

### Entity Type

An entity type has:

- id (is a hash of the name and the attribute Ids and since these are the hashes of the name and value)
- name (string)
- a collection of attributes to define the schema (to represent it in a triple DB this could be EntityType and EntityTypeAttribute)

An entity type is a collection of attributes that are common to all entities of that type. It's a way to define a schema for entities.

- id (of the entity type)
- scoped name - for UX/DX we can give a different name e.g. when you have document you might want to call it title while it actually maps to `name (string)`. Of course it also can simply be set to the name of the attribute.
- attribute id - reference to an attribute

Since the ID is deterministic on the structure itself we automatically can find identical structures that have the same name.

#### Further explanation

Why can't we just rely on the structure? Because if you have a Person with name and age and an Animal with name and age they are not the same. They both might be living beings, but an Animal is not a Person and vice versa. So we need to have a way to distinguish between them. The name + structure probably covers all cases, but maybe I'm missing something.

The benefit is that we can match identical structures with the same name. Downside is that evolution of the structure is not possible. In case you want to evolve the structure you need to create a new entity type. In a distributed system it's not realistic to migrate all the data, but personally I think it's better to have a deterministic and immutable type system.

That said we can handle evolution on the developer tooling side. For example:

Let's say you have a `Event` entity with:

- name
- description
  which results in the ID `abc`.

Now you want to add a `date` attribute. You can create a new entity type `Event` with:

- name
- description
- date
  which results in the ID `def`.

Your tooling should allow to you to map the old `Event` to the new `Event` entity type together e.g.

```
{
 "Event: ["abc", "def"], // entity type Ids
}
```

and you can still query `useQuery({ types: "Event" })`.

This way you can evolve the schema without having to migrate the data, but still have a deterministic and immutable type system. One benefit for example is that if you changed an attribute `age` from `string` to `number` the resulting type can be `string | number`.

### Entity

An entity is a set of attributes (and entity types) that define the entity.

- id (string) - must be the globally unique string for the entity
- attribute id - reference to an attribute
- value - actual value based on the attribute type

When a new triple is created with the same id and attribute id it will overwrite the old value.

In addition to attributes an entity can have a reference to an entity type.

- id (string) - must be the globally unique string for the entity
- "type"
- entity type id

Since an entity can have multiple types it's allowed to have multiple type triples.

#### Recommended Attributes for all entities

- `name` (string) - standard human-readable identifier
- `description` (string) - human-readable description
- `cover` (string) - base64 encoded image

### Relation Type

An entity type has:

- id (is a hash of the name and the attribute Ids and since these are the hashes of the name and value)
- name (string)
- a collection of attributes to define the schema (to represent it in a triple DB this could be RelationType and RelationTypeAttribute, but might be a good use of collection in graph databases?)

There are three attributes that are required for a relation type:

- `from` (string of 32 bytes and they map to an entity type)
- `to` (string of 32 bytes and they map to an entity type)
- `cardinality` (string) - one-to-one, one-to-many, many-to-one, many-to-many // based on the definition a relation the indexer will resolve multiple relations differently e.g. in case of a one-to-one it will use the latest relation as the current one

Evolving follows the same rules as for entity types. I'm not sure the evolution strategy of entity types is applicable to relation types e.g. changing the cardinality from many-to-many to one-to-one. This might need some exploration.

### Relation

Relation is a special entity that links two entities together.

#### Attributes

It has four special attributes:

- `from` (string of 32 bytes)
- `to` (string of 32 bytes)
- `index` (string)

The `from` and `to` attributes are references to entities and are required. The `index` attribute is optional and can have a string the allows to determine the position using a lexicographical order.

In addition a relation can have any number of attributes.

#### Relation Type Reference

In addition to attributes a a relation can have a reference to a relation type.

Triple for relation type:

- id (string) - must be the globally unique string for the relation
- "relation-type"
- relation type id

Since an relation can have multiple relation types it's allowed to have multiple triple with the same id.

### Metadata

Metadata are attributes that can be attached to attributes for a specific entity or entity type. They can be used to store additional information like the format or unit of a value. It behaves like an attribute to an entity.

- reference entity id + attribute id (string) - the attribute id that the metadata is attached to
- attribute id - the actual attribute id
- value - actual value based on the attribute type

In terms of DX you probably can define in the query if you want to include the metadata or not and then the structure will be more nested.

## Summary of the most notable changes

- The attribute types are not referenced by ID, but rather hardcoded by the specification. This is to avoid the need to have a separate entity for each attribute types. I might be missing something, but I don't see any value in having Ids for attribute types.

- The IDs for attributes, entity types and relation types are generated from their content. This is to ensure determinism and immutability to make it easier to build an interoperable system.

- The type definitions are separated from attributes using a different triple structure.

- Relations are not defined on the entity type, but rather independently.

## Opinions

I believe the ID generations for attributes is a good idea. The ID generation for entity types and relation types is more controversial and I would rather explore the idea a bit before setting it in stone.

I believe having a clear distinction between attributes and types is a good idea. One is to define actual data and the other is to define the schema.

I believe the disconnecting relation types as attributes is a good idea to avoid confusing or inconsistent definitions.
