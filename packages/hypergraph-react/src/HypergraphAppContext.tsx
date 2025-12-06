'use client';

import { automergeWasmBase64 } from '@automerge/automerge/automerge.wasm.base64';
import * as automerge from '@automerge/automerge/slim';
import type { DocHandle } from '@automerge/automerge-repo';
import { Repo } from '@automerge/automerge-repo/slim';
import { RepoContext } from '@automerge/automerge-repo-react-hooks';
import { Graph } from '@graphprotocol/grc-20';
import {
  Connect,
  type ConnectCallbackResult,
  Identity,
  Inboxes,
  type InboxMessageStorageEntry,
  Key,
  Messages,
  SpaceEvents,
  type SpaceStorageEntry,
  store,
  Utils,
} from '@graphprotocol/hypergraph';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSelector as useSelectorStore } from '@xstate/store/react';
import { Effect, Exit } from 'effect';
import * as Schema from 'effect/Schema';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { v4 as uuid } from 'uuid';
import type { Address, Hex } from 'viem';

const decodeResponseMessage = Schema.decodeUnknownEither(Messages.ResponseMessage);

const queryClient = new QueryClient();

const CHAIN = Connect.GEO_TESTNET;
const RPC_URL = Connect.TESTNET_RPC_URL;

export type HypergraphAppCtx = {
  // auth related
  logout(): void;
  setIdentity(identity: Connect.PrivateAppIdentity): void;
  // app related
  invitations: Array<Messages.Invitation>;
  createSpace(params: Readonly<{ name: string; smartSessionClient?: Connect.SmartSessionClient }>): Promise<string>;
  getSmartSessionClient(): Promise<Connect.SmartSessionClient>;
  createSpaceInbox(
    params: Readonly<{ space: SpaceStorageEntry; isPublic: boolean; authPolicy: Inboxes.InboxSenderAuthPolicy }>,
  ): Promise<unknown>;
  getLatestSpaceInboxMessages(params: Readonly<{ spaceId: string; inboxId: string }>): Promise<unknown>;
  listPublicSpaceInboxes(params: Readonly<{ spaceId: string }>): Promise<readonly Messages.SpaceInboxPublic[]>;
  getSpaceInbox(params: Readonly<{ spaceId: string; inboxId: string }>): Promise<Messages.SpaceInboxPublic>;
  sendSpaceInboxMessage(
    params: Readonly<{
      message: string;
      spaceId: string;
      inboxId: string;
      encryptionPublicKey: string;
      signaturePrivateKey: string | null;
      authorAccountAddress: string | null;
    }>,
  ): Promise<unknown>;
  createAccountInbox(
    params: Readonly<{ isPublic: boolean; authPolicy: Inboxes.InboxSenderAuthPolicy }>,
  ): Promise<unknown>;
  getLatestAccountInboxMessages(params: Readonly<{ accountAddress: string; inboxId: string }>): Promise<unknown>;
  getOwnAccountInboxes(): Promise<unknown>;
  listPublicAccountInboxes(
    params: Readonly<{ accountAddress: string }>,
  ): Promise<readonly Messages.AccountInboxPublic[]>;
  getAccountInbox(params: Readonly<{ accountAddress: string; inboxId: string }>): Promise<Messages.AccountInboxPublic>;
  sendAccountInboxMessage(
    params: Readonly<{
      message: string;
      accountAddress: string;
      inboxId: string;
      encryptionPublicKey: string;
      signaturePrivateKey: string | null;
      authorAccountAddress: string | null;
    }>,
  ): Promise<unknown>;
  listSpaces(): void;
  listInvitations(): void;
  acceptInvitation(params: Readonly<{ invitation: Messages.Invitation }>): Promise<unknown>;
  subscribeToSpace(params: Readonly<{ spaceId: string }>): void;
  inviteToSpace(params: Readonly<{ space: SpaceStorageEntry; invitee: { accountAddress: Address } }>): Promise<unknown>;
  getVerifiedIdentity(
    accountAddress: string,
    publicKey: string | null,
    appId: string | null,
  ): Promise<{
    accountAddress: string;
    encryptionPublicKey: string;
    signaturePublicKey: string;
  }>;
  isConnecting: boolean;
  isLoadingSpaces: Record<string, boolean>;
  ensureSpaceInbox(params: {
    spaceId: string;
    isPublic?: boolean;
    authPolicy?: Inboxes.InboxSenderAuthPolicy;
    index?: number;
  }): Promise<string>;
  redirectToConnect(params: {
    storage: Identity.Storage;
    successUrl: string;
    connectUrl: string;
    redirectFn: (url: URL) => void;
  }): void;
  processConnectAuthSuccess(params: { storage: Identity.Storage; ciphertext: string; nonce: string }):
    | {
        success: true;
        identity: Connect.PrivateAppIdentity;
      }
    | {
        success: false;
        error: string;
      };
  syncServerUri: string;
  logInvalidResults: boolean;
};

export const HypergraphAppContext = createContext<HypergraphAppCtx>({
  logout() {
    throw new Error('logout is missing');
  },
  setIdentity() {
    throw new Error('setIdentity is missing');
  },
  invitations: [],
  getSmartSessionClient() {
    throw new Error('getSmartSessionClient is missing');
  },
  async createSpace() {
    throw new Error('createSpace is missing');
  },
  async createSpaceInbox() {
    throw new Error('createSpaceInbox is missing');
  },
  async getLatestSpaceInboxMessages() {
    throw new Error('getLatestSpaceInboxMessages is missing');
  },
  async listPublicSpaceInboxes() {
    throw new Error('listPublicSpaceInboxes is missing');
  },
  async getSpaceInbox() {
    throw new Error('getSpaceInbox is missing');
  },
  async sendSpaceInboxMessage() {
    throw new Error('sendSpaceInboxMessage is missing');
  },
  async createAccountInbox() {
    throw new Error('createAccountInbox is missing');
  },
  async getOwnAccountInboxes() {
    throw new Error('getOwnAccountInboxes is missing');
  },
  async getLatestAccountInboxMessages() {
    throw new Error('getLatestAccountInboxMessages is missing');
  },
  async listPublicAccountInboxes() {
    throw new Error('listPublicAccountInboxes is missing');
  },
  async getAccountInbox() {
    throw new Error('getAccountInbox is missing');
  },
  async sendAccountInboxMessage() {
    throw new Error('sendAccountInboxMessage is missing');
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
  isConnecting: true,
  isLoadingSpaces: {},
  async ensureSpaceInbox() {
    throw new Error('ensureSpaceInbox is missing');
  },
  redirectToConnect(_params: {
    storage: Identity.Storage;
    successUrl: string;
    appId: string;
    connectUrl: string;
    redirectFn: (url: URL) => void;
  }) {
    throw new Error('redirectToConnect is missing');
  },
  processConnectAuthSuccess() {
    throw new Error('processConnectAuthSuccess is missing');
  },
  syncServerUri: '',
  logInvalidResults: true,
});

export function useHypergraphApp() {
  return useContext<HypergraphAppCtx>(HypergraphAppContext);
}

export function useHypergraphAuth() {
  const authenticated = useSelectorStore(store, (state) => state.context.authenticated);
  const identity = useSelectorStore(store, (state) => state.context.identity);
  const privyIdentity = useSelectorStore(store, (state) => state.context.privyIdentity);

  return { authenticated, identity, privyIdentity };
}

export type HypergraphAppProviderProps = Readonly<{
  storage?: Identity.Storage;
  syncServerUri?: string;
  chainId?: number;
  children: ReactNode;
  appId: string;
  logInvalidResults?: boolean;
}>;

const mockStorage = {
  getItem(_key: string) {
    return null;
  },
  setItem(_key: string, _value: string) {},
  removeItem(_key: string) {},
};

export function HypergraphAppProvider({
  storage = typeof window !== 'undefined' ? localStorage : mockStorage,
  syncServerUri = 'https://sync.geobrowser.io',
  chainId = Connect.GEO_TESTNET.id,
  appId,
  children,
  logInvalidResults = true,
}: HypergraphAppProviderProps) {
  const [websocketConnection, setWebsocketConnection] = useState<WebSocket>();
  const [isConnecting, setIsConnecting] = useState(true);
  const [isLoadingSpaces, setIsLoadingSpaces] = useState<Record<string, boolean>>({});
  const spaces = useSelectorStore(store, (state) => state.context.spaces);
  const invitations = useSelectorStore(store, (state) => state.context.invitations);
  const repo = useSelectorStore(store, (state) => state.context.repo);
  const identity = useSelectorStore(store, (state) => state.context.identity);
  const privyIdentity = useSelectorStore(store, (state) => state.context.privyIdentity);

  const logout = useCallback(() => {
    websocketConnection?.close();
    setWebsocketConnection(undefined);
    Identity.logout(storage);
  }, [storage, websocketConnection]);

  const setIdentity = useCallback(
    (identity: Connect.PrivateAppIdentity) => {
      Identity.storeIdentity(storage, identity);
      store.send({ type: 'reset' });
      store.send({
        type: 'setAuth',
        identity,
      });
    },
    [storage],
  );

  // check if the user is already authenticated on initial render
  const initialRenderAuthCheckRef = useRef(false);
  // using a layout effect to avoid a re-render
  useLayoutEffect(() => {
    if (!initialRenderAuthCheckRef.current) {
      const identity = Identity.loadIdentity(storage);
      if (identity) {
        store.send({
          type: 'setAuth',
          identity,
        });
      }
      const privyIdentity = Identity.loadPrivyIdentity(storage);
      if (privyIdentity) {
        store.send({
          type: 'setPrivyAuth',
          identity: privyIdentity,
        });
      }

      // set render auth check to true so next potential rerender doesn't try this again
      initialRenderAuthCheckRef.current = true;
    }
  }, [storage]);

  useEffect(() => {
    if (identity === null && privyIdentity === null) {
      setIsConnecting(true);
      return;
    }

    const syncServerUrl = new URL(syncServerUri);
    let syncServerWsUrl: URL;

    if (identity) {
      syncServerWsUrl = new URL(`/?token=${identity.sessionToken}`, syncServerUrl.toString());
    } else if (privyIdentity) {
      syncServerWsUrl = new URL(
        `/?privy-identity-token=${privyIdentity.privyIdentityToken}&account-address=${privyIdentity.accountAddress}`,
        syncServerUrl.toString(),
      );
    } else {
      // This should never happen due to the early returns above, but TypeScript needs this
      return;
    }

    // Use 'wss:' by default, only use 'ws:' for local development
    const isLocalDev = syncServerUrl.hostname === 'localhost' || syncServerUrl.hostname === '127.0.0.1';
    syncServerWsUrl.protocol = isLocalDev ? 'ws:' : 'wss:';

    const syncServerWsUrlString = syncServerWsUrl.toString();
    const websocketConnection = new WebSocket(syncServerWsUrlString);

    setWebsocketConnection(websocketConnection);

    const onOpen = () => {
      console.log('websocket connected');
      setIsConnecting(false);
    };

    const onError = (event: Event) => {
      console.log('websocket error', event);
      setIsConnecting(false);
    };

    const onClose = (event: CloseEvent) => {
      console.log('websocket close', event);
      setIsConnecting(false);
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
  }, [identity, privyIdentity, syncServerUri]);

  // Handle WebSocket messages in a separate effect
  useEffect(() => {
    if (!websocketConnection) return;
    if (identity === null && privyIdentity === null) {
      console.error('No identity found');
      return;
    }
    const encryptionPrivateKey = identity?.encryptionPrivateKey || privyIdentity?.encryptionPrivateKey;
    if (!encryptionPrivateKey) {
      console.error('No encryption private key found');
      return;
    }
    const encryptionPublicKey = identity?.encryptionPublicKey || privyIdentity?.encryptionPublicKey;
    if (!encryptionPublicKey) {
      console.error('No encryption public key found');
      return;
    }
    const signaturePrivateKey = identity?.signaturePrivateKey || privyIdentity?.signaturePrivateKey;
    if (!signaturePrivateKey) {
      console.error('No signature private key found.');
      return;
    }
    const signaturePublicKey = identity?.signaturePublicKey || privyIdentity?.signaturePublicKey;
    if (!signaturePublicKey) {
      console.error('No signature public key found');
      return;
    }
    const accountAddress = identity?.accountAddress || privyIdentity?.accountAddress;
    if (!accountAddress) {
      console.error('No account address found');
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
            accountAddress: update.accountAddress,
          });
          const authorIdentity = await Identity.getVerifiedIdentity(
            update.accountAddress,
            signer,
            null,
            syncServerUri,
            CHAIN,
            RPC_URL,
          );
          if (authorIdentity.signaturePublicKey !== signer) {
            // console.error(
            //   `Received invalid signature, recovered signer is ${signer},
            // expected ${authorIdentity.signaturePublicKey}`,
            // );
            // TODO bring back signature verfication
            // return { valid: false, update: new Uint8Array([]) };
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

    const getVerifiedIdentityForEvent = (accountAddress: string, publicKey: string) => {
      return Effect.gen(function* () {
        const identity = yield* Effect.tryPromise({
          try: () => Identity.getVerifiedIdentity(accountAddress, publicKey, null, syncServerUri, CHAIN, RPC_URL),
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
            store.send({
              type: 'setSpacesList',
              spaces: response.spaces.map((space) => ({
                id: space.id,
                name: space.name,
              })),
            });
            break;
          }
          case 'space': {
            let state: SpaceEvents.SpaceState | undefined;

            for (const event of response.events) {
              // Not sure why but type inference doesn't work here
              const applyEventResult: Exit.Exit<SpaceEvents.SpaceState, SpaceEvents.ApplyError> =
                await Effect.runPromiseExit(
                  SpaceEvents.applyEvent({ state, event, getVerifiedIdentity: getVerifiedIdentityForEvent }),
                );
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

            const inboxes = response.inboxes.map((inbox) => {
              return {
                inboxId: inbox.inboxId,
                isPublic: inbox.isPublic,
                authPolicy: inbox.authPolicy,
                encryptionPublicKey: inbox.encryptionPublicKey,
                secretKey: Utils.bytesToHex(
                  Messages.decryptMessage({
                    nonceAndCiphertext: Utils.hexToBytes(inbox.secretKey),
                    secretKey: Utils.hexToBytes(keys[0].key),
                  }),
                ),
                messages: [],
                lastMessageClock: new Date(0).toISOString(),
                seenMessageIds: new Set<string>(),
              };
            });

            store.send({
              type: 'setSpace',
              name: response.name,
              spaceId: response.id,
              updates: response.updates as Messages.Updates,
              events: response.events as Array<SpaceEvents.SpaceEvent>,
              inboxes,
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
                  accountAddress,
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

            setIsLoadingSpaces((prev) => {
              return { ...prev, [response.id]: false };
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
              SpaceEvents.applyEvent({
                event: response.event,
                state: space.state,
                getVerifiedIdentity: getVerifiedIdentityForEvent,
              }),
            );
            if (Exit.isSuccess(applyEventResult)) {
              store.send({
                type: 'applyEvent',
                spaceId: response.spaceId,
                event: response.event,
                state: applyEventResult.value,
              });
            }
            if (response.event.transaction.type === 'create-space-inbox') {
              const inbox = {
                inboxId: response.event.transaction.id,
                isPublic: response.event.transaction.isPublic,
                authPolicy: response.event.transaction.authPolicy,
                encryptionPublicKey: response.event.transaction.encryptionPublicKey,
                secretKey: Utils.bytesToHex(
                  Messages.decryptMessage({
                    nonceAndCiphertext: Utils.hexToBytes(response.event.transaction.secretKey),
                    secretKey: Utils.hexToBytes(space.keys[0].key),
                  }),
                ),
                lastMessageClock: new Date(0).toISOString(),
                messages: [],
                seenMessageIds: new Set<string>(),
              };
              store.send({
                type: 'setSpaceInbox',
                spaceId: response.spaceId,
                inbox,
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
          case 'account-inbox': {
            // Validate the signature of the inbox corresponds to the current account's identity
            if (signaturePrivateKey) {
              console.error('No signature private key found to process account inbox');
              return;
            }
            const inboxCreator = Inboxes.recoverAccountInboxCreatorKey(response.inbox);
            if (inboxCreator !== signaturePublicKey) {
              console.error('Invalid inbox creator', response.inbox, inboxCreator, signaturePublicKey);
              return;
            }

            const messages: InboxMessageStorageEntry[] = [];

            store.send({
              type: 'setAccountInbox',
              inbox: {
                ...response.inbox,
                messages,
                lastMessageClock: new Date(0).toISOString(),
                seenMessageIds: new Set<string>(),
              },
            });
            break;
          }
          case 'space-inbox-message': {
            const inbox = store
              .getSnapshot()
              .context.spaces.find((s) => s.id === response.spaceId)
              ?.inboxes.find((i) => i.inboxId === response.inboxId);
            if (!inbox) {
              console.error('Inbox not found', response.inboxId);
              return;
            }
            const isValid = await Inboxes.validateSpaceInboxMessage(
              response.message,
              inbox,
              response.spaceId,
              syncServerUri,
              CHAIN,
              RPC_URL,
            );
            if (!isValid) {
              console.error('Invalid message', response.message, inbox.inboxId);
              return;
            }
            try {
              const decryptedMessage = Inboxes.decryptInboxMessage({
                ciphertext: response.message.ciphertext,
                encryptionPrivateKey: inbox.secretKey,
                encryptionPublicKey: inbox.encryptionPublicKey,
              });
              const message = {
                ...response.message,
                createdAt: response.message.createdAt.toISOString(),
                plaintext: decryptedMessage,
                signature: response.message.signature
                  ? {
                      hex: response.message.signature.hex,
                      recovery: response.message.signature.recovery,
                    }
                  : null,
                authorAccountAddress: response.message.authorAccountAddress ?? null,
              };
              store.send({
                type: 'setSpaceInboxMessages',
                spaceId: response.spaceId,
                inboxId: response.inboxId,
                messages: [message],
                lastMessageClock: message.createdAt,
              });
            } catch (error) {
              console.error('Error decrypting message', error);
            }
            break;
          }
          case 'account-inbox-message': {
            const inbox = store.getSnapshot().context.accountInboxes.find((i) => i.inboxId === response.inboxId);
            if (!inbox) {
              console.error('Inbox not found', response.inboxId);
              return;
            }
            const isValid = await Inboxes.validateAccountInboxMessage(
              response.message,
              inbox,
              accountAddress,
              syncServerUri,
              CHAIN,
              RPC_URL,
            );
            if (!isValid) {
              console.error('Invalid message', response.message, inbox.inboxId);
              return;
            }
            try {
              const decryptedMessage = Inboxes.decryptInboxMessage({
                ciphertext: response.message.ciphertext,
                encryptionPrivateKey: encryptionPrivateKey,
                encryptionPublicKey: encryptionPublicKey,
              });
              const message = {
                ...response.message,
                createdAt: response.message.createdAt.toISOString(),
                plaintext: decryptedMessage,
                signature: response.message.signature
                  ? {
                      hex: response.message.signature.hex,
                      recovery: response.message.signature.recovery,
                    }
                  : null,
                authorAccountAddress: response.message.authorAccountAddress ?? null,
              };
              store.send({
                type: 'setAccountInboxMessages',
                inboxId: response.inboxId,
                messages: [message],
                lastMessageClock: message.createdAt,
              });
            } catch (error) {
              console.error('Error decrypting message', error);
            }
            break;
          }
          case 'account-inboxes': {
            response.inboxes.forEach((inbox) => {
              store.send({
                type: 'setAccountInbox',
                inbox: {
                  ...inbox,
                  messages: [],
                  lastMessageClock: new Date(0).toISOString(),
                  seenMessageIds: new Set<string>(),
                },
              });
            });
            break;
          }
          case 'account-inbox-messages': {
            // Validate the signature of the inbox corresponds to the current account's identity
            if (!signaturePrivateKey) {
              console.error('No signature private key found to process account inbox');
              return;
            }
            const inbox = store.getSnapshot().context.accountInboxes.find((i) => i.inboxId === response.inboxId);
            if (!inbox) {
              console.error('Inbox not found', response.inboxId);
              return;
            }
            const validSignatures = await Promise.all(
              response.messages.map(
                // If the message has a signature, check that the signature is valid for the authorAccountAddress
                async (message) => {
                  return Inboxes.validateAccountInboxMessage(
                    message,
                    inbox,
                    accountAddress,
                    syncServerUri,
                    CHAIN,
                    RPC_URL,
                  );
                },
              ),
            );
            let lastMessageClock = new Date(0);
            const messages = response.messages
              .filter((_message, index) => validSignatures[index])
              .map((message) => {
                try {
                  const decryptedMessage = Inboxes.decryptInboxMessage({
                    ciphertext: message.ciphertext,
                    encryptionPrivateKey,
                    encryptionPublicKey,
                  });
                  if (message.createdAt > lastMessageClock) {
                    lastMessageClock = message.createdAt;
                  }
                  return {
                    ...message,
                    createdAt: message.createdAt.toISOString(),
                    plaintext: decryptedMessage,
                    signature: message.signature
                      ? {
                          hex: message.signature.hex,
                          recovery: message.signature.recovery,
                        }
                      : null,
                    authorAccountAddress: message.authorAccountAddress ?? null,
                  };
                } catch (error) {
                  console.error('Error decrypting message', error);
                  return null;
                }
              })
              .filter((message) => message !== null);

            store.send({
              type: 'setAccountInboxMessages',
              inboxId: response.inboxId,
              messages,
              lastMessageClock: lastMessageClock.toISOString(),
            });
            break;
          }
          case 'space-inbox-messages': {
            const space = store.getSnapshot().context.spaces.find((s) => s.id === response.spaceId);
            if (!space) {
              console.error('Space not found', response.spaceId);
              return;
            }
            const inbox = space.inboxes.find((i) => i.inboxId === response.inboxId);
            if (!inbox) {
              console.error('Inbox not found', response.inboxId);
              return;
            }
            let lastMessageClock = new Date(0);
            const validSignatures = await Promise.all(
              response.messages.map(
                // If the message has a signature, check that the signature is valid for the authorAccountAddress
                async (message) => {
                  return Inboxes.validateSpaceInboxMessage(message, inbox, space.id, syncServerUri, CHAIN, RPC_URL);
                },
              ),
            );
            const messages = response.messages
              .filter((_message, index) => validSignatures[index])
              .map((message) => {
                try {
                  const decryptedMessage = Inboxes.decryptInboxMessage({
                    ciphertext: message.ciphertext,
                    encryptionPrivateKey: inbox.secretKey,
                    encryptionPublicKey: inbox.encryptionPublicKey,
                  });
                  if (message.createdAt > lastMessageClock) {
                    lastMessageClock = message.createdAt;
                  }
                  return {
                    ...message,
                    createdAt: message.createdAt.toISOString(),
                    signature: message.signature
                      ? {
                          hex: message.signature.hex,
                          recovery: message.signature.recovery,
                        }
                      : null,
                    authorAccountAddress: message.authorAccountAddress ?? null,
                    plaintext: decryptedMessage,
                  };
                } catch (error) {
                  console.error('Error decrypting message', error);
                  return null;
                }
              })
              .filter((message) => message !== null);

            store.send({
              type: 'setSpaceInboxMessages',
              spaceId: response.spaceId,
              inboxId: response.inboxId,
              messages,
              lastMessageClock: lastMessageClock.toISOString(),
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
  }, [websocketConnection, spaces, identity, privyIdentity, syncServerUri]);

  const createSpaceForContext = useCallback<
    ({ name, smartSessionClient }: { name: string; smartSessionClient?: Connect.SmartSessionClient }) => Promise<string>
  >(
    async ({ name, smartSessionClient }) => {
      if (!identity) {
        throw new Error('No identity   found');
      }
      const encryptionPrivateKey = identity.encryptionPrivateKey;
      const encryptionPublicKey = identity.encryptionPublicKey;
      const signaturePrivateKey = identity.signaturePrivateKey;
      const signaturePublicKey = identity.signaturePublicKey;
      if (!encryptionPrivateKey || !encryptionPublicKey || !signaturePrivateKey || !signaturePublicKey) {
        throw new Error('Missing keys');
      }

      let spaceId = Utils.generateId();

      try {
        if (smartSessionClient?.account) {
          const result = await Graph.createSpace({
            editorAddress: smartSessionClient.account.address,
            name,
            network: smartSessionClient.chain.id === Connect.GEO_TESTNET.id ? 'TESTNET' : 'MAINNET',
          });
          spaceId = result.id;
          console.log('Created public space', spaceId);
        }
      } catch (error) {
        console.error('Error creating public space', error);
      }

      const spaceEvent = await Effect.runPromise(
        SpaceEvents.createSpace({
          author: {
            accountAddress: identity.accountAddress,
            encryptionPublicKey,
            signaturePrivateKey,
            signaturePublicKey,
          },
          spaceId,
        }),
      );
      const result = Key.createKey({
        privateKey: Utils.hexToBytes(encryptionPrivateKey),
        publicKey: Utils.hexToBytes(encryptionPublicKey),
      });

      const message: Messages.RequestCreateSpaceEvent = {
        type: 'create-space-event',
        event: spaceEvent,
        spaceId: spaceEvent.transaction.id,
        keyBox: {
          accountAddress: identity.accountAddress,
          ciphertext: Utils.bytesToHex(result.keyBoxCiphertext),
          nonce: Utils.bytesToHex(result.keyBoxNonce),
          authorPublicKey: encryptionPublicKey,
          id: Utils.generateId(),
        },
        name,
      };
      websocketConnection?.send(Messages.serialize(message));

      // return the created space id
      // @todo return created Space with name, etc
      return spaceEvent.transaction.id;
    },
    [identity, websocketConnection],
  );

  const listSpaces = useCallback(() => {
    const message: Messages.RequestListSpaces = { type: 'list-spaces' };
    websocketConnection?.send(Messages.serialize(message));
  }, [websocketConnection]);

  const listInvitations = useCallback(() => {
    const message: Messages.RequestListInvitations = { type: 'list-invitations' };
    websocketConnection?.send(Messages.serialize(message));
  }, [websocketConnection]);

  const getSmartSessionClientForContext = useCallback(async () => {
    if (!identity?.accountAddress) {
      throw new Error('Missing account address');
    }
    if (!identity.permissionId) {
      throw new Error('Missing permission id');
    }
    if (!identity.addressPrivateKey) {
      throw new Error('Missing session private key');
    }
    return Connect.getSmartSessionClient({
      accountAddress: identity.accountAddress as Hex,
      permissionId: identity.permissionId as Hex,
      sessionPrivateKey: identity.addressPrivateKey as Hex,
      chain: chainId === Connect.GEOGENESIS.id ? Connect.GEOGENESIS : Connect.GEO_TESTNET,
      rpcUrl:
        chainId === Connect.GEOGENESIS.id
          ? Connect.GEOGENESIS.rpcUrls.default.http[0]
          : Connect.GEO_TESTNET.rpcUrls.default.http[0],
    });
  }, [identity, chainId]);

  const createSpaceInboxForContext = useCallback(
    async ({
      space,
      isPublic,
      authPolicy,
    }: Readonly<{ space: SpaceStorageEntry; isPublic: boolean; authPolicy: Inboxes.InboxSenderAuthPolicy }>) => {
      if (!identity) {
        throw new Error('No identity   found');
      }
      const encryptionPrivateKey = identity.encryptionPrivateKey;
      const encryptionPublicKey = identity.encryptionPublicKey;
      const signaturePrivateKey = identity.signaturePrivateKey;
      const signaturePublicKey = identity.signaturePublicKey;
      if (!encryptionPrivateKey || !encryptionPublicKey || !signaturePrivateKey || !signaturePublicKey) {
        throw new Error('Missing keys');
      }
      if (!space.state) {
        console.error('Space has no state', space.id);
        return;
      }
      const message = await Inboxes.createSpaceInboxCreationMessage({
        author: {
          accountAddress: identity.accountAddress,
          signaturePublicKey,
          encryptionPublicKey,
          signaturePrivateKey,
        },
        spaceId: space.id,
        isPublic,
        authPolicy,
        spaceSecretKey: space.keys[0].key,
        previousEventHash: space.state.lastEventHash,
      });
      websocketConnection?.send(Messages.serialize(message));
    },
    [identity, websocketConnection],
  );

  const getLatestSpaceInboxMessagesForContext = useCallback(
    async ({ spaceId, inboxId }: Readonly<{ spaceId: string; inboxId: string }>) => {
      const storeState = store.getSnapshot();
      const space = storeState.context.spaces.find((s) => s.id === spaceId);
      if (!space) {
        console.error('Space not found', spaceId);
        return;
      }
      const inbox = space.inboxes.find((i) => i.inboxId === inboxId);
      if (!inbox) {
        console.error('Inbox not found', inboxId);
        return;
      }
      const latestMessageClock = inbox.lastMessageClock;
      const message: Messages.RequestGetLatestSpaceInboxMessages = {
        type: 'get-latest-space-inbox-messages',
        spaceId,
        inboxId,
        since: new Date(latestMessageClock),
      };
      websocketConnection?.send(Messages.serialize(message));
    },
    [websocketConnection],
  );

  const listPublicSpaceInboxesForContext = useCallback(
    async ({ spaceId }: Readonly<{ spaceId: string }>): Promise<readonly Messages.SpaceInboxPublic[]> => {
      return await Inboxes.listPublicSpaceInboxes({ spaceId, syncServerUri });
    },
    [syncServerUri],
  );

  const getSpaceInboxForContext = useCallback(
    async ({
      spaceId,
      inboxId,
    }: Readonly<{ spaceId: string; inboxId: string }>): Promise<Messages.SpaceInboxPublic> => {
      return await Inboxes.getSpaceInbox({ spaceId, inboxId, syncServerUri });
    },
    [syncServerUri],
  );

  const sendSpaceInboxMessageForContext = useCallback(
    async ({
      spaceId,
      inboxId,
      message,
      encryptionPublicKey,
      signaturePrivateKey,
      authorAccountAddress,
    }: Readonly<{
      spaceId: string;
      inboxId: string;
      message: string;
      encryptionPublicKey: string;
      signaturePrivateKey: string | null;
      authorAccountAddress: string;
    }>) => {
      return await Inboxes.sendSpaceInboxMessage({
        spaceId,
        inboxId,
        message,
        encryptionPublicKey,
        signaturePrivateKey,
        syncServerUri,
        authorAccountAddress,
      });
    },
    [syncServerUri],
  );

  const createAccountInboxForContext = useCallback(
    async ({ isPublic, authPolicy }: Readonly<{ isPublic: boolean; authPolicy: Inboxes.InboxSenderAuthPolicy }>) => {
      if (!identity) {
        throw new Error('No identity   found');
      }
      const encryptionPrivateKey = identity.encryptionPrivateKey;
      const encryptionPublicKey = identity.encryptionPublicKey;
      const signaturePrivateKey = identity.signaturePrivateKey;
      if (!encryptionPrivateKey || !encryptionPublicKey || !signaturePrivateKey) {
        throw new Error('Missing keys');
      }
      const message = await Inboxes.createAccountInboxCreationMessage({
        accountAddress: identity.accountAddress,
        isPublic,
        authPolicy,
        encryptionPublicKey,
        signaturePrivateKey,
      });
      websocketConnection?.send(Messages.serialize(message));
    },
    [identity, websocketConnection],
  );

  const getLatestAccountInboxMessagesForContext = useCallback(
    async ({ accountAddress, inboxId }: Readonly<{ accountAddress: string; inboxId: string }>) => {
      const storeState = store.getSnapshot();
      const inbox = storeState.context.accountInboxes.find((i) => i.inboxId === inboxId);
      if (!inbox) {
        console.error('Inbox not found', inboxId);
        return;
      }
      const latestMessageClock = inbox.lastMessageClock;
      const message: Messages.RequestGetLatestAccountInboxMessages = {
        type: 'get-latest-account-inbox-messages',
        accountAddress,
        inboxId,
        since: new Date(latestMessageClock),
      };
      websocketConnection?.send(Messages.serialize(message));
    },
    [websocketConnection],
  );

  const getOwnAccountInboxesForContext = useCallback(async () => {
    const message: Messages.RequestGetAccountInboxes = {
      type: 'get-account-inboxes',
    };
    websocketConnection?.send(Messages.serialize(message));
  }, [websocketConnection]);

  const listPublicAccountInboxesForContext = useCallback(
    async ({
      accountAddress,
    }: Readonly<{ accountAddress: string }>): Promise<readonly Messages.AccountInboxPublic[]> => {
      return await Inboxes.listPublicAccountInboxes({ accountAddress, syncServerUri });
    },
    [syncServerUri],
  );

  const getAccountInboxForContext = useCallback(
    async ({
      accountAddress,
      inboxId,
    }: Readonly<{ accountAddress: string; inboxId: string }>): Promise<Messages.AccountInboxPublic> => {
      return await Inboxes.getAccountInbox({ accountAddress, inboxId, syncServerUri });
    },
    [syncServerUri],
  );

  const sendAccountInboxMessageForContext = useCallback(
    async ({
      message,
      accountAddress,
      inboxId,
      encryptionPublicKey,
      signaturePrivateKey,
      authorAccountAddress,
    }: Readonly<{
      message: string;
      accountAddress: string;
      inboxId: string;
      encryptionPublicKey: string;
      signaturePrivateKey: string | null;
      authorAccountAddress: string | null;
    }>) => {
      return await Inboxes.sendAccountInboxMessage({
        message,
        accountAddress,
        inboxId,
        encryptionPublicKey,
        signaturePrivateKey,
        syncServerUri,
        authorAccountAddress,
      });
    },
    [syncServerUri],
  );

  const acceptInvitationForContext = useCallback(
    async ({
      invitation,
    }: Readonly<{
      invitation: Messages.Invitation;
    }>) => {
      if (!identity) {
        throw new Error('No identity   found');
      }
      const encryptionPrivateKey = identity.encryptionPrivateKey;
      const encryptionPublicKey = identity.encryptionPublicKey;
      const signaturePrivateKey = identity.signaturePrivateKey;
      const signaturePublicKey = identity.signaturePublicKey;
      if (!encryptionPrivateKey || !encryptionPublicKey || !signaturePrivateKey || !signaturePublicKey) {
        throw new Error('Missing keys');
      }
      const spaceEvent = await Effect.runPromiseExit(
        SpaceEvents.acceptInvitation({
          author: {
            accountAddress: identity.accountAddress,
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
    [identity, websocketConnection],
  );

  const subscribeToSpace = useCallback(
    (params: { spaceId: string }) => {
      const message: Messages.RequestSubscribeToSpace = { type: 'subscribe-space', id: params.spaceId };
      websocketConnection?.send(Messages.serialize(message));
      setIsLoadingSpaces((prev) => {
        // the space was already loaded, don't set it to loading
        if (prev[params.spaceId] === false) {
          return prev;
        }
        return { ...prev, [params.spaceId]: true };
      });
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
        accountAddress: string;
      };
    }>) => {
      if (!identity && !privyIdentity) {
        throw new Error('No identity   found');
      }
      const encryptionPrivateKey = identity?.encryptionPrivateKey || privyIdentity?.encryptionPrivateKey;
      const encryptionPublicKey = identity?.encryptionPublicKey || privyIdentity?.encryptionPublicKey;
      const signaturePrivateKey = identity?.signaturePrivateKey || privyIdentity?.signaturePrivateKey;
      const signaturePublicKey = identity?.signaturePublicKey || privyIdentity?.signaturePublicKey;
      const accountAddress = identity?.accountAddress || privyIdentity?.accountAddress;
      if (
        !encryptionPrivateKey ||
        !encryptionPublicKey ||
        !signaturePrivateKey ||
        !signaturePublicKey ||
        !accountAddress
      ) {
        throw new Error('Missing keys');
      }
      if (!space.state) {
        console.error('No state found for space');
        return;
      }
      const inviteeWithKeys = await Identity.getVerifiedIdentity(
        invitee.accountAddress,
        null,
        appId,
        syncServerUri,
        CHAIN,
        RPC_URL,
      );
      const spaceEvent = await Effect.runPromiseExit(
        SpaceEvents.createInvitation({
          author: {
            accountAddress,
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
          accountAddress: invitee.accountAddress,
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
    [identity, privyIdentity, websocketConnection, syncServerUri, appId],
  );

  const getVerifiedIdentityForContext = useCallback(
    (accountAddress: string, publicKey: string | null, inputAppId: string | null) => {
      const appIdToUse = inputAppId ?? (publicKey ? null : appId);
      return Identity.getVerifiedIdentity(accountAddress, publicKey, appIdToUse, syncServerUri, CHAIN, RPC_URL);
    },
    [syncServerUri, appId],
  );

  const ensureSpaceInboxForContext = useCallback(
    async ({
      spaceId,
      isPublic = true,
      authPolicy = 'anonymous',
      index = 0,
    }: {
      spaceId: string;
      isPublic?: boolean;
      authPolicy?: Inboxes.InboxSenderAuthPolicy;
      index?: number;
    }) => {
      const storeState = store.getSnapshot();
      const space = storeState.context.spaces.find((s) => s.id === spaceId);
      if (!space) {
        throw new Error('Space not found');
      }

      // Return existing inbox if found
      if (space.inboxes[index]) {
        return space.inboxes[index].inboxId;
      }

      // Create new inbox
      await createSpaceInboxForContext({
        space,
        isPublic,
        authPolicy,
      });

      // Wait for inbox to appear in store
      let attempts = 0;
      const maxAttempts = 10;

      while (attempts < maxAttempts) {
        const storeState = store.getSnapshot();
        const updatedSpace = storeState.context.spaces.find((s) => s.id === spaceId);
        if (updatedSpace?.inboxes[index]) {
          return updatedSpace.inboxes[index].inboxId;
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
        attempts++;
      }

      throw new Error('Timeout waiting for inbox to be created');
    },
    [createSpaceInboxForContext],
  );

  const redirectToConnectForContext = useCallback(
    (params: { storage: Identity.Storage; successUrl: string; connectUrl: string; redirectFn: (url: URL) => void }) => {
      const { storage, successUrl, redirectFn, connectUrl } = params;
      const { url, nonce, expiry, secretKey, publicKey } = Connect.createAuthUrl({
        connectUrl: `${connectUrl}/authenticate`,
        redirectUrl: successUrl,
        appId,
      });
      storage.setItem('geo-connect-auth-nonce', nonce);
      storage.setItem('geo-connect-auth-expiry', expiry.toString());
      storage.setItem('geo-connect-auth-secret-key', secretKey);
      storage.setItem('geo-connect-auth-public-key', publicKey);
      redirectFn(url);
    },
    [appId],
  );

  const processConnectAuthSuccessForContext = useCallback(
    (params: {
      storage: Identity.Storage;
      ciphertext: string;
      nonce: string;
    }):
      | {
          success: true;
          identity: Connect.PrivateAppIdentity;
        }
      | {
          success: false;
          error: string;
        } => {
      const { storage, ciphertext, nonce } = params;
      const storedNonce = storage.getItem('geo-connect-auth-nonce');
      const storedExpiry = Number.parseInt(storage.getItem('geo-connect-auth-expiry') ?? '0', 10);
      const storedSecretKey = storage.getItem('geo-connect-auth-secret-key');
      const storedPublicKey = storage.getItem('geo-connect-auth-public-key');
      if (!storedNonce || !storedExpiry || !storedSecretKey || !storedPublicKey) {
        return { success: false, error: 'Failed to authenticate due missing data in the local storage' };
      }

      try {
        const parsedAuthParams: ConnectCallbackResult = Effect.runSync(
          Connect.parseCallbackParams({
            ciphertext,
            nonce,
            storedNonce,
            storedExpiry,
            storedSecretKey,
            storedPublicKey,
          }),
        );

        const identity: Connect.PrivateAppIdentity = {
          address: parsedAuthParams.appIdentityAddress,
          addressPrivateKey: parsedAuthParams.appIdentityAddressPrivateKey,
          accountAddress: parsedAuthParams.accountAddress,
          permissionId: parsedAuthParams.permissionId,
          signaturePublicKey: parsedAuthParams.signaturePublicKey,
          signaturePrivateKey: parsedAuthParams.signaturePrivateKey,
          encryptionPublicKey: parsedAuthParams.encryptionPublicKey,
          encryptionPrivateKey: parsedAuthParams.encryptionPrivateKey,
          sessionToken: parsedAuthParams.sessionToken,
          sessionTokenExpires: parsedAuthParams.sessionTokenExpires,
        };

        setIdentity(identity);
        storage.removeItem('geo-connect-auth-nonce');
        storage.removeItem('geo-connect-auth-expiry');
        storage.removeItem('geo-connect-auth-secret-key');
        storage.removeItem('geo-connect-auth-public-key');
        return { success: true, identity };
      } catch (error) {
        console.error(error);
        return { success: false, error: 'Failed to authenticate due to invalid callback' };
      }
    },
    [setIdentity],
  );

  useEffect(() => {
    const setupRepo = async () => {
      await automerge.next.initializeBase64Wasm(automergeWasmBase64);
      const newRepo = new Repo({});
      store.send({ type: 'setRepo', repo: newRepo });
    };
    setupRepo();
  }, []);

  // need to wait until Automerge is initialized before we can continue to any component that might need it
  if (repo === null) {
    return null;
  }

  return (
    <HypergraphAppContext.Provider
      value={{
        logout,
        setIdentity,
        invitations,
        createSpace: createSpaceForContext,
        getSmartSessionClient: getSmartSessionClientForContext,
        createSpaceInbox: createSpaceInboxForContext,
        getLatestSpaceInboxMessages: getLatestSpaceInboxMessagesForContext,
        listPublicSpaceInboxes: listPublicSpaceInboxesForContext,
        getSpaceInbox: getSpaceInboxForContext,
        sendSpaceInboxMessage: sendSpaceInboxMessageForContext,
        createAccountInbox: createAccountInboxForContext,
        getLatestAccountInboxMessages: getLatestAccountInboxMessagesForContext,
        getOwnAccountInboxes: getOwnAccountInboxesForContext,
        listPublicAccountInboxes: listPublicAccountInboxesForContext,
        getAccountInbox: getAccountInboxForContext,
        sendAccountInboxMessage: sendAccountInboxMessageForContext,
        listSpaces,
        listInvitations,
        acceptInvitation: acceptInvitationForContext,
        subscribeToSpace,
        getVerifiedIdentity: getVerifiedIdentityForContext,
        inviteToSpace,
        isConnecting,
        isLoadingSpaces,
        ensureSpaceInbox: ensureSpaceInboxForContext,
        redirectToConnect: redirectToConnectForContext,
        processConnectAuthSuccess: processConnectAuthSuccessForContext,
        syncServerUri,
        logInvalidResults,
      }}
    >
      <QueryClientProvider client={queryClient}>
        <RepoContext.Provider value={repo}>{children}</RepoContext.Provider>
      </QueryClientProvider>
    </HypergraphAppContext.Provider>
  );
}
