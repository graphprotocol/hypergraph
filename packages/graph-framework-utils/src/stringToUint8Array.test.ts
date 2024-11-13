import { describe, expect, it } from 'vitest';
import { stringToUint8Array } from './stringToUint8Array.js';

describe('stringToUint8Array', () => {
  it('should convert a string to a Uint8Array', () => {
    const encoded = stringToUint8Array('Hello World');
    expect(encoded).toEqual(new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100]));

    const encoded2 = stringToUint8Array('{ "entry": "Hello World" }');
    expect(encoded2).toEqual(
      new Uint8Array([
        123, 32, 34, 101, 110, 116, 114, 121, 34, 58, 32, 34, 72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 34,
        32, 125,
      ]),
    );
  });
});
