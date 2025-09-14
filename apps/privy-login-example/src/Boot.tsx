import { HypergraphAppProvider } from '@graphprotocol/hypergraph-react';
import { PrivyProvider } from '@privy-io/react-auth';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { mapping } from './mapping.js';
import { routeTree } from './routeTree.gen';

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export function Boot() {
  return (
    <PrivyProvider
      appId={import.meta.env.VITE_PRIVY_APP_ID}
      config={{
        loginMethods: ['email', 'google'],
        appearance: {
          theme: 'light',
          accentColor: '#6833ff',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
      }}
    >
      <HypergraphAppProvider
        syncServerUri="http://localhost:3030"
        mapping={mapping}
        appId="93bb8907-085a-4a0e-83dd-62b0dc98e793"
      >
        <RouterProvider router={router} />
      </HypergraphAppProvider>
    </PrivyProvider>
  );
}
