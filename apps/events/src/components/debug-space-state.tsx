import type { SpaceEvents } from '@graphprotocol/hypergraph';

export function DebugSpaceState(props: { state: SpaceEvents.SpaceState | undefined }) {
  return (
    <div className="text-xs">
      <pre>{JSON.stringify(props, null, 2)}</pre>
    </div>
  );
}
