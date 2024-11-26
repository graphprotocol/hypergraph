import { uuid } from '@automerge/automerge';
import { type AutomergeUrl, type DocHandle, Repo } from '@automerge/automerge-repo';
import { RepoContext, useDocument } from '@automerge/automerge-repo-react-hooks';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import { createFileRoute } from '@tanstack/react-router';
import { Effect, Exit } from 'effect';
import * as Schema from 'effect/Schema';
import { useEffect, useState } from 'react';

import type {
  Invitation,
  RequestAcceptInvitationEvent,
  RequestCreateInvitationEvent,
  RequestCreateSpaceEvent,
  RequestCreateUpdate,
  RequestListInvitations,
  RequestListSpaces,
  RequestSubscribeToSpace,
  SpaceEvent,
  SpaceState,
} from '@graphprotocol/graph-framework';
import {
  ResponseMessage,
  acceptInvitation,
  applyEvent,
  createInvitation,
  createKey,
  createSpace,
  decryptKey,
  decryptMessage,
  deserialize,
  encryptKey,
  encryptMessage,
  generateId,
  serialize,
} from '@graphprotocol/graph-framework';

import { DebugInvitations } from '@/components/debug-invitations';
import { DebugSpaceEvents } from '@/components/debug-space-events';
import { DebugSpaceState } from '@/components/debug-space-state';
import { Button } from '@/components/ui/button';
import { GraphFrameworkNetworkAdapter } from '@/lib/GraphFrameworkNetworkAdapter';
import { assertExhaustive } from '@/lib/assertExhaustive';

const availableAccounts = [
  {
    accountId: '0262701b2eb1b6b37ad03e24445dfcad1b91309199e43017b657ce2604417c12f5',
    signaturePrivateKey: '88bb6f20de8dc1787c722dc847f4cf3d00285b8955445f23c483d1237fe85366',
    encryptionPrivateKey: 'bbf164a93b0f78a85346017fa2673cf367c64d81b1c3d6af7ad45e308107a812',
    encryptionPublicKey: '595e1a6b0bb346d83bc382998943d2e6d9210fd341bc8b9f41a7229eede27240',
  },
  {
    accountId: '03bf5d2a1badf15387b08a007d1a9a13a9bfd6e1c56f681e251514d9ba10b57462',
    signaturePrivateKey: '1eee32d3bc202dcb5d17c3b1454fb541d2290cb941860735408f1bfe39e7bc15',
    encryptionPrivateKey: 'b32478dc6f40482127a09d0f1cabbf45dc83ebce638d6246f5552191009fda2c',
    encryptionPublicKey: '0f4e22dc85167597af85cba85988770cd77c25d317f2b14a1f49a54efcbfae3f',
  },
  {
    accountId: '0351460706cf386282d9b6ebee2ccdcb9ba61194fd024345e53037f3036242e6a2',
    signaturePrivateKey: '434518a2c9a665a7c20da086232c818b6c1592e2edfeecab29a40cf5925ca8fe',
    encryptionPrivateKey: 'aaf71397e44fc57b42eaad5b0869d1e0247b4a7f2fe9ec5cc00dec3815849e7a',
    encryptionPublicKey: 'd494144358a610604c4ab453b442d014f2843772eed19be155dd9fc55fe8a332',
  },
];

type SpaceStorageEntry = {
  id: string;
  events: SpaceEvent[];
  state: SpaceState | undefined;
  keys: { id: string; key: string }[];
  updates: Uint8Array[];
  lastUpdateClock: number;
};

interface Doc {
  count: number;
}

const decodeResponseMessage = Schema.decodeUnknownEither(ResponseMessage);

export const Route = createFileRoute('/playground')({
  component: () => <ChooseAccount />,
});

const AutoMergeApp = ({ url }: { url: AutomergeUrl }) => {
  // const hardcodedUrl = 'automerge:4KiBkKrw52GSiTbhQUVVtuGcVZyo';
  const [doc, changeDoc] = useDocument<Doc>(url);

  console.log('AutoMergeApp url:', url);

  if (!doc) {
    return null;
  }

  return (
    <Button
      onClick={() => {
        changeDoc((d: Doc) => {
          d.count = (d.count || 0) + 1;
        });
      }}
    >
      Count: {doc?.count ?? 0}
    </Button>
  );
};

const App = ({
  accountId,
  signaturePrivateKey,
  encryptionPublicKey,
  encryptionPrivateKey,
}: {
  accountId: string;
  signaturePrivateKey: string;
  encryptionPrivateKey: string;
  encryptionPublicKey: string;
}) => {
  const [websocketConnection, setWebsocketConnection] = useState<WebSocket>();
  const [repo, setRepo] = useState<Repo | null>(null);
  const [spaces, setSpaces] = useState<SpaceStorageEntry[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [updatesInFlight, setUpdatesInFlight] = useState<string[]>([]);
  const [graphFrameworkNetworkAdapter] = useState<GraphFrameworkNetworkAdapter>(
    () => new GraphFrameworkNetworkAdapter(),
  );
  const [automergeHandle, setAutomergeHandle] = useState<DocHandle<{ count: number }> | null>(null);

  // Create a stable WebSocket connection that only depends on accountId
  useEffect(() => {
    const websocketConnection = new WebSocket(`ws://localhost:3030/?accountId=${accountId}`);
    const repo = new Repo({
      network: [graphFrameworkNetworkAdapter],
    });
    graphFrameworkNetworkAdapter.setWebSocket(websocketConnection);
    setRepo(repo);
    setAutomergeHandle(repo.create<{ count: number }>({ count: 0 }));
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
  }, [accountId, graphFrameworkNetworkAdapter]); // Only recreate when accountId changes

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
            setSpaces((existingSpaces) => {
              return response.spaces.map((space) => {
                const existingSpace = existingSpaces.find((s) => s.id === space.id);
                return {
                  id: space.id,
                  events: existingSpace?.events ?? [],
                  state: existingSpace?.state,
                  keys: existingSpace?.keys ?? [],
                  updates: existingSpace?.updates ?? [],
                  lastUpdateClock: existingSpace?.lastUpdateClock ?? -1,
                };
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

            const keys = response.keyBoxes.map((keyBox) => {
              const key = decryptKey({
                keyBoxCiphertext: hexToBytes(keyBox.ciphertext),
                keyBoxNonce: hexToBytes(keyBox.nonce),
                publicKey: hexToBytes(keyBox.authorPublicKey),
                privateKey: hexToBytes(encryptionPrivateKey),
              });
              return { id: keyBox.id, key: bytesToHex(key) };
            });

            setSpaces((spaces) =>
              spaces.map((space) => {
                if (space.id === response.id) {
                  let lastUpdateClock = space.lastUpdateClock;
                  const updates = [];
                  if (space.updates) {
                    updates.push(...space.updates);
                  }
                  if (response.updates) {
                    if (response.updates.firstUpdateClock === lastUpdateClock + 1) {
                      lastUpdateClock = response.updates.lastUpdateClock;

                      const newUpdates = (response.updates ? response.updates.updates : []).map((encryptedUpdate) => {
                        return decryptMessage({
                          nonceAndCiphertext: encryptedUpdate,
                          secretKey: hexToBytes(keys[0].key),
                        });
                      });

                      updates.push(...newUpdates);
                    } else {
                      // TODO request missing updates from server
                    }
                  }

                  // TODO fix readonly type issue
                  return {
                    ...space,
                    events: response.events as SpaceEvent[],
                    state: newState,
                    keys,
                    lastUpdateClock,
                    updates,
                  };
                }
                return space;
              }),
            );
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
              setSpaces((spaces) =>
                spaces.map((space) => {
                  if (space.id === response.spaceId) {
                    return { ...space, state: applyEventResult.value, events: [...space.events, response.event] };
                  }
                  return space;
                }),
              );
            }

            break;
          }
          case 'list-invitations': {
            setInvitations(response.invitations.map((invitation) => invitation));
            break;
          }
          case 'update-confirmed': {
            setSpaces((spaces) =>
              spaces.map((space) => {
                if (space.id === response.spaceId && space.lastUpdateClock + 1 === response.clock) {
                  return { ...space, lastUpdateClock: response.clock };
                }
                return space;
              }),
            );
            setUpdatesInFlight((updatesInFlight) => updatesInFlight.filter((id) => id !== response.ephemeralId));
            break;
          }
          case 'updates-notification': {
            setSpaces((spaces) =>
              spaces.map((space) => {
                if (space.id === response.spaceId) {
                  let lastUpdateClock = space.lastUpdateClock;
                  if (response.updates.firstUpdateClock === space.lastUpdateClock + 1) {
                    lastUpdateClock = response.updates.lastUpdateClock;
                  } else {
                    // TODO request missing updates from server
                  }

                  const newUpdates = (response.updates ? response.updates.updates : []).map((encryptedUpdate) => {
                    return decryptMessage({
                      nonceAndCiphertext: encryptedUpdate,
                      secretKey: hexToBytes(space.keys[0].key),
                    });
                  });

                  return {
                    ...space,
                    updates: [...space.updates, ...newUpdates],
                    lastUpdateClock,
                  };
                }
                return space;
              }),
            );
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
  }, [websocketConnection, encryptionPrivateKey, spaces]);

  return (
    <>
      <div>
        <Button
          onClick={async () => {
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
          }}
        >
          Create space
        </Button>

        <Button
          onClick={() => {
            const message: RequestListSpaces = { type: 'list-spaces' };
            websocketConnection?.send(serialize(message));
          }}
        >
          List Spaces
        </Button>

        <Button
          onClick={() => {
            const message: RequestListInvitations = { type: 'list-invitations' };
            websocketConnection?.send(serialize(message));
          }}
        >
          List Invitations
        </Button>
      </div>
      <h2 className="text-lg">Invitations</h2>
      <DebugInvitations
        invitations={invitations}
        accept={async (invitation) => {
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
        }}
      />
      <h2 className="text-lg">Spaces</h2>
      <ul>
        {spaces.map((space) => {
          return (
            <li key={space.id}>
              <h3>Space id: {space.id}</h3>
              <p>Keys:</p>
              <pre className="text-xs">{JSON.stringify(space.keys)}</pre>
              <Button
                onClick={() => {
                  const message: RequestSubscribeToSpace = { type: 'subscribe-space', id: space.id };
                  websocketConnection?.send(serialize(message));
                }}
              >
                Get data and subscribe to Space
              </Button>
              <br />
              {availableAccounts.map((invitee) => {
                return (
                  <Button
                    key={invitee.accountId}
                    onClick={async () => {
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
                    }}
                  >
                    Invite {invitee.accountId.substring(0, 4)}
                  </Button>
                );
              })}
              <h3>Updates</h3>
              <RepoContext.Provider value={repo}>
                <Button
                  onClick={() => {
                    graphFrameworkNetworkAdapter.setSpaceValues({
                      spaceId: space.id,
                      spaceKey: space.keys[0].key,
                      setUpdatesInFlight,
                    });
                  }}
                >
                  Init
                </Button>
                {automergeHandle && <AutoMergeApp url={automergeHandle.url} />}
              </RepoContext.Provider>
              <Button
                onClick={() => {
                  const ephemeralId = uuid();
                  setUpdatesInFlight((updatesInFlight) => [...updatesInFlight, ephemeralId]);
                  setSpaces((currentSpaces) =>
                    currentSpaces.map((currentSpace) => {
                      if (space.id === currentSpace.id) {
                        return { ...currentSpace, updates: [...currentSpace.updates, new Uint8Array([0])] };
                      }
                      return currentSpace;
                    }),
                  );

                  const nonceAndCiphertext = encryptMessage({
                    message: new Uint8Array([0]),
                    secretKey: hexToBytes(space.keys[0].key),
                  });

                  const message: RequestCreateUpdate = {
                    type: 'create-update',
                    ephemeralId,
                    update: nonceAndCiphertext,
                    spaceId: space.id,
                  };
                  websocketConnection?.send(serialize(message));
                }}
              >
                Create an update
              </Button>
              <h3>Updates Content</h3>
              <p>last update clock: {space.lastUpdateClock}</p>
              <p className="text-xs">
                {space.updates.map((update, index) => {
                  return (
                    // biome-ignore lint/suspicious/noArrayIndexKey: we need a unique identifier here
                    <span key={`${update}-${index}`} className="border border-gray-300">
                      {update}
                    </span>
                  );
                })}
              </p>
              <h3>Updates in flight</h3>
              <ul className="text-xs">
                {updatesInFlight.map((updateInFlight) => {
                  return (
                    <li key={updateInFlight} className="border border-gray-300">
                      {updateInFlight}
                    </li>
                  );
                })}
              </ul>
              <hr />
              <h3>State</h3>
              <DebugSpaceState state={space.state} />
              <hr />
              <h3>Events</h3>
              <DebugSpaceEvents events={space.events} />
              <hr />
            </li>
          );
        })}
      </ul>
    </>
  );
};

export const ChooseAccount = () => {
  const [account, setAccount] = useState<{
    accountId: string;
    signaturePrivateKey: string;
    encryptionPrivateKey: string;
    encryptionPublicKey: string;
  } | null>();

  return (
    <div>
      <h1>Choose account</h1>
      <Button
        onClick={() => {
          setAccount(availableAccounts[0]);
        }}
      >
        {availableAccounts[0].accountId.substring(0, 4)}
      </Button>
      <Button
        onClick={() => {
          setAccount(availableAccounts[1]);
        }}
      >
        {availableAccounts[1].accountId.substring(0, 4)}
      </Button>
      <Button
        onClick={() => {
          setAccount(availableAccounts[2]);
        }}
      >
        {availableAccounts[2].accountId.substring(0, 4)}
      </Button>
      Account: {account?.accountId ? account.accountId : 'none'}
      <hr />
      {account && (
        <App
          // forcing a remount of the App component when the accountId changes
          key={account.accountId}
          accountId={account.accountId}
          signaturePrivateKey={account.signaturePrivateKey}
          encryptionPrivateKey={account.encryptionPrivateKey}
          encryptionPublicKey={account.encryptionPublicKey}
        />
      )}
    </div>
  );
};
