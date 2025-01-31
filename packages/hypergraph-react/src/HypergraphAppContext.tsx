'use client';

import * as automerge from '@automerge/automerge';
import { uuid } from '@automerge/automerge';
import { RepoContext } from '@automerge/automerge-repo-react-hooks';
import { Identity, Key, Messages, SpaceEvents, type SpaceStorageEntry, Utils, store } from '@graphprotocol/hypergraph';
import { getSessionNonce, identityExists, prepareSiweMessage } from '@graphprotocol/hypergraph/identity/login';
import { useSelector as useSelectorStore } from '@xstate/store/react';
import { Effect, Exit } from 'effect';
import * as Schema from 'effect/Schema';
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import type { Hex } from 'viem';
import { type Address, getAddress } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

const decodeResponseMessage = Schema.decodeUnknownEither(Messages.ResponseMessage);

export type HypergraphAppCtx = {
  // auth related
  login(signer: Identity.Signer): Promise<void>;
  logout(): void;
  setIdentityAndSessionToken(account: Identity.Identity & { sessionToken: string }): void;
  // app related
  invitations: Array<Messages.Invitation>;
  createSpace(): Promise<unknown>;
  listSpaces(): void;
  listInvitations(): void;
  acceptInvitation(params: Readonly<{ invitation: Messages.Invitation }>): Promise<unknown>;
  subscribeToSpace(params: Readonly<{ spaceId: string }>): void;
  inviteToSpace(params: Readonly<{ space: SpaceStorageEntry; invitee: { accountId: Address } }>): Promise<unknown>;
  getUserIdentity(accountId: string): Promise<{
    accountId: string;
    encryptionPublicKey: string;
    signaturePublicKey: string;
  }>;
  loading: boolean;
};

export const HypergraphAppContext = createContext<HypergraphAppCtx>({
  async login() {},
  logout() {},
  setIdentityAndSessionToken() {},
  invitations: [],
  async createSpace() {
    return {};
  },
  listSpaces() {},
  listInvitations() {},
  async acceptInvitation() {
    return {};
  },
  subscribeToSpace() {},
  async inviteToSpace() {
    return {};
  },
  async getUserIdentity() {
    return {
      accountId: '',
      encryptionPublicKey: '',
      signaturePublicKey: '',
    };
  },
  loading: true,
});

export function useHypergraphApp() {
  return useContext<HypergraphAppCtx>(HypergraphAppContext);
}

export function useAuthenticated() {
  return useSelectorStore(store, (state) => state.context.authenticated);
}
export function useHypergraphAccountId() {
  return useSelectorStore(store, (state) => state.context.accountId);
}
export function useHypergraphIdentity() {
  const accountId = useHypergraphAccountId();
  const keys = useSelectorStore(store, (state) => state.context.keys);
  const identity: Identity.Identity | null =
    accountId && keys
      ? {
          accountId,
          encryptionPublicKey: keys.encryptionPublicKey,
          encryptionPrivateKey: keys.encryptionPrivateKey,
          signaturePublicKey: keys.signaturePublicKey,
          signaturePrivateKey: keys.signaturePrivateKey,
        }
      : null;
  return identity;
}
export function useHypergraphSessionToken() {
  return useSelectorStore(store, (state) => state.context.sessionToken);
}

export type HypergraphAppProviderProps = Readonly<{
  storage: Identity.Storage;
  syncServerUri?: string;
  chainId?: number;
  children: ReactNode;
}>;
// 1) a) Get session token from local storage, or
//    b) Auth with the sync server
// 2) a)Try to get identity from the sync server, or
//    b) If identity is not found, create a new identity
//      (and store it in the sync server)
export function HypergraphAppProvider({
  storage,
  syncServerUri = 'http://localhost:3030',
  chainId = 80451,
  children,
}: HypergraphAppProviderProps) {
  const [websocketConnection, setWebsocketConnection] = useState<WebSocket>();
  const [loading, setLoading] = useState(true);
  const spaces = useSelectorStore(store, (state) => state.context.spaces);
  const invitations = useSelectorStore(store, (state) => state.context.invitations);
  const repo = useSelectorStore(store, (state) => state.context.repo);
  const accountId = useSelectorStore(store, (state) => state.context.accountId);
  const sessionToken = useSelectorStore(store, (state) => state.context.sessionToken);
  const keys = useSelectorStore(store, (state) => state.context.keys);

  async function loginWithKeys(keys: Identity.IdentityKeys, accountId: Address, retryCount = 0) {
    const sessionToken = Identity.loadSyncServerSessionToken(storage, accountId);
    if (sessionToken) {
      // use whoami to check if the session token is still valid
      const res = await fetch(new URL('/whoami', syncServerUri), {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      });
      if (res.status !== 200 || (await res.text()) !== accountId) {
        console.warn('Session token is invalid, wiping state and retrying login with keys');
        Identity.wipeSyncServerSessionToken(storage, accountId);
        if (retryCount > 3) {
          throw new Error('Could not login with keys after several attempts');
        }
        return await loginWithKeys(keys, accountId, retryCount + 1);
      }
      throw new Error('Could not login with keys');
    }

    const account = privateKeyToAccount(keys.signaturePrivateKey as Hex);
    const sessionNonce = await getSessionNonce(account.address, syncServerUri);
    const message = prepareSiweMessage(
      account.address,
      sessionNonce,
      { host: window.location.host, origin: window.location.origin },
      chainId,
    );
    const signature = await account.signMessage({ message });
    const req = {
      accountId,
      message,
      publicKey: keys.signaturePublicKey,
      signature,
    } as const satisfies Messages.RequestLoginWithSigningKey;
    const res = await fetch(new URL('/login/with-signing-key', syncServerUri), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req),
    });
    if (res.status !== 200) {
      throw new Error('Error logging in with signing key');
    }
    const decoded = Schema.decodeUnknownSync(Messages.ResponseLogin)(await res.json());
    Identity.storeAccountId(storage, accountId);
    Identity.storeSyncServerSessionToken(storage, accountId, decoded.sessionToken);
    return {
      accountId,
      sessionToken: decoded.sessionToken,
      keys,
    };
  }

  async function login(signer: Identity.Signer) {
    if (!signer) {
      return;
    }
    const address = await signer.getAddress();
    if (!address) {
      return;
    }
    const accountId = getAddress(address);
    const keys = Identity.loadKeys(storage, accountId);
    let authData: {
      accountId: Address;
      sessionToken: string;
      keys: Identity.IdentityKeys;
    };
    const location = {
      host: window.location.host,
      origin: window.location.origin,
    };
    if (!keys && !(await identityExists(accountId, syncServerUri))) {
      authData = await Identity.signup(signer, accountId, syncServerUri, chainId, storage, location);
    } else if (keys) {
      authData = await loginWithKeys(keys, accountId);
    } else {
      authData = await Identity.loginWithWallet(signer, accountId, syncServerUri, chainId, storage, location);
    }
    console.log('Identity initialized');
    store.send({
      ...authData,
      type: 'setAuth',
    });
    store.send({ type: 'reset' });
  }

  function logout() {
    websocketConnection?.close();
    setWebsocketConnection(undefined);

    const accountIdToLogout = accountId ?? Identity.loadAccountId(storage);
    Identity.wipeAccountId(storage);
    if (!accountIdToLogout) {
      return;
    }
    Identity.wipeKeys(storage, accountIdToLogout);
    Identity.wipeSyncServerSessionToken(storage, accountIdToLogout);
    store.send({ type: 'resetAuth' });
  }

  const setIdentityAndSessionToken = useCallback(
    (account: Identity.Identity & { sessionToken: string }) => {
      Identity.storeAccountId(storage, account.accountId);
      Identity.storeSyncServerSessionToken(storage, account.accountId, account.sessionToken);
      Identity.storeKeys(storage, account.accountId, {
        encryptionPublicKey: account.encryptionPublicKey,
        encryptionPrivateKey: account.encryptionPrivateKey,
        signaturePublicKey: account.signaturePublicKey,
        signaturePrivateKey: account.signaturePrivateKey,
      });
      store.send({ type: 'reset' });
      store.send({
        type: 'setAuth',
        accountId: getAddress(account.accountId),
        sessionToken: account.sessionToken,
        keys: {
          encryptionPublicKey: account.encryptionPublicKey,
          encryptionPrivateKey: account.encryptionPrivateKey,
          signaturePublicKey: account.signaturePublicKey,
          signaturePrivateKey: account.signaturePrivateKey,
        },
      });
      console.log('Identity set');
    },
    [storage],
  );

  // check if the user is already authenticated on initial render
  const initialRenderAuthCheckRef = useRef(false);
  // using a layout effect to avoid a re-render
  useLayoutEffect(() => {
    if (!initialRenderAuthCheckRef.current) {
      const accountId = Identity.loadAccountId(storage);
      if (accountId) {
        const sessionToken = Identity.loadSyncServerSessionToken(storage, accountId);
        if (sessionToken) {
          const keys = Identity.loadKeys(storage, accountId);
          if (keys) {
            // user is already authenticated, set state
            store.send({
              type: 'setAuth',
              accountId: getAddress(accountId),
              sessionToken,
              keys,
            });
          }
        }
      }
      // set render auth check to true so next potential rerender doesn't proc this
      initialRenderAuthCheckRef.current = true;
    }
  }, [storage]);

  // Create a stable WebSocket connection that only depends on accountId
  useEffect(() => {
    if (!sessionToken) {
      setLoading(true);
      return;
    }

    const syncServerUrl = new URL(syncServerUri);
    const syncServerWsUrl = new URL(`/?token=${sessionToken}`, syncServerUrl.toString());
    syncServerWsUrl.protocol = 'ws:';
    const syncServerWsUrlString = syncServerWsUrl.toString();

    const websocketConnection = new WebSocket(syncServerWsUrlString);

    setWebsocketConnection(websocketConnection);

    const onOpen = () => {
      console.log('websocket connected');
      setLoading(false);
    };

    const onError = (event: Event) => {
      console.log('websocket error', event);
      setLoading(false);
    };

    const onClose = (event: CloseEvent) => {
      console.log('websocket close', event);
      setLoading(false);
    };

    websocketConnection.addEventListener('open', onOpen);
    websocketConnection.addEventListener('error', onError);
    websocketConnection.addEventListener('close', onClose);

    return () => {
      websocketConnection.removeEventListener('open', onOpen);
      websocketConnection.removeEventListener('error', onError);
      websocketConnection.removeEventListener('close', onClose);
      websocketConnection.close();
    };
  }, [sessionToken, syncServerUri]);

  // Handle WebSocket messages in a separate effect
  useEffect(() => {
    if (!websocketConnection) return;
    const encryptionPrivateKey = keys?.encryptionPrivateKey;
    if (!encryptionPrivateKey) {
      console.error('No encryption private key found');
      return;
    }

    const onMessage = async (event: MessageEvent) => {
      const data = Messages.deserialize(event.data);
      const message = decodeResponseMessage(data);
      if (message._tag === 'Right') {
        const response = message.right;
        switch (response.type) {
          case 'list-spaces': {
            response.spaces.map((space) => {
              store.send({
                type: 'setSpaceFromList',
                spaceId: space.id,
              });
            });
            break;
          }
          case 'space': {
            let state: SpaceEvents.SpaceState | undefined = undefined;

            for (const event of response.events) {
              // Not sure why but type inference doesn't work here
              const applyEventResult: Exit.Exit<SpaceEvents.SpaceState, SpaceEvents.ApplyError> =
                await Effect.runPromiseExit(SpaceEvents.applyEvent({ state, event }));
              if (Exit.isSuccess(applyEventResult)) {
                state = applyEventResult.value;
              } else {
                console.log('Failed to apply event', applyEventResult);
              }
            }

            const newState = state as SpaceEvents.SpaceState;

            let storeState = store.getSnapshot();

            const keys = response.keyBoxes.map((keyBox) => {
              const key = Key.decryptKey({
                keyBoxCiphertext: Utils.hexToBytes(keyBox.ciphertext),
                keyBoxNonce: Utils.hexToBytes(keyBox.nonce),
                publicKey: Utils.hexToBytes(keyBox.authorPublicKey),
                privateKey: Utils.hexToBytes(encryptionPrivateKey),
              });
              return { id: keyBox.id, key: Utils.bytesToHex(key) };
            });

            store.send({
              type: 'setSpace',
              spaceId: response.id,
              updates: response.updates as Messages.Updates,
              events: response.events as Array<SpaceEvents.SpaceEvent>,
              spaceState: newState,
              keys,
            });

            storeState = store.getSnapshot();
            const automergeDocHandle = storeState.context.spaces.find((s) => s.id === response.id)?.automergeDocHandle;
            if (!automergeDocHandle) {
              console.error('No automergeDocHandle found', response.id);
              return;
            }

            if (response.updates) {
              const updates = response.updates?.updates.map((update) => {
                return Messages.decryptMessage({
                  nonceAndCiphertext: update,
                  secretKey: Utils.hexToBytes(keys[0].key),
                });
              });

              for (const update of updates) {
                automergeDocHandle.update((existingDoc) => {
                  const [newDoc] = automerge.applyChanges(existingDoc, [update]);
                  return newDoc;
                });
              }

              store.send({
                type: 'applyUpdate',
                spaceId: response.id,
                firstUpdateClock: response.updates?.firstUpdateClock,
                lastUpdateClock: response.updates?.lastUpdateClock,
              });
            }

            automergeDocHandle.on('change', (result) => {
              const lastLocalChange = automerge.getLastLocalChange(result.doc);
              if (!lastLocalChange) {
                return;
              }

              try {
                const storeState = store.getSnapshot();
                const space = storeState.context.spaces[0];

                const ephemeralId = uuid();

                const nonceAndCiphertext = Messages.encryptMessage({
                  message: lastLocalChange,
                  secretKey: Utils.hexToBytes(space.keys[0].key),
                });

                const messageToSend = {
                  type: 'create-update',
                  ephemeralId,
                  update: nonceAndCiphertext,
                  spaceId: space.id,
                } as const satisfies Messages.RequestCreateUpdate;
                websocketConnection.send(Messages.serialize(messageToSend));
              } catch (error) {
                console.error('Error sending message', error);
              }
            });

            break;
          }
          case 'space-event': {
            const space = spaces.find((s) => s.id === response.spaceId);
            if (!space) {
              console.error('Space not found', response.spaceId);
              return;
            }
            if (!space.state) {
              console.error('Space has no state', response.spaceId);
              return;
            }

            const applyEventResult = await Effect.runPromiseExit(
              SpaceEvents.applyEvent({ event: response.event, state: space.state }),
            );
            if (Exit.isSuccess(applyEventResult)) {
              store.send({
                type: 'applyEvent',
                spaceId: response.spaceId,
                event: response.event,
                state: applyEventResult.value,
              });
            }

            break;
          }
          case 'list-invitations': {
            store.send({
              type: 'setInvitations',
              invitations: response.invitations.map((invitation) => invitation),
            });
            break;
          }
          case 'update-confirmed': {
            store.send({
              type: 'removeUpdateInFlight',
              ephemeralId: response.ephemeralId,
            });
            store.send({
              type: 'updateConfirmed',
              spaceId: response.spaceId,
              clock: response.clock,
            });
            break;
          }
          case 'updates-notification': {
            const storeState = store.getSnapshot();

            const space = storeState.context.spaces.find((s) => s.id === response.spaceId);
            if (!space) {
              console.error('Space not found', response.spaceId);
              return;
            }

            const automergeUpdates = response.updates.updates.map((update) => {
              return Messages.decryptMessage({
                nonceAndCiphertext: update,
                secretKey: Utils.hexToBytes(space.keys[0].key),
              });
            });

            space?.automergeDocHandle?.update((existingDoc) => {
              const [newDoc] = automerge.applyChanges(existingDoc, automergeUpdates);
              return newDoc;
            });

            store.send({
              type: 'applyUpdate',
              spaceId: response.spaceId,
              firstUpdateClock: response.updates.firstUpdateClock,
              lastUpdateClock: response.updates.lastUpdateClock,
            });
            break;
          }
          default: {
            Utils.assertExhaustive(response);
          }
        }
      }
    };

    websocketConnection.addEventListener('message', onMessage);

    return () => {
      websocketConnection.removeEventListener('message', onMessage);
    };
  }, [websocketConnection, spaces, keys?.encryptionPrivateKey]);

  const createSpaceForContext = async () => {
    if (!accountId) {
      throw new Error('No account id found');
    }
    const encryptionPrivateKey = keys?.encryptionPrivateKey;
    const encryptionPublicKey = keys?.encryptionPublicKey;
    const signaturePrivateKey = keys?.signaturePrivateKey;
    const signaturePublicKey = keys?.signaturePublicKey;
    if (!encryptionPrivateKey || !encryptionPublicKey || !signaturePrivateKey || !signaturePublicKey) {
      throw new Error('Missing keys');
    }
    const spaceEvent = await Effect.runPromise(
      SpaceEvents.createSpace({
        author: {
          accountId,
          encryptionPublicKey,
          signaturePrivateKey,
          signaturePublicKey,
        },
      }),
    );
    const result = Key.createKey({
      privateKey: Utils.hexToBytes(encryptionPrivateKey),
      publicKey: Utils.hexToBytes(encryptionPublicKey),
    });

    const message = {
      type: 'create-space-event',
      event: spaceEvent,
      spaceId: spaceEvent.transaction.id,
      keyId: Utils.generateId(),
      keyBox: {
        accountId,
        ciphertext: Utils.bytesToHex(result.keyBoxCiphertext),
        nonce: Utils.bytesToHex(result.keyBoxNonce),
        authorPublicKey: encryptionPublicKey,
      },
    } as const satisfies Messages.RequestCreateSpaceEvent;
    websocketConnection?.send(Messages.serialize(message));
  };

  const listSpaces = useCallback(() => {
    const message: Messages.RequestListSpaces = { type: 'list-spaces' };
    websocketConnection?.send(Messages.serialize(message));
  }, [websocketConnection]);

  const listInvitations = useCallback(() => {
    const message: Messages.RequestListInvitations = { type: 'list-invitations' };
    websocketConnection?.send(Messages.serialize(message));
  }, [websocketConnection]);

  const acceptInvitationForContext = async ({
    invitation,
  }: Readonly<{
    invitation: Messages.Invitation;
  }>) => {
    if (!accountId) {
      throw new Error('No account id found');
    }
    const encryptionPrivateKey = keys?.encryptionPrivateKey;
    const encryptionPublicKey = keys?.encryptionPublicKey;
    const signaturePrivateKey = keys?.signaturePrivateKey;
    const signaturePublicKey = keys?.signaturePublicKey;
    if (!encryptionPrivateKey || !encryptionPublicKey || !signaturePrivateKey || !signaturePublicKey) {
      throw new Error('Missing keys');
    }
    const spaceEvent = await Effect.runPromiseExit(
      SpaceEvents.acceptInvitation({
        author: {
          accountId,
          signaturePublicKey,
          encryptionPublicKey,
          signaturePrivateKey,
        },
        previousEventHash: invitation.previousEventHash,
      }),
    );
    if (Exit.isFailure(spaceEvent)) {
      console.error('Failed to accept invitation', spaceEvent);
      return;
    }
    const message: Messages.RequestAcceptInvitationEvent = {
      type: 'accept-invitation-event',
      event: spaceEvent.value,
      spaceId: invitation.spaceId,
    };
    websocketConnection?.send(Messages.serialize(message));

    // temporary until we have define a strategy for accepting invitations response
    setTimeout(() => {
      const message2: Messages.RequestListInvitations = { type: 'list-invitations' };
      websocketConnection?.send(Messages.serialize(message2));
    }, 1000);
  };

  const subscribeToSpace = useCallback(
    (params: { spaceId: string }) => {
      const message: Messages.RequestSubscribeToSpace = { type: 'subscribe-space', id: params.spaceId };
      websocketConnection?.send(Messages.serialize(message));
    },
    [websocketConnection],
  );

  const getUserIdentity = async (
    accountId: string,
  ): Promise<{
    accountId: string;
    encryptionPublicKey: string;
    signaturePublicKey: string;
  }> => {
    const storeState = store.getSnapshot();
    const identity = storeState.context.userIdentities[accountId];
    if (identity) {
      return {
        accountId,
        encryptionPublicKey: identity.encryptionPublicKey,
        signaturePublicKey: identity.signaturePublicKey,
      };
    }
    const res = await fetch(`${syncServerUri}/identity?accountId=${accountId}`);
    if (res.status !== 200) {
      throw new Error('Failed to fetch identity');
    }
    const resDecoded = Schema.decodeUnknownSync(Messages.ResponseIdentity)(await res.json());

    if (
      !(await Identity.verifyIdentityOwnership(
        resDecoded.accountId,
        resDecoded.signaturePublicKey,
        resDecoded.accountProof,
        resDecoded.keyProof,
      ))
    ) {
      throw new Error('Invalid identity');
    }

    store.send({
      type: 'addUserIdentity',
      accountId: resDecoded.accountId,
      encryptionPublicKey: resDecoded.encryptionPublicKey,
      signaturePublicKey: resDecoded.signaturePublicKey,
      accountProof: resDecoded.accountProof,
      keyProof: resDecoded.keyProof,
    });
    return {
      accountId: resDecoded.accountId,
      encryptionPublicKey: resDecoded.encryptionPublicKey,
      signaturePublicKey: resDecoded.signaturePublicKey,
    };
  };

  const inviteToSpace = async ({
    space,
    invitee,
  }: Readonly<{
    space: SpaceStorageEntry;
    invitee: {
      accountId: string;
    };
  }>) => {
    if (!accountId) {
      throw new Error('No account id found');
    }
    const encryptionPrivateKey = keys?.encryptionPrivateKey;
    const encryptionPublicKey = keys?.encryptionPublicKey;
    const signaturePrivateKey = keys?.signaturePrivateKey;
    const signaturePublicKey = keys?.signaturePublicKey;
    if (!encryptionPrivateKey || !encryptionPublicKey || !signaturePrivateKey || !signaturePublicKey) {
      throw new Error('Missing keys');
    }
    if (!encryptionPrivateKey || !encryptionPublicKey || !signaturePrivateKey || !signaturePublicKey) {
      throw new Error('Missing keys');
    }
    if (!space.state) {
      console.error('No state found for space');
      return;
    }
    const inviteeWithKeys = await getUserIdentity(invitee.accountId);
    const spaceEvent = await Effect.runPromiseExit(
      SpaceEvents.createInvitation({
        author: {
          accountId,
          signaturePublicKey,
          encryptionPublicKey,
          signaturePrivateKey,
        },
        previousEventHash: space.state.lastEventHash,
        invitee: inviteeWithKeys,
      }),
    );
    if (Exit.isFailure(spaceEvent)) {
      console.error('Failed to create invitation', spaceEvent);
      return;
    }

    const keyBoxes = space.keys.map((key) => {
      const keyBox = Key.encryptKey({
        key: Utils.hexToBytes(key.key),
        publicKey: Utils.hexToBytes(inviteeWithKeys.encryptionPublicKey),
        privateKey: Utils.hexToBytes(encryptionPrivateKey),
      });
      return {
        id: key.id,
        ciphertext: Utils.bytesToHex(keyBox.keyBoxCiphertext),
        nonce: Utils.bytesToHex(keyBox.keyBoxNonce),
        authorPublicKey: encryptionPublicKey,
        accountId: invitee.accountId,
      };
    });

    const message: Messages.RequestCreateInvitationEvent = {
      type: 'create-invitation-event',
      event: spaceEvent.value,
      spaceId: space.id,
      keyBoxes,
    };
    websocketConnection?.send(Messages.serialize(message));
  };

  return (
    <HypergraphAppContext.Provider
      value={{
        login,
        logout,
        setIdentityAndSessionToken,
        invitations,
        createSpace: createSpaceForContext,
        listSpaces,
        listInvitations,
        acceptInvitation: acceptInvitationForContext,
        subscribeToSpace,
        getUserIdentity,
        inviteToSpace,
        loading,
      }}
    >
      <RepoContext.Provider value={repo}>{children}</RepoContext.Provider>
    </HypergraphAppContext.Provider>
  );
}
