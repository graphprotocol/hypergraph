import * as automerge from '@automerge/automerge';
import { uuid } from '@automerge/automerge';
import { type AutomergeUrl, type DocHandle, Repo } from '@automerge/automerge-repo';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import { useSelector as useSelectorStore } from '@xstate/store/react';
import { Effect, Exit } from 'effect';
import * as Schema from 'effect/Schema';
import { createContext, useContext, useEffect, useState } from 'react';

import { createKey, decryptKey, encryptKey } from '@graph-framework/key';
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
} from '@graph-framework/messages';
import { ResponseMessage, decryptMessage, deserialize, encryptMessage, serialize } from '@graph-framework/messages';
import type { SpaceEvent, SpaceState } from '@graph-framework/space-events';
import { acceptInvitation, applyEvent, createInvitation, createSpace } from '@graph-framework/space-events';
import { generateId } from '@graph-framework/utils';

import { assertExhaustive } from './assertExhaustive.js';
import type { SpaceStorageEntry } from './store.js';
import { store } from './store.js';

const hardcodedUrl = 'automerge:2JWupfYZBBm7s2NCy1VnvQa4Vdvf' as AutomergeUrl;

const decodeResponseMessage = Schema.decodeUnknownEither(ResponseMessage);

type Props = {
  children: React.ReactNode;
  accountId: string;
};

const GraphFrameworkContext = createContext<{
  invitations: Invitation[];
  createSpace: (params: {
    encryptionPublicKey: string;
    encryptionPrivateKey: string;
    signaturePrivateKey: string;
  }) => Promise<unknown>;
  listSpaces: () => void;
  listInvitations: () => void;
  acceptInvitation: (params: {
    encryptionPublicKey: string;
    encryptionPrivateKey: string;
    signaturePrivateKey: string;
    invitation: Invitation;
  }) => Promise<unknown>;
  subscribeToSpace: (params: { spaceId: string }) => void;
  inviteToSpace: (params: {
    encryptionPublicKey: string;
    encryptionPrivateKey: string;
    signaturePrivateKey: string;
    space: SpaceStorageEntry;
    invitee: {
      accountId: string;
      encryptionPublicKey: string;
    };
  }) => Promise<unknown>;
  repo: Repo;
  automergeHandle: DocHandle<unknown>;
}>({
  invitations: [],
  createSpace: async () => {},
  listSpaces: () => {},
  listInvitations: () => {},
  acceptInvitation: async () => {},
  subscribeToSpace: () => {},
  inviteToSpace: async () => {},
  // @ts-expect-error repo is always set
  repo: undefined,
  // @ts-expect-error automergeHandle is always set
  automergeHandle: undefined,
});

export function GraphFramework({ children, accountId }: Props) {
  const [websocketConnection, setWebsocketConnection] = useState<WebSocket>();
  const [repo] = useState<Repo>(() => new Repo({}));
  const [automergeHandle] = useState<DocHandle<unknown>>(() => repo.find(hardcodedUrl));
  const spaces = useSelectorStore(store, (state) => state.context.spaces);
  const invitations = useSelectorStore(store, (state) => state.context.invitations);
  // Create a stable WebSocket connection that only depends on accountId
  useEffect(() => {
    const websocketConnection = new WebSocket(`ws://localhost:3030/?accountId=${accountId}`);

    const docHandle = automergeHandle;
    // set it to ready to interact with the document
    docHandle.doneLoading();

    docHandle.on('change', (result) => {
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

    store.send({
      type: 'setAutomergeDocumentId',
      automergeDocumentId: docHandle.url.slice(10),
    });
    setWebsocketConnection(websocketConnection);

    const onOpen = () => {
      console.log('websocket connected');
    };

    const onError = (event: Event) => {
      console.log('websocket error', event);
    };

    const onClose = (event: CloseEvent) => {
      console.log('websocket close', event);
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
  }, [accountId, automergeHandle]); // Only recreate when accountId changes

  // Handle WebSocket messages in a separate effect
  // biome-ignore lint/correctness/useExhaustiveDependencies: automergeHandle is a mutable object
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
            // fetch all spaces (for debugging purposes)
            for (const space of response.spaces) {
              const message: RequestSubscribeToSpace = { type: 'subscribe-space', id: space.id };
              websocketConnection?.send(serialize(message));
            }
            break;
          }
          case 'space': {
            let state: SpaceState | undefined = undefined;

            for (const event of response.events) {
              const applyEventResult = await Effect.runPromiseExit(applyEvent({ state: undefined, event }));
              if (Exit.isSuccess(applyEventResult)) {
                state = applyEventResult.value;
              }
            }

            const newState = state as SpaceState;

            const storeState = store.getSnapshot();

            const keys = response.keyBoxes.map((keyBox) => {
              const key = decryptKey({
                keyBoxCiphertext: hexToBytes(keyBox.ciphertext),
                keyBoxNonce: hexToBytes(keyBox.nonce),
                publicKey: hexToBytes(keyBox.authorPublicKey),
                privateKey: hexToBytes(storeState.context.encryptionPrivateKey),
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

            if (response.updates) {
              const updates = response.updates?.updates.map((update) => {
                return decryptMessage({
                  nonceAndCiphertext: update,
                  secretKey: hexToBytes(keys[0].key),
                });
              });

              for (const update of updates) {
                if (!automergeHandle) {
                  return;
                }

                automergeHandle.update((existingDoc) => {
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

            automergeHandle?.update((existingDoc) => {
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
          default:
            assertExhaustive(response);
        }
      }
    };

    websocketConnection.addEventListener('message', onMessage);

    return () => {
      websocketConnection.removeEventListener('message', onMessage);
    };
  }, [websocketConnection, spaces]);

  const createSpaceForContext = async ({
    encryptionPublicKey,
    encryptionPrivateKey,
    signaturePrivateKey,
  }: {
    encryptionPublicKey: string;
    encryptionPrivateKey: string;
    signaturePrivateKey: string;
  }) => {
    const spaceEvent = await Effect.runPromise(
      createSpace({
        author: {
          encryptionPublicKey,
          signaturePrivateKey,
          signaturePublicKey: accountId,
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

  const listSpaces = async () => {
    const message: RequestListSpaces = { type: 'list-spaces' };
    websocketConnection?.send(serialize(message));
  };

  const listInvitations = async () => {
    const message: RequestListInvitations = { type: 'list-invitations' };
    websocketConnection?.send(serialize(message));
  };

  const acceptInvitationForContext = async ({
    encryptionPublicKey,
    signaturePrivateKey,
    invitation,
  }: {
    encryptionPublicKey: string;
    encryptionPrivateKey: string;
    signaturePrivateKey: string;
    invitation: Invitation;
  }) => {
    const spaceEvent = await Effect.runPromiseExit(
      acceptInvitation({
        author: {
          signaturePublicKey: accountId,
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

  const subscribeToSpace = (params: { spaceId: string }) => {
    const message: RequestSubscribeToSpace = { type: 'subscribe-space', id: params.spaceId };
    websocketConnection?.send(serialize(message));
  };

  const inviteToSpace = async ({
    encryptionPublicKey,
    encryptionPrivateKey,
    signaturePrivateKey,
    space,
    invitee,
  }: {
    encryptionPublicKey: string;
    encryptionPrivateKey: string;
    signaturePrivateKey: string;
    space: SpaceStorageEntry;
    invitee: {
      accountId: string;
      encryptionPublicKey: string;
    };
  }) => {
    if (!space.state) {
      console.error('No state found for space');
      return;
    }
    const spaceEvent = await Effect.runPromiseExit(
      createInvitation({
        author: {
          signaturePublicKey: accountId,
          encryptionPublicKey,
          signaturePrivateKey,
        },
        previousEventHash: space.state.lastEventHash,
        invitee: {
          signaturePublicKey: invitee.accountId,
          encryptionPublicKey,
        },
      }),
    );
    if (Exit.isFailure(spaceEvent)) {
      console.error('Failed to create invitation', spaceEvent);
      return;
    }

    const keyBoxes = space.keys.map((key) => {
      const keyBox = encryptKey({
        key: hexToBytes(key.key),
        publicKey: hexToBytes(invitee.encryptionPublicKey),
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
        inviteToSpace,
        repo,
        automergeHandle,
      }}
    >
      {children}
    </GraphFrameworkContext.Provider>
  );
}

export const useGraphFramework = () => {
  return useContext(GraphFrameworkContext);
};

export const useSelector = useSelectorStore;
