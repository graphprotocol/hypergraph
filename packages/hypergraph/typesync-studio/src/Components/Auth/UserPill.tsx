'use client';

import { useHypergraphApp, useHypergraphAuth } from '@graphprotocol/hypergraph-react';

export function UserPill() {
  const { logout, redirectToConnect } = useHypergraphApp();
  const { authenticated, identity } = useHypergraphAuth();

  if (authenticated && identity?.address) {
    return (
      <button
        type="button"
        className="rounded-full bg-slate-900 flex items-center justify-center px-3 py-1.5 text-sm font-semibold text-white shadow-xs ring-1 ring-white/10 ring-inset hover:bg-white/10 cursor-pointer"
        onClick={() => logout()}
      >
        {shorten(identity.address)}
      </button>
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

function shorten(address: string) {
  return `${address.substring(0, 6)}...${address.substring(address.length - 6, address.length)}`;
}
