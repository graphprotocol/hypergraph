'use client';

import { Toast } from '@base-ui-components/react/toast';
import { store } from '@graphprotocol/hypergraph';
import type { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import type { GraphQLClient } from 'graphql-request';

import { AppSchemaSpaceProvider } from '@/Context/AppSchemaSpaceContext.tsx';

// @ts-expect-error
window.HYPERGRAPH_STORE = store;

export interface TypeSyncRouterContext {
  readonly queryClient: QueryClient;
  readonly graphqlClient: GraphQLClient;
}

export const Route = createRootRouteWithContext<TypeSyncRouterContext>()({
  component() {
    return (
      <AppSchemaSpaceProvider>
        <Toast.Provider>
          <Toast.Portal>
            <Outlet />
          </Toast.Portal>
        </Toast.Provider>
      </AppSchemaSpaceProvider>
    );
  },
});
