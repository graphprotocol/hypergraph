import type { SpaceState } from '@graphprotocol/graph-framework';

export function DebugSpaceState(props: { state: SpaceState | undefined }) {
  return (
    <div className="text-xs">
      <pre>{JSON.stringify(props, null, 2)}</pre>
    </div>
  );
}
