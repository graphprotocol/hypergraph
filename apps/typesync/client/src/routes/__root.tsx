'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { GithubLogo } from '@phosphor-icons/react';
import type { QueryClient } from '@tanstack/react-query';
import { Link, Outlet, createRootRouteWithContext } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import type { GraphQLClient } from 'graphql-request';
import { useAtom } from 'jotai';

import { AppSpacesNavbar } from '../Components/AppsNavbar.js';
import { CmdPalette, cmdPaletteOpenAtom } from '../Components/CmdPalette.js';
import { appsQueryOptions } from '../hooks/useAppQuery.js';
import { useOSQuery } from '../hooks/useOSQuery.js';

export type RouterContext = Readonly<{
  queryClient: QueryClient;
  graphqlClient: GraphQLClient;
}>;

export const Route = createRootRouteWithContext<RouterContext>()({
  component: Layout,
  async loader(ctx) {
    // preload apps from the api. will be used in the AppSpacesNavbar component
    await ctx.context.queryClient.ensureQueryData(appsQueryOptions);
  },
});

function Layout() {
  const { data: os } = useOSQuery();
  const [, setCmdPaletteOpen] = useAtom(cmdPaletteOpenAtom);

  return (
    <div>
      <div className="fixed inset-y-0 z-50 flex w-72 flex-col h-full">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-slate-900 pb-4 h-full">
          <Link
            to="/"
            className="flex h-16 shrink-0 items-center justify-center text-xl border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 cursor-pointer"
          >
            Hypergraph TypeSync
          </Link>
          <AppSpacesNavbar />
        </div>
      </div>

      <div className="pl-72">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-end gap-x-4 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-transparent shadow-sm px-4">
          <div className="flex flex-1 items-center justify-end self-end w-fit gap-x-6 h-16">
            <button
              type="button"
              className="min-w-fit w-72 inline-flex items-center justify-between cursor-pointer rounded-4xl text-gray-900 dark:text-gray-300 shadow-sm gap-x-2 pl-2 pr-3 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-slate-800 dark:hover:bg-slate-700"
              onClick={() => setCmdPaletteOpen((curr) => !curr)}
            >
              <span className="flex items-center flex-1 gap-x-2">
                <MagnifyingGlassIcon className="size-4 text-gray-800 dark:text-white" />
                Search
              </span>
              <kbd className="inline-flex items-center rounded border border-gray-200 dark:border-slate-600 px-1 font-sans text-xs text-gray-400 dark:text-gray-200">
                {os === 'MacOS' ? '⌘K' : '^K'}
              </kbd>
            </button>
            <div aria-hidden="true" className="block h-6 w-px bg-gray-900/10 dark:bg-slate-300" />
            <div className="flex items-center w-fit h-16 gap-x-2">
              <a
                href="https://github.com/graphprotocol/hypergraph"
                target="_blank"
                rel="noreferrer"
                className="p-2 w-fit h-fit inline-flex items-center justify-center rounded-full bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white"
              >
                <GithubLogo size={16} />
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
      <CmdPalette />
      <TanStackRouterDevtools />
    </div>
  );
}
