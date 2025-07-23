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
              connectUrl: 'https://hypergraph-connect.vercel.app/',
              successUrl: `${window.location.origin}/authenticate-success`,
              // hardcoded appId for testing
              appId: '93bb8907-085a-4a0e-83dd-62b0dc98e793',
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
