import { Button } from '@/components/ui/button';
import { Identity } from '@graphprotocol/hypergraph';
import { usePrivy } from '@privy-io/react-auth';
import { createLazyFileRoute, useRouter } from '@tanstack/react-router';
import { useEffect } from 'react';

export const Route = createLazyFileRoute('/login')({
  component: () => <Login />,
});

function Login() {
  const { ready, authenticated, login } = usePrivy();
  // Disable login when Privy is not ready or the user is already authenticated
  const disableLogin = !ready || (ready && authenticated);
  const { authenticated: graphAuthenticated } = Identity.useGraphLogin();
  const router = useRouter();
  const redirectToPlayground = () => {
    router.navigate({
      to: '/playground',
    });
  };

  useEffect(() => {
    console.log('Privy Authenticated', authenticated);
    console.log('The Graph Authenticated', graphAuthenticated);
    if (authenticated && graphAuthenticated) {
      redirectToPlayground();
    }
  }, [authenticated, graphAuthenticated]);
  return (
    <div className="flex flex-1 justify-center items-center flex-col gap-4">
      {(!ready || !authenticated) && (
        <Button disabled={disableLogin} onClick={login}>
          Log in
        </Button>
      )}
    </div>
  );
}
