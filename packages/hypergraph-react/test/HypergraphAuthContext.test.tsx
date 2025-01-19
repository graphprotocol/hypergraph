import '@testing-library/jest-dom/vitest';
import { cleanup, renderHook } from '@testing-library/react';
// biome-ignore lint/style/useImportType: <explanation>
import React from 'react';
import { type PrivateKeyAccount, generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { afterEach, describe, expect, it } from 'vitest';

import type { Identity } from '@graphprotocol/hypergraph';

import { HypergraphAuthProvider, useAuthenticated, useHypergraphAccountId } from '../src/HypergraphAuthContext.js';

afterEach(() => {
  cleanup();
});

const storageMockDict = {} as { [key: string]: string };
const storageMock = {
  getItem: (key: string) => {
    return storageMockDict[key] || null;
  },
  setItem: (key: string, value: string) => {
    storageMockDict[key] = value;
  },
  removeItem: (key: string) => {
    delete storageMockDict[key];
  },
};
const accountSigner = (account: PrivateKeyAccount): Identity.Signer => {
  return {
    signMessage: async (message: string) => {
      return account.signMessage({ message });
    },
    getAddress: async () => {
      return account.address;
    },
  };
};

describe('HypergraphAuthContext', () => {
  it('should render the HypergraphAuthProvider and be initially unauthenticetd', async () => {
    // generate a random private key to simulate a user wallet
    const account = privateKeyToAccount(generatePrivateKey());
    const signer = accountSigner(account);
    const wrapper = ({ children }: Readonly<{ children: React.ReactNode }>) => (
      <HypergraphAuthProvider storage={storageMock} signer={signer}>
        {children}
      </HypergraphAuthProvider>
    );

    const { result: authenticatedResult } = renderHook(() => useAuthenticated(), { wrapper });
    expect(authenticatedResult.current).toEqual(false);
    const { result: accountIdResult } = renderHook(() => useHypergraphAccountId(), { wrapper });
    expect(accountIdResult.current).toBeNull();
  });
});
