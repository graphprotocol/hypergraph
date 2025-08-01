import { Id } from '@graphprotocol/grc-20';
import type { Mapping } from '@graphprotocol/hypergraph';

export const mapping: Mapping.Mapping = {
  Event: {
    typeIds: [Id('7f9562d4-034d-4385-bf5c-f02cdebba47a')],
    properties: {
      name: Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
      description: Id('9b1f76ff-9711-404c-861e-59dc3fa7d037'),
    },
    relations: {
      sponsors: Id('6860bfac-f703-4289-b789-972d0aaf3abe'),
    },
  },
  Company: {
    typeIds: [Id('6c504df5-1a8f-43d1-bf2d-1ef9fa5b08b5')],
    properties: {
      name: Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
    },
    relations: {
      jobOffers: Id('1203064e-9741-4235-89d4-97f4b22eddfb'),
    },
  },
  JobOffer: {
    typeIds: [Id('f60585af-71b6-4674-9a26-b74ca6c1cceb')],
    properties: {
      name: Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
      salary: Id('baa36ac9-78ac-4cf7-8394-6b2d3006bebe'),
    },
  },

  // Todo2: {
  //   typeIds: [Id('LJuM8ju67mCv78FhAiK9k9')],
  //   properties: {
  //     name: Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
  //     checked: Id('Ud9kn9gAUsCr1pxvxcgDj8'),
  //     due: Id('CFisPgjjWVdnaMtSWJDBqA'),
  //     point: Id('BkcVo7JZHF5LsWw7XZJwwe'),
  //     website: Id('XZmLQ8XyaUHnNWgSSbzaHU'),
  //     amount: Id('LfzKTfgy5Qg3PxAfKB2BL7'),
  //   },
  //   relations: {
  //     assignees: Id('HCdFcTRyMyZMXScKox738i'),
  //   },
  // },
  // User: {
  //   typeIds: [Id('Fk5qzwdpKsD35gm5ts4SZA')],
  //   properties: {
  //     name: Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
  //   },
  // },
};
