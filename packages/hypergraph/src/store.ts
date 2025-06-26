import type { AnyDocumentId, DocHandle, Repo } from '@automerge/automerge-repo';
import { type Store, createStore } from '@xstate/store';
import type { PrivateAppIdentity } from './connect/types.js';
import type { DocumentContent } from './entity/types.js';
import { mergeMessages } from './inboxes/merge-messages.js';
import type { InboxSenderAuthPolicy } from './inboxes/types.js';
import type { Invitation, Updates } from './messages/index.js';
import type { SpaceEvent, SpaceState } from './space-events/index.js';
import type { Mapping } from './types.js';
import { idToAutomergeId } from './utils/automergeId.js';

export type InboxMessageStorageEntry = {
  id: string;
  plaintext: string;
  ciphertext: string;
  signature: {
    hex: string;
    recovery: number;
  } | null;
  createdAt: string;
  authorAccountAddress: string | null;
};

export type SpaceInboxStorageEntry = {
  inboxId: string;
  isPublic: boolean;
  authPolicy: InboxSenderAuthPolicy;
  encryptionPublicKey: string;
  secretKey: string;
  lastMessageClock: string;
  messages: InboxMessageStorageEntry[]; // Kept sorted by UUIDv7
  seenMessageIds: Set<string>; // For deduplication
};

export type AccountInboxStorageEntry = {
  inboxId: string;
  isPublic: boolean;
  authPolicy: InboxSenderAuthPolicy;
  encryptionPublicKey: string;
  lastMessageClock: string;
  messages: InboxMessageStorageEntry[]; // Kept sorted by UUIDv7
  seenMessageIds: Set<string>; // For deduplication
};

export type SpaceStorageEntry = {
  id: string;
  name: string;
  events: SpaceEvent[];
  state: SpaceState | undefined;
  keys: { id: string; key: string }[];
  automergeDocHandle: DocHandle<DocumentContent>;
  inboxes: SpaceInboxStorageEntry[];
};

interface StoreContext {
  spaces: SpaceStorageEntry[];
  spacesLoadingIsPending: boolean;
  updatesInFlight: string[];
  invitations: Invitation[];
  repo: Repo | null;
  identities: {
    [accountAddress: string]: {
      encryptionPublicKey: string;
      signaturePublicKey: string;
      accountProof: string;
      keyProof: string;
    };
  };
  authenticated: boolean;
  identity: PrivateAppIdentity | null;
  lastUpdateClock: { [spaceId: string]: number };
  accountInboxes: AccountInboxStorageEntry[];
  mapping: Mapping;
}

const initialStoreContext: StoreContext = {
  spaces: [],
  spacesLoadingIsPending: true,
  updatesInFlight: [],
  invitations: [],
  repo: null,
  identities: {},
  authenticated: false,
  identity: null,
  lastUpdateClock: {},
  accountInboxes: [],
  mapping: {},
};

type StoreEvent =
  | { type: 'setInvitations'; invitations: Invitation[] }
  | { type: 'setMapping'; mapping: Mapping }
  | { type: 'reset' }
  | { type: 'addUpdateInFlight'; updateId: string }
  | { type: 'removeUpdateInFlight'; updateId: string }
  | { type: 'setSpacesList'; spaces: { id: string; name: string }[] }
  | { type: 'applyEvent'; spaceId: string; event: SpaceEvent; state: SpaceState }
  | { type: 'updateConfirmed'; spaceId: string; clock: number }
  | { type: 'applyUpdate'; spaceId: string; firstUpdateClock: number; lastUpdateClock: number }
  | {
      type: 'addVerifiedIdentity';
      accountAddress: string;
      encryptionPublicKey: string;
      signaturePublicKey: string;
      accountProof: string;
      keyProof: string;
    }
  | {
      type: 'setSpaceInbox';
      spaceId: string;
      inbox: SpaceInboxStorageEntry;
    }
  | {
      type: 'setSpaceInboxMessages';
      spaceId: string;
      inboxId: string;
      messages: InboxMessageStorageEntry[];
      lastMessageClock: string;
    }
  | {
      type: 'setAccountInbox';
      inbox: AccountInboxStorageEntry;
    }
  | {
      type: 'setAccountInboxMessages';
      inboxId: string;
      messages: InboxMessageStorageEntry[];
      lastMessageClock: string;
    }
  | {
      type: 'setSpace';
      spaceId: string;
      name: string;
      updates?: Updates;
      events: SpaceEvent[];
      inboxes?: SpaceInboxStorageEntry[];
      spaceState: SpaceState;
      keys: {
        id: string;
        key: string;
      }[];
    }
  | {
      type: 'setAuth';
      identity: PrivateAppIdentity;
    }
  | {
      type: 'resetAuth';
    }
  | {
      type: 'setRepo';
      repo: Repo;
    };

type GenericEventObject = { type: string };

export const store: Store<StoreContext, StoreEvent, GenericEventObject> = createStore({
  context: initialStoreContext,
  on: {
    setInvitations: (context, event: { invitations: Invitation[] }) => {
      return {
        ...context,
        invitations: event.invitations,
      };
    },
    setMapping: (context, event: { mapping: Mapping }) => {
      return {
        ...context,
        mapping: event.mapping,
      };
    },
    reset: (context) => {
      // once the repo is initialized, there is no need to reset it
      return { ...initialStoreContext, repo: context.repo, mapping: context.mapping };
    },
    addUpdateInFlight: (context, event: { updateId: string }) => {
      return {
        ...context,
        updatesInFlight: [...context.updatesInFlight, event.updateId],
      };
    },
    removeUpdateInFlight: (context, event: { updateId: string }) => {
      return {
        ...context,
        updatesInFlight: context.updatesInFlight.filter((id) => id !== event.updateId),
      };
    },
    setSpacesList: (context, event: { spaces: { id: string; name: string }[] }) => {
      if (!context.repo) {
        return context;
      }

      let storeContext: StoreContext = { ...context, spacesLoadingIsPending: false };

      for (const space of event.spaces) {
        const existingSpace = context.spaces.find((s) => s.id === space.id);
        const lastUpdateClock = context.lastUpdateClock[space.id] ?? -1;
        const result = context.repo.findWithProgress<DocumentContent>(idToAutomergeId(space.id) as AnyDocumentId);

        // set it to ready to interact with the document
        result.handle.doneLoading();

        if (existingSpace) {
          storeContext = {
            ...storeContext,
            spaces: storeContext.spaces.map((existingSpace) => {
              if (existingSpace.id === space.id) {
                const newSpace: SpaceStorageEntry = {
                  id: existingSpace.id,
                  name: existingSpace.name,
                  events: existingSpace.events ?? [],
                  state: existingSpace.state,
                  keys: existingSpace.keys ?? [],
                  automergeDocHandle: result.handle,
                  inboxes: existingSpace.inboxes ?? [],
                };
                return newSpace;
              }
              return existingSpace;
            }),
            lastUpdateClock: {
              ...storeContext.lastUpdateClock,
              [space.id]: lastUpdateClock,
            },
          };
        } else {
          storeContext = {
            ...storeContext,
            spaces: [
              ...storeContext.spaces,
              {
                id: space.id,
                name: space.name,
                events: [],
                state: undefined,
                keys: [],
                inboxes: [],
                automergeDocHandle: result.handle,
              },
            ],
            lastUpdateClock: {
              ...storeContext.lastUpdateClock,
              [space.id]: -1,
            },
          };
        }
      }

      return storeContext;
    },
    applyEvent: (context, event: { spaceId: string; event: SpaceEvent; state: SpaceState }) => {
      return {
        ...context,
        spaces: context.spaces.map((space) => {
          if (space.id === event.spaceId) {
            return { ...space, events: [...space.events, event.event], state: event.state };
          }
          return space;
        }),
      };
    },
    updateConfirmed: (context, event: { spaceId: string; clock: number }) => {
      return {
        ...context,
        lastUpdateClock: {
          ...context.lastUpdateClock,
          [event.spaceId]: event.clock,
        },
      };
    },
    applyUpdate: (context, event: { spaceId: string; firstUpdateClock: number; lastUpdateClock: number }) => {
      const lastUpdateClock = context.lastUpdateClock[event.spaceId] ?? -1;
      if (event.firstUpdateClock === lastUpdateClock + 1) {
        return {
          ...context,
          lastUpdateClock: {
            ...context.lastUpdateClock,
            [event.spaceId]: event.lastUpdateClock,
          },
        };
      }

      // TODO else case: request missing updates from server
      return context;
    },
    addVerifiedIdentity: (
      context,
      event: {
        accountAddress: string;
        encryptionPublicKey: string;
        signaturePublicKey: string;
        accountProof: string;
        keyProof: string;
      },
    ) => {
      return {
        ...context,
        identities: {
          ...context.identities,
          [event.accountAddress]: {
            encryptionPublicKey: event.encryptionPublicKey,
            signaturePublicKey: event.signaturePublicKey,
            accountProof: event.accountProof,
            keyProof: event.keyProof,
          },
        },
      };
    },
    setSpaceInbox: (context, event: { spaceId: string; inbox: SpaceInboxStorageEntry }) => {
      return {
        ...context,
        spaces: context.spaces.map((space) => {
          if (space.id === event.spaceId) {
            const existingInbox = space.inboxes.find((inbox) => inbox.inboxId === event.inbox.inboxId);
            if (existingInbox) {
              return {
                ...space,
                inboxes: space.inboxes.map((inbox) => {
                  if (inbox.inboxId === event.inbox.inboxId) {
                    const { messages, seenMessageIds } = mergeMessages(
                      existingInbox.messages,
                      existingInbox.seenMessageIds,
                      event.inbox.messages,
                    );
                    return {
                      ...event.inbox,
                      messages,
                      seenMessageIds,
                    };
                  }
                  return inbox;
                }),
              };
            }
            return { ...space, inboxes: [...space.inboxes, event.inbox] };
          }
          return space;
        }),
      };
    },
    setSpaceInboxMessages: (
      context,
      event: { spaceId: string; inboxId: string; messages: InboxMessageStorageEntry[]; lastMessageClock: string },
    ) => {
      return {
        ...context,
        spaces: context.spaces.map((space) => {
          if (space.id === event.spaceId) {
            return {
              ...space,
              inboxes: space.inboxes.map((inbox) => {
                if (inbox.inboxId === event.inboxId) {
                  const { messages, seenMessageIds } = mergeMessages(
                    inbox.messages,
                    inbox.seenMessageIds,
                    event.messages,
                  );
                  return {
                    ...inbox,
                    messages,
                    seenMessageIds,
                    lastMessageClock: new Date(
                      Math.max(new Date(inbox.lastMessageClock).getTime(), new Date(event.lastMessageClock).getTime()),
                    ).toISOString(),
                  };
                }
                return inbox;
              }),
            };
          }
          return space;
        }),
      };
    },
    setAccountInbox: (context, event: { inbox: AccountInboxStorageEntry }) => {
      const existingInbox = context.accountInboxes.find((inbox) => inbox.inboxId === event.inbox.inboxId);
      if (existingInbox) {
        return {
          ...context,
          accountInboxes: context.accountInboxes.map((inbox) => {
            if (inbox.inboxId === event.inbox.inboxId) {
              const { messages, seenMessageIds } = mergeMessages(
                existingInbox.messages,
                existingInbox.seenMessageIds,
                event.inbox.messages,
              );
              return {
                ...event.inbox,
                messages,
                seenMessageIds,
              };
            }
            return inbox;
          }),
        };
      }
      return {
        ...context,
        accountInboxes: [...context.accountInboxes, event.inbox],
      };
    },
    setAccountInboxMessages: (
      context,
      event: { inboxId: string; messages: InboxMessageStorageEntry[]; lastMessageClock: string },
    ) => {
      return {
        ...context,
        accountInboxes: context.accountInboxes.map((inbox) => {
          if (inbox.inboxId === event.inboxId) {
            const { messages, seenMessageIds } = mergeMessages(inbox.messages, inbox.seenMessageIds, event.messages);
            return {
              ...inbox,
              messages,
              seenMessageIds,
              lastMessageClock: new Date(
                Math.max(new Date(inbox.lastMessageClock).getTime(), new Date(event.lastMessageClock).getTime()),
              ).toISOString(),
            };
          }
          return inbox;
        }),
      };
    },
    setSpace: (
      context,
      event: {
        spaceId: string;
        name: string;
        updates?: Updates;
        inboxes?: SpaceInboxStorageEntry[];
        events: SpaceEvent[];
        spaceState: SpaceState;
        keys: {
          id: string;
          key: string;
        }[];
      },
    ) => {
      const existingSpace = context.spaces.find((s) => s.id === event.spaceId);
      if (!existingSpace && context.repo) {
        const result = context.repo.findWithProgress<DocumentContent>(idToAutomergeId(event.spaceId) as AnyDocumentId);
        // set it to ready to interact with the document
        result.handle.doneLoading();

        const newSpace: SpaceStorageEntry = {
          name: event.name,
          id: event.spaceId,
          events: event.events,
          state: event.spaceState,
          keys: event.keys,
          automergeDocHandle: result.handle,
          inboxes: event.inboxes ?? [],
        };
        return {
          ...context,
          spaces: [...context.spaces, newSpace],
          lastUpdateClock: {
            ...context.lastUpdateClock,
            [event.spaceId]: -1,
          },
        };
      }

      let lastUpdateClock = context.lastUpdateClock[event.spaceId] ?? -1;
      if (event.updates?.firstUpdateClock === lastUpdateClock + 1) {
        lastUpdateClock = event.updates.lastUpdateClock;
      } else {
        // TODO request missing updates from server
      }

      return {
        ...context,
        spaces: context.spaces.map((space) => {
          if (space.id === event.spaceId) {
            // Merge inboxes: keep existing ones and add new ones
            const mergedInboxes = [...space.inboxes];
            for (const newInbox of event.inboxes ?? []) {
              const existingInboxIndex = mergedInboxes.findIndex((inbox) => inbox.inboxId === newInbox.inboxId);
              if (existingInboxIndex === -1) {
                // Only add if it's a new inbox
                mergedInboxes.push(newInbox);
              }
            }

            return {
              ...space,
              events: event.events,
              state: event.spaceState,
              keys: event.keys,
              inboxes: mergedInboxes,
            };
          }
          return space;
        }),
        lastUpdateClock: {
          ...context.lastUpdateClock,
          [event.spaceId]: lastUpdateClock,
        },
      };
    },
    setAuth: (context, event: { identity: PrivateAppIdentity }) => {
      return {
        ...context,
        authenticated: true,
        // TODO: remove hard-coded account address and use the one from the identity
        identity: { ...event.identity },
      };
    },
    resetAuth: (context) => {
      return {
        ...context,
        identity: null,
        authenticated: false,
      };
    },
    setRepo: (context, event: { repo: Repo }) => {
      return {
        ...context,
        repo: event.repo,
      };
    },
  },
});
