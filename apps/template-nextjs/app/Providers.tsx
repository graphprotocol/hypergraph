'use client';

import { HypergraphAppProvider } from '@graphprotocol/hypergraph-react';

export default function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
  const _storage = typeof window !== 'undefined' ? window.localStorage : (undefined as unknown as Storage);

  return (
    <HypergraphAppProvider storage={_storage} appId="93bb8907085a4a0e83dd62b0dc98e793">
      {children}
    </HypergraphAppProvider>
  );
}
