import { Id } from '@graphprotocol/grc-20';
import type { Mapping } from '@graphprotocol/hypergraph';

export const mapping: Mapping = {
  Event: {
    typeIds: [Id.Id('6b8dbe76-389f-4bde-acdd-db9d5e387882')],
    properties: {
      name: Id.Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
    },
    relations: {
      sponsors: Id.Id('d8e4ea54-cb8c-4dca-9c2b-64dbbbe78397'),
    },
  },
  Company: {
    typeIds: [Id.Id('e8932986-67a9-4fff-89a6-07f03973014c')],
    properties: {
      name: Id.Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
    },
    relations: {
      jobOffers: Id.Id('96beadca-0846-4e56-9628-c196f7f3c4cd'),
    },
  },
  JobOffer: {
    typeIds: [Id.Id('a107c081-3089-4a94-8208-6a10775557d2')],
    properties: {
      name: Id.Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
      salary: Id.Id('20d18713-5352-4e1f-987c-d853bf9f8831'),
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
