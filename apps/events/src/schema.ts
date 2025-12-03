import { SystemIds } from '@graphprotocol/grc-20';
import { Entity, Id, Type } from '@graphprotocol/hypergraph';

export const User = Entity.Schema(
  { name: Type.String },
  {
    types: [Id('bffa181e-a333-495b-949c-57f2831d7eca')],
    properties: {
      name: Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
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
    types: [Id('44fe82a9-e4c2-4330-a395-ce85ed78e421')],
    properties: {
      name: Id('c668aa67-bbca-4b2c-908c-9c5599035eab'),
      completed: Id('71e7654f-2623-4794-88fb-841c8f3dd9b4'),
      assignees: Id('5b80d3ee-2463-4246-b628-44ba808ab3e1'),
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
    types: [Id('210f4e94-234c-49d7-af0f-f3b74fb07650')],
    properties: {
      name: Id('e291f4da-632d-4b70-aca8-5c6c01dbf1ca'),
      checked: Id('d1cc82ef-8bde-45f4-b31c-56b6d59279ec'),
      assignees: Id('1115e9f8-db2e-41df-8969-c5d34c367c10'),
      due: Id('6a28f275-b31c-47bc-83cd-ad416aaa7073'),
      amount: Id('0c8219be-e284-4738-bd95-91a1c113c78e'),
      point: Id('7f032477-c60e-4c85-a161-019b70db05ca'),
      website: Id('75b6a647-5c2b-41e7-92c0-b0a0c9b28b02'),
    },
  },
);

export const JobOffer = Entity.Schema(
  {
    name: Type.String,
    salary: Type.Number,
  },
  {
    types: [Id('a4c1b288-756e-477b-aab2-007decf01c61')],
    properties: {
      name: Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
      salary: Id('86ff5361-b820-4ba8-b689-b48e815e07d2'),
    },
  },
);

export const Company = Entity.Schema(
  {
    name: Type.String,
    jobOffers: Type.Relation(JobOffer),
  },
  {
    types: [Id('bcf56f59-c532-47d5-a005-2d802f512c85')],
    properties: {
      name: Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
      jobOffers: Id('54190b30-1c68-499c-9ed8-5c6190810e31'),
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
    types: [Id('239bc639-938e-427c-bebb-d562d82ae272')],
    properties: {
      name: Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
      description: Id('9b1f76ff-9711-404c-861e-59dc3fa7d037'),
      sponsors: Id('926b00ee-68b5-4462-a27f-3806af705118'),
    },
  },
);

export const Image = Entity.Schema(
  {
    url: Type.String,
  },
  {
    types: [Id('ba4e4146-0010-499d-a0a3-caaa7f579d0e')],
    properties: {
      url: Id('8a743832-c094-4a62-b665-0c3cc2f9c7bc'),
    },
  },
);

export const Project = Entity.Schema(
  {
    name: Type.String,
  },
  {
    types: [Id('484a18c5-030a-499c-b0f2-ef588ff16d50')], // Project type
    properties: {
      name: Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
    },
  },
);

export const Person = Entity.Schema(
  {
    name: Type.String,
    description: Type.optional(Type.String),
    avatar: Type.Relation(Image),
  },
  {
    types: [Id('7ed45f2b-c48b-419e-8e46-64d5ff680b0d')],
    properties: {
      name: Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
      description: Id('9b1f76ff-9711-404c-861e-59dc3fa7d037'),
      avatar: Id('1155beff-fad5-49b7-a2e0-da4777b8792c'),
    },
  },
);

export const Topic = Entity.Schema(
  {
    name: Type.optional(Type.String),
    cover: Type.Relation(Image),
  },
  {
    types: [Id('5ef5a586-0f27-4d8e-8f6c-59ae5b3e89e2')],
    properties: {
      name: Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
      cover: Id('34f53507-2e6b-42c5-a844-43981a77cfa2'),
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
    types: [Id('484a18c5-030a-499c-b0f2-ef588ff16d50')], // Project type
    properties: {
      name: Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
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
    types: [Id('972d201a-d780-4568-9e01-543f67b26bee')],
    properties: {
      name: Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
      description: Id('9b1f76ff-9711-404c-861e-59dc3fa7d037'),
      airDate: Id('77999397-f78d-44a7-bbc5-d93a617af47c'),
      duration: Id('76996acc-d10f-4cd5-9ac9-4a705b8e03b4'),
      audioUrl: Id('87f919d5-560b-408c-be8d-318e2c5c098b'),
      avatar: Id('1155beff-fad5-49b7-a2e0-da4777b8792c'),
      listenOn: {
        propertyId: Id('1367bac7-dcea-4b80-86ad-a4a4cdd7c2cb'),
        properties: {
          website: Id('eed38e74-e679-46bf-8a42-ea3e4f8fb5fb'),
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
    types: [Id('4c81561d-1f95-4131-9cdd-dd20ab831ba2')],
    properties: {
      name: Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
      description: Id('9b1f76ff-9711-404c-861e-59dc3fa7d037'),
      dateFounded: Id('41aa3d98-47b6-4a97-b7ec-427e575b910e'),
      rssFeedUrl: Id('a5776138-deb8-436f-8c98-3eccd100d98f'),
      hosts: Id('c72d9abb-bca8-4e86-b7e8-b71e91d2b37e'),
      avatar: Id('1155beff-fad5-49b7-a2e0-da4777b8792c'),
      topics: Id('458fbc07-0dbf-4c92-8f57-16f3fdde7c32'),
      listenOn: {
        propertyId: Id('1367bac7-dcea-4b80-86ad-a4a4cdd7c2cb'),
        properties: {
          website: Id('eed38e74-e679-46bf-8a42-ea3e4f8fb5fb'),
        },
      },
      episodes: Id('f1873bbc-381f-4604-abad-76fed4f6d73f'),
    },
  },
);

export const Quote = Entity.Schema(
  {
    name: Type.String,
  },
  {
    types: [Id('043a171c-6918-4dc3-a7db-b8471ca6fcc2')],
    properties: {
      name: Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
    },
  },
);

export const Claim = Entity.Schema(
  {
    name: Type.String,
  },
  {
    types: [Id('043a171c-6918-4dc3-a7db-b8471ca6fcc2')],
    properties: {
      name: Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
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
    types: [Id('972d201a-d780-4568-9e01-543f67b26bee')],
    properties: {
      name: Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
      description: Id('9b1f76ff-9711-404c-861e-59dc3fa7d037'),
      airDate: Id('77999397-f78d-44a7-bbc5-d93a617af47c'),
      duration: Id('76996acc-d10f-4cd5-9ac9-4a705b8e03b4'),
      audioUrl: Id('87f919d5-560b-408c-be8d-318e2c5c098b'),
      episodeNumber: Id('9b5eced9-5c30-473b-8404-f474a777db3a'),
      hosts: Id('c72d9abb-bca8-4e86-b7e8-b71e91d2b37e'),
      guests: Id('cb60a1a6-6fb5-48c9-b936-200c5c271330'),
      avatar: Id('1155beff-fad5-49b7-a2e0-da4777b8792c'),
      podcast: Id('f1873bbc-381f-4604-abad-76fed4f6d73f'),
      contributors: Id('1ff59132-2d57-4671-934a-7b662e3cf66a'),
      quotes: Id('8d4ae49c-226d-4086-8ec3-af5d5b2a65d0'),
      claims: Id('e1371bcd-a704-4396-adb7-ea7ecc8fe3d4'),
      topics: Id('458fbc07-0dbf-4c92-8f57-16f3fdde7c32'),
      listenOn: {
        propertyId: Id('1367bac7-dcea-4b80-86ad-a4a4cdd7c2cb'),
        properties: {
          website: Id('eed38e74-e679-46bf-8a42-ea3e4f8fb5fb'),
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
    types: [Id('362c1dbd-dc64-44bb-a3c4-652f38a642d7')],
    properties: {
      name: Id(SystemIds.NAME_PROPERTY),
      avatar: Id('1155beff-fad5-49b7-a2e0-da4777b8792c'),
    },
  },
);

export type Space = Entity.Entity<typeof Space>;
