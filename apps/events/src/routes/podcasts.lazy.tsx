import { Entity } from '@graphprotocol/hypergraph';
import { useEntities } from '@graphprotocol/hypergraph-react';
import { createLazyFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';
import { Podcast } from '@/schema';

export const Route = createLazyFileRoute('/podcasts')({
  component: RouteComponent,
});

function RouteComponent() {
  const space = 'e252f9e1-d3ad-4460-8bf1-54f93b02f220';

  useEffect(() => {
    setTimeout(async () => {
      const result = await Entity.findOnePublic(Podcast, {
        id: 'f5d27d3e-3a51-452d-bac2-702574381633',
        space: space,
        include: {
          listenOn: {},
        },
      });
      console.log('findOnePublic result:', result);
    }, 1000);
  }, []);

  const { data, isLoading, isError } = useEntities(Podcast, {
    mode: 'public',
    first: 100,
    space: space,
    include: {
      listenOn: {},
    },
    orderBy: { property: 'dateFounded', direction: 'asc' },
    backlinksTotalCountsTypeId1: '972d201a-d780-4568-9e01-543f67b26bee',
  });
  console.log({ data, isLoading, isError });
  return (
    <>
      <h1>Podcasts</h1>
      {isLoading && <div>Loading...</div>}
      {isError && <div>Error</div>}
      {data?.map((podcast) => (
        <div key={podcast.id}>
          <h2>
            {podcast.backlinksTotalCountsTypeId1} - {podcast.dateFounded.toISOString()} {podcast.name} - {podcast.id}
          </h2>
          {podcast.listenOn.map((listenOn) => (
            <div key={listenOn._relation.id}>
              <h3>- {listenOn.name}</h3>
              <div>--{listenOn._relation.website}</div>
            </div>
          ))}
        </div>
      ))}
    </>
  );
}
