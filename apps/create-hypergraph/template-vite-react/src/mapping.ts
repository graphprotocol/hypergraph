import type { Mapping } from '@graphprotocol/hypergraph';
import { Id } from '@graphprotocol/hypergraph';

export const mapping: Mapping.Mapping = {
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
      x: Id('0d625978-4b3c-4b57-a86f-de45c997c73c'),
    },
    relations: {
      avatar: Id('1155beff-fad5-49b7-a2e0-da4777b8792c'),
    },
  },
  Dapp: {
    typeIds: [Id('8ca136d0-698a-4bbf-a76b-8e2741b2dc8c')],
    properties: {
      name: Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
      description: Id('9b1f76ff-9711-404c-861e-59dc3fa7d037'),
      x: Id('0d625978-4b3c-4b57-a86f-de45c997c73c'),
      github: Id('9eedefa8-60ae-4ac1-9a04-805054a4b094'),
    },
    relations: {
      avatar: Id('1155beff-fad5-49b7-a2e0-da4777b8792c'),
    },
  },
  Investor: {
    typeIds: [Id('331aea18-973c-4adc-8f53-614f598d262d')],
    properties: {
      name: Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
    },
  },
  FundingStage: {
    typeIds: [Id('8d35d217-3fa1-4686-b74f-fcb3e9438067')],
    properties: {
      name: Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
    },
  },
  InvestmentRound: {
    typeIds: [Id('8f03f4c9-59e4-44a8-a625-c0a40b1ff330')],
    properties: {
      name: Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
      raisedAmount: Id('16781706-dd9c-48bf-913e-cdf18b56034f'),
    },
    relations: {
      investors: Id('9b8a610a-fa35-486e-a479-e253dbdabb4f'),
      fundingStages: Id('e278c3d4-78b9-4222-b272-5a39a8556bd2'),
      raisedBy: Id('b4878d1a-0609-488d-b8a6-e19862d6b62f'),
    },
  },
  Asset: {
    typeIds: [Id('f8780a80-c238-4a2a-96cb-567d88b1aa63')],
    properties: {
      name: Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
      symbol: Id('ace1e96c-9b83-47b4-bd33-1d302ec0a0f5'),
      blockchainAddress: Id('56b5944f-f059-48d1-b0fa-34abe84219da'),
    },
  },
};
