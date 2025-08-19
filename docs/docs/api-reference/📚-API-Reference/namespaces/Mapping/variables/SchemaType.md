# Variable: SchemaType

> `const` **SchemaType**: `Struct`\<\{ `knowledgeGraphId`: `NullOr`\<*typeof* `UUID`\>; `name`: *typeof* `NonEmptyTrimmedString`; `properties`: `filter`\<`filter`\<`Array$`\<`Union`\<\[`Struct`\<\{ `dataType`: `Literal`\<\[..., ..., ..., ..., ...\]\>; `knowledgeGraphId`: `NullOr`\<*typeof* `UUID`\>; `name`: *typeof* `NonEmptyTrimmedString`; `optional`: `optional`\<`NullishOr`\<...\>\>; \}\>, `Struct`\<\{ `dataType`: `refine`\<`` `Relation(${(...)})` ``, `Schema`\<..., ..., ...\>\>; `knowledgeGraphId`: `NullOr`\<*typeof* `UUID`\>; `name`: *typeof* `NonEmptyTrimmedString`; `optional`: `optional`\<`NullishOr`\<...\>\>; `relationType`: `refine`\<`string`, *typeof* `Trimmed`\>; \}\>\]\>\>\>\>; \}\>

Defined in: [packages/hypergraph/src/mapping/Mapping.ts:182](https://github.com/hashirpm/hypergraph/blob/ab4ea1cdb9430798142e0d735aac9d31c2cf0ae0/packages/hypergraph/src/mapping/Mapping.ts#L182)

## Since

0.2.0
