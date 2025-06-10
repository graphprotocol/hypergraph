---
slug: grc20-serialization-and-encoding
title: "4. Serialization and Encoding in GRC-20"
date: 2025-06-07
series_position: 4
authors: [nik]
tags: [knowledge-graphs, education, grc20]
---

> **Series:** GRC-20 Knowledge Graph (Part 4 of 6)  
> **Previous:** [← UUIDs & Identifiers](/blog/grc20-uuids-and-identifiers)  
> **Next:** [Spaces & Governance →](/blog/grc20-spaces-and-governance)

Let's explore the details of how data is encoded and transmitted in GRC-20.

<!-- truncate -->

## Protocol Buffers: The Core Format

### Why Protocol Buffers?

GRC-20 chose Protocol Buffers for several reasons:

1. **Efficiency**: Compact binary format
2. **Schema Evolution**: Backward/forward compatibility
3. **Language Agnostic**: Wide platform support
4. **Type Safety**: Strong typing and validation
5. **Performance**: Fast serialization/deserialization

### Core Message Types

Here are the fundamental protobuf messages in GRC-20:

```proto
syntax = "proto3";
package grc20;

message Entity {
    bytes id = 1;              // UUID4 (16 bytes)
    repeated Value values = 2;  // Property values
}

message Value {
    bytes property = 1;        // Property UUID
    string value = 2;          // UTF-8 literal
    oneof options {
        TextOptions text_options = 3;
        NumberOptions number_options = 4;
        TimeOptions time_options = 5;
    }
}

message Relation {
    bytes id = 1;
    bytes type = 2;
    bytes from_entity = 3;
    optional bytes from_space = 4;
    optional bytes from_version = 5;
    bytes to_entity = 6;
    optional bytes to_space = 7;
    optional bytes to_version = 8;
    bytes entity = 9;
    optional string position = 10;
    optional bool verified = 11;
}
```

## JSON Representation

While protobuf is used for wire format, JSON is useful for:
- API responses
- Debugging and inspection
- Human-readable storage
- Documentation

### JSON Conversion Rules

When converting protobuf messages to JSON:

1. **UUID Fields**
   - Convert 16-byte arrays to lowercase hex strings with dashes
   - Example: `"2a5fe010-078b-4ad6-8a61-7272f33729f4"`

2. **Repeated Fields**
   - Represent as JSON arrays
   - Preserve order exactly

3. **Optional Fields**
   - Omit if not present
   - Never use null values

4. **Oneof Fields**
   - Include only the present option
   - Use camelCase naming

### Example JSON Formats

#### Entity

```json
{
    "id": "2a5fe010-078b-4ad6-8a61-7272f33729f4",
    "values": [
        {
            "property": "a126ca53-0c8e-48d5-b888-82c734c38935",
            "value": "Example Entity",
            "textOptions": {
                "language": "en"
            }
        }
    ]
}
```

#### Relation

```json
{
    "id": "29785ffb-5ce6-4a9b-b0dc-b138328ba334",
    "type": "0509279a-713d-4667-a412-24fe3757f554",
    "fromEntity": "2a5fe010-078b-4ad6-8a61-7272f33729f4",
    "toEntity": "386d9dde-4c10-4099-af42-0e946bf2f199",
    "position": "a",
    "verified": true
}
```