import { HypergraphAppProvider } from '@graphprotocol/hypergraph-react';
import { RouterProvider, createRouter } from '@tanstack/react-router';
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
    <HypergraphAppProvider
      storage={localStorage}
      syncServerUri="http://localhost:3030"
      mapping={mapping}
      chainId={80451}
    >
      <RouterProvider router={router} />
    </HypergraphAppProvider>
  );
}
