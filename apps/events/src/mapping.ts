import type { Mapping } from '@graphprotocol/hypergraph';
import { Id } from '@graphprotocol/hypergraph';

export const mapping: Mapping.Mapping = {
  User: {
    typeIds: [Id('bffa181ea333495b949c57f2831d7eca')],
    properties: {
      name: Id('c9c79675850a42c5bbbd9e5c55d3f4e7'),
    },
  },
  Todo: {
    typeIds: [Id('44fe82a9e4c24330a395ce85ed78e421')],
    properties: {
      name: Id('c668aa67bbca4b2c908c9c5599035eab'),
      completed: Id('71e7654f2623479488fb841c8f3dd9b4'),
    },
    relations: {
      assignees: Id('5b80d3ee24634246b62844ba808ab3e1'),
    },
  },
  Todo2: {
    typeIds: [Id('210f4e94234c49d7af0ff3b74fb07650')],
    properties: {
      name: Id('e291f4da632d4b70aca85c6c01dbf1ca'),
      checked: Id('d1cc82ef8bde45f4b31c56b6d59279ec'),
      due: Id('6a28f275b31c47bc83cdad416aaa7073'),
      amount: Id('0c8219bee2844738bd9591a1c113c78e'),
      point: Id('7f032477c60e4c85a161019b70db05ca'),
      website: Id('75b6a6475c2b41e792c0b0a0c9b28b02'),
    },
    relations: {
      assignees: Id('1115e9f8db2e41df8969c5d34c367c10'),
    },
  },
  JobOffer: {
    typeIds: [Id('a4c1b288756e477baab2007decf01c61')],
    properties: {
      name: Id('a126ca530c8e48d5b88882c734c38935'),
      salary: Id('86ff5361b8204ba8b689b48e815e07d2'),
    },
  },
  Company: {
    typeIds: [Id('bcf56f59c53247d5a0052d802f512c85')],
    properties: {
      name: Id('a126ca530c8e48d5b88882c734c38935'),
    },
    relations: {
      jobOffers: Id('54190b301c68499c9ed85c6190810e31'),
    },
  },
  Event: {
    typeIds: [Id('239bc639938e427cbebbd562d82ae272')],
    properties: {
      name: Id('a126ca530c8e48d5b88882c734c38935'),
      description: Id('9b1f76ff9711404c861e59dc3fa7d037'),
    },
    relations: {
      sponsors: Id('926b00ee68b54462a27f3806af705118'),
    },
  },
  Todo3: {
    typeIds: [Id('4f7bba7678554d63b59d1d9f2be866df')],
    properties: {
      name: Id('47006386d351411c82871dae1c1aa8c1'),
      completed: Id('9f9f00eb4f324f7192bab266566d0013'),
      description: Id('89cac80a1dbd4bca97b245e1556d9122'),
    },
  },
};
