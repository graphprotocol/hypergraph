import { privateKeyToAccount } from 'viem/accounts';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { encryptIdentity } from '../../src/identity/identity-encryption';
import { getSessionNonce, prepareSiweMessage, restoreKeys, signup } from '../../src/identity/login';
import type { IdentityKeys, Signer, Storage } from '../../src/identity/types';
import type * as Messages from '../../src/messages';

describe('prepareSiweMessage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Set fixed date for consistent tests
    vi.setSystemTime(new Date('2024-01-01'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create a valid SIWE message with correct parameters', () => {
    const address = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
    const nonce = 'Sv2dJppgx9SKDGCIb'; // generateNonce from siwe
    const chainId = 1;

    const message = prepareSiweMessage(
      address,
      nonce,
      { host: 'test.example.com', origin: 'https://test.example.com' },
      chainId,
    );

    expect(message).toContain(`${address}`);
    expect(message).toContain('test.example.com');
    expect(message).toContain('Sign in to Hypergraph');
    expect(message).toContain('https://test.example.com');
    expect(message).toContain(nonce);
    expect(message).toContain('Version: 1');
    expect(message).toContain('Chain ID: 1');

    const expectedExpiration = new Date('2024-01-31').toISOString();
    expect(message).toContain(expectedExpiration);
  });

  it('should create different messages for different addresses', () => {
    const address1 = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
    const address2 = '0x098B742F2696AFC37724887cf999e1cFdB8f4b55';
    const nonce = 'Sv2dJppgx9SKDGCIb'; // generateNonce from siwe
    const chainId = 1;

    const message1 = prepareSiweMessage(
      address1,
      nonce,
      { host: 'test.example.com', origin: 'https://test.example.com' },
      chainId,
    );
    const message2 = prepareSiweMessage(
      address2,
      nonce,
      { host: 'test.example.com', origin: 'https://test.example.com' },
      chainId,
    );

    expect(message1).not.toBe(message2);
  });

  it('should create different messages for different chain IDs', () => {
    const address = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
    const nonce = 'Sv2dJppgx9SKDGCIb'; // generateNonce from siwe

    const message1 = prepareSiweMessage(
      address,
      nonce,
      { host: 'test.example.com', origin: 'https://test.example.com' },
      1,
    );
    const message2 = prepareSiweMessage(
      address,
      nonce,
      { host: 'test.example.com', origin: 'https://test.example.com' },
      137,
    );

    expect(message1).not.toBe(message2);
  });
});

describe('getSessionNonce', () => {
  // mock fetch to http://localhost:3000/login/nonce to return a nonce
  beforeEach(() => {
    vi.spyOn(global, 'fetch').mockImplementation((url) => {
      if (url.toString() === 'http://localhost:3000/login/nonce') {
        return Promise.resolve({
          status: 200,
          json: () => Promise.resolve({ sessionNonce: 'Sv2dJppgx9SKDGCIb' }),
        } as Response);
      }
      return vi.fn() as never;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return a nonce', () => {
    const nonce = getSessionNonce('0x742d35Cc6634C0532925a3b844Bc454e4438f44e', 'http://localhost:3000');
    expect(nonce).toBeDefined();
  });
});

describe('restoreKeys', () => {
  const accountPrivateKey = '0xda75e4ea10de7b3ba2d4212cc16bfbb6cac6aed04ac59a28c3231994d8027a9f';
  const account = privateKeyToAccount(accountPrivateKey);

  const signer: Signer = {
    signMessage: (message) => {
      return account.signMessage({ message });
    },
    getAddress: () => account.address,
  };

  const mockStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  };

  // mock fetch to http://localhost:3000/login/nonce to return a nonce
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(global, 'fetch').mockImplementation((url) => {
      if (url.toString() === 'http://localhost:3000/identity/encrypted') {
        return Promise.resolve({
          status: 200,
          json: () => Promise.resolve({ sessionNonce: 'Sv2dJppgx9SKDGCIb' }),
        } as Response);
      }
      return vi.fn() as never;
    });
  });

  it('should return keys from storage if they exist', async () => {
    const accountId = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
    const mockKeys: IdentityKeys = {
      encryptionPrivateKey: 'encryptionPrivateKey',
      encryptionPublicKey: 'encryptionPublicKey',
      signaturePrivateKey: 'signaturePrivateKey',
      signaturePublicKey: 'signaturePublicKey',
    };
    mockStorage.getItem.mockReturnValue(JSON.stringify(mockKeys));

    const result = await restoreKeys(signer, accountId, 'session-token', 'http://localhost:3000', mockStorage);

    expect(result).toEqual(mockKeys);
    expect(mockStorage.getItem).toHaveBeenCalledWith('hypergraph:dev:keys:0x742d35Cc6634C0532925a3b844Bc454e4438f44e');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('should fetch and decrypt keys if not in storage', async () => {
    const accountId = account.address;
    const identityKeys: IdentityKeys = {
      encryptionPrivateKey: 'encryptionPrivateKey',
      encryptionPublicKey: 'encryptionPublicKey',
      signaturePrivateKey: 'signaturePrivateKey',
      signaturePublicKey: 'signaturePublicKey',
    };

    const encryptedIdentity = await encryptIdentity(signer, accountId, identityKeys);

    const mockEncryptedKeys: Messages.ResponseIdentityEncrypted = {
      keyBox: {
        accountId,
        ciphertext: encryptedIdentity.ciphertext,
        nonce: encryptedIdentity.nonce,
      },
    };

    mockStorage.getItem.mockReturnValue(null);

    vi.spyOn(global, 'fetch').mockImplementation((url) => {
      if (url.toString() === 'http://localhost:3000/identity/encrypted') {
        return Promise.resolve({
          status: 200,
          json: () => Promise.resolve(mockEncryptedKeys),
        } as Response);
      }
      return vi.fn() as never;
    });

    const result = await restoreKeys(signer, accountId, 'session-token', 'http://localhost:3000', mockStorage);

    expect(result).toEqual(identityKeys);
    expect(mockStorage.getItem).toHaveBeenCalledWith('hypergraph:dev:keys:0x4aAE31951Dfd101d95c2b90e6a8a44b49867346E');
    expect(JSON.parse(mockStorage.setItem.mock.calls[0][1])).toEqual(identityKeys);
    expect(fetch).toHaveBeenCalledWith(
      expect.any(URL),
      expect.objectContaining({
        headers: {
          Authorization: 'Bearer session-token',
        },
      }),
    );
  });

  it('should throw error if fetch fails', async () => {
    const accountId = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';

    mockStorage.getItem.mockReturnValue(null);

    vi.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        status: 404,
      } as Response),
    );

    await expect(restoreKeys(signer, accountId, 'session-token', 'http://localhost:3000', mockStorage)).rejects.toThrow(
      'Error fetching identity 404',
    );
  });
});

describe('signup', () => {
  let mockStorage: Storage;

  const accountPrivateKey = '0xda75e4ea10de7b3ba2d4212cc16bfbb6cac6aed04ac59a28c3231994d8027a9f';
  const account = privateKeyToAccount(accountPrivateKey);
  const accountId = account.address;

  const signer: Signer = {
    signMessage: (message) => {
      return account.signMessage({ message });
    },
    getAddress: () => account.address,
  };

  const location = { host: 'localhost', origin: 'http://localhost' };

  beforeEach(() => {
    mockStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
  });

  it('should create and store new identity', async () => {
    const sessionToken = 'session-token';

    vi.spyOn(global, 'fetch').mockImplementation((url) => {
      if (url.toString() === 'http://localhost:3000/login/nonce') {
        return Promise.resolve({
          status: 200,
          json: () => Promise.resolve({ sessionNonce: 'Sv2dJppgx9SKDGCIb' }),
        } as Response);
      }
      if (url.toString() === 'http://localhost:3000/identity') {
        return Promise.resolve({
          status: 200,
          json: () => Promise.resolve({ sessionToken }),
        } as Response);
      }
      return vi.fn() as never;
    });

    const result = await signup(signer, accountId, 'http://localhost:3000', 1, mockStorage, location);

    expect(result.accountId).toEqual(accountId);
    expect(result.sessionToken).toEqual(sessionToken);
    expect(result.keys.encryptionPublicKey).toBeDefined();
    expect(result.keys.encryptionPrivateKey).toBeDefined();
    expect(result.keys.signaturePublicKey).toBeDefined();
    expect(result.keys.signaturePrivateKey).toBeDefined();

    expect(mockStorage.setItem).toHaveBeenCalledTimes(3);
    expect(fetch).toHaveBeenCalledWith(
      expect.any(URL),
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    );
  });

  it('should throw error if identity creation fails', async () => {
    vi.spyOn(global, 'fetch').mockImplementation((url) => {
      if (url.toString() === 'http://localhost:3000/login/nonce') {
        return Promise.resolve({
          status: 200,
          json: () => Promise.resolve({ sessionNonce: 'Sv2dJppgx9SKDGCIb' }),
        } as Response);
      }
      if (url.toString() === 'http://localhost:3000/identity') {
        return Promise.resolve({
          status: 500,
        } as Response);
      }
      return vi.fn() as never;
    });

    await expect(signup(signer, accountId, 'http://localhost:3000', 1, mockStorage, location)).rejects.toThrow(
      'Error creating identity: 500',
    );
  });
});
