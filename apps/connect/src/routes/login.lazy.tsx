import GeoLogo from '@/assets/images/geo-logo-branded.svg?react';
import { AppTitle } from '@/components/ui/AppTitle';
import { Connect, type Identity } from '@graphprotocol/hypergraph';
import { type ConnectedWallet, useIdentityToken, usePrivy, useWallets } from '@privy-io/react-auth';
import { createLazyFileRoute, useRouter } from '@tanstack/react-router';
import { useCallback, useEffect, useState } from 'react';
import { type WalletClient, createWalletClient, custom } from 'viem';

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
      console.log('hypergraphLogin');
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

      console.log(walletClient);
      console.log(rpcUrl);
      console.log(CHAIN);
      await Connect.login({
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
    console.log('useEffect in login.lazy.tsx');
    if (
      !hypergraphLoginStarted && // avoid re-running the effect too often
      privyAuthenticated && // privy must be authenticated to run it
      walletsReady && // wallets must be ready to run it
      wallets.length > 0 // wallets must have at least one wallet to run it
    ) {
      console.log('running login effect');
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
    <div className="flex grow flex-col items-center justify-center">
      <div className="c-card sm:c-card--large">
        <div className="flex items-center justify-center gap-3 text-4xl sm:gap-4 sm:text-5xl">
          <GeoLogo className="w-[1em] shrink-0" />
          <AppTitle />
        </div>
        <div className="flex flex-col items-center justify-center gap-2 mt-4">
          <p className="text-center text-muted-foreground max-w-72 leading-6 font-semibold">
            Manage your private and public spaces on the decentralized web and grant access to 3rd party apps.
          </p>
        </div>
        <button
          type="button"
          disabled={!privyReady || privyAuthenticated}
          onClick={() => {
            privyLogin();
          }}
          className="c-button c-button--primary sm:c-button--large mt-4 w-full sm:mt-10"
        >
          Sign in
        </button>
      </div>
    </div>
  );
}
