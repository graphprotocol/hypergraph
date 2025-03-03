import { Button } from '@/components/ui/button';
import { createEthereumAccount } from '@/lib/create-ethereum-account';
import { useDelegatedActions, usePrivy, useWallets } from '@privy-io/react-auth';

export const Delegate = () => {
  const { user } = usePrivy();
  const { ready, wallets } = useWallets();
  const { delegateWallet, revokeWallets } = useDelegatedActions();

  // find the embedded wallet to delegate from the array of the user's wallets
  const walletToDelegate = wallets.find((wallet) => wallet.walletClientType === 'privy');

  // // check if the wallet to delegate by inspecting the user's linked accounts
  // const isAlreadyDelegated = !!user?.linkedAccounts.find(
  //   (account): account is WalletWithMetadata => account.type === 'wallet' && account.delegated,
  // );

  const onDelegate = async () => {
    const { address, privateKey } = createEthereumAccount();
    if (!walletToDelegate || !ready) return;
    await delegateWallet({ address: walletToDelegate.address, chainType: 'ethereum' });
    alert(`Delegated to ${address} with private key ${privateKey}`);
  };

  return (
    <>
      <h1 className="text-2xl font-bold">Delegate Access</h1>
      <h2 className="text-lg font-bold">Accounts</h2>
      <ul>
        {user?.linkedAccounts.map((account) => {
          if (account.type === 'wallet') {
            return <li key={account.address}>{account.address}</li>;
          }
        })}
      </ul>
      <Button disabled={!ready || !walletToDelegate} onClick={onDelegate} type="button">
        Delegate access
      </Button>
    </>
  );
};
