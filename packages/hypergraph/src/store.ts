import type { AnyDocumentId, DocHandle } from '@automerge/automerge-repo';
import { Repo } from '@automerge/automerge-repo';
import { type Store, createStore } from '@xstate/store';

import type { Invitation, Updates } from './messages/types.js';
import type { SpaceEvent, SpaceState } from './space-events/types.js';
import { idToAutomergeId } from './utils/automergeId.js';

export type SpaceStorageEntry = {
  id: string;
  events: SpaceEvent[];
  state: SpaceState | undefined;
  keys: { id: string; key: string }[];
  lastUpdateClock: number;
  automergeDocHandle: DocHandle<unknown> | undefined;
};

interface StoreContext {
  spaces: SpaceStorageEntry[];
  updatesInFlight: string[];
  invitations: Invitation[];
  encryptionPrivateKey: string;
  repo: Repo;
  userIdentities: {
    [accountId: string]: {
      encryptionPublicKey: string;
      signaturePublicKey: string;
      accountProof: string;
      keyProof: string;
    };
  };
}

const initialStoreContext: StoreContext = {
  spaces: [],
  updatesInFlight: [],
  invitations: [],
  encryptionPrivateKey: '',
  repo: new Repo({}),
  userIdentities: {},
};

type StoreEvent =
  | { type: 'setInvitations'; invitations: Invitation[] }
  | { type: 'setEncryptionPrivateKey'; encryptionPrivateKey: string }
  | { type: 'reset' }
  | { type: 'addUpdateInFlight'; ephemeralId: string }
  | { type: 'removeUpdateInFlight'; ephemeralId: string }
  | { type: 'setSpaceFromList'; spaceId: string }
  | { type: 'applyEvent'; spaceId: string; event: SpaceEvent; state: SpaceState }
  | { type: 'updateConfirmed'; spaceId: string; clock: number }
  | { type: 'applyUpdate'; spaceId: string; firstUpdateClock: number; lastUpdateClock: number }
  | {
      type: 'addUserIdentity';
      accountId: string;
      encryptionPublicKey: string;
      signaturePublicKey: string;
      accountProof: string;
      keyProof: string;
    }
  | {
      type: 'setSpace';
      spaceId: string;
      updates?: Updates;
      events: SpaceEvent[];
      spaceState: SpaceState;
      keys: {
        id: string;
        key: string;
      }[];
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
    setEncryptionPrivateKey: (context, event: { encryptionPrivateKey: string }) => {
      return {
        ...context,
        encryptionPrivateKey: event.encryptionPrivateKey,
      };
    },
    reset: () => {
      return initialStoreContext;
    },
    addUpdateInFlight: (context, event: { ephemeralId: string }) => {
      return {
        ...context,
        updatesInFlight: [...context.updatesInFlight, event.ephemeralId],
      };
    },
    removeUpdateInFlight: (context, event: { ephemeralId: string }) => {
      return {
        ...context,
        updatesInFlight: context.updatesInFlight.filter((id) => id !== event.ephemeralId),
      };
    },
    setSpaceFromList: (context, event: { spaceId: string }) => {
      const existingSpace = context.spaces.find((s) => s.id === event.spaceId);
      const automergeDocHandle = context.repo.find(idToAutomergeId(event.spaceId) as AnyDocumentId);

      // set it to ready to interact with the document
      automergeDocHandle.doneLoading();

      if (existingSpace) {
        return {
          ...context,
          spaces: context.spaces.map((existingSpace) => {
            if (existingSpace.id === event.spaceId) {
              const newSpace: SpaceStorageEntry = {
                id: existingSpace.id,
                events: existingSpace.events ?? [],
                state: existingSpace.state,
                keys: existingSpace.keys ?? [],
                lastUpdateClock: existingSpace.lastUpdateClock ?? -1,
                automergeDocHandle,
              };
              return newSpace;
            }
            return existingSpace;
          }),
        };
      }
      return {
        ...context,
        spaces: [
          ...context.spaces,
          {
            id: event.spaceId,
            events: [],
            state: undefined,
            keys: [],
            updates: [],
            lastUpdateClock: -1,
            automergeDocHandle,
          },
        ],
      };
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
        spaces: context.spaces.map((space) => {
          if (space.id === event.spaceId && space.lastUpdateClock + 1 === event.clock) {
            return { ...space, lastUpdateClock: event.clock };
          }
          return space;
        }),
      };
    },
    applyUpdate: (context, event: { spaceId: string; firstUpdateClock: number; lastUpdateClock: number }) => {
      return {
        ...context,
        spaces: context.spaces.map((space) => {
          if (space.id === event.spaceId) {
            let lastUpdateClock = space.lastUpdateClock;
            if (event.firstUpdateClock === space.lastUpdateClock + 1) {
              lastUpdateClock = event.lastUpdateClock;
            } else {
              // TODO request missing updates from server
            }

            return { ...space, lastUpdateClock };
          }
          return space;
        }),
      };
    },
    addUserIdentity: (
      context,
      event: {
        accountId: string;
        encryptionPublicKey: string;
        signaturePublicKey: string;
        accountProof: string;
        keyProof: string;
      },
    ) => {
      return {
        ...context,
        userIdentities: {
          ...context.userIdentities,
          [event.accountId]: {
            encryptionPublicKey: event.encryptionPublicKey,
            signaturePublicKey: event.signaturePublicKey,
            accountProof: event.accountProof,
            keyProof: event.keyProof,
          },
        },
      };
    },
    setSpace: (
      context,
      event: {
        spaceId: string;
        updates?: Updates;
        events: SpaceEvent[];
        spaceState: SpaceState;
        keys: {
          id: string;
          key: string;
        }[];
      },
    ) => {
      const existingSpace = context.spaces.find((s) => s.id === event.spaceId);
      if (!existingSpace) {
        const automergeDocHandle = context.repo.find(idToAutomergeId(event.spaceId) as AnyDocumentId);
        // set it to ready to interact with the document
        automergeDocHandle.doneLoading();

        const newSpace: SpaceStorageEntry = {
          id: event.spaceId,
          events: event.events,
          state: event.spaceState,
          lastUpdateClock: -1,
          keys: event.keys,
          automergeDocHandle,
        };
        return {
          ...context,
          spaces: [...context.spaces, newSpace],
        };
      }

      return {
        ...context,
        spaces: context.spaces.map((space) => {
          if (space.id === event.spaceId) {
            let lastUpdateClock = space.lastUpdateClock;

            if (event.updates?.firstUpdateClock === lastUpdateClock + 1) {
              lastUpdateClock = event.updates.lastUpdateClock;
            } else {
              // TODO request missing updates from server
            }

            return {
              ...space,
              events: event.events,
              state: event.spaceState,
              lastUpdateClock,
              keys: event.keys,
            };
          }
          return space;
        }),
      };
    },
  },
});
