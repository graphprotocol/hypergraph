# Type Alias: MappingEntry

> **MappingEntry** = `object`

Defined in: [packages/hypergraph/src/mapping/Mapping.ts:11](https://github.com/hashirpm/hypergraph/blob/ab4ea1cdb9430798142e0d735aac9d31c2cf0ae0/packages/hypergraph/src/mapping/Mapping.ts#L11)

Mappings for a schema type and its properties/relations

## Since

0.2.0

## Properties

### properties?

> `optional` **properties**: `object`

Defined in: [packages/hypergraph/src/mapping/Mapping.ts:24](https://github.com/hashirpm/hypergraph/blob/ab4ea1cdb9430798142e0d735aac9d31c2cf0ae0/packages/hypergraph/src/mapping/Mapping.ts#L24)

Record of property names to the `Id` of the type in the Knowledge Graph

#### Index Signature

\[`key`: `string`\]: `Id`

#### Since

0.2.0

***

### relations?

> `optional` **relations**: `object`

Defined in: [packages/hypergraph/src/mapping/Mapping.ts:34](https://github.com/hashirpm/hypergraph/blob/ab4ea1cdb9430798142e0d735aac9d31c2cf0ae0/packages/hypergraph/src/mapping/Mapping.ts#L34)

Record of relation properties to the `Id` of the type in the Knowledge Graph

#### Index Signature

\[`key`: `string`\]: `Id`

#### Since

0.2.0

***

### typeIds

> **typeIds**: `Grc20Id`[]

Defined in: [packages/hypergraph/src/mapping/Mapping.ts:18](https://github.com/hashirpm/hypergraph/blob/ab4ea1cdb9430798142e0d735aac9d31c2cf0ae0/packages/hypergraph/src/mapping/Mapping.ts#L18)

Array of the `Id` of the type in the Knowledge Graph.
Is an array because a type can belong to multiple spaces/extend multiple types.

#### Since

0.2.0
