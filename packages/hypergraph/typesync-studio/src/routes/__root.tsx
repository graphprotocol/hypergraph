'use client';

import { GithubLogoIcon } from '@phosphor-icons/react';
import type { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, Link, Outlet } from '@tanstack/react-router';
import type { GraphQLClient } from 'graphql-request';

export interface TypeSyncRouterContext {
  readonly queryClient: QueryClient;
  readonly graphqlClient: GraphQLClient;
}

export const Route = createRootRouteWithContext<TypeSyncRouterContext>()({
  component() {
    return (
      <div>
        <div>
          <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between gap-x-4 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm px-4">
            <div className="flex w-fit items-center h-16">
              <Link
                to="/"
                className="flex h-16 shrink-0 items-center justify-center text-xl border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 cursor-pointer"
              >
                Hypergraph TypeSync
              </Link>
            </div>
            <div className="flex items-center justify-end self-end w-fit gap-x-6 h-16">
              <div aria-hidden="true" className="block h-6 w-px bg-gray-900/10 dark:bg-slate-300" />
              <div className="flex items-center w-fit h-16 gap-x-2">
                <a
                  href="https://github.com/graphprotocol/hypergraph"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 w-fit h-fit inline-flex items-center justify-center rounded-full bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white"
                >
                  <GithubLogoIcon size={16} />
                </a>
              </div>
            </div>
          </div>

          <main className="py-10">
            <div className="px-4">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    );
  },
});
