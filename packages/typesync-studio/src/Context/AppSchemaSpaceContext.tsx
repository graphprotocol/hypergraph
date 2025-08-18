'use client';

import type { Id } from '@graphprotocol/hypergraph';
import { type OmitStrict, useHypergraphApp, useHypergraphAuth } from '@graphprotocol/hypergraph-react';
import { GithubLogoIcon } from '@phosphor-icons/react';
import { Link } from '@tanstack/react-router';
import { createContext, useContext, useState } from 'react';

import { UserPill } from '@/Components/Auth/UserPill.tsx';

export type AppSchemaSpaceCtx = {
  readonly spaceId: Id | null;
  readonly name: string | null;
  setAppSchemaSpace(args: Readonly<{ id: Id; name: string }>): void;
};

export const AppSchemaSpaceContext = createContext<AppSchemaSpaceCtx>({
  spaceId: null,
  name: null,
  setAppSchemaSpace() {},
});

export function useAppSchemaSpace(): AppSchemaSpaceCtx {
  return useContext<AppSchemaSpaceCtx>(AppSchemaSpaceContext);
}

export function AppSchemaSpaceProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const { isConnecting } = useHypergraphApp();
  const { authenticated } = useHypergraphAuth();

  const [appSchemaSpaceCtx, setAppSchemaSpaceCtx] = useState<OmitStrict<AppSchemaSpaceCtx, 'setAppSchemaSpace'>>({
    spaceId: null,
    name: null,
  });

  return (
    <AppSchemaSpaceContext.Provider
      value={{
        ...appSchemaSpaceCtx,
        setAppSchemaSpace(args) {
          if (!authenticated || isConnecting) {
            throw new Error('Must be authenticated');
          }

          setAppSchemaSpaceCtx({
            spaceId: args.id,
            name: args.name,
          });
        },
      }}
    >
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
            <UserPill />
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

        <main className="pt-6 pb-10">
          <div className="px-4">{children}</div>
        </main>
      </div>
    </AppSchemaSpaceContext.Provider>
  );
}
