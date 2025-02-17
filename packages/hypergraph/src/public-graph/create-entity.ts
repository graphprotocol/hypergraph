import { IPFS, type SetTripleOp, Triple } from '@graphprotocol/grc-20';

type Params = {
  id: string;
  spaceId: string;
  accountId: string;
  data: {
    [filedName: string]: string;
  };
  mapping: {
    [filedName: string]: string;
  };
};

export const createEntity = async ({ id, data, spaceId, accountId, mapping }: Params) => {
  const ops: SetTripleOp[] = [];

  for (const [fieldName, value] of Object.entries(data)) {
    const attributeId = mapping[fieldName];
    let attributeValueType: 'TEXT' | 'CHECKBOX' | 'NUMBER' | 'URL' | 'POINT';
    switch (typeof value) {
      case 'string':
        attributeValueType = 'TEXT';
        break;
      case 'boolean':
        attributeValueType = 'CHECKBOX';
        break;
      case 'number':
        attributeValueType = 'NUMBER';
        break;
      default:
        throw new Error('Not implemented value type');
    }
    const setTripleOp: SetTripleOp = Triple.make({
      entityId: id,
      attributeId,
      value: {
        type: attributeValueType,
        value,
      },
    });

    ops.push(setTripleOp);
  }

  const cid = await IPFS.publishEdit({
    name: 'Edit name',
    ops,
    author: accountId,
  });

  const result = await fetch(`https://api-testnet.grc-20.thegraph.com/space/${spaceId}/edit/calldata`, {
    method: 'POST',
    body: JSON.stringify({
      cid: cid,
      network: 'TESTNET',
    }),
  });

  const jsonResult = await result.json();
  return jsonResult;
};
