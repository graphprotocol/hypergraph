# Variable: RequestCreateInvitationEvent

> `const` **RequestCreateInvitationEvent**: `Struct`\<\{ `event`: `Struct`\<\{ `author`: `Struct`\<\{ `accountAddress`: *typeof* `String$`; `signature`: `Struct`\<\{ `hex`: *typeof* `String$`; `recovery`: *typeof* `Number$`; \}\>; \}\>; `transaction`: `Struct`\<\{ `id`: *typeof* `String$`; `inviteeAccountAddress`: *typeof* `String$`; `previousEventHash`: *typeof* `String$`; `type`: `Literal`\<\[`"create-invitation"`\]\>; \}\>; \}\>; `keyBoxes`: `Array$`\<`Struct`\<\{ `accountAddress`: *typeof* `String$`; `authorPublicKey`: *typeof* `String$`; `ciphertext`: *typeof* `String$`; `id`: *typeof* `String$`; `nonce`: *typeof* `String$`; \}\>\>; `spaceId`: *typeof* `String$`; `type`: `Literal`\<\[`"create-invitation-event"`\]\>; \}\>

Defined in: [packages/hypergraph/src/messages/types.ts:75](https://github.com/hashirpm/hypergraph/blob/ab4ea1cdb9430798142e0d735aac9d31c2cf0ae0/packages/hypergraph/src/messages/types.ts#L75)
