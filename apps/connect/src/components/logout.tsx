import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from '@tanstack/react-router';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';

export function Logout() {
  const { logout: privyLogout, ready, authenticated } = usePrivy();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const disconnectWallet = async () => {
    setIsLoading(true);
    await privyLogout();
    router.navigate({
      to: '/login',
    });
    setIsLoading(false);
  };

  return (
    <Button className="home-button" onClick={() => disconnectWallet()} disabled={!ready || !authenticated}>
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" /> Logout
        </>
      ) : (
        'Logout'
      )}
    </Button>
  );
}
