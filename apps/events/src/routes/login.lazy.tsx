import { Button } from '@/components/ui/button';
import { Connect } from '@graphprotocol/hypergraph';
import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/login')({
  component: () => <Login />,
});

function Login() {
  return (
    <div className="flex flex-1 justify-center items-center flex-col gap-4">
      <Button
        onClick={() => {
          const { url, nonce, expiry, secretKey, publicKey } = Connect.createAuthUrl({
            connectUrl: 'http://localhost:5180/authenticate',
            redirectUrl: 'http://localhost:5173/authenticate-success',
            appId: '93bb8907-085a-4a0e-83dd-62b0dc98e793',
          });
          localStorage.setItem('geo-connect-auth-nonce', nonce);
          localStorage.setItem('geo-connect-auth-expiry', expiry.toString());
          localStorage.setItem('geo-connect-auth-secret-key', secretKey);
          localStorage.setItem('geo-connect-auth-public-key', publicKey);
          window.location.href = url.toString();
        }}
      >
        Authenticate with Connect
      </Button>
    </div>
  );
}
