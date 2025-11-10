import { Podcast } from '@/schema';
import { useEntities } from '@graphprotocol/hypergraph-react';
import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/podcasts')({
  component: RouteComponent,
});

function RouteComponent() {
  const space = '530a70d9-d5ee-410a-850a-cf70e4be2ee5';

  const { data, isLoading, isError } = useEntities(Podcast, {
    mode: 'public',
    first: 100,
    space: space,
    include: {
      projects: {},
    },
  });
  console.log({ data, isLoading, isError });
  return (
    <>
      <h1>Podcasts</h1>
      {isLoading && <div>Loading...</div>}
      {isError && <div>Error</div>}
      {data?.map((podcast) => (
        <div key={podcast.id}>
          <h2>{podcast.name}</h2>
          {podcast.projects.map((project) => (
            <div key={project._relation.id}>
              <h3>- {project.name}</h3>
              <div>--{project._relation.website}</div>
            </div>
          ))}
        </div>
      ))}
      <pre className="text-xs">{JSON.stringify(data, null, 2)}</pre>
    </>
  );
}
