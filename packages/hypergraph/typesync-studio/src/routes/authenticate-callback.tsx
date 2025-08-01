'use client';

import { useHypergraphApp } from '@graphprotocol/hypergraph-react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Schema } from 'effect';
import { useEffect } from 'react';

const AuthenticateCallbackSearchParams = Schema.Struct({
  ciphertext: Schema.NonEmptyTrimmedString,
  nonce: Schema.NonEmptyTrimmedString,
});
type AuthenticateCallbackSearchParams = typeof AuthenticateCallbackSearchParams.Type;
const AuthenticateCallbackSearchParamsDecoder = Schema.decodeUnknownSync(AuthenticateCallbackSearchParams);

export const Route = createFileRoute('/authenticate-callback')({
  component: AuthenticateCallbackComponent,
  validateSearch(search: Record<string, unknown>): AuthenticateCallbackSearchParams {
    return AuthenticateCallbackSearchParamsDecoder(search);
  },
});

function AuthenticateCallbackComponent() {
  const { ciphertext, nonce } = Route.useSearch();
  const { processConnectAuthSuccess } = useHypergraphApp();
  const navigate = useNavigate();

  useEffect(() => {
    processConnectAuthSuccess({ storage: localStorage, ciphertext, nonce });
    navigate({ to: '/', replace: true });
  }, [ciphertext, nonce, processConnectAuthSuccess, navigate]);

  return <div>Authenticating …</div>;
}
