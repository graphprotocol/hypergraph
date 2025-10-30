import type { Mapping } from '@graphprotocol/hypergraph';
import { Id } from '@graphprotocol/hypergraph';

export const mapping: Mapping.Mapping = {
  User: {
    typeIds: [Id('bffa181e-a333-495b-949c-57f2831d7eca')],
    properties: {
      name: Id('c9c79675-850a-42c5-bbbd-9e5c55d3f4e7'),
    },
  },
  Todo: {
    typeIds: [Id('44fe82a9-e4c2-4330-a395-ce85ed78e421')],
    properties: {
      name: Id('c668aa67-bbca-4b2c-908c-9c5599035eab'),
      completed: Id('71e7654f-2623-4794-88fb-841c8f3dd9b4'),
    },
    relations: {
      assignees: Id('5b80d3ee-2463-4246-b628-44ba808ab3e1'),
    },
  },
  Todo2: {
    typeIds: [Id('210f4e94-234c-49d7-af0f-f3b74fb07650')],
    properties: {
      name: Id('e291f4da-632d-4b70-aca8-5c6c01dbf1ca'),
      checked: Id('d1cc82ef-8bde-45f4-b31c-56b6d59279ec'),
      due: Id('6a28f275-b31c-47bc-83cd-ad416aaa7073'),
      amount: Id('0c8219be-e284-4738-bd95-91a1c113c78e'),
      point: Id('7f032477-c60e-4c85-a161-019b70db05ca'),
      website: Id('75b6a647-5c2b-41e7-92c0-b0a0c9b28b02'),
    },
    relations: {
      assignees: Id('1115e9f8-db2e-41df-8969-c5d34c367c10'),
    },
  },
  JobOffer: {
    typeIds: [Id('a4c1b288-756e-477b-aab2-007decf01c61')],
    properties: {
      name: Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
      salary: Id('86ff5361-b820-4ba8-b689-b48e815e07d2'),
    },
  },
  Company: {
    typeIds: [Id('bcf56f59-c532-47d5-a005-2d802f512c85')],
    properties: {
      name: Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
    },
    relations: {
      jobOffers: Id('54190b30-1c68-499c-9ed8-5c6190810e31'),
    },
  },
  Event: {
    typeIds: [Id('239bc639-938e-427c-bebb-d562d82ae272')],
    properties: {
      name: Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
      description: Id('9b1f76ff-9711-404c-861e-59dc3fa7d037'),
    },
    relations: {
      sponsors: Id('926b00ee-68b5-4462-a27f-3806af705118'),
    },
  },
  Todo3: {
    typeIds: [Id('4f7bba76-7855-4d63-b59d-1d9f2be866df')],
    properties: {
      name: Id('47006386-d351-411c-8287-1dae1c1aa8c1'),
      completed: Id('9f9f00eb-4f32-4f71-92ba-b266566d0013'),
      description: Id('89cac80a-1dbd-4bca-97b2-45e1556d9122'),
    },
  },
};
