'use client';

import { RouterProvider } from '@tanstack/react-router';
import { Provider } from 'jotai';

import { createTypeSyncAppRouter, type TypeSyncAppRouter } from './clients/router.js';

const router = createTypeSyncAppRouter();

// biome-ignore lint/suspicious/noExplicitAny: something wrong between the router dehydrate
type UnknownRouter = any;

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: TypeSyncAppRouter;
  }
}

export function Providers() {
  return (
    <Provider>
      <RouterProvider<TypeSyncAppRouter> router={router as UnknownRouter} />
    </Provider>
  );
}
