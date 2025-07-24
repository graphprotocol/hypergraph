'use client';

import { useHypergraphApp } from '@graphprotocol/hypergraph-react';
import { useRouter } from 'next/navigation';
import { useLayoutEffect } from 'react';

export type AuthCallbackProps = {
  ciphertext: string;
  nonce: string;
};
export function AuthCallback({ ciphertext, nonce }: Readonly<AuthCallbackProps>) {
  const router = useRouter();
  const { processConnectAuthSuccess } = useHypergraphApp();

  useLayoutEffect(() => {
    processConnectAuthSuccess({ storage: localStorage, ciphertext, nonce });
    router.replace('/');
  }, [ciphertext, nonce, processConnectAuthSuccess, router]);

  return <div>Authenticating …</div>;
}
