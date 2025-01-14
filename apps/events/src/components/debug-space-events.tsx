import type { SpaceEvents } from '@graphprotocol/hypergraph';

export function DebugSpaceEvents({ events }: { events: SpaceEvents.SpaceEvent[] }) {
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
