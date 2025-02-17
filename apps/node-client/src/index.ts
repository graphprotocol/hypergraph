import { PublicGraph, Utils } from '@graphprotocol/hypergraph';

const accountId = '0x098B742F2696AFC37724887cf999e1cFdB8f4b55';

// const result = await PublicGraph.createSpace({
//   initialEditorAddress: accountId,
//   spaceName: 'Example-Name',
// });

// const result = await PublicGraph.createAccount(accountId);

// console.log(result);

const entityResult = await PublicGraph.createEntity({
  id: Utils.generateId(),
  accountId,
  data: {
    name: 'Test Geo',
    description: 'Test Description',
  },
  mapping: {
    name: PublicGraph.SYSTEM_IDS.NAME_ATTRIBUTE,
    description: PublicGraph.SYSTEM_IDS.DESCRIPTION_ATTRIBUTE,
  },
  spaceId: 'APRxsbvk2awdZQChF4i5ey',
});

console.log(entityResult);
