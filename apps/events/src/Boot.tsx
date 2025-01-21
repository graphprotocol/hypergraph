import { RouterProvider, createRouter } from '@tanstack/react-router';

import { Auth } from '@graphprotocol/hypergraph-react';
import { PrivyProvider } from '@privy-io/react-auth';

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
    <PrivyProvider // note: PrivyProvider is only needed for the login page and the logout button in the navigation
      appId="cm4wx6ziv00ngrmfjf9ik36iu"
      config={{
        // Display email and wallet as login methods
        loginMethods: ['email', 'wallet', 'google', 'twitter', 'github'],
        // Customize Privy's appearance in your app
        appearance: {
          theme: 'light',
          accentColor: '#676FFF',
        },
        // Create embedded wallets for users who don't have a wallet
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
      }}
    >
      <Auth.HypergraphAuthProvider storage={localStorage}>
        <RouterProvider router={router} />
      </Auth.HypergraphAuthProvider>
    </PrivyProvider>
  );
}
