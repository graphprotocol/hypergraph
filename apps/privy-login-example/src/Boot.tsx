import { HypergraphAppProvider } from '@graphprotocol/hypergraph-react';
import { PrivyProvider } from '@privy-io/react-auth';
import { createRouter, RouterProvider } from '@tanstack/react-router';
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
      <HypergraphAppProvider syncServerUri="http://localhost:3030" appId="93bb8907085a4a0e83dd62b0dc98e793">
        <RouterProvider router={router} />
      </HypergraphAppProvider>
    </PrivyProvider>
  );
}
