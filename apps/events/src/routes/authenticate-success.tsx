import { Connect } from '@graphprotocol/hypergraph';
import { useHypergraphApp } from '@graphprotocol/hypergraph-react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import * as Effect from 'effect/Effect';
import { useEffect } from 'react';

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
  const { setIdentity } = useHypergraphApp();
  const navigate = useNavigate();

  useEffect(() => {
    const storedNonce = localStorage.getItem('geo-connect-auth-nonce');
    const storedExpiry = Number.parseInt(localStorage.getItem('geo-connect-auth-expiry') ?? '0', 10);
    const storedSecretKey = localStorage.getItem('geo-connect-auth-secret-key');
    const storedPublicKey = localStorage.getItem('geo-connect-auth-public-key');
    if (!storedNonce || !storedExpiry || !storedSecretKey || !storedPublicKey) {
      alert('Failed to authenticate due missing data in the local storage');
      return;
    }

    try {
      const parsedAuthParams = Effect.runSync(
        Connect.parseCallbackParams({
          ciphertext,
          nonce,
          storedNonce,
          storedExpiry,
          storedSecretKey,
          storedPublicKey,
        }),
      );

      setIdentity({
        address: parsedAuthParams.appIdentityAddress,
        addressPrivateKey: parsedAuthParams.appIdentityAddressPrivateKey,
        accountAddress: parsedAuthParams.accountAddress,
        signaturePublicKey: parsedAuthParams.signaturePublicKey,
        signaturePrivateKey: parsedAuthParams.signaturePrivateKey,
        encryptionPublicKey: parsedAuthParams.encryptionPublicKey,
        encryptionPrivateKey: parsedAuthParams.encryptionPrivateKey,
        sessionToken: parsedAuthParams.sessionToken,
        sessionTokenExpires: parsedAuthParams.sessionTokenExpires,
      });
      localStorage.removeItem('geo-connect-auth-nonce');
      localStorage.removeItem('geo-connect-auth-expiry');
      localStorage.removeItem('geo-connect-auth-secret-key');
      localStorage.removeItem('geo-connect-auth-public-key');
      console.log('redirecting to /');
      navigate({ to: '/', replace: true });
    } catch (error) {
      console.error(error);
      alert('Failed to authenticate due invalid callback');
    }
  }, [ciphertext, nonce, setIdentity, navigate]);

  return <div>Authenticating …</div>;
}
