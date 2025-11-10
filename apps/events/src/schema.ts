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
    description: Type.optional(Type.String),
    x: Type.optional(Type.String),
  },
  {
    types: [Id('484a18c5-030a-499c-b0f2-ef588ff16d50')],
    properties: {
      name: Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
      description: Id('9b1f76ff-9711-404c-861e-59dc3fa7d037'),
      x: Id('0d625978-4b3c-4b57-a86f-de45c997c73c'),
    },
  },
);

export const Podcast = Entity.Schema(
  {
    name: Type.String,
    description: Type.optional(Type.String),
    dateFounded: Type.Date,
    rssFeedUrl: Type.optional(Type.String),
    projects: Type.Relation(Project, {
      properties: {
        website: Type.optional(Type.String),
        // website: Type.String,
      },
    }),
  },
  {
    types: [Id('69732974-c632-490d-81a3-12ea567b2a8e')],
    properties: {
      name: Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
      description: Id('9b1f76ff-9711-404c-861e-59dc3fa7d037'),
      dateFounded: Id('41aa3d98-47b6-4a97-b7ec-427e575b910e'),
      rssFeedUrl: Id('4dd1a486-c1ad-48c6-b261-e4c8edf7ac65'),
      projects: {
        propertyId: Id('71931b5f-1d6a-462e-81d9-5b8e85fb5c4b'),
        properties: {
          website: Id('eed38e74-e679-46bf-8a42-ea3e4f8fb5fb'),
        },
      },
    },
  },
);
