# Class: TypesyncHypergraphSchemaType

Defined in: [packages/hypergraph/src/cli/services/Model.ts:29](https://github.com/hashirpm/hypergraph/blob/ab4ea1cdb9430798142e0d735aac9d31c2cf0ae0/packages/hypergraph/src/cli/services/Model.ts#L29)

## Extends

- `object` & `object` & `object` & `object`

## Constructors

### Constructor

> **new TypesyncHypergraphSchemaType**(`props`, `options?`): `TypesyncHypergraphSchemaType`

Defined in: node\_modules/.pnpm/effect@3.17.6/node\_modules/effect/dist/dts/Schema.d.ts:4265

#### Parameters

##### props

###### knowledgeGraphId

`null` \| `string` = `...`

###### name

`string` = `EffectSchema.NonEmptyTrimmedString`

###### properties

readonly \{ `dataType`: `` `Relation(${string})` ``; `knowledgeGraphId`: `null` \| `string`; `name`: `string`; `optional?`: `null` \| `boolean`; `relationType`: `string`; \} \| \{ `dataType`: `"String"` \| `"Number"` \| `"Boolean"` \| `"Date"` \| `"Point"`; `knowledgeGraphId`: `null` \| `string`; `name`: `string`; `optional?`: `null` \| `boolean`; \} & `object`[] = `...`

###### status

`null` \| `"published"` \| `"synced"` \| `"published_not_synced"` = `TypesyncHypergraphSchemaStatus`

##### options?

`MakeOptions`

#### Returns

`TypesyncHypergraphSchemaType`

#### Inherited from

`Schema.Class<TypesyncHypergraphSchemaType>( '/Hypergraph/cli/models/TypesyncHypergraphSchemaType', )({ ...Mapping.SchemaType.omit('properties').fields, status: TypesyncHypergraphSchemaStatus, properties: Schema.Array(TypesyncHypergraphSchemaTypeProperty).pipe( Schema.minItems(1), Schema.filter(Utils.namesAreUnique, { identifier: 'DuplicatePropertyNames', jsonSchema: {}, description: 'The property.name must be unique across all properties in the type', }), ), }).constructor`

## Properties

### knowledgeGraphId

> `readonly` **knowledgeGraphId**: `null` \| `string`

Defined in: [packages/hypergraph/src/mapping/Mapping.ts:184](https://github.com/hashirpm/hypergraph/blob/ab4ea1cdb9430798142e0d735aac9d31c2cf0ae0/packages/hypergraph/src/mapping/Mapping.ts#L184)

#### Inherited from

`Schema.Class<TypesyncHypergraphSchemaType>( '/Hypergraph/cli/models/TypesyncHypergraphSchemaType', )({ ...Mapping.SchemaType.omit('properties').fields, status: TypesyncHypergraphSchemaStatus, properties: Schema.Array(TypesyncHypergraphSchemaTypeProperty).pipe( Schema.minItems(1), Schema.filter(Utils.namesAreUnique, { identifier: 'DuplicatePropertyNames', jsonSchema: {}, description: 'The property.name must be unique across all properties in the type', }), ), }).knowledgeGraphId`

***

### name

> `readonly` **name**: `string` = `EffectSchema.NonEmptyTrimmedString`

Defined in: [packages/hypergraph/src/mapping/Mapping.ts:183](https://github.com/hashirpm/hypergraph/blob/ab4ea1cdb9430798142e0d735aac9d31c2cf0ae0/packages/hypergraph/src/mapping/Mapping.ts#L183)

#### Inherited from

`Schema.Class<TypesyncHypergraphSchemaType>( '/Hypergraph/cli/models/TypesyncHypergraphSchemaType', )({ ...Mapping.SchemaType.omit('properties').fields, status: TypesyncHypergraphSchemaStatus, properties: Schema.Array(TypesyncHypergraphSchemaTypeProperty).pipe( Schema.minItems(1), Schema.filter(Utils.namesAreUnique, { identifier: 'DuplicatePropertyNames', jsonSchema: {}, description: 'The property.name must be unique across all properties in the type', }), ), }).name`

***

### properties

> `readonly` **properties**: readonly \{ `dataType`: `` `Relation(${string})` ``; `knowledgeGraphId`: `null` \| `string`; `name`: `string`; `optional?`: `null` \| `boolean`; `relationType`: `string`; \} \| \{ `dataType`: `"String"` \| `"Number"` \| `"Boolean"` \| `"Date"` \| `"Point"`; `knowledgeGraphId`: `null` \| `string`; `name`: `string`; `optional?`: `null` \| `boolean`; \} & `object`[]

Defined in: [packages/hypergraph/src/cli/services/Model.ts:34](https://github.com/hashirpm/hypergraph/blob/ab4ea1cdb9430798142e0d735aac9d31c2cf0ae0/packages/hypergraph/src/cli/services/Model.ts#L34)

#### Inherited from

`Schema.Class<TypesyncHypergraphSchemaType>( '/Hypergraph/cli/models/TypesyncHypergraphSchemaType', )({ ...Mapping.SchemaType.omit('properties').fields, status: TypesyncHypergraphSchemaStatus, properties: Schema.Array(TypesyncHypergraphSchemaTypeProperty).pipe( Schema.minItems(1), Schema.filter(Utils.namesAreUnique, { identifier: 'DuplicatePropertyNames', jsonSchema: {}, description: 'The property.name must be unique across all properties in the type', }), ), }).properties`

***

### status

> `readonly` **status**: `null` \| `"published"` \| `"synced"` \| `"published_not_synced"` = `TypesyncHypergraphSchemaStatus`

Defined in: [packages/hypergraph/src/cli/services/Model.ts:33](https://github.com/hashirpm/hypergraph/blob/ab4ea1cdb9430798142e0d735aac9d31c2cf0ae0/packages/hypergraph/src/cli/services/Model.ts#L33)

#### Inherited from

`Schema.Class<TypesyncHypergraphSchemaType>( '/Hypergraph/cli/models/TypesyncHypergraphSchemaType', )({ ...Mapping.SchemaType.omit('properties').fields, status: TypesyncHypergraphSchemaStatus, properties: Schema.Array(TypesyncHypergraphSchemaTypeProperty).pipe( Schema.minItems(1), Schema.filter(Utils.namesAreUnique, { identifier: 'DuplicatePropertyNames', jsonSchema: {}, description: 'The property.name must be unique across all properties in the type', }), ), }).status`
