import type { Identity } from '@graphprotocol/hypergraph';
import { Auth } from '@graphprotocol/hypergraph-react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { createLazyFileRoute, useRouter } from '@tanstack/react-router';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createWalletClient, custom } from 'viem';
import { mainnet } from 'viem/chains';

import { Button } from '@/components/ui/button';
import { availableAccounts } from '@/lib/availableAccounts';

export const Route = createLazyFileRoute('/login')({
  component: () => <Login />,
});

function Login() {
  const { ready: privyReady, login: privyLogin, signMessage, authenticated: privyAuthenticated } = usePrivy();
  const { ready: walletsReady, wallets } = useWallets();
  const { setIdentityAndSessionToken, login: hypergraphLogin } = Auth.useHypergraphAuth();
  const { navigate } = useRouter();
  const [hypergraphLoginStarted, setHypergraphLoginStarted] = useState(false);

  useEffect(() => {
    if (
      !hypergraphLoginStarted && // avoid re-running the effect to often
      privyAuthenticated && // privy must be authenticated to run it
      walletsReady && // wallets must be ready to run it
      wallets.length > 0 // wallets must have at least one wallet to run it
    ) {
      setHypergraphLoginStarted(true);
      (async () => {
        try {
          const embeddedWallet = wallets.find((wallet) => wallet.walletClientType === 'privy') || wallets[0];
          const privyProvider = await embeddedWallet.getEthereumProvider();
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
              if (embeddedWallet.walletClientType === 'privy') {
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
          alert('Failed to login');
          console.error(error);
        }
      })();
    }
  }, [hypergraphLoginStarted, walletsReady, wallets, signMessage, hypergraphLogin, navigate, privyAuthenticated]);

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
