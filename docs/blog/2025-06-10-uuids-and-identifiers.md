---
slug: grc20-uuids-and-identifiers
title: "3. Working with UUIDs and Identifiers in GRC-20"
date: 2025-06-08
series_position: 3
authors: [nik]
tags: [knowledge-graphs, education, grc20]
---

> **Series:** GRC-20 Knowledge Graph (Part 3 of 6)  
> **Previous:** [← Properties & Relations](/blog/properties-and-relations-in-grc20)  
> **Next:** [Serialization & Encoding →](/blog/grc20-serialization-and-encoding)

The GRC-20 specification uses UUID version 4 as the foundation for all identifiers in the knowledge graph system. Understanding how to work with these identifiers is crucial for building interoperable applications. Let's dive into the details of GRC-20's UUID implementation.

<!-- truncate -->

## Why UUID4?

GRC-20 chose UUID version 4 (random) for several key reasons:

1. **Decentralization**: No central coordination needed
2. **Collision resistance**: 2⁻¹²² probability of collision
3. **Standardization**: Well-defined in RFC 4122
4. **Efficiency**: Compact 16-byte representation
5. **Interoperability**: Wide language/platform support

## Core UUID Constants

GRC-20 defines several fundamental UUIDs that every implementation must know:

```typescript
// Core Types
const TYPE_UUID = "e7d737c5-3676-4c60-9fa1-6aa64a8c90ad"
const PROPERTY_TYPE_UUID = "808a04ce-b21c-4d88-8ad1-2e240613e5ca"
const SPACE_TYPE_UUID = "362c1dbd-dc64-44bb-a3c4-652f38a642d7"

// Native Value Types
const TEXT_TYPE = "9edb6fcc-e454-4aa5-8611-39d7f024c010"
const NUMBER_TYPE = "9b597aae-c31c-46c8-8565-a370da0c2a65"
const CHECKBOX_TYPE = "7aa4792e-eacd-4186-8272-fa7fc18298ac"
const URL_TYPE = "283127c9-6142-4684-92ed-90b0ebc7f29a"
const TIME_TYPE = "167664f6-68f8-40e1-976b-20bd16ed8d47"
const POINT_TYPE = "df250d17-e364-413d-9779-2ddaae841e34"
```

## Working with UUIDs

### Binary (Wire) Format

When transmitting UUIDs in protobuf messages, use raw 16-byte arrays:

```proto
message Entity {
  bytes id = 1;  // 16 bytes, network byte order
  // ...
}
```

### String Representation

For human readability and JSON interfaces, use the canonical 36-character format:

```typescript
// Example UUID string
const entityId = "2a5fe010-078b-4ad6-8a61-7272f33729f4"
```

### Converting Legacy IDs

If you're migrating from an existing system with its own ID format, follow this process:

1. Take your original ID string
2. UTF-8 encode it
3. Compute its MD5 hash
4. Use the 16-byte digest to seed a UUID4 generator
5. Set version (4) and variant bits per RFC 4122

This ensures deterministic, stable UUIDs for your existing identifiers.

## Best Practices

1. **Generation**
   - Always use cryptographically secure random number generators
   - Verify version 4 and variant bits are correctly set
   - Don't try to generate UUIDs manually

2. **Storage**
   - Store as 16-byte arrays in databases
   - Index UUID columns for efficient lookups
   - Consider UUID-optimized database types

3. **Validation**
   - Check length (16 bytes or 36 chars)
   - Verify version 4 bit pattern
   - Validate hex digits and dash positions in strings

4. **Cross-Space References**
   - Include space IDs when referencing external entities
   - Track versions for stability
   - Use the verified flag appropriately

## Implementation Example

Here's a TypeScript example of working with GRC-20 UUIDs:

```typescript
import { v4 as uuidv4 } from 'uuid'
import { createHash } from 'crypto'

// Generate a new UUID4
function generateEntityId(): string {
  return uuidv4()
}

// Convert legacy ID to UUID4
function legacyIdToUuid(legacyId: string): string {
  const hash = createHash('md5')
    .update(legacyId)
    .digest()
  
  // Set version 4 and variant bits
  hash[6] = (hash[6] & 0x0f) | 0x40
  hash[8] = (hash[8] & 0x3f) | 0x80
  
  return formatUuid(hash)
}

// Format 16 bytes as UUID string
function formatUuid(bytes: Buffer): string {
  const hex = bytes.toString('hex')
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20)
  ].join('-')
}
```

## Common Pitfalls

1. **String vs Binary**
   - Don't mix string and binary formats
   - Always be explicit about which format you're using
   - Convert at system boundaries only

2. **Case Sensitivity**
   - Always use lowercase for string UUIDs
   - Be careful with case-sensitive comparisons
   - Normalize input strings

3. **Validation**
   - Don't assume all 16-byte values are valid UUIDs
   - Check version and variant bits
   - Validate string format thoroughly

4. **Performance**
   - Cache UUID parsing results
   - Use binary format for internal operations
   - Batch UUID operations when possible

## Learn More

For complete details on UUID usage in GRC-20, including protobuf schemas and serialization formats, check out the [full GRC-20 specification](https://forum.thegraph.com/t/grc-20-knowledge-graph/6161).

The proper handling of UUIDs is fundamental to building robust GRC-20 implementations. By following these guidelines and best practices, you'll ensure your application can reliably participate in the broader knowledge graph ecosystem. 