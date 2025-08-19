# Type Alias: SmartSessionClient

> **SmartSessionClient** = `object`

Defined in: [packages/hypergraph/src/connect/smart-account.ts:168](https://github.com/hashirpm/hypergraph/blob/ab4ea1cdb9430798142e0d735aac9d31c2cf0ae0/packages/hypergraph/src/connect/smart-account.ts#L168)

## Properties

### account

> **account**: `Account`

Defined in: [packages/hypergraph/src/connect/smart-account.ts:169](https://github.com/hashirpm/hypergraph/blob/ab4ea1cdb9430798142e0d735aac9d31c2cf0ae0/packages/hypergraph/src/connect/smart-account.ts#L169)

***

### chain

> **chain**: `Chain`

Defined in: [packages/hypergraph/src/connect/smart-account.ts:170](https://github.com/hashirpm/hypergraph/blob/ab4ea1cdb9430798142e0d735aac9d31c2cf0ae0/packages/hypergraph/src/connect/smart-account.ts#L170)

***

### sendUserOperation()

> **sendUserOperation**: \<`calls`\>(`{ calls }`) => `Promise`\<`string`\>

Defined in: [packages/hypergraph/src/connect/smart-account.ts:171](https://github.com/hashirpm/hypergraph/blob/ab4ea1cdb9430798142e0d735aac9d31c2cf0ae0/packages/hypergraph/src/connect/smart-account.ts#L171)

#### Type Parameters

##### calls

`calls` *extends* readonly `unknown`[]

#### Parameters

##### \{ calls \}

###### calls

`calls`

#### Returns

`Promise`\<`string`\>

***

### signMessage()

> **signMessage**: (`{ message }`) => `Promise`\<`Hex`\>

Defined in: [packages/hypergraph/src/connect/smart-account.ts:173](https://github.com/hashirpm/hypergraph/blob/ab4ea1cdb9430798142e0d735aac9d31c2cf0ae0/packages/hypergraph/src/connect/smart-account.ts#L173)

#### Parameters

##### \{ message \}

###### message

`SignableMessage`

#### Returns

`Promise`\<`Hex`\>

***

### waitForUserOperationReceipt()

> **waitForUserOperationReceipt**: (`{ hash }`) => `Promise`\<`WaitForUserOperationReceiptReturnType`\>

Defined in: [packages/hypergraph/src/connect/smart-account.ts:172](https://github.com/hashirpm/hypergraph/blob/ab4ea1cdb9430798142e0d735aac9d31c2cf0ae0/packages/hypergraph/src/connect/smart-account.ts#L172)

#### Parameters

##### \{ hash \}

###### hash

`Hex`

#### Returns

`Promise`\<`WaitForUserOperationReceiptReturnType`\>
