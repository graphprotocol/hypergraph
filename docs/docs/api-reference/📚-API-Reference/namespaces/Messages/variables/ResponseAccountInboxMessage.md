# Variable: ResponseAccountInboxMessage

> `const` **ResponseAccountInboxMessage**: `Struct`\<\{ `accountAddress`: *typeof* `String$`; `inboxId`: *typeof* `String$`; `message`: `Struct`\<\{ `authorAccountAddress`: `optional`\<*typeof* `String$`\>; `ciphertext`: *typeof* `String$`; `createdAt`: *typeof* `Date$`; `id`: *typeof* `String$`; `signature`: `optional`\<`Struct`\<\{ `hex`: *typeof* `String$`; `recovery`: *typeof* `Number$`; \}\>\>; \}\>; `type`: `Literal`\<\[`"account-inbox-message"`\]\>; \}\>

Defined in: [packages/hypergraph/src/messages/types.ts:398](https://github.com/hashirpm/hypergraph/blob/ab4ea1cdb9430798142e0d735aac9d31c2cf0ae0/packages/hypergraph/src/messages/types.ts#L398)
