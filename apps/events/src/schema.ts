import { ContentIds, SystemIds } from '@geoprotocol/geo-sdk';
import { Entity, Id, Type } from '@graphprotocol/hypergraph';

export const User = Entity.Schema(
  { name: Type.String },
  {
    types: [Id('bffa181ea333495b949c57f2831d7eca')],
    properties: {
      name: Id('a126ca530c8e48d5b88882c734c38935'),
    },
  },
);

export const Todo = Entity.Schema(
  {
    name: Type.String,
    completed: Type.Boolean,
    assignees: Type.Relation(User),
  },
  {
    types: [Id('44fe82a9e4c24330a395ce85ed78e421')],
    properties: {
      name: Id('c668aa67bbca4b2c908c9c5599035eab'),
      completed: Id('71e7654f2623479488fb841c8f3dd9b4'),
      assignees: Id('5b80d3ee24634246b62844ba808ab3e1'),
    },
  },
);

export const Todo2 = Entity.Schema(
  {
    name: Type.String,
    checked: Type.Boolean,
    assignees: Type.Relation(User),
    due: Type.Date,
    amount: Type.Number,
    point: Type.Point,
    website: Type.String,
  },
  {
    types: [Id('210f4e94234c49d7af0ff3b74fb07650')],
    properties: {
      name: Id('e291f4da632d4b70aca85c6c01dbf1ca'),
      checked: Id('d1cc82ef8bde45f4b31c56b6d59279ec'),
      assignees: Id('1115e9f8db2e41df8969c5d34c367c10'),
      due: Id('6a28f275b31c47bc83cdad416aaa7073'),
      amount: Id('0c8219bee2844738bd9591a1c113c78e'),
      point: Id('7f032477c60e4c85a161019b70db05ca'),
      website: Id('75b6a6475c2b41e792c0b0a0c9b28b02'),
    },
  },
);

export const JobOffer = Entity.Schema(
  {
    name: Type.String,
    salary: Type.Number,
  },
  {
    types: [Id('a4c1b288756e477baab2007decf01c61')],
    properties: {
      name: Id('a126ca530c8e48d5b88882c734c38935'),
      salary: Id('86ff5361b8204ba8b689b48e815e07d2'),
    },
  },
);

export const Company = Entity.Schema(
  {
    name: Type.String,
    jobOffers: Type.Relation(JobOffer),
  },
  {
    types: [Id('bcf56f59c53247d5a0052d802f512c85')],
    properties: {
      name: Id('a126ca530c8e48d5b88882c734c38935'),
      jobOffers: Id('54190b301c68499c9ed85c6190810e31'),
    },
  },
);

export const Event = Entity.Schema(
  {
    name: Type.String,
    description: Type.optional(Type.String),
    sponsors: Type.Relation(Company),
  },
  {
    types: [Id('239bc639938e427cbebbd562d82ae272')],
    properties: {
      name: Id('a126ca530c8e48d5b88882c734c38935'),
      description: Id('9b1f76ff9711404c861e59dc3fa7d037'),
      sponsors: Id('926b00ee68b54462a27f3806af705118'),
    },
  },
);

export const Image = Entity.Schema(
  {
    url: Type.String,
  },
  {
    types: [Id('ba4e41460010499da0a3caaa7f579d0e')],
    properties: {
      url: Id('8a743832c0944a62b6650c3cc2f9c7bc'),
    },
  },
);

export const Project = Entity.Schema(
  {
    name: Type.String,
  },
  {
    types: [Id('484a18c5030a499cb0f2ef588ff16d50')], // Project type
    properties: {
      name: Id('a126ca530c8e48d5b88882c734c38935'),
    },
  },
);

export const Skill = Entity.Schema(
  {
    name: Type.String,
  },
  {
    types: [ContentIds.SKILL_TYPE],
    properties: {
      name: SystemIds.NAME_PROPERTY,
    },
  },
);

export const Person = Entity.Schema(
  {
    name: Type.String,
    description: Type.optional(Type.String),
    avatar: Type.Relation(Image),
    skills: Type.Relation(Skill),
  },
  {
    types: [Id('7ed45f2bc48b419e8e4664d5ff680b0d')],
    properties: {
      name: Id('a126ca530c8e48d5b88882c734c38935'),
      description: Id('9b1f76ff9711404c861e59dc3fa7d037'),
      avatar: Id('1155befffad549b7a2e0da4777b8792c'),
      skills: Id(ContentIds.SKILLS_PROPERTY),
    },
  },
);

export const Topic = Entity.Schema(
  {
    name: Type.optional(Type.String),
    cover: Type.Relation(Image),
  },
  {
    types: [Id('5ef5a5860f274d8e8f6c59ae5b3e89e2')],
    properties: {
      name: Id('a126ca530c8e48d5b88882c734c38935'),
      cover: Id('34f535072e6b42c5a84443981a77cfa2'),
    },
  },
);

// Generic entity for platform links (Apple Podcasts, Spotify, etc.)
// Using Project type since platforms like Apple Podcasts use this type
export const GenericEntity = Entity.Schema(
  {
    name: Type.String,
  },
  {
    types: [Id('484a18c5030a499cb0f2ef588ff16d50')], // Project type
    properties: {
      name: Id('a126ca530c8e48d5b88882c734c38935'),
    },
  },
);

export const Episode2 = Entity.Schema(
  {
    name: Type.String,
    description: Type.optional(Type.String),
    airDate: Type.Date,
    avatar: Type.Relation(Image),
    duration: Type.optional(Type.Number), // in seconds
    audioUrl: Type.optional(Type.String),
    listenOn: Type.Relation(GenericEntity, {
      properties: {
        website: Type.optional(Type.String),
      },
    }),
  },
  {
    types: [Id('972d201ad78045689e01543f67b26bee')],
    properties: {
      name: Id('a126ca530c8e48d5b88882c734c38935'),
      description: Id('9b1f76ff9711404c861e59dc3fa7d037'),
      airDate: Id('77999397f78d44a7bbc5d93a617af47c'),
      duration: Id('76996accd10f4cd59ac94a705b8e03b4'),
      audioUrl: Id('87f919d5560b408cbe8d318e2c5c098b'),
      avatar: Id('1155befffad549b7a2e0da4777b8792c'),
      listenOn: {
        propertyId: Id('1367bac7dcea4b8086ada4a4cdd7c2cb'),
        properties: {
          website: Id('eed38e74e67946bf8a42ea3e4f8fb5fb'),
        },
      },
    },
  },
);

export const Podcast = Entity.Schema(
  {
    name: Type.String,
    description: Type.optional(Type.String),
    dateFounded: Type.Date,
    rssFeedUrl: Type.optional(Type.String),
    avatar: Type.Relation(Image),
    hosts: Type.Relation(Person),
    topics: Type.Relation(Topic),
    listenOn: Type.Relation(GenericEntity, {
      properties: {
        website: Type.optional(Type.String),
      },
    }),
    episodes: Type.Backlink(Episode2),
  },
  {
    types: [Id('4c81561d1f9541319cdddd20ab831ba2')],
    properties: {
      name: Id('a126ca530c8e48d5b88882c734c38935'),
      description: Id('9b1f76ff9711404c861e59dc3fa7d037'),
      dateFounded: Id('41aa3d9847b64a97b7ec427e575b910e'),
      rssFeedUrl: Id('a5776138deb8436f8c983eccd100d98f'),
      hosts: Id('c72d9abbbca84e86b7e8b71e91d2b37e'),
      avatar: Id('1155befffad549b7a2e0da4777b8792c'),
      topics: Id('458fbc070dbf4c928f5716f3fdde7c32'),
      listenOn: {
        propertyId: Id('1367bac7dcea4b8086ada4a4cdd7c2cb'),
        properties: {
          website: Id('eed38e74e67946bf8a42ea3e4f8fb5fb'),
        },
      },
      episodes: Id('f1873bbc381f4604abad76fed4f6d73f'),
    },
  },
);

export const Quote = Entity.Schema(
  {
    name: Type.String,
  },
  {
    types: [Id('043a171c69184dc3a7dbb8471ca6fcc2')],
    properties: {
      name: Id('a126ca530c8e48d5b88882c734c38935'),
    },
  },
);

export const Claim = Entity.Schema(
  {
    name: Type.String,
  },
  {
    types: [Id('043a171c69184dc3a7dbb8471ca6fcc2')],
    properties: {
      name: Id('a126ca530c8e48d5b88882c734c38935'),
    },
  },
);

export const Episode = Entity.Schema(
  {
    name: Type.String,
    description: Type.optional(Type.String),
    airDate: Type.Date,
    avatar: Type.Relation(Image),
    duration: Type.optional(Type.Number), // in seconds
    audioUrl: Type.optional(Type.String),
    episodeNumber: Type.optional(Type.Number),
    guests: Type.Relation(Person),
    hosts: Type.Relation(Person),
    podcast: Type.Relation(Podcast),
    contributors: Type.Relation(Person),
    quotes: Type.Relation(Quote),
    claims: Type.Relation(Claim),
    topics: Type.Relation(Topic),
    listenOn: Type.Relation(GenericEntity, {
      properties: {
        website: Type.optional(Type.String),
      },
    }),
  },
  {
    types: [Id('972d201ad78045689e01543f67b26bee')],
    properties: {
      name: Id('a126ca530c8e48d5b88882c734c38935'),
      description: Id('9b1f76ff9711404c861e59dc3fa7d037'),
      airDate: Id('77999397f78d44a7bbc5d93a617af47c'),
      duration: Id('76996accd10f4cd59ac94a705b8e03b4'),
      audioUrl: Id('87f919d5560b408cbe8d318e2c5c098b'),
      episodeNumber: Id('9b5eced95c30473b8404f474a777db3a'),
      hosts: Id('c72d9abbbca84e86b7e8b71e91d2b37e'),
      guests: Id('cb60a1a66fb548c9b936200c5c271330'),
      avatar: Id('1155befffad549b7a2e0da4777b8792c'),
      podcast: Id('f1873bbc381f4604abad76fed4f6d73f'),
      contributors: Id('1ff591322d574671934a7b662e3cf66a'),
      quotes: Id('8d4ae49c226d40868ec3af5d5b2a65d0'),
      claims: Id('e1371bcda7044396adb7ea7ecc8fe3d4'),
      topics: Id('458fbc070dbf4c928f5716f3fdde7c32'),
      listenOn: {
        propertyId: Id('1367bac7dcea4b8086ada4a4cdd7c2cb'),
        properties: {
          website: Id('eed38e74e67946bf8a42ea3e4f8fb5fb'),
        },
      },
    },
  },
);

export const Space = Entity.Schema(
  {
    name: Type.String,
    avatar: Type.Relation(Image),
  },
  {
    types: [Id('362c1dbddc6444bba3c4652f38a642d7')],
    properties: {
      name: Id(SystemIds.NAME_PROPERTY),
      avatar: Id('1155befffad549b7a2e0da4777b8792c'),
    },
  },
);

export type Space = Entity.Entity<typeof Space>;

export const EpisodeHostTest = Entity.Schema(
  {
    name: Type.String,
  },
  {
    types: [Id('972d201ad78045689e01543f67b26bee')],
    properties: {
      name: Id(SystemIds.NAME_PROPERTY),
    },
  },
);

export const PodcastHostTest = Entity.Schema(
  {
    name: Type.String,
  },
  {
    types: [Id('4c81561d1f9541319cdddd20ab831ba2')],
    properties: {
      name: Id(SystemIds.NAME_PROPERTY),
    },
  },
);

export const PersonBacklink = Entity.Schema(
  {
    name: Type.String,
  },
  {
    types: [Id('7ed45f2bc48b419e8e4664d5ff680b0d')],
    properties: {
      name: Id(SystemIds.NAME_PROPERTY),
    },
  },
);

export const Bounty = Entity.Schema(
  {
    name: Type.String,
    description: Type.optional(Type.String),
    interestedIn: Type.Backlink(PersonBacklink),
  },
  {
    types: [Id('808af0bad5884e3391f09dd4b25e18be')],
    properties: {
      name: Id(SystemIds.NAME_PROPERTY),
      description: Id(SystemIds.DESCRIPTION_PROPERTY),
      interestedIn: Id('ff7e1b4444a2419187324e6c222afe07'),
    },
  },
);

export const PersonHostTest = Entity.Schema(
  {
    name: Type.String,
    hostedPodcasts: Type.Backlink(PodcastHostTest),
    hostedEpisodes: Type.Backlink(EpisodeHostTest),
  },
  {
    types: [Id('7ed45f2bc48b419e8e4664d5ff680b0d')],
    properties: {
      name: Id(SystemIds.NAME_PROPERTY),
      hostedPodcasts: Id('c72d9abbbca84e86b7e8b71e91d2b37e'),
      hostedEpisodes: Id('c72d9abbbca84e86b7e8b71e91d2b37e'),
    },
  },
);
