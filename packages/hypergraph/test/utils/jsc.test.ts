import { describe, expect, it } from 'vitest';

import { InfinityNotAllowedError, NaNNotAllowedError, canonicalize } from '../../src/utils/jsc.js';

describe('jsc', () => {
  describe('canonicalize', () => {
    it('should handle primitive values', () => {
      expect(canonicalize(null)).toBe('null');
      expect(canonicalize(true)).toBe('true');
      expect(canonicalize(false)).toBe('false');
      expect(canonicalize(123)).toBe('123');
      expect(canonicalize('string')).toBe('"string"');
    });
    it('should canonizalize the given object using RFC8785 and maintain order for complex object', () => {
      const json = {
        1: { f: { f: 'hi', F: 5 }, '\n': 56.0 },
        10: {},
        '': 'empty',
        a: {},
        111: [
          {
            e: 'yes',
            E: 'no',
          },
        ],
        A: {},
      };
      const actual = canonicalize(json);

      expect(actual).toEqual(
        '{"":"empty","1":{"\\n":56,"f":{"F":5,"f":"hi"}},"10":{},"111":[{"E":"no","e":"yes"}],"A":{},"a":{}}',
      );
    });
    it('should canonicalize a simple JSON object', () => {
      const json = {
        from_account: '543 232 625-3',
        to_account: '321 567 636-4',
        amount: 500,
        currency: 'USD',
      };
      expect(canonicalize(json)).toEqual(
        '{"amount":500,"currency":"USD","from_account":"543 232 625-3","to_account":"321 567 636-4"}',
      );
    });
    it('should handle empty array', () => {
      expect(canonicalize([])).toBe('[]');
    });
    it('should handle array with various types', () => {
      expect(canonicalize([1, 'text', null, true, false])).toBe('[1,"text",null,true,false]');
    });
    it('should ignore undefined and symbol values in arrays', () => {
      expect(canonicalize([1, undefined, Symbol('symbol'), 2])).toBe('[1,2]');
    });
    it('should handle empty object', () => {
      expect(canonicalize({})).toBe('{}');
    });
    it('should handle object with sorted keys', () => {
      const obj = { b: 2, a: 1 };
      expect(canonicalize(obj)).toBe('{"a":1,"b":2}');
    });
    it('should ignore undefined and symbol values in objects', () => {
      const obj = { a: 1, b: undefined, c: Symbol('symbol'), d: 2 };
      expect(canonicalize(obj)).toBe('{"a":1,"d":2}');
    });
    it('should handle nested objects and arrays', () => {
      const obj = { b: [3, 2, { c: 1 }], a: { x: 'y' } };
      expect(canonicalize(obj)).toBe('{"a":{"x":"y"},"b":[3,2,{"c":1}]}');
    });
    it('should handle objects with toJSON method', () => {
      const obj = {
        toJSON: () => ({ a: 1, b: 2 }),
      };
      expect(canonicalize(obj)).toBe('{"a":1,"b":2}');
    });
    it('should throw NaNNotAllowedError for NaN values', () => {
      expect(() => canonicalize(Number.NaN)).toThrow(NaNNotAllowedError);
    });
    it('should throw an error if given an infinite number', () => {
      expect(() => {
        canonicalize(Number.POSITIVE_INFINITY);
      }).toThrow(new InfinityNotAllowedError());
    });
  });
});
