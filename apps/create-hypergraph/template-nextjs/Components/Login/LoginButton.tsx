'use client';

import { useHypergraphApp } from '@graphprotocol/hypergraph-react';

import { Button } from '../ui/button';

export function LoginButton() {
  const { redirectToConnect } = useHypergraphApp();

  const handleSignIn = () => {
    redirectToConnect({
      storage: localStorage,
      connectUrl: 'https://connect.geobrowser.io/',
      successUrl: `${window.location.origin}/authenticate-success`,
      redirectFn: (url: URL) => {
        window.location.href = url.toString();
      },
    });
  };

  return (
    <Button type="button" onClick={handleSignIn} className="w-full bg-primary hover:bg-primary/90">
      Sign in with Geo Connect
    </Button>
  );
}
