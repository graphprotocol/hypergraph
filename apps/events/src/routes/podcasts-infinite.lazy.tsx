import { useEntitiesPublicInfinite } from '@graphprotocol/hypergraph-react';
import { createLazyFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';
import { Podcast } from '@/schema';

export const Route = createLazyFileRoute('/podcasts-infinite')({
  component: RouteComponent,
});

function RouteComponent() {
  const space = 'e252f9e1-d3ad-4460-8bf1-54f93b02f220';

  const { data, isLoading, isError, fetchNextPage } = useEntitiesPublicInfinite(Podcast, {
    first: 2,
    offset: 0,
    space: space,
    include: {
      listenOn: {},
    },
  });

  useEffect(() => {
    setTimeout(() => {
      fetchNextPage();
      setTimeout(() => {
        fetchNextPage();
      }, 1000);
    }, 1000);
  }, [fetchNextPage]);
  console.log({ data, isLoading, isError });

  return (
    <>
      <h1>Podcasts</h1>
      {isLoading && <div>Loading...</div>}
      {isError && <div>Error</div>}
      {data?.pages.map((page) => {
        return page.data.map((podcast) => (
          <div key={podcast.id}>
            <h2>{podcast.name}</h2>
            <hr />
          </div>
        ));
      })}
      {/* <pre className="text-xs">{JSON.stringify(data, null, 2)}</pre> */}
    </>
  );
}
