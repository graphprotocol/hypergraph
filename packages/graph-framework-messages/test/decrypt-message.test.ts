import { describe, expect, it } from 'vitest';

import { decryptMessage } from '../src/decrypt-message.js';
import { encryptMessage } from '../src/encrypt-message.js';

describe('decryptMessage', () => {
  const testKey = new Uint8Array(32).fill(1);

  it('should successfully decrypt a valid message', () => {
    const nonceAndCiphertext = encryptMessage({
      message: new TextEncoder().encode('Hello, World!'),
      secretKey: testKey,
    });

    const result = decryptMessage({
      nonceAndCiphertext,
      secretKey: testKey,
    });

    expect(new TextDecoder().decode(result)).toBe('Hello, World!');
  });

  it('should fail to decrypt with an invalid nonce', () => {
    const nonceAndCiphertext = encryptMessage({
      message: new TextEncoder().encode('Hello, World!'),
      secretKey: testKey,
    });

    expect(() => {
      return decryptMessage({
        nonceAndCiphertext: new Uint8Array([...new Uint8Array(24).fill(0), ...nonceAndCiphertext.subarray(24)]),
        secretKey: testKey,
      });
    }).toThrow();
  });

  it('should fail to decrypt with the wrong key', () => {
    const nonceAndCiphertext = encryptMessage({
      message: new TextEncoder().encode('Hello, World!'),
      secretKey: testKey,
    });

    const wrongKey = new Uint8Array(32).fill(0);

    expect(() => {
      return decryptMessage({
        nonceAndCiphertext,
        secretKey: wrongKey,
      });
    }).toThrow();
  });
});
