import { HypergraphAppProvider } from '@graphprotocol/hypergraph-react';
import { RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';

import { createTypesyncAppRouter, type TypesyncAppRouter } from './clients/Router.tsx';
import reportWebVitals from './reportWebVitals.ts';
import './styles.css';

const router = createTypesyncAppRouter();

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: TypesyncAppRouter;
  }
}

// Render the app
const rootElement = document.getElementById('root');
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <HypergraphAppProvider storage={localStorage} appId="577fb988-3699-495a-9e59-ced8ccbf7a19">
        <RouterProvider<TypesyncAppRouter> router={router} />
      </HypergraphAppProvider>
    </StrictMode>,
  );
}

reportWebVitals();
