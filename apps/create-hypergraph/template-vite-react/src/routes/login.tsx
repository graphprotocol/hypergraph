import { useHypergraphApp } from '@graphprotocol/hypergraph-react';
import { createFileRoute } from '@tanstack/react-router';

function Login() {
  const { redirectToConnect } = useHypergraphApp();
  return (
    <div className="flex items-center justify-center">
      <div className="flex flex-col items-center gap-6 p-8 text-center">
        <p className="text-muted-foreground text-lg">Sign in to access your spaces and start building.</p>
        <button
          type="button"
          className="px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-base"
          onClick={() => {
            redirectToConnect({
              storage: localStorage,
              // connectUrl: 'http://localhost:5180',
              connectUrl: 'https://connect.geobrowser.io/',
              successUrl: `${window.location.origin}/authenticate-success`,
              redirectFn: (url: URL) => {
                window.location.href = url.toString();
              },
            });
          }}
        >
          Sign in with Geo Connect
        </button>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/login')({
  component: Login,
});
