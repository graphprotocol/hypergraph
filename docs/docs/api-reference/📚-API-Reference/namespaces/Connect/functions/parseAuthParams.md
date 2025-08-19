# Function: parseAuthParams()

> **parseAuthParams**(`params`): `Effect`\<\{ `nonce`: `string`; `payload`: \{ `appId`: `string`; `encryptionPublicKey`: `string`; `expiry`: `number`; \}; `redirect`: `string`; \}, [`FailedToParseConnectAuthUrl`](../../../../classes/FailedToParseConnectAuthUrl.md)\>

Defined in: [packages/hypergraph/src/connect/parse-auth-params.ts:14](https://github.com/hashirpm/hypergraph/blob/ab4ea1cdb9430798142e0d735aac9d31c2cf0ae0/packages/hypergraph/src/connect/parse-auth-params.ts#L14)

## Parameters

### params

`ParseAuthUrlParams`

## Returns

`Effect`\<\{ `nonce`: `string`; `payload`: \{ `appId`: `string`; `encryptionPublicKey`: `string`; `expiry`: `number`; \}; `redirect`: `string`; \}, [`FailedToParseConnectAuthUrl`](../../../../classes/FailedToParseConnectAuthUrl.md)\>
