'use client';

import { HypergraphAppProvider } from '@graphprotocol/hypergraph-react';

// recommended by https://docs.privy.io/basics/troubleshooting/react-frameworks#next-js
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HypergraphAppProvider syncServerUri="http://localhost:3030" appId="83aa8907-085b-430f-1296-ab87dc98e793">
      {children}
    </HypergraphAppProvider>
  );
}
