import { Button } from '@/components/ui/button';
import { availableAccounts } from '@/lib/availableAccounts';
import { Identity } from '@graphprotocol/hypergraph';
import { usePrivy } from '@privy-io/react-auth';
import { Link, createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/login')({
  component: () => <Login />,
});

function Login() {
  const { ready, authenticated, login } = usePrivy();
  // Disable login when Privy is not ready or the user is already authenticated
  const disableLogin = !ready || (ready && authenticated);
  const { setIdentityAndSessionToken, authenticated: graphAuthenticated } = Identity.useGraphLogin();

  return (
    <div className="flex flex-1 justify-center items-center flex-col gap-4">
      {(!ready || !authenticated) && !graphAuthenticated ? (
        <div>
          <Button disabled={disableLogin} onClick={login}>
            Log in
          </Button>

          <div>
            <h1>Choose account</h1>
            <Button
              onClick={(event) => {
                event.preventDefault();
                setIdentityAndSessionToken(availableAccounts[0]);
              }}
            >
              {availableAccounts[0].accountId.substring(0, 6)}
            </Button>
            <Button
              onClick={(event) => {
                event.preventDefault();
                setIdentityAndSessionToken(availableAccounts[1]);
              }}
            >
              {availableAccounts[1].accountId.substring(0, 6)}
            </Button>
            <Button
              onClick={(event) => {
                event.preventDefault();
                setIdentityAndSessionToken(availableAccounts[2]);
              }}
            >
              {availableAccounts[2].accountId.substring(0, 6)}
            </Button>
          </div>
        </div>
      ) : (
        <Link className="text-blue-500 hover:text-blue-600 underline" to="/">
          Go to Home
        </Link>
      )}
    </div>
  );
}
