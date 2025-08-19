# Variable: RequestCreateAccountInbox

> `const` **RequestCreateAccountInbox**: `Struct`\<\{ `accountAddress`: *typeof* `String$`; `authPolicy`: `Union`\<\[`Literal`\<\[`"anonymous"`\]\>, `Literal`\<\[`"optional_auth"`\]\>, `Literal`\<\[`"requires_auth"`\]\>\]\>; `encryptionPublicKey`: *typeof* `String$`; `inboxId`: *typeof* `String$`; `isPublic`: *typeof* `Boolean$`; `signature`: `Struct`\<\{ `hex`: *typeof* `String$`; `recovery`: *typeof* `Number$`; \}\>; `type`: `Literal`\<\[`"create-account-inbox"`\]\>; \}\>

Defined in: [packages/hypergraph/src/messages/types.ts:135](https://github.com/hashirpm/hypergraph/blob/ab4ea1cdb9430798142e0d735aac9d31c2cf0ae0/packages/hypergraph/src/messages/types.ts#L135)
