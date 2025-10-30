import { Connect, type Identity, PrivyAuth } from '@graphprotocol/hypergraph';
import { type ConnectedWallet, useIdentityToken, usePrivy, useWallets } from '@privy-io/react-auth';
import { createLazyFileRoute, useRouter } from '@tanstack/react-router';
import { useCallback, useEffect, useState } from 'react';
import { createWalletClient, custom, type WalletClient } from 'viem';
import { Button } from '@/components/ui/button';

const CHAIN = import.meta.env.VITE_HYPERGRAPH_CHAIN === 'geogenesis' ? Connect.GEOGENESIS : Connect.GEO_TESTNET;
const syncServerUri = import.meta.env.VITE_HYPERGRAPH_SYNC_SERVER_ORIGIN;
const addressStorage = localStorage;
const keysStorage = sessionStorage;

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
            const { signature } = await signMessage({ message }, { uiOptions: { showWalletUIs: false } });
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

      await PrivyAuth.login({
        // @ts-expect-error incompatible viem types
        walletClient,
        signer,
        syncServerUri,
        addressStorage,
        keysStorage,
        identityToken,
        rpcUrl,
        chain: CHAIN,
      });
    },
    [identityToken, signMessage],
  );

  useEffect(() => {
    if (
      !hypergraphLoginStarted && // avoid re-running the effect too often
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
            account: embeddedWallet.address as `0x${string}`,
            chain: CHAIN,
            transport: custom(privyProvider),
          });

          await hypergraphLogin(walletClient, embeddedWallet);

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
      <Button
        disabled={!privyReady || privyAuthenticated}
        onClick={() => {
          privyLogin();
        }}
        className="c-button c-button--primary sm:c-button--large mt-6"
      >
        Authenticate with Privy
      </Button>
    </div>
  );
}
