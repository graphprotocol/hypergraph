import { Entity, Id, Type } from '@graphprotocol/hypergraph';

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

export const Dapp = Entity.Schema(
  {
    name: Type.String,
    description: Type.optional(Type.String),
    x: Type.optional(Type.String),
    github: Type.optional(Type.String),
    avatar: Type.Relation(Image),
  },
  {
    types: [Id('8ca136d0698a4bbfa76b8e2741b2dc8c')],
    properties: {
      name: Id('a126ca530c8e48d5b88882c734c38935'),
      description: Id('9b1f76ff9711404c861e59dc3fa7d037'),
      x: Id('0d6259784b3c4b57a86fde45c997c73c'),
      github: Id('9eedefa860ae4ac19a04805054a4b094'),
      avatar: Id('1155befffad549b7a2e0da4777b8792c'),
    },
  },
);

export const Investor = Entity.Schema(
  {
    name: Type.String,
  },
  {
    types: [Id('331aea18973c4adc8f53614f598d262d')],
    properties: {
      name: Id('a126ca530c8e48d5b88882c734c38935'),
    },
  },
);

export const FundingStage = Entity.Schema(
  {
    name: Type.String,
  },
  {
    types: [Id('8d35d2173fa14686b74ffcb3e9438067')],
    properties: {
      name: Id('a126ca530c8e48d5b88882c734c38935'),
    },
  },
);

export const InvestmentRound = Entity.Schema(
  {
    name: Type.String,
    raisedAmount: Type.optional(Type.Number),
    investors: Type.Relation(Investor),
    fundingStages: Type.Relation(FundingStage),
    raisedBy: Type.Relation(Project),
  },
  {
    types: [Id('8f03f4c959e444a8a625c0a40b1ff330')],
    properties: {
      name: Id('a126ca530c8e48d5b88882c734c38935'),
      raisedAmount: Id('16781706dd9c48bf913ecdf18b56034f'),
      investors: Id('9b8a610afa35486ea479e253dbdabb4f'),
      fundingStages: Id('e278c3d478b94222b2725a39a8556bd2'),
      raisedBy: Id('b4878d1a0609488db8a6e19862d6b62f'),
    },
  },
);

export const Asset = Entity.Schema(
  {
    name: Type.String,
    symbol: Type.optional(Type.String),
    blockchainAddress: Type.optional(Type.String),
  },
  {
    types: [Id('f8780a80c2384a2a96cb567d88b1aa63')],
    properties: {
      name: Id('a126ca530c8e48d5b88882c734c38935'),
      symbol: Id('ace1e96c9b8347b4bd331d302ec0a0f5'),
      blockchainAddress: Id('56b5944ff05948d1b0fa34abe84219da'),
    },
  },
);
