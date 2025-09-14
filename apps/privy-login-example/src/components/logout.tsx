import { useHypergraphApp } from '@graphprotocol/hypergraph-react';
import { useRouter } from '@tanstack/react-router';
import { Button } from './ui/button';

export function Logout() {
  const { logout: graphLogout } = useHypergraphApp();
  const router = useRouter();
  const disconnectWallet = async () => {
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
