import '@testing-library/jest-dom/vitest';
import { cleanup, renderHook, waitFor } from '@testing-library/react';
import type React from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import { HypergraphAppProvider, useHypergraphAuth } from '../src/HypergraphAppContext.js';

afterEach(() => {
  cleanup();
});

const storageMockDict = {} as { [key: string]: string };
const storageMock = {
  getItem(key: string) {
    return storageMockDict[key] || null;
  },
  setItem(key: string, value: string) {
    storageMockDict[key] = value;
  },
  removeItem(key: string) {
    delete storageMockDict[key];
  },
};

describe('HypergraphAppContext', () => {
  it('should render the HypergraphAppProvider and be initially unauthenticated', async () => {
    const wrapper = ({ children }: Readonly<{ children: React.ReactNode }>) => (
      <HypergraphAppProvider storage={storageMock} syncServerUri="http://localhost:3030" appId="test">
        {children}
      </HypergraphAppProvider>
    );

    const { result: authenticatedResult } = renderHook(() => useHypergraphAuth(), { wrapper });
    // hook won't work until the Provider loaded automerge and then renders the children
    expect(authenticatedResult.current).toEqual(null);
    // wait until automerge is loaded and the provider exposes auth state
    await waitFor(() => {
      expect(authenticatedResult.current?.authenticated).toEqual(false);
    });
    expect(authenticatedResult.current?.identity).toBeNull();
  });
});
