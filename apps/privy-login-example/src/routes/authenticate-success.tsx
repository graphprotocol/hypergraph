import { useHypergraphApp } from '@graphprotocol/hypergraph-react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';

export const Route = createFileRoute('/authenticate-success')({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): { ciphertext: string; nonce: string } => {
    return {
      ciphertext: search.ciphertext as string,
      nonce: search.nonce as string,
    };
  },
});

function RouteComponent() {
  const { ciphertext, nonce } = Route.useSearch();
  const { processConnectAuthSuccess } = useHypergraphApp();
  const navigate = useNavigate();
  const isProcessingRef = useRef(false);

  useEffect(() => {
    if (isProcessingRef.current) return; // prevent multiple calls from useEffect double calling in StrictMode
    const result = processConnectAuthSuccess({ storage: localStorage, ciphertext, nonce });
    if (result.success) {
      isProcessingRef.current = true;
      navigate({ to: '/', replace: true });
    } else {
      alert(result.error);
    }
  }, [ciphertext, nonce, processConnectAuthSuccess, navigate]);

  return <div>Authenticating …</div>;
}
