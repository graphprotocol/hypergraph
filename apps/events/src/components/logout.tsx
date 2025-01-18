import { Auth } from '@graphprotocol/hypergraph-react';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from '@tanstack/react-router';
import { Button } from './ui/button';

export function Logout() {
  const { logout: graphLogout } = Auth.useHypergraphAuth();
  const { logout: privyLogout } = usePrivy();
  const router = useRouter();
  const disconnectWallet = () => {
    graphLogout();
    privyLogout();
    router.navigate({
      to: '/login',
    });
  };

  return (
    <Button className="home-button" onClick={() => disconnectWallet()}>
      Logout
    </Button>
  );
}
