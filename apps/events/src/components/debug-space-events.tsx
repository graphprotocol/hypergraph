import type { SpaceEvent } from '@graphprotocol/graph-framework';

export function DebugSpaceEvents({ events }: { events: SpaceEvent[] }) {
  return (
    <ul className="text-xs">
      {events.map((event) => {
        return (
          <li key={event.transaction.id} className="border border-gray-300">
            <pre>{JSON.stringify(event, null, 2)}</pre>
          </li>
        );
      })}
    </ul>
  );
}
