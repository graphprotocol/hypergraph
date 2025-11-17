import { useEntities } from '@graphprotocol/hypergraph-react';
import { createLazyFileRoute } from '@tanstack/react-router';
import { Podcast } from '@/schema';

export const Route = createLazyFileRoute('/podcasts')({
  component: RouteComponent,
});

function RouteComponent() {
  const space = 'e252f9e1-d3ad-4460-8bf1-54f93b02f220';

  const { data, isLoading, isError } = useEntities(Podcast, {
    mode: 'public',
    first: 100,
    space: space,
    include: {
      projects: {},
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
            {podcast.backlinksTotalCountsTypeId1} - {podcast.dateFounded.toISOString()} {podcast.name}
          </h2>
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
