'use client';

import { useHypergraphApp } from '@graphprotocol/hypergraph-react';

export function LoginForm() {
  const { redirectToConnect } = useHypergraphApp();

  return (
    <div className="flex items-center justify-center">
      <div className="flex flex-col items-center gap-6 p-8 text-center">
        <p className="text-muted-foreground text-lg">Sign in to access your spaces and start building.</p>
        <button
          type="button"
          className="px-8 py-4 rounded-md bg-indigo-600 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          onClick={() => {
            redirectToConnect({
              storage: localStorage,
              connectUrl: 'https://hypergraph-connect.vercel.app/',
              successUrl: `${window.location.origin}/authenticate-success`,
              // hardcoded appId for testing
              appId: '93bb8907-085a-4a0e-83dd-62b0dc98e793',
              redirectFn: (url: URL) => {
                window.location.href = url.toString();
              },
            });
          }}
        >
          Sign in with Geo Connect
        </button>
      </div>
    </div>
  );
}
