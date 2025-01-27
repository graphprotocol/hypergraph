import '@testing-library/jest-dom/vitest';
import { cleanup, renderHook } from '@testing-library/react';
// biome-ignore lint/style/useImportType: <explanation>
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import { HypergraphAppProvider, useAuthenticated, useHypergraphAccountId } from '../src/HypergraphAppContext.js';

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
      <HypergraphAppProvider storage={storageMock}>{children}</HypergraphAppProvider>
    );

    const { result: authenticatedResult } = renderHook(() => useAuthenticated(), { wrapper });
    expect(authenticatedResult.current).toEqual(false);
    const { result: accountIdResult } = renderHook(() => useHypergraphAccountId(), { wrapper });
    expect(accountIdResult.current).toBeNull();
  });
});
