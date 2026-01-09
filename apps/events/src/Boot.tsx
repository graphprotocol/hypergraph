import { HypergraphAppProvider } from '@graphprotocol/hypergraph-react';
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
    <HypergraphAppProvider syncServerUri="http://localhost:3030" appId="93bb8907085a4a0e83dd62b0dc98e793">
      <RouterProvider router={router} />
    </HypergraphAppProvider>
  );
}
