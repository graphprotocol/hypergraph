'use client';

import * as automerge from '@automerge/automerge';
import { uuid } from '@automerge/automerge';
import type { DocHandle } from '@automerge/automerge-repo';
import { RepoContext } from '@automerge/automerge-repo-react-hooks';
import { Identity, Key, Messages, SpaceEvents, type SpaceStorageEntry, Utils, store } from '@graphprotocol/hypergraph';
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
import { type Address, getAddress } from 'viem';

const decodeResponseMessage = Schema.decodeUnknownEither(Messages.ResponseMessage);

export type HypergraphAppCtx = {
  // auth related
  login(signer: Identity.Signer): Promise<void>;
  logout(): void;
  setIdentityAndSessionToken(account: Identity.Identity & { sessionToken: string }): void;
  // app related
  invitations: Array<Messages.Invitation>;
  createSpace(): Promise<string>;
  listSpaces(): void;
  listInvitations(): void;
  acceptInvitation(params: Readonly<{ invitation: Messages.Invitation }>): Promise<unknown>;
  subscribeToSpace(params: Readonly<{ spaceId: string }>): void;
  inviteToSpace(params: Readonly<{ space: SpaceStorageEntry; invitee: { accountId: Address } }>): Promise<unknown>;
  getVerifiedIdentity(accountId: string): Promise<{
    accountId: string;
    encryptionPublicKey: string;
    signaturePublicKey: string;
  }>;
  loading: boolean;
};

export const HypergraphAppContext = createContext<HypergraphAppCtx>({
  async login() {
    throw new Error('login is missing');
  },
  logout() {
    throw new Error('logout is missing');
  },
  setIdentityAndSessionToken() {
    throw new Error('setIdentityAndSessionToken is missing');
  },
  invitations: [],
  async createSpace() {
    throw new Error('createSpace is missing');
  },
  listSpaces() {
    throw new Error('listSpaces is missing');
  },
  listInvitations() {
    throw new Error('listInvitations is missing');
  },
  async acceptInvitation() {
    throw new Error('acceptInvitation is missing');
  },
  subscribeToSpace() {
    throw new Error('subscribeToSpace is missing');
  },
  async inviteToSpace() {
    throw new Error('inviteToSpace is missing');
  },
  async getVerifiedIdentity() {
    throw new Error('getVerifiedIdentity is missing');
  },
  loading: true,
});

export function useHypergraphApp() {
  return useContext<HypergraphAppCtx>(HypergraphAppContext);
}

export function useHypergraphAuth() {
  const authenticated = useSelectorStore(store, (state) => state.context.authenticated);
  const accountId = useSelectorStore(store, (state) => state.context.accountId);
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
  return { authenticated, identity };
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

  const login = useCallback(
    async (signer: Identity.Signer) => {
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
      if (!keys && !(await Identity.identityExists(accountId, syncServerUri))) {
        authData = await Identity.signup(signer, accountId, syncServerUri, chainId, storage, location);
      } else if (keys) {
        authData = await Identity.loginWithKeys(keys, accountId, syncServerUri, chainId, storage, location);
      } else {
        authData = await Identity.loginWithWallet(signer, accountId, syncServerUri, chainId, storage, location);
      }
      console.log('Identity initialized');
      store.send({
        ...authData,
        type: 'setAuth',
      });
      store.send({ type: 'reset' });
    },
    [storage, syncServerUri, chainId],
  );

  const logout = useCallback(() => {
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
  }, [accountId, storage, websocketConnection]);

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
    if (!accountId) {
      console.error('No accountId found');
      return;
    }
    const encryptionPrivateKey = keys?.encryptionPrivateKey;
    if (!encryptionPrivateKey) {
      console.error('No encryption private key found');
      return;
    }
    const signaturePrivateKey = keys?.signaturePrivateKey;
    if (!signaturePrivateKey) {
      console.error('No signature private key found.');
      return;
    }

    const applyUpdates = async (
      spaceId: string,
      spaceSecretKey: string,
      automergeDocHandle: DocHandle<unknown>,
      updates: Messages.Updates,
    ) => {
      const verifiedUpdates = await Promise.all(
        updates.updates.map(async (update) => {
          const signer = Messages.recoverUpdateMessageSigner({
            update: update.update,
            spaceId,
            updateId: update.updateId,
            signature: update.signature,
            accountId: update.accountId,
          });
          const authorIdentity = await Identity.getVerifiedIdentity(update.accountId, syncServerUri);
          if (authorIdentity.signaturePublicKey !== signer) {
            console.error(
              `Received invalid signature, recovered signer is ${signer},
            expected ${authorIdentity.signaturePublicKey}`,
            );
            return { valid: false, update: new Uint8Array([]) };
          }
          return {
            valid: true,
            update: Messages.decryptMessage({
              nonceAndCiphertext: update.update,
              secretKey: Utils.hexToBytes(spaceSecretKey),
            }),
          };
        }),
      );
      const validUpdates = verifiedUpdates.filter((update) => update.valid).map((update) => update.update);
      automergeDocHandle.update((existingDoc) => {
        const [newDoc] = automerge.applyChanges(existingDoc, validUpdates);
        return newDoc;
      });

      store.send({
        type: 'applyUpdate',
        spaceId,
        firstUpdateClock: updates.firstUpdateClock,
        lastUpdateClock: updates.lastUpdateClock,
      });
    };

    const getVerifiedIdentity = (accountId: string) => {
      return Effect.gen(function* () {
        const identity = yield* Effect.tryPromise({
          try: () => Identity.getVerifiedIdentity(accountId, syncServerUri),
          catch: () => new Identity.InvalidIdentityError(),
        });
        return identity;
      });
    };

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
                await Effect.runPromiseExit(SpaceEvents.applyEvent({ state, event, getVerifiedIdentity }));
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
              await applyUpdates(response.id, keys[0].key, automergeDocHandle, response.updates);
            }

            automergeDocHandle.on('change', (result) => {
              const lastLocalChange = automerge.getLastLocalChange(result.doc);
              if (!lastLocalChange) {
                return;
              }

              try {
                const storeState = store.getSnapshot();
                const space = storeState.context.spaces[0];

                const updateId = uuid();

                const messageToSend = Messages.signedUpdateMessage({
                  accountId,
                  updateId,
                  spaceId: space.id,
                  message: lastLocalChange,
                  secretKey: space.keys[0].key,
                  signaturePrivateKey,
                });
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
              SpaceEvents.applyEvent({ event: response.event, state: space.state, getVerifiedIdentity }),
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
              updateId: response.updateId,
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
            if (!space.automergeDocHandle) {
              console.error('No automergeDocHandle found', response.spaceId);
              return;
            }

            await applyUpdates(response.spaceId, space.keys[0].key, space.automergeDocHandle, response.updates);
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
  }, [websocketConnection, spaces, accountId, keys?.encryptionPrivateKey, keys?.signaturePrivateKey, syncServerUri]);

  const createSpaceForContext = useCallback<() => Promise<string>>(async () => {
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

    // return the created space id
    // @todo return created Space with name, etc
    return spaceEvent.transaction.id;
  }, [
    accountId,
    keys?.encryptionPrivateKey,
    keys?.encryptionPublicKey,
    keys?.signaturePrivateKey,
    keys?.signaturePublicKey,
    websocketConnection,
  ]);

  const listSpaces = useCallback(() => {
    const message: Messages.RequestListSpaces = { type: 'list-spaces' };
    websocketConnection?.send(Messages.serialize(message));
  }, [websocketConnection]);

  const listInvitations = useCallback(() => {
    const message: Messages.RequestListInvitations = { type: 'list-invitations' };
    websocketConnection?.send(Messages.serialize(message));
  }, [websocketConnection]);

  const acceptInvitationForContext = useCallback(
    async ({
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
    },
    [
      accountId,
      keys?.encryptionPrivateKey,
      keys?.encryptionPublicKey,
      keys?.signaturePrivateKey,
      keys?.signaturePublicKey,
      websocketConnection,
    ],
  );

  const subscribeToSpace = useCallback(
    (params: { spaceId: string }) => {
      const message: Messages.RequestSubscribeToSpace = { type: 'subscribe-space', id: params.spaceId };
      websocketConnection?.send(Messages.serialize(message));
    },
    [websocketConnection],
  );

  const inviteToSpace = useCallback(
    async ({
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
      const inviteeWithKeys = await Identity.getVerifiedIdentity(invitee.accountId, syncServerUri);
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
    },
    [
      accountId,
      keys?.encryptionPrivateKey,
      keys?.encryptionPublicKey,
      keys?.signaturePrivateKey,
      keys?.signaturePublicKey,
      websocketConnection,
      syncServerUri,
    ],
  );

  const getVerifiedIdentity = useCallback(
    (accountId: string) => {
      return Identity.getVerifiedIdentity(accountId, syncServerUri);
    },
    [syncServerUri],
  );

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
        getVerifiedIdentity,
        inviteToSpace,
        loading,
      }}
    >
      <RepoContext.Provider value={repo}>{children}</RepoContext.Provider>
    </HypergraphAppContext.Provider>
  );
}
