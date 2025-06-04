import { CreateSpace } from '@/components/create-space';
import { Button } from '@/components/ui/button';
import { Connect, type Identity, Key, type Messages, StoreConnect, Utils } from '@graphprotocol/hypergraph';
import { useIdentityToken, usePrivy, useWallets } from '@privy-io/react-auth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { createStore } from '@xstate/store';
import { useSelector } from '@xstate/store/react';
import { Effect } from 'effect';
import { useEffect } from 'react';
import { createWalletClient, custom } from 'viem';
import { mainnet } from 'viem/chains';

type AuthenticateSearch = {
  data: unknown;
  redirect: string;
  nonce: string;
};

export const Route = createFileRoute('/authenticate')({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): AuthenticateSearch => {
    return {
      data: search.data,
      redirect: search.redirect as string,
      nonce: search.nonce as string,
    };
  },
});

type AppInfo = {
  appId: string;
  redirect: string;
  appNonce: string;
  expiry: number;
  ephemeralEncryptionPublicKey: string;
};

type ComponentContext =
  | {
      step: 'fetching-app-identity';
      appIdentity: undefined;
      error: undefined;
      appInfo: undefined;
    }
  | {
      step: 'app-identity-does-not-exist';
      appIdentity: undefined;
      error: undefined;
      appInfo: AppInfo;
    }
  | {
      step: 'error';
      appIdentity: undefined;
      error: string;
      appInfo: AppInfo | undefined;
    }
  | {
      step: 'selecting-spaces';
      appIdentity: Connect.PrivateAppIdentity;
      error: undefined;
      appInfo: AppInfo;
    };

const initialContext: ComponentContext = {
  step: 'fetching-app-identity' as const,
  appIdentity: undefined,
  error: undefined,
  appInfo: undefined,
};

type ComponentEvents = {
  setAppIdentity: { appIdentity: Connect.PrivateAppIdentity; appInfo: AppInfo };
  setStepToAppIdentityDoesNotExist: { appInfo: AppInfo };
  setStepToError: { error: string; appInfo: AppInfo | undefined };
};

const componentStore = createStore<ComponentContext, ComponentEvents, never>({
  context: initialContext,
  on: {
    setAppIdentity: (_context, event) => ({
      step: 'selecting-spaces',
      appIdentity: event.appIdentity,
      error: undefined,
      appInfo: event.appInfo,
    }),
    setStepToAppIdentityDoesNotExist: (_context, event) => ({
      step: 'app-identity-does-not-exist',
      appIdentity: undefined,
      error: undefined,
      appInfo: event.appInfo,
    }),
    setStepToError: (context, event) => ({
      step: 'error',
      appIdentity: undefined,
      error: event.error,
      appInfo: event.appInfo ?? context.appInfo,
    }),
  },
});

function RouteComponent() {
  const { ready } = usePrivy();

  if (!ready) {
    return null;
  }

  return <AuthenticateComponent />;
}

function AuthenticateComponent() {
  const { data, redirect, nonce } = Route.useSearch();
  const { identityToken } = useIdentityToken();
  const accountAddress = useSelector(StoreConnect.store, (state) => state.context.accountAddress);
  const keys = useSelector(StoreConnect.store, (state) => state.context.keys);

  const { signMessage } = usePrivy();
  const { wallets } = useWallets();
  const embeddedWallet = wallets.find((wallet) => wallet.walletClientType === 'privy') || wallets[0];

  const state = useSelector(componentStore, (state) => state.context);
  const queryClient = useQueryClient();

  const {
    // isPending,
    // error,
    data: spacesData,
  } = useQuery<{
    spaces: {
      id: string;
      name: string;
      appIdentities: { address: string; appId: string }[];
      keyBoxes: {
        id: string;
        ciphertext: string;
        nonce: string;
        authorPublicKey: string;
      }[];
    }[];
  }>({
    queryKey: ['spaces'],
    queryFn: async () => {
      if (!identityToken) return { spaces: [] };
      const response = await fetch(`${import.meta.env.VITE_HYPERGRAPH_SYNC_SERVER_ORIGIN}/connect/spaces`, {
        headers: { 'privy-id-token': identityToken },
      });
      return await response.json();
    },
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: signMessage would cause an infinite loop
  useEffect(() => {
    const run = async () => {
      if (!identityToken || !accountAddress || !keys || !embeddedWallet) {
        return;
      }

      try {
        const parsedAuthParams = await Effect.runPromise(Connect.parseAuthParams({ data, redirect, nonce }));

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

        const response = await fetch(
          `${import.meta.env.VITE_HYPERGRAPH_SYNC_SERVER_ORIGIN}/connect/app-identity/${parsedAuthParams.payload.appId}`,
          {
            headers: {
              'privy-id-token': identityToken,
              'Content-Type': 'application/json',
            },
          },
        );
        if (response.status === 200) {
          const appIdentity = await response.json();
          console.log('appIdentity', appIdentity);
          const decryptedIdentity = await Connect.decryptAppIdentity(
            signer,
            accountAddress,
            appIdentity.appIdentity.ciphertext,
            appIdentity.appIdentity.nonce,
          );
          console.log(
            'decryptedIdentity',
            decryptedIdentity.encryptionPrivateKey,
            decryptedIdentity.signaturePrivateKey,
          );
          componentStore.send({
            type: 'setAppIdentity',
            appIdentity: {
              address: appIdentity.appIdentity.address,
              signaturePublicKey: decryptedIdentity.signaturePublicKey,
              encryptionPublicKey: decryptedIdentity.encryptionPublicKey,
              addressPrivateKey: decryptedIdentity.addressPrivateKey,
              encryptionPrivateKey: decryptedIdentity.encryptionPrivateKey,
              signaturePrivateKey: decryptedIdentity.signaturePrivateKey,
              sessionToken: appIdentity.appIdentity.sessionToken,
              sessionTokenExpires: new Date(appIdentity.appIdentity.sessionTokenExpires),
            },
            appInfo: {
              appId: parsedAuthParams.payload.appId,
              redirect: parsedAuthParams.redirect,
              appNonce: parsedAuthParams.nonce,
              expiry: parsedAuthParams.payload.expiry,
              ephemeralEncryptionPublicKey: parsedAuthParams.payload.encryptionPublicKey,
            },
          });
          queryClient.invalidateQueries({ queryKey: ['spaces'] });
          return;
        }
        if (response.status === 404) {
          componentStore.send({
            type: 'setStepToAppIdentityDoesNotExist',
            appInfo: {
              appId: parsedAuthParams.payload.appId,
              redirect: parsedAuthParams.redirect,
              appNonce: parsedAuthParams.nonce,
              expiry: parsedAuthParams.payload.expiry,
              ephemeralEncryptionPublicKey: parsedAuthParams.payload.encryptionPublicKey,
            },
          });
          return;
        }
        alert('Failed to fetch app identity');
      } catch (error) {
        console.error(error);
        alert('Failed to parse authentication data');
      }
    };
    run();
    // }, [data, redirect, nonce, identityToken, accountAddress, keys, embeddedWallet, queryClient.invalidateQueries, signMessage]);
  }, [data, redirect, nonce, identityToken, accountAddress, keys, embeddedWallet, queryClient.invalidateQueries]);

  const createNewAppIdentity = async () => {
    if (!identityToken || !accountAddress || !keys || !embeddedWallet || !state.appInfo) {
      return;
    }

    try {
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

      const newAppIdentity = Connect.createAppIdentity();
      const { ciphertext, nonce } = await Connect.encryptAppIdentity(
        signer,
        accountAddress,
        newAppIdentity.address,
        newAppIdentity.addressPrivateKey,
        keys,
      );
      const { accountProof, keyProof } = await Connect.proveIdentityOwnership(signer, accountAddress, keys);

      const message: Messages.RequestConnectCreateAppIdentity = {
        appId: state.appInfo.appId,
        address: newAppIdentity.address,
        signaturePublicKey: newAppIdentity.signaturePublicKey,
        encryptionPublicKey: newAppIdentity.encryptionPublicKey,
        ciphertext,
        nonce,
        accountProof,
        keyProof,
      };

      const response = await fetch(`${import.meta.env.VITE_HYPERGRAPH_SYNC_SERVER_ORIGIN}/connect/app-identity`, {
        headers: {
          'privy-id-token': identityToken,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(message),
      });
      const appIdentityResponse = await response.json();
      console.log('appIdentity', appIdentityResponse);
      componentStore.send({
        type: 'setAppIdentity',
        appIdentity: {
          address: newAppIdentity.address,
          signaturePublicKey: newAppIdentity.signaturePublicKey,
          encryptionPublicKey: newAppIdentity.encryptionPublicKey,
          addressPrivateKey: newAppIdentity.addressPrivateKey,
          encryptionPrivateKey: keys.encryptionPrivateKey,
          signaturePrivateKey: keys.signaturePrivateKey,
          sessionToken: appIdentityResponse.appIdentity.sessionToken,
          sessionTokenExpires: appIdentityResponse.appIdentity.sessionTokenExpires,
        },
        appInfo: {
          appId: state.appInfo.appId,
          redirect: state.appInfo.redirect,
          appNonce: state.appInfo.appNonce,
          expiry: state.appInfo.expiry,
          ephemeralEncryptionPublicKey: state.appInfo.ephemeralEncryptionPublicKey,
        },
      });
      queryClient.invalidateQueries({ queryKey: ['spaces'] });
    } catch (error) {
      console.error(error);
      alert('Failed to create new app identity');
    }
  };

  const encryptSpacesAndRedirect = async () => {
    // TODO: compare the existing selected spaces for this app identity with the selected spaces and only encrypt the new spaces and attach them to the app identity in the sync server
    if (
      !identityToken ||
      !accountAddress ||
      !keys ||
      !embeddedWallet ||
      !state.appInfo ||
      state.step !== 'selecting-spaces'
    ) {
      return;
    }

    const spacesInput = spacesData
      ? spacesData.spaces.map((space) => {
          // TODO: currently without checking we assume all keyboxes exists and we don't create any - we should check if the keyboxes exist and create them if they don't
          if (space.appIdentities.some((appIdentity) => appIdentity.address === state.appIdentity.address))
            return {
              id: space.id,
              keyBoxes: [],
            };

          const spaceKeys = space.keyBoxes.map((keyboxData) => {
            const key = Key.decryptKey({
              privateKey: Utils.hexToBytes(keys.encryptionPrivateKey),
              publicKey: Utils.hexToBytes(keyboxData.authorPublicKey),
              keyBoxCiphertext: Utils.hexToBytes(keyboxData.ciphertext),
              keyBoxNonce: Utils.hexToBytes(keyboxData.nonce),
            });
            return {
              id: keyboxData.id,
              key: key,
            };
          });

          const keyBoxes = spaceKeys.map((keyData) => {
            const keyBox = Key.encryptKey({
              privateKey: Utils.hexToBytes(keys.encryptionPrivateKey),
              publicKey: Utils.hexToBytes(state.appIdentity.encryptionPublicKey),
              key: keyData.key,
            });
            return {
              id: keyData.id,
              ciphertext: Utils.bytesToHex(keyBox.keyBoxCiphertext),
              nonce: Utils.bytesToHex(keyBox.keyBoxNonce),
              authorPublicKey: state.appIdentity.encryptionPublicKey,
              accountAddress: accountAddress,
            };
          });

          return {
            id: space.id,
            keyBoxes,
          };
        })
      : [];

    const message: Messages.RequestConnectAddAppIdentityToSpaces = {
      type: 'connect-add-app-identity-to-spaces',
      appIdentityAddress: state.appIdentity.address,
      spacesInput,
    };

    // TODO add loading indicator by updating the state
    const response = await fetch(
      `${import.meta.env.VITE_HYPERGRAPH_SYNC_SERVER_ORIGIN}/connect/add-app-identity-to-spaces`,
      {
        headers: {
          'privy-id-token': identityToken,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(message),
      },
    );
    if (response.status === 200) {
      console.log('state.appIdentity', state.appIdentity);
      const params = Connect.createCallbackParams({
        appId: state.appInfo.appId,
        nonce: state.appInfo.appNonce,
        ephemeralPublicKey: state.appInfo.ephemeralEncryptionPublicKey,
        appIdentityAddress: state.appIdentity.address,
        encryptionPrivateKey: state.appIdentity.encryptionPrivateKey,
        signaturePrivateKey: state.appIdentity.signaturePrivateKey,
        signaturePublicKey: state.appIdentity.signaturePublicKey,
        appIdentityAddressPrivateKey: state.appIdentity.addressPrivateKey,
        encryptionPublicKey: state.appIdentity.encryptionPublicKey,
        spaces: spacesData?.spaces.map((space) => ({ id: space.id })) ?? [],
        expiry: state.appInfo.expiry,
        sessionToken: state.appIdentity.sessionToken,
        sessionTokenExpires: state.appIdentity.sessionTokenExpires.getTime(),
      });
      window.location.href = `${state.appInfo.redirect}?ciphertext=${params.ciphertext}&nonce=${params.nonce}`;
    } else {
      alert('Failed to authenticate and give access to all spaces');
    }
  };

  return (
    <div>
      <div>
        <h1>Authenticating</h1>
        {state.step === 'fetching-app-identity' && <p>Loading…</p>}
        {state.step === 'app-identity-does-not-exist' && (
          <>
            <p>Do you want accociate this app with your account and give access to all spaces?</p>
            <p>
              App Id: {state.appInfo.appId ?? 'unknown'}
              <br />
              Redirect: {state.appInfo.redirect ?? 'unknown'}
            </p>
            <p>Select spaces (not working yet)</p>
            {spacesData?.spaces.map((space: { id: string; name: string }) => (
              <div key={space.id}>
                {space.name} ({space.id})
              </div>
            ))}
            <CreateSpace />
            <Button onClick={createNewAppIdentity}>Authenticate</Button>
          </>
        )}
        {state.step === 'selecting-spaces' && (
          <>
            <p>Do you want login with this app?</p>
            <p>
              App Id: {state.appInfo.appId ?? 'unknown'}
              <br />
              Redirect: {state.appInfo.redirect ?? 'unknown'}
            </p>
            <p>Select spaces (not working yet)</p>
            {spacesData?.spaces.map((space) => (
              <div key={space.id}>
                {space.name} ({space.id})
                <br />
                ---------
                <br />
                {space.appIdentities.map((appIdentity) => (
                  <div key={appIdentity.address}>
                    {appIdentity.appId} ({appIdentity.address})
                  </div>
                ))}
              </div>
            ))}
            <CreateSpace />
            <Button onClick={encryptSpacesAndRedirect}>Authenticate and give access to all spaces</Button>
          </>
        )}
      </div>
    </div>
  );
}
