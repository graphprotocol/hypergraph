import { useEntities } from '@graphprotocol/hypergraph-react';
import { Project } from '../schema';

export const Projects = ({ spaceId }: { spaceId: string }) => {
  const { data, isLoading, isError } = useEntities(Project, {
    mode: 'public',
    // include: {
    //   sponsors: {
    //     jobOffers: {},
    //   },
    // },
    // filter: {
    //   or: [{ name: { startsWith: 'test' } }, { name: { startsWith: 'ETH' } }],
    // },
    first: 100,
    space: spaceId,
  });
  console.log({ isLoading, isError, data });

  return (
    <div>
      <h2 className="text-lg font-bold">Projects</h2>
      {isLoading && <div>Loading...</div>}
      {isError && <div>Error</div>}
      {data?.map((project) => (
        <div key={project.id}>
          <h2>{project.name}</h2>
          <pre className="text-xs">{JSON.stringify(project, null, 2)}</pre>
        </div>
      ))}
    </div>
  );
};
