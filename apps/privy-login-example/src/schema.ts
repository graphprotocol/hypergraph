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
    description: Type.optional(Type.String),
    x: Type.optional(Type.String),
    avatar: Type.Relation(Image),
  },
  {
    types: [Id('484a18c5030a499cb0f2ef588ff16d50')],
    properties: {
      name: Id('a126ca530c8e48d5b88882c734c38935'),
      description: Id('9b1f76ff9711404c861e59dc3fa7d037'),
      x: Id('0d6259784b3c4b57a86fde45c997c73c'),
      avatar: Id('1155befffad549b7a2e0da4777b8792c'),
    },
  },
);
