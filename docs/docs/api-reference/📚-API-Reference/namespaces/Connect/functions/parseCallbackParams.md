# Function: parseCallbackParams()

> **parseCallbackParams**(`__namedParameters`): `Effect`\<\{ `accountAddress`: `string`; `appIdentityAddress`: `string`; `appIdentityAddressPrivateKey`: `string`; `encryptionPrivateKey`: `string`; `encryptionPublicKey`: `string`; `permissionId`: `string`; `privateSpaces`: readonly `object`[]; `publicSpaces`: readonly `object`[]; `sessionToken`: `string`; `sessionTokenExpires`: `Date`; `signaturePrivateKey`: `string`; `signaturePublicKey`: `string`; \}, [`FailedToParseAuthCallbackUrl`](../../../../classes/FailedToParseAuthCallbackUrl.md)\>

Defined in: [packages/hypergraph/src/connect/parse-callback-params.ts:19](https://github.com/hashirpm/hypergraph/blob/ab4ea1cdb9430798142e0d735aac9d31c2cf0ae0/packages/hypergraph/src/connect/parse-callback-params.ts#L19)

## Parameters

### \_\_namedParameters

`ParseCallbackUrlParams`

## Returns

`Effect`\<\{ `accountAddress`: `string`; `appIdentityAddress`: `string`; `appIdentityAddressPrivateKey`: `string`; `encryptionPrivateKey`: `string`; `encryptionPublicKey`: `string`; `permissionId`: `string`; `privateSpaces`: readonly `object`[]; `publicSpaces`: readonly `object`[]; `sessionToken`: `string`; `sessionTokenExpires`: `Date`; `signaturePrivateKey`: `string`; `signaturePublicKey`: `string`; \}, [`FailedToParseAuthCallbackUrl`](../../../../classes/FailedToParseAuthCallbackUrl.md)\>
