import { usePrivy } from '@privy-io/react-auth';
import { createLazyFileRoute, useRouter } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

export const Route = createLazyFileRoute('/login')({
  component: () => <Login />,
});

function Login() {
  const { ready, login, authenticated } = usePrivy();
  const { navigate } = useRouter();

  useEffect(() => {
    if (ready && authenticated) {
      navigate({ to: '/' });
    }
  }, [authenticated, ready, navigate]);

  return (
    <div className="flex flex-1 justify-center items-center flex-col gap-4">
      <div>
        <Button
          disabled={!ready || authenticated}
          onClick={(event) => {
            event.preventDefault();
            login({});
          }}
        >
          Log in
        </Button>
      </div>
    </div>
  );
}
