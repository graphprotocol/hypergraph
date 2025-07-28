import { describe, expect, it } from 'vitest';

import * as Utils from '../../src/mapping/Utils.js';

describe('Utils', () => {
  describe('toCamelCase', () => {
    it('should convert the strings to camelCase', () => {
      expect(Utils.toCamelCase('Address line 1')).toEqual('addressLine1');
      expect(Utils.toCamelCase('AddressLine1')).toEqual('addressLine1');
      expect(Utils.toCamelCase('addressLine1')).toEqual('addressLine1');
      expect(Utils.toCamelCase('address_line_1')).toEqual('addressLine1');
      expect(Utils.toCamelCase('address-line-1')).toEqual('addressLine1');
      expect(Utils.toCamelCase('address-line_1')).toEqual('addressLine1');
      expect(Utils.toCamelCase('address-line 1')).toEqual('addressLine1');
      expect(Utils.toCamelCase('ADDRESS_LINE_1')).toEqual('addressLine1');
    });
    it.fails('should throw an InvalidNameError if string is empty', () => {
      expect(Utils.toCamelCase('')).toThrowError(Utils.InvalidInputError);
    });
  });
  describe('toPascalCase', () => {
    it('should convert the strings to PascalCase', () => {
      expect(Utils.toPascalCase('Address line 1')).toEqual('AddressLine1');
      expect(Utils.toPascalCase('AddressLine1')).toEqual('AddressLine1');
      expect(Utils.toPascalCase('addressLine1')).toEqual('AddressLine1');
      expect(Utils.toPascalCase('address_line_1')).toEqual('AddressLine1');
      expect(Utils.toPascalCase('address-line-1')).toEqual('AddressLine1');
      expect(Utils.toPascalCase('address-line_1')).toEqual('AddressLine1');
      expect(Utils.toPascalCase('address-line 1')).toEqual('AddressLine1');
      expect(Utils.toPascalCase('ADDRESS_LINE_1')).toEqual('AddressLine1');
    });
    it.fails('should throw an InvalidNameError if string is empty', () => {
      expect(Utils.toPascalCase('')).toThrowError(Utils.InvalidInputError);
    });
  });
  describe('namesAreUnique', () => {
    it('should return true if the name prop on each entry is unique', () => {
      expect(Utils.namesAreUnique([{ name: 'Account' }, { name: 'Event' }])).toEqual(true);
    });
    it('should return false if the name prop on each entry is not unique', () => {
      expect(Utils.namesAreUnique([{ name: 'Account' }, { name: 'Event' }, { name: 'Account' }])).toEqual(false);
      // should handle casing
      expect(Utils.namesAreUnique([{ name: 'Account' }, { name: 'Event' }, { name: 'account' }])).toEqual(false);
    });
  });
});
