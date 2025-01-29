import { store } from '@graphprotocol/hypergraph';
import { useHypergraphApp } from '@graphprotocol/hypergraph-react';
import { useSelector } from '@xstate/store/react';
import { useEffect, useState } from 'react';

import { Button } from './ui/button';

export function DevTool({ spaceId }: { spaceId: string }) {
  const [isOpen, setIsOpen] = useState(false);

  const spaces = useSelector(store, (state) => state.context.spaces);
  const updatesInFlight = useSelector(store, (state) => state.context.updatesInFlight);
  const { subscribeToSpace, loading } = useHypergraphApp();

  useEffect(() => {
    if (!loading) {
      subscribeToSpace({ spaceId });
    }
  }, [loading, subscribeToSpace, spaceId]);

  const space = spaces.find((space) => space.id === spaceId);

  return (
    <>
      <div className="flex flex-row gap-2">
        <Button
          onClick={(event) => {
            event.preventDefault();
            setIsOpen(!isOpen);
          }}
        >
          Hypergraph DevTool
        </Button>
      </div>
      {isOpen && !space && <div>Space not found</div>}
      {isOpen && space && (
        <>
          <h3>Space id: {space.id}</h3>
          <p>Keys:</p>
          <pre className="text-xs">{JSON.stringify(space.keys)}</pre>
          <br />
          <h3>Last update clock: {space.lastUpdateClock}</h3>
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
          <div className="text-xs">
            <pre>{JSON.stringify(space.state, null, 2)}</pre>
          </div>
          <hr />
          <h3>Events</h3>
          <ul className="text-xs">
            {space.events.map((event) => {
              return (
                <li key={event.transaction.id} className="border border-gray-300">
                  <pre>{JSON.stringify(event, null, 2)}</pre>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </>
  );
}
