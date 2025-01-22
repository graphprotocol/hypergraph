import type { Identity } from '@graphprotocol/hypergraph';
import { Auth } from '@graphprotocol/hypergraph-react';
import { useLogin, usePrivy, useWallets } from '@privy-io/react-auth';
import { createLazyFileRoute, useRouter } from '@tanstack/react-router';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { createWalletClient, custom } from 'viem';
import { mainnet } from 'viem/chains';

import { Button } from '@/components/ui/button';
import { availableAccounts } from '@/lib/availableAccounts';

export const Route = createLazyFileRoute('/login')({
  component: () => <Login />,
});

function Login() {
  const { setIdentityAndSessionToken, login: hypergraphLogin } = Auth.useHypergraphAuth();
  const { ready: privyReady, signMessage } = usePrivy();
  const { ready: walletsReady, wallets } = useWallets();
  const { login: privyLogin } = useLogin({
    onComplete: async ({ user }) => {
      try {
        if (!walletsReady || !wallets.length) {
          throw new Error('Wallets not ready');
        }
        const wallet = wallets.find((wallet) => wallet.address === user.wallet?.address);
        if (!wallet) {
          throw new Error('Embedded wallet not found');
        }
        const privyProvider = await wallet.getEthereumProvider();
        const walletClient = createWalletClient({
          chain: mainnet,
          transport: custom(privyProvider),
        });

        const signer: Identity.Signer = {
          getAddress: async () => {
            const [address] = await walletClient.getAddresses();
            return address;
          },
          signMessage: async (message: string) => {
            if (wallet.walletClientType === 'privy') {
              const { signature } = await signMessage({ message });
              return signature;
            }
            const [address] = await walletClient.getAddresses();
            return await walletClient.signMessage({ account: address, message });
          },
        };

        await hypergraphLogin(signer);
        navigate({ to: '/' });
      } catch (error) {
        setHypergraphLoginStarted(false);
        alert('Failed to login');
        console.error(error);
      }
    },
  });
  const { navigate } = useRouter();
  const [hypergraphLoginStarted, setHypergraphLoginStarted] = useState(false);

  return (
    <div className="flex flex-1 justify-center items-center flex-col gap-4">
      <div>
        <Button
          disabled={!privyReady || hypergraphLoginStarted}
          onClick={(event) => {
            event.preventDefault();
            privyLogin({});
          }}
        >
          Log in {hypergraphLoginStarted && <Loader2 className="ml-2 w-4 h-4 animate-spin" />}
        </Button>

        <div>
          <h1>Choose account</h1>
          <Button
            onClick={(event) => {
              event.preventDefault();
              setIdentityAndSessionToken(availableAccounts[0]);
              navigate({ to: '/' });
            }}
          >
            {availableAccounts[0].accountId.substring(0, 6)}
          </Button>
          <Button
            onClick={(event) => {
              event.preventDefault();
              setIdentityAndSessionToken(availableAccounts[1]);
              navigate({ to: '/' });
            }}
          >
            {availableAccounts[1].accountId.substring(0, 6)}
          </Button>
          <Button
            onClick={(event) => {
              event.preventDefault();
              setIdentityAndSessionToken(availableAccounts[2]);
              navigate({ to: '/' });
            }}
          >
            {availableAccounts[2].accountId.substring(0, 6)}
          </Button>
        </div>
      </div>
    </div>
  );
}
