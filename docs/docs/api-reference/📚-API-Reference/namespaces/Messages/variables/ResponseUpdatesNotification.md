# Variable: ResponseUpdatesNotification

> `const` **ResponseUpdatesNotification**: `Struct`\<\{ `spaceId`: *typeof* `String$`; `type`: `Literal`\<\[`"updates-notification"`\]\>; `updates`: `Struct`\<\{ `firstUpdateClock`: *typeof* `Number$`; `lastUpdateClock`: *typeof* `Number$`; `updates`: `Array$`\<`Struct`\<\{ `accountAddress`: *typeof* `String$`; `signature`: `Struct`\<\{ `hex`: *typeof* `String$`; `recovery`: *typeof* `Number$`; \}\>; `update`: *typeof* `Uint8Array$`; `updateId`: *typeof* `String$`; \}\>\>; \}\>; \}\>

Defined in: [packages/hypergraph/src/messages/types.ts:372](https://github.com/hashirpm/hypergraph/blob/ab4ea1cdb9430798142e0d735aac9d31c2cf0ae0/packages/hypergraph/src/messages/types.ts#L372)
