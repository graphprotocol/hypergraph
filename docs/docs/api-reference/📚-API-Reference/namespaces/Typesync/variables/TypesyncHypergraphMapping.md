# Variable: TypesyncHypergraphMapping

> `const` **TypesyncHypergraphMapping**: `Record$`\<*typeof* `NonEmptyTrimmedString`, `Struct`\<\{ `properties`: `optional`\<`UndefinedOr`\<`Record$`\<*typeof* `NonEmptyTrimmedString`, *typeof* `UUID`\>\>\>; `relations`: `optional`\<`UndefinedOr`\<`Record$`\<*typeof* `NonEmptyTrimmedString`, *typeof* `UUID`\>\>\>; `typeIds`: `filter`\<`Array$`\<*typeof* `UUID`\>\>; \}\>\>

Defined in: [packages/hypergraph/src/cli/services/Model.ts:65](https://github.com/hashirpm/hypergraph/blob/ab4ea1cdb9430798142e0d735aac9d31c2cf0ae0/packages/hypergraph/src/cli/services/Model.ts#L65)

Extending the hypergraph [Mapping definition](../../../../_media/Mapping.ts) to make it an effect Schema instance.
Allows decoding as well as passing in the api request payload
