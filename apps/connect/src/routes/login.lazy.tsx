import { Button } from '@/components/ui/button';
import { Connect, type Identity } from '@graphprotocol/hypergraph';
import { useIdentityToken, usePrivy, useWallets } from '@privy-io/react-auth';
import { createLazyFileRoute, useRouter } from '@tanstack/react-router';
import { useCallback, useEffect, useState } from 'react';
import { createWalletClient, custom, getAddress } from 'viem';
import { mainnet } from 'viem/chains';

const syncServerUri = import.meta.env.VITE_HYPERGRAPH_SYNC_SERVER_ORIGIN;
const storage = localStorage;

export const Route = createLazyFileRoute('/login')({
  component: () => <Login />,
});

function Login() {
  const { ready: privyReady, login: privyLogin, signMessage, authenticated: privyAuthenticated } = usePrivy();
  const { ready: walletsReady, wallets } = useWallets();
  const { navigate } = useRouter();
  const [hypergraphLoginStarted, setHypergraphLoginStarted] = useState(false);
  const { identityToken } = useIdentityToken();

  const hypergraphLogin = useCallback(
    async (signer: Identity.Signer) => {
      if (!signer || !identityToken) {
        return;
      }
      const address = await signer.getAddress();
      if (!address) {
        return;
      }
      const accountAddress = getAddress(address);
      await Connect.login(signer, accountAddress, syncServerUri, storage, identityToken);
    },
    [identityToken],
  );

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

          const redirect = localStorage.getItem('geo-connect-authenticate-redirect');
          if (redirect) {
            localStorage.removeItem('geo-connect-authenticate-redirect');
            navigate({ to: redirect, replace: true });
            return;
          }

          navigate({ to: '/', replace: true });
        } catch (error) {
          alert('Failed to login');
          console.error(error);
        }
      })();
    }
  }, [privyAuthenticated, walletsReady, wallets, signMessage, hypergraphLogin, navigate, hypergraphLoginStarted]);

  return (
    <div className="flex flex-1 justify-center items-center flex-col gap-4">
      <div>
        <Button
          disabled={!privyReady || privyAuthenticated}
          onClick={(event) => {
            event.preventDefault();
            privyLogin({});
          }}
        >
          Log in
        </Button>
      </div>
    </div>
  );
}
