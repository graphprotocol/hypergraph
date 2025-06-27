import { Loading } from '@/components/ui/Loading';
import { Connect } from '@graphprotocol/hypergraph';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from '@tanstack/react-router';
import { useState } from 'react';

export function LogoutButton() {
  const { logout: privyLogout, ready, authenticated } = usePrivy();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const disconnectWallet = async () => {
    setIsLoading(true);
    Connect.wipeAllAuthData(localStorage, sessionStorage);
    await privyLogout();
    router.navigate({
      to: '/login',
    });
    setIsLoading(false);
  };

  return (
    <button
      type="button"
      disabled={!ready || !authenticated}
      onClick={() => disconnectWallet()}
      className="c-button c-button--small"
    >
      {isLoading ? <Loading hideLabel /> : null}
      Log out
    </button>
  );
}
