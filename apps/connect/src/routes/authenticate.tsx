import { CreateSpaceCard } from '@/components/CreateSpaceCard';
import { SpacesCard } from '@/components/SpacesCard';
import { Loading } from '@/components/ui/Loading';
import { usePrivateSpaces } from '@/hooks/use-private-spaces';
import { usePublicSpaces } from '@/hooks/use-public-spaces';
import { Connect, Identity, Key, type Messages, StoreConnect, Utils } from '@graphprotocol/hypergraph';
import { useIdentityToken, usePrivy, useWallets } from '@privy-io/react-auth';
import { createFileRoute } from '@tanstack/react-router';
import { createStore } from '@xstate/store';
import { useSelector } from '@xstate/store/react';
import { Effect, Schema } from 'effect';
import { TriangleAlert } from 'lucide-react';
import { useEffect } from 'react';
import { createWalletClient, custom } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

const CHAIN = import.meta.env.VITE_HYPERGRAPH_CHAIN === 'geogenesis' ? Connect.GEOGENESIS : Connect.GEO_TESTNET;

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

  const { isPending: privateSpacesPending, error: privateSpacesError, data: privateSpacesData } = usePrivateSpaces();
  const {
    isPending: publicSpacesPending,
    error: publicSpacesError,
    data: publicSpacesData,
  } = usePublicSpaces(import.meta.env.VITE_HYPERGRAPH_API_URL);

  const selectedPrivateSpaces = new Set<string>();
  const selectedPublicSpaces = new Set<string>();

  const handlePrivateSpaceToggle = (spaceId: string, checked: boolean) => {
    if (checked) {
      selectedPrivateSpaces.add(spaceId);
    } else {
      selectedPrivateSpaces.delete(spaceId);
    }
  };

  const handlePublicSpaceToggle = (spaceId: string, checked: boolean) => {
    if (checked) {
      selectedPublicSpaces.add(spaceId);
    } else {
      selectedPublicSpaces.delete(spaceId);
    }
  };

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
              'account-address': accountAddress,
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

    const privateSpacesInput = privateSpacesData
      ? privateSpacesData
          // .filter((space) => selectedPrivateSpaces.has(space.id))
          .map((space) => {
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
      accountAddress,
      spacesInput: privateSpacesInput,
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
        appIdentityAddressPrivateKey: appIdentity.addressPrivateKey,
        accountAddress: accountAddress,
        permissionId: appIdentity.permissionId,
        encryptionPrivateKey: appIdentity.encryptionPrivateKey,
        signaturePrivateKey: appIdentity.signaturePrivateKey,
        signaturePublicKey: appIdentity.signaturePublicKey,
        encryptionPublicKey: appIdentity.encryptionPublicKey,
        privateSpaces: privateSpacesInput?.map((space) => ({ id: space.id })) ?? [],
        publicSpaces: publicSpacesData?.map((space) => ({ id: space.id })) ?? [],
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
        account: embeddedWallet.address as `0x${string}`,
        chain: CHAIN,
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

      console.log('creating smart session');
      console.log('public spaces data', publicSpacesData);
      const spaces =
        publicSpacesData
          // .filter((space) => selectedPublicSpaces.has(space.id))
          ?.map((space) => ({
            address:
              space.type === 'personal'
                ? (space.personalAddress as `0x${string}`)
                : (space.mainVotingAddress as `0x${string}`),
            type: space.type as 'personal' | 'public',
          })) ?? [];
      console.log('spaces', spaces);

      const localAccount = privateKeyToAccount(keys.signaturePrivateKey as `0x${string}`);
      console.log('local account', localAccount.address);
      // TODO: add additional actions (must be passed from the app)
      const permissionId = await Connect.createSmartSession(
        localAccount,
        accountAddress,
        newAppIdentity.addressPrivateKey,
        CHAIN,
        import.meta.env.VITE_HYPERGRAPH_RPC_URL,
        {
          allowCreateSpace: true,
          spaces,
          additionalActions: [],
        },
      );
      console.log('smart session created');
      const smartAccountClient = await Connect.getSmartAccountWalletClient({
        owner: localAccount,
        address: accountAddress,
        chain: CHAIN,
        rpcUrl: import.meta.env.VITE_HYPERGRAPH_RPC_URL,
      });

      console.log('encrypting app identity');
      const { ciphertext, nonce } = await Connect.encryptAppIdentity(
        signer,
        newAppIdentity.address,
        newAppIdentity.addressPrivateKey,
        permissionId,
        keys,
      );
      console.log('proving ownership');
      const { accountProof, keyProof } = await Identity.proveIdentityOwnership(
        smartAccountClient,
        accountAddress,
        keys,
      );

      const message: Messages.RequestConnectCreateAppIdentity = {
        appId: state.appInfo.appId,
        address: newAppIdentity.address,
        accountAddress,
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
          accountAddress,
          encryptionPrivateKey: keys.encryptionPrivateKey,
          signaturePrivateKey: keys.signaturePrivateKey,
          encryptionPublicKey: newAppIdentity.encryptionPublicKey,
          signaturePublicKey: newAppIdentity.signaturePublicKey,
          sessionToken: appIdentityResponse.appIdentity.sessionToken,
          sessionTokenExpires: new Date(appIdentityResponse.appIdentity.sessionTokenExpires),
          permissionId,
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
      account: embeddedWallet.address as `0x${string}`,
      chain: CHAIN,
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
      state.appIdentityResponse.ciphertext,
      state.appIdentityResponse.nonce,
    );
    await encryptSpacesAndRedirect({
      accountAddress: state.appIdentityResponse.accountAddress,
      appIdentity: {
        address: decryptedIdentity.address,
        addressPrivateKey: decryptedIdentity.addressPrivateKey,
        accountAddress: state.appIdentityResponse.accountAddress,
        permissionId: decryptedIdentity.permissionId,
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
    <div className="flex grow flex-col items-center justify-center">
      {(() => {
        switch (state.step) {
          case 'fetching-app-identity':
            return (
              <div className="c-card c-card--small">
                <Loading className="text-xl" />
              </div>
            );
          case 'error':
            return <div className="c-card bg-error-dark text-error-light font-semibold">Error: {state.error}</div>;
          case 'selecting-spaces-existing-app-identity':
          case 'selecting-spaces-new-app-identity':
            return (
              <div className="grid w-xl max-w-full flex-col gap-6 lg:w-4xl lg:grid-cols-2 lg:gap-8 2xl:w-6xl">
                <div className="c-card relative isolate col-1 row-span-2 flex flex-col gap-6 overflow-clip">
                  <div className="bg-gradient-aqua dark:bg-gradient-lavender absolute inset-0 -z-10 opacity-30" />
                  <p>A third-party application is requesting access to your personal Geo spaces.</p>
                  <dl className="mb-auto flex flex-col gap-4 text-lg">
                    <div>
                      <dt className="text-foreground-muted font-semibold">App ID</dt>
                      <dd>{state.appInfo?.appId ?? 'unknown'}</dd>
                    </div>
                    <div>
                      <dt className="text-foreground-muted font-semibold">Redirect URL</dt>
                      <dd>{state.appInfo?.redirect ?? 'unknown'}</dd>
                    </div>
                  </dl>
                  {state.step !== 'selecting-spaces-existing-app-identity' ? (
                    <div className="border-error-dark text-error-dark dark:text-error-light flex gap-2 rounded-lg border-2 border-dashed p-3 pr-4 leading-tight">
                      <span className="text-error-dark flex h-lh shrink-0 items-center">
                        <TriangleAlert className="size-4" />
                      </span>{' '}
                      This is the first time you are authenticating with this app. Please verify the above information
                      before proceeding.
                    </div>
                  ) : null}
                  <div>
                    {state.step === 'selecting-spaces-new-app-identity' ? (
                      <button
                        type="button"
                        onClick={createNewAppIdentityAndRedirect}
                        className="c-button c-button--primary w-full"
                      >
                        Authenticate and redirect back to app
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={decryptAppIdentityAndRedirect}
                        className="c-button c-button--primary w-full"
                      >
                        Authenticate and redirect back to app
                      </button>
                    )}
                  </div>
                </div>
                <CreateSpaceCard className="lg:col-2" />
                <div className="relative min-h-80 lg:col-2">
                  <SpacesCard
                    spaces={[...(privateSpacesData ?? []), ...(publicSpacesData ?? [])]}
                    status={
                      privateSpacesPending
                        ? 'loading'
                        : privateSpacesError
                          ? { error: privateSpacesError.message }
                          : undefined
                    }
                    className="lg:absolute lg:inset-0"
                  />
                </div>
              </div>
            );
        }
      })()}
    </div>
  );
}
