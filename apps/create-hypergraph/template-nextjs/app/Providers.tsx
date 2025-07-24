'use client';

import { HypergraphAppProvider } from '@graphprotocol/hypergraph-react';

import { mapping } from './mapping';

export default function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
  const _storage = typeof window !== 'undefined' ? window.localStorage : (undefined as unknown as Storage);

  return (
    <HypergraphAppProvider syncServerUri="http://localhost:3030" mapping={mapping} storage={_storage}>
      {children}
    </HypergraphAppProvider>
  );
}
