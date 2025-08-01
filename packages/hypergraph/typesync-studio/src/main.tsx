import { RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';

import { createTypesyncAppRouter, type TypesyncAppRouter } from './clients/Router.tsx';
import './styles.css';
import reportWebVitals from './reportWebVitals.ts';

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
      <RouterProvider<TypesyncAppRouter> router={router} />
    </StrictMode>,
  );
}

reportWebVitals();
