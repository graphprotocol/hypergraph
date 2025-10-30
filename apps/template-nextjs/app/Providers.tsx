'use client';

import { HypergraphAppProvider } from '@graphprotocol/hypergraph-react';

export default function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
  const _storage = typeof window !== 'undefined' ? window.localStorage : (undefined as unknown as Storage);

  return (
    <HypergraphAppProvider storage={_storage} appId="93bb8907-085a-4a0e-83dd-62b0dc98e793">
      {children}
    </HypergraphAppProvider>
  );
}
