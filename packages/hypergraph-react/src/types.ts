import type { Id as Grc20Id } from '@graphprotocol/grc-20';

export type Mapping = {
  [key: string]: {
    typeIds: Grc20Id.Id[];
    properties: {
      [key: string]: Grc20Id.Id;
    };
  };
};
