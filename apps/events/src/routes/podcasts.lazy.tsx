import { useEntities, useEntity, usePublicSpaces } from '@graphprotocol/hypergraph-react';
import { createLazyFileRoute } from '@tanstack/react-router';
import { Person, Podcast, Topic } from '@/schema';

export const Route = createLazyFileRoute('/podcasts')({
  component: RouteComponent,
});

function RouteComponent() {
  const space = 'e252f9e1-d3ad-4460-8bf1-54f93b02f220';

  // useEffect(() => {
  //   setTimeout(async () => {
  //     const result = await Entity.searchManyPublic(Podcast, {
  //       query: 'Joe',
  //       space: space,
  //       // include: {
  //       //   listenOn: {},
  //       // },
  //     });
  //     console.log('searchManyPublic result:', result);
  //   }, 1000);
  // }, []);

  const {
    data: person,
    invalidEntity: personInvalidEntity,
    invalidRelationEntities: personInvalidRelationEntities,
  } = useEntity(Person, {
    id: '9800a4e8-8437-4310-9af6-ac91644f7c26',
    mode: 'public',
    space: '95a4a1cc-bfcc-4038-b7a1-02c513d27700',
    include: {
      skills: {
        _config: {
          relationSpaces: ['95a4a1cc-bfcc-4038-b7a1-02c513d27700'],
          valueSpaces: ['021265e2-d839-47c3-8d03-0ee3dfb29ffc', '95a4a1cc-bfcc-4038-b7a1-02c513d27700'],
        },
      },
      skillsTotalCount: true,
    },
    includeSpaceIds: true,
  });
  console.log({ person, personInvalidEntity, personInvalidRelationEntities });
  if (person) {
    console.log('person', person.skillsTotalCount);
  }

  const {
    data: podcast,
    invalidEntity,
    invalidRelationEntities,
  } = useEntity(Podcast, {
    id: 'f5d27d3e-3a51-452d-bac2-702574381633',
    mode: 'public',
    space: space,
    include: {
      listenOn: {},
      hosts: {
        avatar: {},
      },
      episodes: {},
    },
  });
  console.log({ podcast, invalidEntity, invalidRelationEntities });

  const { data, isLoading, isError } = useEntities(Podcast, {
    mode: 'public',
    first: 10,
    space: space,
    include: {
      listenOn: {},
      hosts: {
        avatar: {},
        avatarTotalCount: true,
      },
      hostsTotalCount: true,
      episodes: {},
      episodesTotalCount: true,
    },
    orderBy: { property: 'dateFounded', direction: 'asc' },
  });

  console.log({ data, isLoading, isError });

  const { data: topics } = useEntities(Topic, {
    mode: 'public',
    first: 10,
    space: space,
    filter: {
      cover: {
        exists: true,
      },
      or: [
        { id: { is: '01d162e2-6d64-4acb-b0a6-be94169b8746' } },
        { id: { is: '0cd77106-5e1e-4784-96da-e4d191861081' } },
      ],
    },
    include: {
      cover: {},
    },
  });

  console.log({ topics });

  const { data: spaces } = usePublicSpaces({
    filter: { memberAccountAddress: '0xE86b4a182779ae6320cA04ad43Fe6a1bed051e24' },
  });
  console.log('spaces', spaces);

  return (
    <>
      <h1>Podcasts</h1>
      {isLoading && <div>Loading...</div>}
      {isError && <div>Error</div>}
      {data?.map((podcast) => (
        <div key={podcast.id}>
          <h2>
            {podcast.dateFounded.toISOString()} {podcast.name} - {podcast.id}
          </h2>
          {podcast.listenOn.map((listenOn) => (
            <div key={listenOn._relation.id}>
              <h3>- {listenOn.name}</h3>
              <div>--{listenOn._relation.website}</div>
            </div>
          ))}
          <div>Total hosts: {podcast.hostsTotalCount ?? 0}</div>
          <div>Total episodes: {podcast.episodesTotalCount ?? 0}</div>
        </div>
      ))}
    </>
  );
}
