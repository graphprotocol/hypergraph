'use client';

import { useHypergraphApp } from '@graphprotocol/hypergraph-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

export type AuthCallbackProps = {
  ciphertext: string;
  nonce: string;
};
export function AuthCallback({ ciphertext, nonce }: Readonly<AuthCallbackProps>) {
  const router = useRouter();
  const { processConnectAuthSuccess } = useHypergraphApp();
  const isProcessingRef = useRef(false);

  useEffect(() => {
    if (isProcessingRef.current) return; // prevent multiple calls from useEffect double calling in StrictMode
    const result = processConnectAuthSuccess({ storage: localStorage, ciphertext, nonce });
    if (result.success) {
      isProcessingRef.current = true;
      router.replace('/');
    } else {
      alert(result.error);
    }
  }, [ciphertext, nonce, processConnectAuthSuccess, router]);

  return <div>Authenticating …</div>;
}
