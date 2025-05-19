import { Id } from '@graphprotocol/grc-20';
import type { Mapping } from '@graphprotocol/hypergraph-react';

export const mapping: Mapping = {
  NewsStory: {
    typeIds: [Id.Id('VKPGYGnFuaoAASiAukCVCX')],
    properties: {
      name: Id.Id('LuBWqZAu6pz54eiJS5mLv8'),
      publishDate: Id.Id('KPNjGaLx5dKofVhT6Dfw22'),
      description: Id.Id('LA1DqP5v6QAdsgLPXGF3YA'),
    },
  },
  Todo2: {
    typeIds: [Id.Id('4ewpH1mPW9f2tLhaHdKKyn')],
    properties: {
      name: Id.Id('LuBWqZAu6pz54eiJS5mLv8'),
      checked: Id.Id('7zyFtwuuf9evFNZqcLSytU'),
    },
    relations: {
      assignees: Id.Id('GeLe54zpz1MiMWAF8LFCCt'),
    },
  },
  User: {
    typeIds: [Id.Id('KYCunro75we8KbjpsDKbm7')],
    properties: {
      name: Id.Id('LuBWqZAu6pz54eiJS5mLv8'),
    },
  },
};
