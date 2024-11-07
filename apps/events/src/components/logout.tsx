import { wipeKeys } from '@/lib/keyStorage';
import { redirect } from '@tanstack/react-router';
import { Button } from './ui/button';

export function Logout() {
  const disconnectWallet = () => {
    const localStorageSignerAddress = localStorage.getItem('signerAddress');
    localStorage.removeItem('signerAddress');
    if (!localStorageSignerAddress) {
      return;
    }
    wipeKeys(localStorageSignerAddress);
    redirect({
      to: '/login',
    });
  };

  return (
    <Button className="home-button" onClick={() => disconnectWallet()}>
      Logout
    </Button>
  );
}
