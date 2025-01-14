import { Identity } from '@graphprotocol/hypergraph';
import { PrivyProvider, usePrivy, useWallets } from '@privy-io/react-auth';
import { useRouter } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

function DoGraphLogin() {
  const { login } = Identity.useGraphLogin();
  useEffect(() => {
    console.log('Logging in to The Graph');
    login();
  }, []);
  return <div />;
}

function Auth({ children }: { children: React.ReactNode }) {
  const { signMessage, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const [signer, setSigner] = useState<Identity.Signer | null>(null);

  useEffect(() => {
    const getSigner = async () => {
      const embeddedWallet = wallets.find((wallet) => wallet.walletClientType === 'privy') || wallets[0];
      const provider = await embeddedWallet.getEthersProvider();
      const newSigner = provider.getSigner();
      if (embeddedWallet.walletClientType === 'privy') {
        newSigner.signMessage = async (message) => {
          // @ts-expect-error signMessage is a string in this case
          const signature = await signMessage(message); //, uiConfig);

          return signature;
        };
      }
      setSigner(newSigner);
    };

    if (wallets.length > 0) {
      getSigner();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallets]);

  return (
    <>
      {signer && authenticated ? (
        <Identity.GraphLogin storage={localStorage} signer={signer}>
          <DoGraphLogin />
          {children}
        </Identity.GraphLogin>
      ) : (
        children
      )}
    </>
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId="cm4wx6ziv00ngrmfjf9ik36iu"
      config={{
        // Display email and wallet as login methods
        loginMethods: ['email', 'wallet', 'google', 'twitter', 'github'],
        // Customize Privy's appearance in your app
        appearance: {
          theme: 'light',
          accentColor: '#676FFF',
        },
        // Create embedded wallets for users who don't have a wallet
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
      }}
    >
      <Auth>{children}</Auth>
    </PrivyProvider>
  );
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { authenticated } = usePrivy();
  const { authenticated: graphAuthenticated } = Identity.useGraphLogin();
  const router = useRouter();
  if (!authenticated || !graphAuthenticated) {
    router.navigate({
      to: '/login',
    });
    return <div />;
  }
  return <>{children}</>;
}
