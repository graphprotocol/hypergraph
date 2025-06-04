'use client';

import { HypergraphAppProvider } from '@graphprotocol/hypergraph-react';

// recommended by https://docs.privy.io/basics/troubleshooting/react-frameworks#next-js
export default function Providers({ children }: { children: React.ReactNode }) {
  const storage = typeof window !== 'undefined' ? window.localStorage : (undefined as unknown as Storage);

  return (
    <HypergraphAppProvider storage={storage} syncServerUri="http://localhost:3030">
      {children}
    </HypergraphAppProvider>
  );
}
