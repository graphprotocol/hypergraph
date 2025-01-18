import * as automerge from '@automerge/automerge';
import { uuid } from '@automerge/automerge';
import { RepoContext } from '@automerge/automerge-repo-react-hooks';
import { useSelector as useSelectorStore } from '@xstate/store/react';
import { Effect, Exit } from 'effect';
import * as Schema from 'effect/Schema';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { verifyIdentityOwnership } from './identity/prove-ownership.js';
import { createKey, decryptKey, encryptKey } from './key/index.js';
import type {
  Invitation,
  RequestAcceptInvitationEvent,
  RequestCreateInvitationEvent,
  RequestCreateSpaceEvent,
  RequestCreateUpdate,
  RequestListInvitations,
  RequestListSpaces,
  RequestSubscribeToSpace,
  Updates,
} from './messages/index.js';
import {
  ResponseIdentity,
  ResponseMessage,
  decryptMessage,
  deserialize,
  encryptMessage,
  serialize,
} from './messages/index.js';
import type { SpaceEvent, SpaceState } from './space-events/index.js';
import { acceptInvitation, applyEvent, createInvitation, createSpace } from './space-events/index.js';
import type { SpaceStorageEntry } from './store.js';
import { store } from './store.js';
import { assertExhaustive } from './utils/assertExhaustive.js';
import { generateId } from './utils/generateId.js';
import { bytesToHex, hexToBytes } from './utils/hexBytesAddressUtils.js';

const decodeResponseMessage = Schema.decodeUnknownEither(ResponseMessage);

type Props = {
  children: React.ReactNode;
  accountId: string;
  syncServer?: string;
  sessionToken?: string | null;
  encryptionPrivateKey?: string | null;
  encryptionPublicKey?: string | null;
  signaturePrivateKey?: string | null;
  signaturePublicKey?: string | null;
};

const GraphFrameworkContext = createContext<{
  invitations: Invitation[];
  createSpace: () => Promise<unknown>;
  listSpaces: () => void;
  listInvitations: () => void;
  acceptInvitation: (params: {
    invitation: Invitation;
  }) => Promise<unknown>;
  subscribeToSpace: (params: { spaceId: string }) => void;
  getUserIdentity: (accountId: string) => Promise<{
    accountId: string;
    encryptionPublicKey: string;
    signaturePublicKey: string;
  }>;
  inviteToSpace: (params: {
    space: SpaceStorageEntry;
    invitee: {
      accountId: string;
    };
  }) => Promise<unknown>;
  isLoading: boolean;
}>({
  invitations: [],
  createSpace: async () => {},
  listSpaces: () => {},
  listInvitations: () => {},
  acceptInvitation: async () => {},
  subscribeToSpace: () => {},
  getUserIdentity: async () => ({
    accountId: '',
    encryptionPublicKey: '',
    signaturePublicKey: '',
  }),
  inviteToSpace: async () => {},
  isLoading: true,
});

export function GraphFramework({
  children,
  accountId,
  syncServer = 'http://localhost:3030',
  sessionToken,
  encryptionPrivateKey,
  encryptionPublicKey,
  signaturePrivateKey,
  signaturePublicKey,
}: Props) {
  const [websocketConnection, setWebsocketConnection] = useState<WebSocket>();
  const [isLoading, setIsLoading] = useState(true);
  const spaces = useSelectorStore(store, (state) => state.context.spaces);
  const invitations = useSelectorStore(store, (state) => state.context.invitations);
  const repo = useSelector(store, (state) => state.context.repo);

  console.log('Sync server:', syncServer);
  const syncServerUrl = new URL(syncServer);
  const syncServerWsUrl = new URL(`/?token=${sessionToken}`, syncServerUrl.toString());
  syncServerWsUrl.protocol = 'ws:';
  const syncServerWsUrlString = syncServerWsUrl.toString();

  // Create a stable WebSocket connection that only depends on accountId
  useEffect(() => {
    if (!sessionToken) {
      setIsLoading(false);
      return;
    }

    const websocketConnection = new WebSocket(syncServerWsUrlString);

    setWebsocketConnection(websocketConnection);

    const onOpen = () => {
      console.log('websocket connected');
      setIsLoading(false);
    };

    const onError = (event: Event) => {
      console.log('websocket error', event);
      setIsLoading(false);
    };

    const onClose = (event: CloseEvent) => {
      console.log('websocket close', event);
      setIsLoading(false);
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
  }, [sessionToken, syncServerWsUrlString]);

  // Handle WebSocket messages in a separate effect
  useEffect(() => {
    if (!websocketConnection) return;

    const onMessage = async (event: MessageEvent) => {
      const data = deserialize(event.data);
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
            if (!encryptionPrivateKey) {
              console.error('No encryption private key found');
              return;
            }
            let state: SpaceState | undefined = undefined;

            for (const event of response.events) {
              const applyEventResult = await Effect.runPromiseExit(applyEvent({ state: undefined, event }));
              if (Exit.isSuccess(applyEventResult)) {
                state = applyEventResult.value;
              }
            }

            const newState = state as SpaceState;

            let storeState = store.getSnapshot();

            const keys = response.keyBoxes.map((keyBox) => {
              const key = decryptKey({
                keyBoxCiphertext: hexToBytes(keyBox.ciphertext),
                keyBoxNonce: hexToBytes(keyBox.nonce),
                publicKey: hexToBytes(keyBox.authorPublicKey),
                privateKey: hexToBytes(encryptionPrivateKey),
              });
              return { id: keyBox.id, key: bytesToHex(key) };
            });

            store.send({
              type: 'setSpace',
              spaceId: response.id,
              updates: response.updates as Updates,
              events: response.events as SpaceEvent[],
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
                return decryptMessage({
                  nonceAndCiphertext: update,
                  secretKey: hexToBytes(keys[0].key),
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

                const nonceAndCiphertext = encryptMessage({
                  message: lastLocalChange,
                  secretKey: hexToBytes(space.keys[0].key),
                });

                const messageToSend: RequestCreateUpdate = {
                  type: 'create-update',
                  ephemeralId,
                  update: nonceAndCiphertext,
                  spaceId: space.id,
                };
                websocketConnection.send(serialize(messageToSend));
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
              applyEvent({ event: response.event, state: space.state }),
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
              return decryptMessage({
                nonceAndCiphertext: update,
                secretKey: hexToBytes(space.keys[0].key),
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
            assertExhaustive(response);
          }
        }
      }
    };

    websocketConnection.addEventListener('message', onMessage);

    return () => {
      websocketConnection.removeEventListener('message', onMessage);
    };
  }, [websocketConnection, spaces, encryptionPrivateKey]);

  const createSpaceForContext = async () => {
    if (!encryptionPrivateKey || !encryptionPublicKey || !signaturePrivateKey || !signaturePublicKey) {
      throw new Error('Missing keys');
    }
    const spaceEvent = await Effect.runPromise(
      createSpace({
        author: {
          accountId,
          encryptionPublicKey,
          signaturePrivateKey,
          signaturePublicKey,
        },
      }),
    );
    const result = createKey({
      privateKey: hexToBytes(encryptionPrivateKey),
      publicKey: hexToBytes(encryptionPublicKey),
    });

    const message: RequestCreateSpaceEvent = {
      type: 'create-space-event',
      event: spaceEvent,
      spaceId: spaceEvent.transaction.id,
      keyId: generateId(),
      keyBox: {
        accountId,
        ciphertext: bytesToHex(result.keyBoxCiphertext),
        nonce: bytesToHex(result.keyBoxNonce),
        authorPublicKey: encryptionPublicKey,
      },
    };
    websocketConnection?.send(serialize(message));
  };

  const listSpaces = useCallback(() => {
    const message: RequestListSpaces = { type: 'list-spaces' };
    websocketConnection?.send(serialize(message));
  }, [websocketConnection]);

  const listInvitations = useCallback(() => {
    const message: RequestListInvitations = { type: 'list-invitations' };
    websocketConnection?.send(serialize(message));
  }, [websocketConnection]);

  const acceptInvitationForContext = async ({
    invitation,
  }: {
    invitation: Invitation;
  }) => {
    if (!encryptionPrivateKey || !encryptionPublicKey || !signaturePrivateKey || !signaturePublicKey) {
      throw new Error('Missing keys');
    }
    const spaceEvent = await Effect.runPromiseExit(
      acceptInvitation({
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
    const message: RequestAcceptInvitationEvent = {
      type: 'accept-invitation-event',
      event: spaceEvent.value,
      spaceId: invitation.spaceId,
    };
    websocketConnection?.send(serialize(message));

    // temporary until we have define a strategy for accepting invitations response
    setTimeout(() => {
      const message2: RequestListInvitations = { type: 'list-invitations' };
      websocketConnection?.send(serialize(message2));
    }, 1000);
  };

  const subscribeToSpace = useCallback(
    (params: { spaceId: string }) => {
      const message: RequestSubscribeToSpace = { type: 'subscribe-space', id: params.spaceId };
      websocketConnection?.send(serialize(message));
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
    const res = await fetch(`${syncServer}/identity?accountId=${accountId}`);
    if (res.status !== 200) {
      throw new Error('Failed to fetch identity');
    }
    const resDecoded = Schema.decodeUnknownSync(ResponseIdentity)(await res.json());

    if (
      !(await verifyIdentityOwnership(
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
  }: {
    space: SpaceStorageEntry;
    invitee: {
      accountId: string;
    };
  }) => {
    if (!encryptionPrivateKey || !encryptionPublicKey || !signaturePrivateKey || !signaturePublicKey) {
      throw new Error('Missing keys');
    }
    if (!space.state) {
      console.error('No state found for space');
      return;
    }
    const inviteeWithKeys = await getUserIdentity(invitee.accountId);
    const spaceEvent = await Effect.runPromiseExit(
      createInvitation({
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
      const keyBox = encryptKey({
        key: hexToBytes(key.key),
        publicKey: hexToBytes(inviteeWithKeys.encryptionPublicKey),
        privateKey: hexToBytes(encryptionPrivateKey),
      });
      return {
        id: key.id,
        ciphertext: bytesToHex(keyBox.keyBoxCiphertext),
        nonce: bytesToHex(keyBox.keyBoxNonce),
        authorPublicKey: encryptionPublicKey,
        accountId: invitee.accountId,
      };
    });

    const message: RequestCreateInvitationEvent = {
      type: 'create-invitation-event',
      event: spaceEvent.value,
      spaceId: space.id,
      keyBoxes,
    };
    websocketConnection?.send(serialize(message));
  };

  return (
    <GraphFrameworkContext.Provider
      value={{
        invitations,
        createSpace: createSpaceForContext,
        listSpaces,
        listInvitations,
        acceptInvitation: acceptInvitationForContext,
        subscribeToSpace,
        getUserIdentity,
        inviteToSpace,
        isLoading,
      }}
    >
      <RepoContext.Provider value={repo}>{children}</RepoContext.Provider>
    </GraphFrameworkContext.Provider>
  );
}

export const useGraphFramework = () => {
  return useContext(GraphFrameworkContext);
};

export const useSelector = useSelectorStore;
