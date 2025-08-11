import type { Mapping } from '@graphprotocol/hypergraph';
import { Id } from '@graphprotocol/hypergraph';

export const mapping: Mapping.Mapping = {
  Address: {
    typeIds: [Id('5c6e72fb-8340-47c0-8281-8be159ecd495')],
    properties: {
      name: Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
      description: Id('9b1f76ff-9711-404c-861e-59dc3fa7d037'),
    },
  },
  Image: {
    typeIds: [Id('ba4e4146-0010-499d-a0a3-caaa7f579d0e')],
    properties: {
      url: Id('8a743832-c094-4a62-b665-0c3cc2f9c7bc'),
    },
  },
  Project: {
    typeIds: [Id('484a18c5-030a-499c-b0f2-ef588ff16d50')],
    properties: {
      name: Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
      description: Id('9b1f76ff-9711-404c-861e-59dc3fa7d037'),
      xUrl: Id('0d625978-4b3c-4b57-a86f-de45c997c73c'),
    },
    relations: {
      avatar: Id('1155beff-fad5-49b7-a2e0-da4777b8792c'),
    },
  },
  Dapp: {
    typeIds: [Id('8ca136d0-698a-4bbf-a76b-8e2741b2dc8c')],
    properties: {
      name: Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
    },
  },
  InvestmentRound: {
    typeIds: [Id('8f03f4c9-59e4-44a8-a625-c0a40b1ff330')],
    properties: {
      name: Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
    },
  },
  Asset: {
    typeIds: [Id('f8780a80-c238-4a2a-96cb-567d88b1aa63')],
    properties: {
      name: Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
    },
  },
};
