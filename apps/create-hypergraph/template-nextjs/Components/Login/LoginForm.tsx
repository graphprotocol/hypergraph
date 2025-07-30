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
          className="px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-base cursor-pointer"
          onClick={() => {
            redirectToConnect({
              storage: localStorage,
              connectUrl: 'https://connect.geobrowser.io/',
              successUrl: `${window.location.origin}/authenticate-success`,
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
