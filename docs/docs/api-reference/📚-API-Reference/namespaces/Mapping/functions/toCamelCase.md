# Function: toCamelCase()

> **toCamelCase**(`str`): `string`

Defined in: [packages/hypergraph/src/mapping/Utils.ts:25](https://github.com/hashirpm/hypergraph/blob/ab4ea1cdb9430798142e0d735aac9d31c2cf0ae0/packages/hypergraph/src/mapping/Utils.ts#L25)

Takes the input string and returns the camelCase equivalent

## Parameters

### str

`string`

input string

## Returns

`string`

camelCased value of the input string

## Example

```ts
import { toCamelCase } from '@graphprotocol/hypergraph/mapping'

expect(toCamelCase('Address line 1')).toEqual('addressLine1');
expect(toCamelCase('AddressLine1')).toEqual('addressLine1');
expect(toCamelCase('addressLine1')).toEqual('addressLine1');
expect(toCamelCase('address_line_1')).toEqual('addressLine1');
expect(toCamelCase('address-line-1')).toEqual('addressLine1');
expect(toCamelCase('address-line_1')).toEqual('addressLine1');
expect(toCamelCase('address-line 1')).toEqual('addressLine1');
expect(toCamelCase('ADDRESS_LINE_1')).toEqual('addressLine1');
```

## Since

0.2.0
