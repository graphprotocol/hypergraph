'use client';

import { HypergraphAppProvider } from '@graphprotocol/hypergraph-react';
import { PrivyProvider } from '@privy-io/react-auth';

// recommended by https://docs.privy.io/basics/troubleshooting/react-frameworks#next-js
export default function Providers({ children }: { children: React.ReactNode }) {
  const storage = typeof window !== 'undefined' ? window.localStorage : (undefined as unknown as Storage);

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
      <HypergraphAppProvider storage={storage}>{children}</HypergraphAppProvider>
    </PrivyProvider>
  );
}
