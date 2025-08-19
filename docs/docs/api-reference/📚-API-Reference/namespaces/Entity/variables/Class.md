# Variable: Class()

> **Class**: \<`Self`\>(`identifier`) => \<`Fields`\>(`fields`, `annotations?`) => \[`Self`\] *extends* \[`never`\] ? `` "Missing `Self` generic - use `class Self extends Class<Self>()({ ... })`" `` : `ClassFromFields`\<`Self`, `Fields`, \{ \[K in string \| number \| symbol\]: ExtractFields\<"select", Fields, true\>\[K\] \}\> & `object`

Defined in: [packages/hypergraph/src/entity/entity.ts:6](https://github.com/hashirpm/hypergraph/blob/ab4ea1cdb9430798142e0d735aac9d31c2cf0ae0/packages/hypergraph/src/entity/entity.ts#L6)

## Type Parameters

### Self

`Self` = `never`

## Parameters

### identifier

`string`

## Returns

> \<`Fields`\>(`fields`, `annotations?`): \[`Self`\] *extends* \[`never`\] ? `` "Missing `Self` generic - use `class Self extends Class<Self>()({ ... })`" `` : `ClassFromFields`\<`Self`, `Fields`, \{ \[K in string \| number \| symbol\]: ExtractFields\<"select", Fields, true\>\[K\] \}\> & `object`

### Type Parameters

#### Fields

`Fields` *extends* `Fields`

### Parameters

#### fields

`Fields` & `Validate`\<`Fields`, `"update"` \| `"insert"` \| `"select"`\>

#### annotations?

`Schema`\<`Self`, readonly \[\]\>

### Returns

\[`Self`\] *extends* \[`never`\] ? `` "Missing `Self` generic - use `class Self extends Class<Self>()({ ... })`" `` : `ClassFromFields`\<`Self`, `Fields`, \{ \[K in string \| number \| symbol\]: ExtractFields\<"select", Fields, true\>\[K\] \}\> & `object`
