import { Id } from '@graphprotocol/grc-20';
import type { Mapping } from '@graphprotocol/hypergraph';

export const mapping: Mapping.Mapping = {
  Event: {
    typeIds: [Id.Id('7f9562d4-034d-4385-bf5c-f02cdebba47a')],
    properties: {
      name: Id.Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
    },
    relations: {
      sponsors: Id.Id('6860bfac-f703-4289-b789-972d0aaf3abe'),
    },
  },
  Company: {
    typeIds: [Id.Id('6c504df5-1a8f-43d1-bf2d-1ef9fa5b08b5')],
    properties: {
      name: Id.Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
    },
    relations: {
      jobOffers: Id.Id('1203064e-9741-4235-89d4-97f4b22eddfb'),
    },
  },
  JobOffer: {
    typeIds: [Id.Id('f60585af-71b6-4674-9a26-b74ca6c1cceb')],
    properties: {
      name: Id.Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
      salary: Id.Id('baa36ac9-78ac-4cf7-8394-6b2d3006bebe'),
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
