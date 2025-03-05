import { Button } from '@/components/ui/button';
import { usePrivy } from '@privy-io/react-auth';

export const ExportWallet = () => {
  const { ready, authenticated, user, exportWallet } = usePrivy();
  const isAuthenticated = ready && authenticated;
  // check that your user has an embedded wallet
  const hasEmbeddedWallet = !!user?.linkedAccounts.find(
    (account) => account.type === 'wallet' && account.walletClientType === 'privy' && account.chainType === 'ethereum',
  );

  return (
    <>
      <h1 className="text-2xl font-bold">Export Wallet</h1>
      <Button onClick={exportWallet} disabled={!isAuthenticated || !hasEmbeddedWallet}>
        Export my wallet
      </Button>
    </>
  );
};
