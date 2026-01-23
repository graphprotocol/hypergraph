import { SystemIds } from '@geoprotocol/geo-sdk';
import { Config, Entity, Id, Type } from '@graphprotocol/hypergraph';

Config.setApiOrigin('https://testnet-api.geobrowser.io');

const BOUNTY_TYPE_ID = Id('327976dea5ad45769b83b7e7ec6337cf');
const REWARD_PROPERTY_ID = Id('e8e7301136354e84b46b767e7cd530a8');
const ACTIVE_UNTIL_PROPERTY_ID = Id('3e4679aaeaf94bddaad825dd5d96234c');

const Bounty = Entity.Schema(
  {
    name: Type.String,
    description: Type.String,
    reward: Type.Number,
    activeUntil: Type.Date,
  },
  {
    types: [BOUNTY_TYPE_ID],
    properties: {
      name: SystemIds.NAME_PROPERTY,
      description: SystemIds.DESCRIPTION_PROPERTY,
      reward: REWARD_PROPERTY_ID,
      activeUntil: ACTIVE_UNTIL_PROPERTY_ID,
    },
  },
);

async function main() {
  const bounty = await Entity.findOnePublic(Bounty, {
    id: '93c9d09e662840a891fefe4c505f9365',
    space: 'b0043a26cb81379c1217dfd2283b67b8',
  });
  console.log(bounty);
}

main();
