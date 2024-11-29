import { describe, expect, it } from 'vitest';

import { encryptMessage } from '../src/encrypt-message.js';

describe('encryptMessage', () => {
  const tooShortKey = new Uint8Array(31).fill(1);

  it('should fail to encrypt with a too short key', () => {
    expect(() => {
      encryptMessage({ message: new TextEncoder().encode('Hello, World!'), secretKey: tooShortKey });
    }).toThrow();
  });
});
