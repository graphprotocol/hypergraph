# Variable: CreateSpaceInboxEvent

> `const` **CreateSpaceInboxEvent**: `Struct`\<\{ `author`: `Struct`\<\{ `accountAddress`: *typeof* `String$`; `signature`: `Struct`\<\{ `hex`: *typeof* `String$`; `recovery`: *typeof* `Number$`; \}\>; \}\>; `transaction`: `Struct`\<\{ `authPolicy`: `Union`\<\[`Literal`\<\[`"anonymous"`\]\>, `Literal`\<\[`"optional_auth"`\]\>, `Literal`\<\[`"requires_auth"`\]\>\]\>; `encryptionPublicKey`: *typeof* `String$`; `id`: *typeof* `String$`; `inboxId`: *typeof* `String$`; `isPublic`: *typeof* `Boolean$`; `previousEventHash`: *typeof* `String$`; `secretKey`: *typeof* `String$`; `spaceId`: *typeof* `String$`; `type`: `Literal`\<\[`"create-space-inbox"`\]\>; \}\>; \}\>

Defined in: [packages/hypergraph/src/space-events/types.ts:82](https://github.com/hashirpm/hypergraph/blob/ab4ea1cdb9430798142e0d735aac9d31c2cf0ae0/packages/hypergraph/src/space-events/types.ts#L82)
