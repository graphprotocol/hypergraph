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
    typeIds: [Id.Id('LJuM8ju67mCv78FhAiK9k9')],
    properties: {
      name: Id.Id('LuBWqZAu6pz54eiJS5mLv8'),
      checked: Id.Id('Ud9kn9gAUsCr1pxvxcgDj8'),
      due: Id.Id('CFisPgjjWVdnaMtSWJDBqA'),
      point: Id.Id('BkcVo7JZHF5LsWw7XZJwwe'),
      website: Id.Id('XZmLQ8XyaUHnNWgSSbzaHU'),
      amount: Id.Id('LfzKTfgy5Qg3PxAfKB2BL7'),
    },
    relations: {
      assignees: Id.Id('HCdFcTRyMyZMXScKox738i'),
    },
  },
  User: {
    typeIds: [Id.Id('Fk5qzwdpKsD35gm5ts4SZA')],
    properties: {
      name: Id.Id('LuBWqZAu6pz54eiJS5mLv8'),
    },
  },
};
