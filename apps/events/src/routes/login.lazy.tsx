import { Button } from '@/components/ui/button';
import { useHypergraphApp } from '@graphprotocol/hypergraph-react';
import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/login')({
  component: () => <Login />,
});

function Login() {
  const { redirectToConnect } = useHypergraphApp();
  return (
    <div className="flex flex-1 justify-center items-center flex-col gap-4">
      <Button
        onClick={() => {
          redirectToConnect({
            storage: localStorage,
            connectUrl: 'http://localhost:5180',
            successUrl: 'http://localhost:5173/authenticate-success',
            appId: '93bb8907-085a-4a0e-83dd-62b0dc98e793',
            redirectFn: (url: URL) => {
              window.location.href = url.toString();
            },
          });
        }}
      >
        Authenticate with Connect
      </Button>
    </div>
  );
}
