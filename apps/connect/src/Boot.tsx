import { Connect, StoreConnect } from '@graphprotocol/hypergraph';
import { PrivyProvider } from '@privy-io/react-auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { useLayoutEffect, useRef } from 'react';
import { getAddress } from 'viem';
import { routeTree } from './routeTree.gen';

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const queryClient = new QueryClient();

const addressStorage = localStorage;
const keysStorage = sessionStorage;

export function Boot() {
  // check if the user is already authenticated on initial render
  const initialRenderAuthCheckRef = useRef(false);
  // using a layout effect to avoid a re-render
  useLayoutEffect(() => {
    if (!initialRenderAuthCheckRef.current) {
      const accountAddress = Connect.loadAccountAddress(addressStorage);
      if (accountAddress) {
        const keys = Connect.loadKeys(keysStorage, accountAddress);
        if (keys) {
          // user is already authenticated, set state
          StoreConnect.store.send({
            type: 'setAuth',
            accountAddress: getAddress(accountAddress),
            sessionToken: 'dummy',
            keys,
          });
        }
      }
      // set render auth check to true so next potential rerender doesn't proc this
      initialRenderAuthCheckRef.current = true;
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <PrivyProvider
        appId="cmbhnmo1x000bla0mxudtd8z9"
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
        <RouterProvider router={router} />
      </PrivyProvider>
    </QueryClientProvider>
  );
}
