import { CreateSpace } from '@/components/create-space';
import { Button } from '@/components/ui/button';
import { useSpaces } from '@/hooks/use-spaces';
import { Connect, type Identity, Key, type Messages, StoreConnect, Utils } from '@graphprotocol/hypergraph';
import { useIdentityToken, usePrivy, useWallets } from '@privy-io/react-auth';
import { createFileRoute } from '@tanstack/react-router';
import { createStore } from '@xstate/store';
import { useSelector } from '@xstate/store/react';
import { Effect, Schema } from 'effect';
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
      appIdentityResponse: undefined;
      appIdentity: undefined;
      error: undefined;
      appInfo: undefined;
    }
  | {
      step: 'error';
      appIdentity: undefined;
      appIdentityResponse: undefined;
      error: string;
      appInfo: AppInfo | undefined;
    }
  | {
      step: 'selecting-spaces-new-app-identity';
      appIdentityResponse: undefined;
      appIdentity: undefined;
      error: undefined;
      appInfo: AppInfo;
    }
  | {
      step: 'selecting-spaces-existing-app-identity';
      appIdentityResponse: Connect.AppIdentityResponse;
      appIdentity: undefined;
      error: undefined;
      appInfo: AppInfo;
    };

const initialContext: ComponentContext = {
  step: 'fetching-app-identity' as const,
  appIdentityResponse: undefined,
  appIdentity: undefined,
  error: undefined,
  appInfo: undefined,
};

type ComponentEvents = {
  setStepToSelectingSpacesExistingAppIdentity: {
    appInfo: AppInfo;
    // biome-ignore lint/suspicious/noExplicitAny: TODO add types later
    appIdentityResponse: any;
  };
  setStepToSelectingSpacesNewAppIdentity: { appInfo: AppInfo };
  setStepToError: { error: string; appInfo: AppInfo | undefined };
};

const decodeAppIdentityResponse = Schema.decodeSync(Connect.AppIdentityResponse);

const componentStore = createStore<ComponentContext, ComponentEvents, never>({
  context: initialContext,
  on: {
    setStepToSelectingSpacesExistingAppIdentity: (_context, event) => ({
      step: 'selecting-spaces-existing-app-identity',
      appIdentity: undefined,
      appIdentityResponse: event.appIdentityResponse,
      error: undefined,
      appInfo: event.appInfo,
    }),
    setStepToSelectingSpacesNewAppIdentity: (_context, event) => ({
      step: 'selecting-spaces-new-app-identity',
      appIdentity: undefined,
      appIdentityResponse: undefined,
      error: undefined,
      appInfo: event.appInfo,
    }),
    setStepToError: (context, event) => ({
      step: 'error',
      appIdentity: undefined,
      appIdentityResponse: undefined,
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

  const { isPending, error: spacesError, data: spacesData } = useSpaces();

  useEffect(() => {
    const run = async () => {
      if (!identityToken || !accountAddress || !keys || !embeddedWallet) {
        return;
      }

      try {
        const parsedAuthParams = await Effect.runPromise(Connect.parseAuthParams({ data, redirect, nonce }));
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
          const appIdentityResponseRaw = await response.json();
          const appIdentityResponse = decodeAppIdentityResponse(appIdentityResponseRaw?.appIdentity);
          componentStore.send({
            type: 'setStepToSelectingSpacesExistingAppIdentity',
            appInfo: {
              appId: parsedAuthParams.payload.appId,
              redirect: parsedAuthParams.redirect,
              appNonce: parsedAuthParams.nonce,
              expiry: parsedAuthParams.payload.expiry,
              ephemeralEncryptionPublicKey: parsedAuthParams.payload.encryptionPublicKey,
            },
            appIdentityResponse,
          });
          return;
        }
        if (response.status === 404) {
          componentStore.send({
            type: 'setStepToSelectingSpacesNewAppIdentity',
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
        componentStore.send({
          type: 'setStepToError',
          error: 'Failed to fetch app identity',
          appInfo: undefined,
        });
      } catch (error) {
        console.error(error);
        componentStore.send({
          type: 'setStepToError',
          error: 'Failed to parse authentication data',
          appInfo: undefined,
        });
      }
    };
    run();
  }, [data, redirect, nonce, identityToken, accountAddress, keys, embeddedWallet]);

  const encryptSpacesAndRedirect = async ({
    accountAddress,
    appIdentity,
    appInfo,
  }: {
    accountAddress: string;
    appIdentity: Connect.PrivateAppIdentity;
    appInfo: AppInfo;
  }) => {
    // TODO: compare the existing selected spaces for this app identity with the selected spaces and only encrypt the new spaces and attach them to the app identity in the sync server
    if (!identityToken || !accountAddress || !keys || !embeddedWallet) {
      return;
    }

    const spacesInput = spacesData
      ? spacesData.map((space) => {
          // TODO: currently without checking we assume all keyboxes exists and we don't create any - we should check if the keyboxes exist and create them if they don't
          if (space.appIdentities.some((spaceAppIdentity) => spaceAppIdentity.address === appIdentity.address))
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
              publicKey: Utils.hexToBytes(appIdentity.encryptionPublicKey),
              key: keyData.key,
            });
            return {
              id: keyData.id,
              ciphertext: Utils.bytesToHex(keyBox.keyBoxCiphertext),
              nonce: Utils.bytesToHex(keyBox.keyBoxNonce),
              authorPublicKey: appIdentity.encryptionPublicKey,
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
      appIdentityAddress: appIdentity.address,
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
      const params = Connect.createCallbackParams({
        appId: appInfo.appId,
        nonce: appInfo.appNonce,
        ephemeralPublicKey: appInfo.ephemeralEncryptionPublicKey,
        appIdentityAddress: appIdentity.address,
        encryptionPrivateKey: appIdentity.encryptionPrivateKey,
        signaturePrivateKey: appIdentity.signaturePrivateKey,
        signaturePublicKey: appIdentity.signaturePublicKey,
        appIdentityAddressPrivateKey: appIdentity.addressPrivateKey,
        encryptionPublicKey: appIdentity.encryptionPublicKey,
        spaces: spacesData?.map((space) => ({ id: space.id })) ?? [],
        expiry: appInfo.expiry,
        sessionToken: appIdentity.sessionToken,
        sessionTokenExpires: appIdentity.sessionTokenExpires.getTime(),
      });
      window.location.href = `${appInfo.redirect}?ciphertext=${params.ciphertext}&nonce=${params.nonce}`;
    } else {
      componentStore.send({
        type: 'setStepToError',
        error: 'Failed to authenticate and give access to all spaces',
        appInfo: appInfo,
      });
    }
  };

  const createNewAppIdentityAndRedirect = async () => {
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
      await encryptSpacesAndRedirect({
        accountAddress,
        appIdentity: {
          address: newAppIdentity.address,
          addressPrivateKey: newAppIdentity.addressPrivateKey,
          encryptionPrivateKey: keys.encryptionPrivateKey,
          signaturePrivateKey: keys.signaturePrivateKey,
          encryptionPublicKey: newAppIdentity.encryptionPublicKey,
          signaturePublicKey: newAppIdentity.signaturePublicKey,
          sessionToken: appIdentityResponse.appIdentity.sessionToken,
          sessionTokenExpires: new Date(appIdentityResponse.appIdentity.sessionTokenExpires),
        },
        appInfo: state.appInfo,
      });
    } catch (error) {
      console.error(error);
      componentStore.send({
        type: 'setStepToError',
        error: 'Failed to create new app identity',
        appInfo: state.appInfo,
      });
    }
  };

  const decryptAppIdentityAndRedirect = async () => {
    if (!state.appIdentityResponse) {
      return;
    }

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

    const decryptedIdentity = await Connect.decryptAppIdentity(
      signer,
      state.appIdentityResponse.accountAddress,
      state.appIdentityResponse.ciphertext,
      state.appIdentityResponse.nonce,
    );
    await encryptSpacesAndRedirect({
      accountAddress: state.appIdentityResponse.accountAddress,
      appIdentity: {
        address: decryptedIdentity.address,
        addressPrivateKey: decryptedIdentity.addressPrivateKey,
        encryptionPrivateKey: decryptedIdentity.encryptionPrivateKey,
        signaturePrivateKey: decryptedIdentity.signaturePrivateKey,
        encryptionPublicKey: decryptedIdentity.encryptionPublicKey,
        signaturePublicKey: decryptedIdentity.signaturePublicKey,
        sessionToken: state.appIdentityResponse.sessionToken,
        sessionTokenExpires: new Date(state.appIdentityResponse.sessionTokenExpires),
      },
      appInfo: state.appInfo,
    });
  };

  return (
    <div className="flex flex-col gap-4 max-w-(--breakpoint-sm) mx-auto py-8">
      <div>
        <h1 className="text-lg font-bold mb-4">Authenticating with Geo Connect</h1>
        {state.step === 'fetching-app-identity' && <p>Loading…</p>}
        {state.step === 'error' && <p>Error: {state.error}</p>}
        {(state.step === 'selecting-spaces-existing-app-identity' ||
          state.step === 'selecting-spaces-new-app-identity') && (
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-xs text-gray-500">App Id</span>
              <div className="text-sm">{state.appInfo.appId ?? 'unknown'}</div>
              <span className="text-xs text-gray-500">Redirect:</span>
              <div className="text-sm">{state.appInfo.redirect ?? 'unknown'}</div>
            </div>
            <h2 className="font-bold mb-2 mt-2">Spaces</h2>
            <ul className="space-y-4">
              {isPending && <p>Loading spaces …</p>}
              {spacesError && <p>An error has occurred loading spaces: {spacesError.message}</p>}
              {!isPending && !spacesError && spacesData?.length === 0 && <p>No spaces found</p>}
              {spacesData?.map((space) => (
                <li key={space.id}>
                  <p>{space.name}</p>
                  <p className="text-xs text-gray-500 mt-2 mb-1">Apps with access to this space</p>
                  <ul>
                    {space.apps.map((app) => (
                      <li key={app.id} className="text-sm">
                        {app.name}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
            <CreateSpace />
            <div className="mt-8">
              {state.step === 'selecting-spaces-new-app-identity' ? (
                <Button onClick={createNewAppIdentityAndRedirect}>Authenticate and redirect back to app</Button>
              ) : (
                <Button onClick={decryptAppIdentityAndRedirect}>Authenticate and redirect back to app</Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
