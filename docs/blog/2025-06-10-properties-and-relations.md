---
slug: properties-and-relations-in-grc20
title: "2. Defining Properties & Relations"
date: 2025-06-09
series_position: 2
authors: [nik]
tags: [knowledge-graphs, education, grc20, hypergraph]
---

> **Series:** GRC-20 Knowledge Graph (Part 2 of 6)  
> **Previous:** [← Entities & Types](/blog/understanding-entities-and-types)  
> **Next:** [UUIDs & Identifiers →](/blog/grc20-uuids-and-identifiers)

In the previous post we learned how Hypergraph models entities and types. Now we'll see how Hypergraph attaches **Properties** to entities and creates **Relations** between them, enabling rich, connected knowledge graphs while staying compliant with the GRC-20 standard.

<!-- truncate -->

## Properties in GRC-20

Properties in GRC-20 are first-class entities that define attributes and their characteristics. Each property entity includes:

- A unique UUID4 identifier
- A value type specification
- Optional metadata (unit, format, language requirements)

### Native Value Types

GRC-20 defines six built-in value types:

| Type     | UUID                                   | Description                   |
|----------|----------------------------------------|-------------------------------|
| Text     | 9edb6fcc-e454-4aa5-8611-39d7f024c010 | Unicode character sequences   |
| Number   | 9b597aae-c31c-46c8-8565-a370da0c2a65 | Decimal numeric values        |
| Checkbox | 7aa4792e-eacd-4186-8272-fa7fc18298ac | Boolean true/false           |
| URL      | 283127c9-6142-4684-92ed-90b0ebc7f29a | URIs with protocol prefix    |
| Time     | 167664f6-68f8-40e1-976b-20bd16ed8d47 | ISO-8601 timestamps          |
| Point    | df250d17-e364-413d-9779-2ddaae841e34 | Coordinate pairs or vectors  |

### Value Options

Properties can specify additional metadata through options:

```proto
message Options {
  oneof value {
    TextOptions   text   = 1;
    NumberOptions number = 2;
    TimeOptions   time   = 3;
  }
}
```

These options enable features like:
- Language tags for text
- Formatting strings for numbers
- Timezone and format specifications for timestamps

## Relations: The Connective Tissue

Relations in GRC-20 are sophisticated edges that can carry their own properties and metadata. They consist of two parts:

1. A lightweight relation record
2. An optional relation entity for additional properties

### Relation Structure

```proto
message Relation {
  bytes id             = 1;  // relation UUID4
  bytes type           = 2;  // relation-type UUID4
  bytes from_entity    = 3;  // source entity UUID4
  optional bytes from_space   = 4;  // source Space UUID4
  optional bytes from_version = 5;  // source Edit/Version UUID4
  bytes to_entity      = 6;  // target entity UUID4
  optional bytes to_space     = 7;  // target Space UUID4
  optional bytes to_version   = 8;  // target Edit/Version UUID4
  bytes entity         = 9;  // relation entity UUID4
  optional string position    = 10; // ordering key
  optional bool verified      = 11; // trust flag
}
```

### Key Features

1. **Cross-Space References**
   - Relations can link entities across different spaces
   - Optional space and version tracking
   - Verification status for trust

2. **Ordered Collections**
   - `position` field enables stable ordering
   - Useful for lists, sequences, and rankings

3. **Rich Metadata**
   - Relation entities can carry additional properties
   - Full entity capabilities for relationship data

## System Properties

GRC-20 defines several system-level properties that are automatically maintained:

1. **Creation Metadata**
   - Created at timestamp
   - Created by (blockchain address)

2. **Update Tracking**
   - Updated at timestamp
   - Version history

3. **Implicit Properties**
   - Name
   - Types
   - Description
   - Cover
   - Blocks

## Best Practices

When working with GRC-20 properties and relations:

1. **Property Design**
   - Use native value types when possible
   - Include appropriate options metadata
   - Consider property reusability

2. **Relation Management**
   - Use relation entities for complex relationships
   - Maintain proper ordering with position keys
   - Track cross-space references carefully

3. **Data Validation**
   - Ensure values match their declared types
   - Handle language tags appropriately
   - Validate URIs and timestamps

## Implementation Example

Here's how you might represent a simple property-relation combination:

```json
{
  "property": {
    "id": "6ab0887f-b6c1-4628-9eee-2234a247c1d2",
    "type": "808a04ce-b21c-4d88-8ad1-2e240613e5ca",  // Property Type
    "value_type": "9edb6fcc-e454-4aa5-8611-39d7f024c010"  // Text Type
  },
  "relation": {
    "id": "29785ffb-5ce6-4a9b-b0dc-b138328ba334",
    "type": "0509279a-713d-4667-a412-24fe3757f554",
    "from_entity": "2a5fe010-078b-4ad6-8a61-7272f33729f4",
    "to_entity": "386d9dde-4c10-4099-af42-0e946bf2f199"
  }
}
```

## Learn More

For complete details on properties, relations, and their implementation, refer to the [GRC-20 specification](https://forum.thegraph.com/t/grc-20-knowledge-graph/6161). The specification includes full protobuf schemas, serialization formats, and detailed guidelines for building compliant systems.

Properties and relations form the foundation of GRC-20's ability to represent rich, interconnected knowledge in a standardized way. By following these patterns, you can build robust, interoperable knowledge graphs that work seamlessly across the decentralized web. 