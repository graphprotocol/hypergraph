# Function: toPascalCase()

> **toPascalCase**(`str`): `string`

Defined in: [packages/hypergraph/src/mapping/Utils.ts:87](https://github.com/hashirpm/hypergraph/blob/ab4ea1cdb9430798142e0d735aac9d31c2cf0ae0/packages/hypergraph/src/mapping/Utils.ts#L87)

Takes the input string and returns the PascalCase equivalent

## Parameters

### str

`string`

input string

## Returns

`string`

PascalCased value of the input string

## Example

```ts
iimport { toPascalCase } from '@graphprotocol/hypergraph/mapping'

expect(toPascalCase('Address line 1')).toEqual('AddressLine1');
expect(toPascalCase('AddressLine1')).toEqual('AddressLine1');
expect(toPascalCase('addressLine1')).toEqual('AddressLine1');
expect(toPascalCase('address_line_1')).toEqual('AddressLine1');
expect(toPascalCase('address-line-1')).toEqual('AddressLine1');
expect(toPascalCase('address-line_1')).toEqual('AddressLine1');
expect(toPascalCase('address-line 1')).toEqual('AddressLine1');
expect(toPascalCase('ADDRESS_LINE_1')).toEqual('AddressLine1');
```

## Since

0.2.0
