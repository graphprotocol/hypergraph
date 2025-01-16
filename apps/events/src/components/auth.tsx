import { Identity } from '@graphprotocol/hypergraph';
import { PrivyProvider, usePrivy, useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';

function DoGraphLogin() {
  const { login } = Identity.useGraphLogin();
  // biome-ignore lint/correctness/useExhaustiveDependencies: this is an issue and will make sure login is not run in a useEffect
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: todo [this is kinda ugly]
  useEffect(() => {
    if (wallets.length > 0) {
      (async () => {
        const embeddedWallet = wallets.find((wallet) => wallet.walletClientType === 'privy') || wallets[0];
        const privyProvider = await embeddedWallet.getEthereumProvider();
        const ethersProvider = new ethers.providers.Web3Provider(privyProvider);
        const newSigner = await ethersProvider.getSigner();

        if (embeddedWallet.walletClientType === 'privy') {
          newSigner.signMessage = async (message) => {
            // @ts-expect-error signMessage is a string in this case
            const { signature } = await signMessage({ message }); //, uiConfig);
            return signature;
          };
        }

        setSigner(newSigner);
      })();
    }
  }, [wallets, setSigner, signMessage]);

  return (
    <>
      {signer && authenticated ? (
        <Identity.GraphLogin storage={localStorage} signer={signer}>
          <DoGraphLogin />
          {children}
        </Identity.GraphLogin>
      ) : (
        // @ts-expect-error signer is not required should be fixed in GraphLogin
        <Identity.GraphLogin storage={localStorage}>{children}</Identity.GraphLogin>
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
