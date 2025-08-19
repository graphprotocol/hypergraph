# Class: TypesyncHypergraphSchema

Defined in: [packages/hypergraph/src/cli/services/Model.ts:43](https://github.com/hashirpm/hypergraph/blob/ab4ea1cdb9430798142e0d735aac9d31c2cf0ae0/packages/hypergraph/src/cli/services/Model.ts#L43)

## Extends

- `object`

## Constructors

### Constructor

> **new TypesyncHypergraphSchema**(`props`, `options?`): `TypesyncHypergraphSchema`

Defined in: node\_modules/.pnpm/effect@3.17.6/node\_modules/effect/dist/dts/Schema.d.ts:4265

#### Parameters

##### props

###### types

readonly [`TypesyncHypergraphSchemaType`](TypesyncHypergraphSchemaType.md)[] = `...`

##### options?

`MakeOptions`

#### Returns

`TypesyncHypergraphSchema`

#### Inherited from

`Schema.Class<TypesyncHypergraphSchema>( '/Hypergraph/cli/models/TypesyncHypergraphSchema', )({ types: Schema.Array(TypesyncHypergraphSchemaType).pipe( Schema.minItems(1), Schema.filter(Utils.namesAreUnique, { identifier: 'DuplicateTypeNames', jsonSchema: {}, description: 'The type.name must be unique across all types in the schema', }), Schema.filter(Mapping.allRelationPropertyTypesExist, { identifier: 'AllRelationTypesExist', jsonSchema: {}, description: 'Each type property of dataType RELATION must have a type of the same name in the schema', }), ), }).constructor`

## Properties

### types

> `readonly` **types**: readonly [`TypesyncHypergraphSchemaType`](TypesyncHypergraphSchemaType.md)[]

Defined in: [packages/hypergraph/src/cli/services/Model.ts:46](https://github.com/hashirpm/hypergraph/blob/ab4ea1cdb9430798142e0d735aac9d31c2cf0ae0/packages/hypergraph/src/cli/services/Model.ts#L46)

#### Inherited from

`Schema.Class<TypesyncHypergraphSchema>( '/Hypergraph/cli/models/TypesyncHypergraphSchema', )({ types: Schema.Array(TypesyncHypergraphSchemaType).pipe( Schema.minItems(1), Schema.filter(Utils.namesAreUnique, { identifier: 'DuplicateTypeNames', jsonSchema: {}, description: 'The type.name must be unique across all types in the schema', }), Schema.filter(Mapping.allRelationPropertyTypesExist, { identifier: 'AllRelationTypesExist', jsonSchema: {}, description: 'Each type property of dataType RELATION must have a type of the same name in the schema', }), ), }).types`
