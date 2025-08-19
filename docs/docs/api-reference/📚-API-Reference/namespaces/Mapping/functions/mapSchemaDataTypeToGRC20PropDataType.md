# Function: mapSchemaDataTypeToGRC20PropDataType()

> **mapSchemaDataTypeToGRC20PropDataType**(`dataType`): `ValueDataType` \| `"RELATION"`

Defined in: [packages/hypergraph/src/mapping/Mapping.ts:787](https://github.com/hashirpm/hypergraph/blob/ab4ea1cdb9430798142e0d735aac9d31c2cf0ae0/packages/hypergraph/src/mapping/Mapping.ts#L787)

## Parameters

### dataType

the dataType from the user-submitted schema

`` `Relation(${string})` `` | `"String"` | `"Number"` | `"Boolean"` | `"Date"` | `"Point"`

## Returns

`ValueDataType` \| `"RELATION"`

the mapped to GRC-20 dataType for the GRC-20 ops

## Since

0.2.0
