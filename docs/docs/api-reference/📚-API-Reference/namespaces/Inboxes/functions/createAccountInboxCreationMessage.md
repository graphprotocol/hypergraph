# Function: createAccountInboxCreationMessage()

> **createAccountInboxCreationMessage**(`__namedParameters`): `object`

Defined in: [packages/hypergraph/src/inboxes/create-inbox.ts:30](https://github.com/hashirpm/hypergraph/blob/ab4ea1cdb9430798142e0d735aac9d31c2cf0ae0/packages/hypergraph/src/inboxes/create-inbox.ts#L30)

## Parameters

### \_\_namedParameters

`CreateAccountInboxParams`

## Returns

`object`

### accountAddress

> `readonly` **accountAddress**: `string` = `Schema.String`

### authPolicy

> `readonly` **authPolicy**: `"anonymous"` \| `"optional_auth"` \| `"requires_auth"` = `InboxSenderAuthPolicy`

### encryptionPublicKey

> `readonly` **encryptionPublicKey**: `string` = `Schema.String`

### inboxId

> `readonly` **inboxId**: `string` = `Schema.String`

### isPublic

> `readonly` **isPublic**: `boolean` = `Schema.Boolean`

### signature

> `readonly` **signature**: `object` = `SignatureWithRecovery`

#### signature.hex

> `readonly` **hex**: `string` = `Schema.String`

#### signature.recovery

> `readonly` **recovery**: `number` = `Schema.Number`

### type

> `readonly` **type**: `"create-account-inbox"`
