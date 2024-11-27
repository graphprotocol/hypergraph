import type { SpaceEvent, SpaceState } from 'graph-framework';

export type SpaceStorageEntry = {
  id: string;
  events: SpaceEvent[];
  state: SpaceState | undefined;
  keys: { id: string; key: string }[];
  updates: Uint8Array[];
  lastUpdateClock: number;
};
