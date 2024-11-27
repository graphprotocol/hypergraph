import { createStore } from '@xstate/store';
import type { SpaceEvent, SpaceState, Updates } from 'graph-framework';
import type { SpaceStorageEntry } from '../types';

interface StoreContext {
  spaces: SpaceStorageEntry[];
  updatesInFlight: string[];
}

const initialStoreContext: StoreContext = {
  spaces: [],
  updatesInFlight: [],
};

export const store = createStore({
  context: initialStoreContext,
  on: {
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
                updates: existingSpace.updates ?? [],
                lastUpdateClock: existingSpace.lastUpdateClock ?? -1,
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
        const newSpace: SpaceStorageEntry = {
          id: event.spaceId,
          events: event.events,
          state: event.spaceState,
          lastUpdateClock: -1,
          keys: event.keys,
          updates: [],
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
