---
slug: understanding-entities-and-types
title: "1. Modeling Entities and Types in Hypergraph with GRC-20"
date: 2025-06-10
series_position: 1
authors: [nik]
tags: [knowledge-graphs, education, grc20, hypergraph]
---

> **Series:** GRC-20 Knowledge Graph (Part 1 of 6)  
> **Next:** [Properties and Relations in GRC-20 →](/blog/properties-and-relations-in-grc20)

Hypergraph is an open-source framework that lets you build and query decentralized knowledge graphs using the GRC-20 standard. In this first tutorial, we'll see how Hypergraph represents **Entities** and **Types** and why they are the foundation of any knowledge graph you create.

<!-- truncate -->

## Entities: The Foundation

In GRC-20, entities are the fundamental building blocks that represent any identifiable thing in the knowledge graph. Each entity has:

- A globally unique UUID4 identifier
- A set of values (key-value pairs)
- Optional relations to other entities

For example, an entity could represent:
- A person (like Albert Einstein)
- A place (like Paris)
- An organization (like NASA)
- An abstract concept (like Relativity)

### Entity Structure

The core entity structure in GRC-20 is elegantly simple:

```proto
message Entity {
  bytes id        = 1;  // UUID4
  repeated Value values = 2;
}
```

Each value attached to an entity includes:
- A property reference (UUID)
- The actual value (as a UTF-8 string)
- Optional type-specific metadata

## Types: Providing Structure

Types in GRC-20 serve as classification mechanisms that help organize entities and define their expected properties. The type system is designed to be:

- Flexible but structured
- Composable through inheritance
- Evolution-friendly

### Key Features of Types

1. **Implicit Entity Type**
   - Every node automatically has the base Entity type
   - No explicit declaration needed

2. **Type Relations**
   - Types are connected through "broader types" relations
   - Creates a natural hierarchy of classifications

3. **Property Inheritance**
   - Types can define expected properties
   - Subtypes inherit properties from their broader types

### Built-in Type UUIDs

The specification defines several core type identifiers:

```
Type (schema): e7d737c5-3676-4c60-9fa1-6aa64a8c90ad
Property Type: 808a04ce-b21c-4d88-8ad1-2e240613e5ca
Space Type:    362c1dbd-dc64-44bb-a3c4-652f38a642d7
```

## Why This Matters

The GRC-20 approach to entities and types enables:

1. **Flexible Knowledge Representation**
   - Any concept can be modeled as an entity
   - Types provide structure without rigid constraints

2. **Natural Evolution**
   - New types can be added without breaking existing ones
   - Properties can evolve independently

3. **Interoperability**
   - Standard UUID-based identification
   - Consistent serialization format
   - Cross-space references

4. **Web3 Native Design**
   - Built for decentralized networks
   - No dependence on centralized authorities
   - Blockchain-friendly identifiers

## Learn More

This post covers just the basics of entities and types in GRC-20. For the complete specification, including detailed protobuf schemas and implementation guidelines, check out the [full GRC-20 specification](https://forum.thegraph.com/t/grc-20-knowledge-graph/6161).

## Best Practices

When working with GRC-20 entities and types:

1. Always use UUID4 for identifiers
2. Consider type hierarchies carefully
3. Keep entities focused and atomic
4. Use relations to express connections
5. Follow the protobuf serialization format

The GRC-20 specification represents a major step forward in standardizing knowledge representation for Web3. By understanding entities and types, you're well on your way to building interoperable, decentralized knowledge systems. 