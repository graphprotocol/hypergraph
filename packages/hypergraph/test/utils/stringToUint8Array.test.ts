import { describe, expect, it } from 'vitest';

import { stringToUint8Array } from '../../src/utils/stringToUint8Array.js';

describe('utils/stringToUint8Array', () => {
  it('should convert a string to a Uint8Array', () => {
    const encoded = stringToUint8Array('Hello World');
    expect(arraysEqual(encoded, new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100]))).toBe(true);

    const encoded2 = stringToUint8Array('{ "entry": "Hello World" }');
    expect(
      arraysEqual(
        encoded2,
        new Uint8Array([
          123, 32, 34, 101, 110, 116, 114, 121, 34, 58, 32, 34, 72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 34,
          32, 125,
        ]),
      ),
    ).toBe(true);
  });
});

function arraysEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
