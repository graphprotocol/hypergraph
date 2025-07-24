import { useHypergraphApp, useHypergraphAuth } from '@graphprotocol/hypergraph-react';
import { useRouter } from '@tanstack/react-router';

export function Logout() {
  const { logout } = useHypergraphApp();
  const { authenticated } = useHypergraphAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.navigate({
      to: '/login',
    });
  };

  return (
    <button type="button" onClick={handleLogout} disabled={!authenticated}>
      Logout
    </button>
  );
}
