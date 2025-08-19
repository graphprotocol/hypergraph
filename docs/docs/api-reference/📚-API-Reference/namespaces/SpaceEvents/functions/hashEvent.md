# Function: hashEvent()

> **hashEvent**(`event`): `string`

Defined in: [packages/hypergraph/src/space-events/hash-event.ts:7](https://github.com/hashirpm/hypergraph/blob/ab4ea1cdb9430798142e0d735aac9d31c2cf0ae0/packages/hypergraph/src/space-events/hash-event.ts#L7)

## Parameters

### event

\{ `author`: \{ `accountAddress`: `string`; `signature`: \{ `hex`: `string`; `recovery`: `number`; \}; \}; `transaction`: \{ `creatorAccountAddress`: `string`; `id`: `string`; `type`: `"create-space"`; \}; \} | \{ `author`: \{ `accountAddress`: `string`; `signature`: \{ `hex`: `string`; `recovery`: `number`; \}; \}; `transaction`: \{ `id`: `string`; `previousEventHash`: `string`; `type`: `"delete-space"`; \}; \} | \{ `author`: \{ `accountAddress`: `string`; `signature`: \{ `hex`: `string`; `recovery`: `number`; \}; \}; `transaction`: \{ `id`: `string`; `inviteeAccountAddress`: `string`; `previousEventHash`: `string`; `type`: `"create-invitation"`; \}; \} | \{ `author`: \{ `accountAddress`: `string`; `signature`: \{ `hex`: `string`; `recovery`: `number`; \}; \}; `transaction`: \{ `authPolicy`: `"anonymous"` \| `"optional_auth"` \| `"requires_auth"`; `encryptionPublicKey`: `string`; `id`: `string`; `inboxId`: `string`; `isPublic`: `boolean`; `previousEventHash`: `string`; `secretKey`: `string`; `spaceId`: `string`; `type`: `"create-space-inbox"`; \}; \} | \{ `author`: \{ `accountAddress`: `string`; `signature`: \{ `hex`: `string`; `recovery`: `number`; \}; \}; `transaction`: \{ `id`: `string`; `previousEventHash`: `string`; `type`: `"accept-invitation"`; \}; \}

## Returns

`string`
