# Function: createInvitation()

> **createInvitation**(`__namedParameters`): `Effect`\<\{ `author`: \{ `accountAddress`: `string`; `signature`: \{ `hex`: `string`; `recovery`: `number`; \}; \}; `transaction`: \{ `id`: `string`; `inviteeAccountAddress`: `string`; `previousEventHash`: `string`; `type`: `"create-invitation"`; \}; \}, `undefined`\>

Defined in: [packages/hypergraph/src/space-events/create-invitation.ts:15](https://github.com/hashirpm/hypergraph/blob/ab4ea1cdb9430798142e0d735aac9d31c2cf0ae0/packages/hypergraph/src/space-events/create-invitation.ts#L15)

## Parameters

### \_\_namedParameters

`Params`

## Returns

`Effect`\<\{ `author`: \{ `accountAddress`: `string`; `signature`: \{ `hex`: `string`; `recovery`: `number`; \}; \}; `transaction`: \{ `id`: `string`; `inviteeAccountAddress`: `string`; `previousEventHash`: `string`; `type`: `"create-invitation"`; \}; \}, `undefined`\>
