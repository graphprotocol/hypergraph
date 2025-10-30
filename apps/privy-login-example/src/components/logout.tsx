import { useHypergraphApp } from '@graphprotocol/hypergraph-react';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from '@tanstack/react-router';
import { Button } from './ui/button';

export function Logout() {
  const { logout: graphLogout } = useHypergraphApp();
  const { logout: privyLogout } = usePrivy();
  const router = useRouter();
  const disconnectWallet = async () => {
    privyLogout();
    graphLogout(); // needs to be called after privy logout since it triggers a re-render
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
