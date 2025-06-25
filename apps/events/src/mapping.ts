import { Id } from '@graphprotocol/grc-20';
import type { Mapping } from '@graphprotocol/hypergraph';

export const mapping: Mapping = {
  Event: {
    typeIds: [Id.Id('407d9e8a-c703-4fb4-830d-98c758c8564e')],
    properties: {
      name: Id.Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
    },
    relations: {
      sponsors: Id.Id('a7ac80a6-d3d9-4b04-9b9f-ead1723af09f'),
    },
  },
  Company: {
    typeIds: [Id.Id('b0220a78-9205-4e5e-9bf1-c03ee0791e23')],
    properties: {
      name: Id.Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
    },
    relations: {
      jobOffers: Id.Id('7ca8063c-3664-479b-912d-1b3b86af2bf4'),
    },
  },
  JobOffer: {
    typeIds: [Id.Id('99e1733b-661d-4edb-a253-98ff4b7747d0')],
    properties: {
      name: Id.Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
      salary: Id.Id('5ecfb4e5-09eb-437d-9c3c-e9e7395d52aa'),
    },
  },

  // Todo2: {
  //   typeIds: [Id.Id('LJuM8ju67mCv78FhAiK9k9')],
  //   properties: {
  //     name: Id.Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
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
  //     name: Id.Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
  //   },
  // },
};
