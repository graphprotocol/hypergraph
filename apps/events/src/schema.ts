import { EntitySchema, Id, Type } from '@graphprotocol/hypergraph';

export const User = EntitySchema(
  { name: Type.String },
  {
    types: [Id('bffa181e-a333-495b-949c-57f2831d7eca')],
    properties: {
      name: Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
    },
  },
);

export const Todo = EntitySchema(
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

export const Todo2 = EntitySchema(
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

export const JobOffer = EntitySchema(
  {
    name: Type.String,
    salary: Type.Number,
  },
  {
    types: [Id('bffa181e-a333-495b-949c-57f2831d7eca')],
    properties: {
      name: Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
      salary: Id('baa36ac9-78ac-4cf7-8394-6b2d3006bebe'),
    },
  },
);

export const Company = EntitySchema(
  {
    name: Type.String,
    jobOffers: Type.Relation(JobOffer),
  },
  {
    types: [Id('6c504df5-1a8f-43d1-bf2d-1ef9fa5b08b5')],
    properties: {
      name: Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
      jobOffers: Id('1203064e-9741-4235-89d4-97f4b22eddfb'),
    },
  },
);

export const Event = EntitySchema(
  {
    name: Type.String,
    description: Type.optional(Type.String),
    sponsors: Type.Relation(Company),
  },
  {
    types: [Id('7f9562d4-034d-4385-bf5c-f02cdebba47a')],
    properties: {
      name: Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
      description: Id('9b1f76ff-9711-404c-861e-59dc3fa7d037'),
      sponsors: Id('6860bfac-f703-4289-b789-972d0aaf3abe'),
    },
  },
);

export const Image = EntitySchema(
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

export const Project = EntitySchema(
  {
    name: Type.String,
    description: Type.optional(Type.String),
    x: Type.optional(Type.String),
    // avatar: Type.Relation(Image),
  },
  {
    types: [Id('484a18c5-030a-499c-b0f2-ef588ff16d50')],
    properties: {
      name: Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
      description: Id('9b1f76ff-9711-404c-861e-59dc3fa7d037'),
      x: Id('0d625978-4b3c-4b57-a86f-de45c997c73c'),
      // avatar: Id('1155beff-fad5-49b7-a2e0-da4777b8792c'),
    },
  },
);
