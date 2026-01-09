import { useEntities, useEntity, usePublicSpaces } from '@graphprotocol/hypergraph-react';
import { createLazyFileRoute } from '@tanstack/react-router';
import { Person, PersonHostTest, Podcast, Topic } from '@/schema';

export const Route = createLazyFileRoute('/podcasts')({
  component: RouteComponent,
});

function RouteComponent() {
  const space = 'e252f9e1d3ad44608bf154f93b02f220';

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
    id: '9800a4e8843743109af6ac91644f7c26',
    mode: 'public',
    space: '95a4a1ccbfcc4038b7a102c513d27700',
    include: {
      skills: {
        _config: {
          relationSpaces: ['95a4a1ccbfcc4038b7a102c513d27700'],
          valueSpaces: ['021265e2d83947c38d030ee3dfb29ffc', '95a4a1ccbfcc4038b7a102c513d27700'],
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
    id: 'f5d27d3e3a51452dbac2702574381633',
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

  const { data: personHostTest } = useEntities(PersonHostTest, {
    mode: 'public',
    first: 10,
    filter: {
      name: {
        startsWith: 'Joe',
      },
    },
    space: space,
    include: {
      hostedPodcasts: {},
      hostedEpisodes: {},
    },
  });
  console.log({ personHostTest });

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
      or: [{ id: { is: '01d162e26d644acbb0a6be94169b8746' } }, { id: { is: '0cd771065e1e478496dae4d191861081' } }],
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
