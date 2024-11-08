import { PrivyProvider } from '@privy-io/react-auth';
import { RouterProvider, createRouter } from '@tanstack/react-router';

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
      appId="cm1gt9i1b002g12ih6b6l4vvi"
      config={{
        // Display email and wallet as login methods
        loginMethods: ['wallet'],
        // Customize Privy's appearance in your app
        appearance: {
          theme: 'light',
          accentColor: '#676FFF',
        },
        // Create embedded wallets for users who don't have a wallet
        // embeddedWallets: {
        //   createOnLogin: "users-without-wallets",
        // },
      }}
    >
      <RouterProvider router={router} />
    </PrivyProvider>
  );
}
