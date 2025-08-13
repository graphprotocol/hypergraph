'use client';

import { useHypergraphApp, useHypergraphAuth } from '@graphprotocol/hypergraph-react';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { SignOutIcon } from '@phosphor-icons/react';

import { shorten } from '@/utils/string.ts';

export function UserPill() {
  const { logout, redirectToConnect } = useHypergraphApp();
  const { authenticated, identity } = useHypergraphAuth();

  if (authenticated && identity?.address) {
    return (
      <Menu as="div" className="relative w-fit">
        <MenuButton className="relative flex max-w-xs items-center justify-center gap-x-3 rounded-full bg-white dark:bg-slate-900 text-sm focus:outline-hidden focus-visible:ring-2 hover:ring-2 focus-visible:ring-indigo-500 hover:ring-indigo-500 focus-visible:ring-offset-2 hover:ring-offset-2 hover:shadow cursor-pointer px-3 py-1">
          <span className="absolute -inset-1.5" />
          <span className="sr-only">Open user menu</span>
          <span className="text-sm/6">{shorten(identity.address)}</span>
        </MenuButton>
        <MenuItems
          transition
          className="absolute right-0 md:left-0 z-10 mt-2 w-36 px-1 origin-top-right md:origin-top-left rounded-md bg-white dark:bg-slate-800 py-1 shadow-lg ring-1 ring-black/5 dark:ring-white/10 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-200 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
        >
          <MenuItem
            as="button"
            onClick={() => logout()}
            className="w-full flex rounded-md items-center gap-x-2 px-4 py-2 text-sm text-gray-700 dark:text-white data-focus:bg-gray-100 dark:data-focus:bg-slate-700 data-focus:outline-hidden"
          >
            <SignOutIcon className="size-4" aria-hidden="true" />
            Sign out
          </MenuItem>
        </MenuItems>
      </Menu>
    );
  }

  return (
    <button
      type="button"
      className="rounded-full bg-slate-900 flex items-center justify-center px-3 py-1.5 text-sm font-semibold text-white shadow-xs ring-1 ring-white/10 ring-inset hover:bg-white/10 cursor-pointer"
      onClick={() =>
        redirectToConnect({
          storage: localStorage,
          connectUrl: 'https://connect.geobrowser.io/',
          successUrl: `${window.location.origin}/authenticate-callback`,
          redirectFn(url: URL) {
            window.location.href = url.toString();
          },
        })
      }
    >
      Sign in to Geo Account
    </button>
  );
}
