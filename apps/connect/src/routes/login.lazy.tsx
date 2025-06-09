import { Button } from '@/components/ui/button';
import { Connect, type Identity } from '@graphprotocol/hypergraph';
import { GEOGENESIS, GEO_TESTNET } from '@graphprotocol/hypergraph/connect/smart-account';
import { type ConnectedWallet, useIdentityToken, usePrivy, useWallets } from '@privy-io/react-auth';
import { createLazyFileRoute, useRouter } from '@tanstack/react-router';
import { useCallback, useEffect, useState } from 'react';
import { type WalletClient, createWalletClient, custom } from 'viem';

const CHAIN = import.meta.env.VITE_HYPERGRAPH_CHAIN === 'geogenesis' ? GEOGENESIS : GEO_TESTNET;
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
    async (walletClient: WalletClient, embeddedWallet: ConnectedWallet) => {
      if (!identityToken) {
        return;
      }
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

      const address = await signer.getAddress();
      if (!address) {
        return;
      }

      const rpcUrl = import.meta.env.VITE_HYPERGRAPH_RPC_URL;

      await Connect.login({ walletClient, signer, syncServerUri, storage, identityToken, rpcUrl, chain: CHAIN });
    },
    [identityToken, signMessage],
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
            chain: CHAIN,
            transport: custom(privyProvider),
          });

          await hypergraphLogin(walletClient, embeddedWallet);

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
  }, [privyAuthenticated, walletsReady, wallets, hypergraphLogin, navigate, hypergraphLoginStarted]);

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
