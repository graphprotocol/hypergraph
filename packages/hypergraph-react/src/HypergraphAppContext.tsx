'use client';

import * as automerge from '@automerge/automerge';
import { uuid } from '@automerge/automerge';
import { RepoContext } from '@automerge/automerge-repo-react-hooks';
import { Identity, Key, Messages, SpaceEvents, type SpaceStorageEntry, Utils, store } from '@graphprotocol/hypergraph';
import { useSelector as useSelectorStore } from '@xstate/store/react';
import { Effect, Exit } from 'effect';
import * as Schema from 'effect/Schema';
import { createContext, useContext, useEffect, useState } from 'react';
import { useCallback } from 'react';
import type { Address } from 'viem';

const decodeResponseMessage = Schema.decodeUnknownEither(Messages.ResponseMessage);

export type HypergraphAppCtx = {
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

export type HypergraphAppProviderProps = Readonly<{
  accountId: string;
  syncServer?: string;
  sessionToken?: string | null;
  encryptionPrivateKey?: string | null;
  encryptionPublicKey?: string | null;
  signaturePrivateKey?: string | null;
  signaturePublicKey?: string | null;
  children: React.ReactNode;
}>;
export function HypergraphAppProvider({
  accountId,
  syncServer = 'http://localhost:3030',
  sessionToken,
  encryptionPrivateKey,
  encryptionPublicKey,
  signaturePrivateKey,
  signaturePublicKey,
  children,
}: HypergraphAppProviderProps) {
  const [websocketConnection, setWebsocketConnection] = useState<WebSocket>();
  const [loading, setLoading] = useState(true);
  const spaces = useSelectorStore(store, (state) => state.context.spaces);
  const invitations = useSelectorStore(store, (state) => state.context.invitations);
  const repo = useSelectorStore(store, (state) => state.context.repo);

  const syncServerUrl = new URL(syncServer);
  const syncServerWsUrl = new URL(`/?token=${sessionToken}`, syncServerUrl.toString());
  syncServerWsUrl.protocol = 'ws:';
  const syncServerWsUrlString = syncServerWsUrl.toString();

  // Create a stable WebSocket connection that only depends on accountId
  useEffect(() => {
    if (!sessionToken) {
      setLoading(false);
      return;
    }

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
  }, [sessionToken, syncServerWsUrlString]);

  // Handle WebSocket messages in a separate effect
  useEffect(() => {
    if (!websocketConnection) return;

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
            if (!encryptionPrivateKey) {
              console.error('No encryption private key found');
              return;
            }
            let state: SpaceEvents.SpaceState | undefined = undefined;

            for (const event of response.events) {
              const applyEventResult = await Effect.runPromiseExit(SpaceEvents.applyEvent({ state: undefined, event }));
              if (Exit.isSuccess(applyEventResult)) {
                state = applyEventResult.value;
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
  }, [websocketConnection, spaces, encryptionPrivateKey]);

  const createSpaceForContext = async () => {
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
    const res = await fetch(`${syncServer}/identity?accountId=${accountId}`);
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
