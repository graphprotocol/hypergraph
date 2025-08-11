import { HypergraphAppProvider } from '@graphprotocol/hypergraph-react';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import ReactDOM from 'react-dom/client';
import './index.css';
import { mapping } from './mapping';

// Import the generated route tree
import { routeTree } from './routeTree.gen';

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// Render the app
const rootElement = document.getElementById('root');
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    // <React.StrictMode>
    <HypergraphAppProvider mapping={mapping} appId="93bb8907-085a-4a0e-83dd-62b0dc98e793">
      <RouterProvider router={router} />
    </HypergraphAppProvider>,
    // </React.StrictMode>,
  );
}
