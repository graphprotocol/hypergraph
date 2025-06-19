import { Id } from '@graphprotocol/grc-20';
import type { Mapping } from '@graphprotocol/hypergraph-react';

export const mapping: Mapping = {
  RelationEntry: {
    typeIds: [Id.Id('8f151ba4-de20-4e3c-9cb4-99ddf96f48f1')],
    properties: {
      name: Id.Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
    },
  },
  Event: {
    typeIds: [Id.Id('4d876b81-787e-41fc-ab5d-075d4da66a3f')],
    properties: {
      name: Id.Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
      // description: Id.Id('9b1f76ff-9711-404c-861e-59dc3fa7d037'),
    },
    // relations: {
    //   any: Id.Id('8f151ba4-de20-4e3c-9cb4-99ddf96f48f1'),
    // },
  },
  // Todo2: {
  //   typeIds: [Id.Id('LJuM8ju67mCv78FhAiK9k9')],
  //   properties: {
  //     name: Id.Id('LuBWqZAu6pz54eiJS5mLv8'),
  //     checked: Id.Id('Ud9kn9gAUsCr1pxvxcgDj8'),
  //     due: Id.Id('CFisPgjjWVdnaMtSWJDBqA'),
  //     point: Id.Id('BkcVo7JZHF5LsWw7XZJwwe'),
  //     website: Id.Id('XZmLQ8XyaUHnNWgSSbzaHU'),
  //     amount: Id.Id('LfzKTfgy5Qg3PxAfKB2BL7'),
  //   },
  //   relations: {
  //     assignees: Id.Id('HCdFcTRyMyZMXScKox738i'),
  //   },
  // },
  // User: {
  //   typeIds: [Id.Id('Fk5qzwdpKsD35gm5ts4SZA')],
  //   properties: {
  //     name: Id.Id('LuBWqZAu6pz54eiJS5mLv8'),
  //   },
  // },
};
