import type { AnyDocumentId, DocHandle } from '@automerge/automerge-repo';
import { Repo } from '@automerge/automerge-repo';
import { type Store, createStore } from '@xstate/store';
import type { Address } from 'viem';
import type { Identity } from './index.js';
import type { Invitation, Updates } from './messages/index.js';
import type { SpaceEvent, SpaceState } from './space-events/index.js';
import { idToAutomergeId } from './utils/automergeId.js';

export type SpaceStorageEntry = {
  id: string;
  events: SpaceEvent[];
  state: SpaceState | undefined;
  keys: { id: string; key: string }[];
  automergeDocHandle: DocHandle<unknown> | undefined;
};

interface StoreContext {
  spaces: SpaceStorageEntry[];
  updatesInFlight: string[];
  invitations: Invitation[];
  repo: Repo;
  identities: {
    [accountId: string]: {
      encryptionPublicKey: string;
      signaturePublicKey: string;
      accountProof: string;
      keyProof: string;
    };
  };
  authenticated: boolean;
  accountId: Address | null;
  sessionToken: string | null;
  keys: Identity.IdentityKeys | null;
  lastUpdateClock: { [spaceId: string]: number };
}

const initialStoreContext: StoreContext = {
  spaces: [],
  updatesInFlight: [],
  invitations: [],
  repo: new Repo({}),
  identities: {},
  authenticated: false,
  accountId: null,
  sessionToken: null,
  keys: null,
  lastUpdateClock: {},
};

type StoreEvent =
  | { type: 'setInvitations'; invitations: Invitation[] }
  | { type: 'reset' }
  | { type: 'addUpdateInFlight'; updateId: string }
  | { type: 'removeUpdateInFlight'; updateId: string }
  | { type: 'setSpaceFromList'; spaceId: string }
  | { type: 'applyEvent'; spaceId: string; event: SpaceEvent; state: SpaceState }
  | { type: 'updateConfirmed'; spaceId: string; clock: number }
  | { type: 'applyUpdate'; spaceId: string; firstUpdateClock: number; lastUpdateClock: number }
  | {
      type: 'addVerifiedIdentity';
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
    }
  | {
      type: 'setAuth';
      accountId: Address;
      sessionToken: string;
      keys: Identity.IdentityKeys;
    }
  | {
      type: 'resetAuth';
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
    reset: () => {
      return initialStoreContext;
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
    setSpaceFromList: (context, event: { spaceId: string }) => {
      const existingSpace = context.spaces.find((s) => s.id === event.spaceId);
      const lastUpdateClock = context.lastUpdateClock[event.spaceId] ?? -1;
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
                automergeDocHandle,
              };
              return newSpace;
            }
            return existingSpace;
          }),
          lastUpdateClock: {
            ...context.lastUpdateClock,
            [event.spaceId]: lastUpdateClock,
          },
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
        accountId: string;
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
          keys: event.keys,
          automergeDocHandle,
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
            return {
              ...space,
              events: event.events,
              state: event.spaceState,
              keys: event.keys,
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
    setAuth: (context, event: { accountId: Address; sessionToken: string; keys: Identity.IdentityKeys }) => {
      return {
        ...context,
        authenticated: true,
        accountId: event.accountId,
        sessionToken: event.sessionToken,
        keys: event.keys,
      };
    },
    resetAuth: (context) => {
      return {
        ...context,
        authenticated: false,
        accountId: null,
        sessionToken: null,
        keys: null,
      };
    },
  },
});
