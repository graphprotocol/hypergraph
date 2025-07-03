import type { Op } from '@graphprotocol/grc-20';
import { Ipfs } from '@graphprotocol/grc-20';
import { Connect } from '@graphprotocol/hypergraph';
import type { Hash } from 'viem';

type PublishParams = {
  name: string;
  ops: Op[];
  walletClient: Connect.SmartSessionClient;
  space: string;
};

type PublishResult = {
  txResult: Hash;
  to: Hash;
  data: Hash;
  cid: string;
};

export const publishOps = async ({ name, ops, walletClient, space }: PublishParams): Promise<PublishResult> => {
  const address = walletClient.account?.address;
  if (!address) {
    throw new Error('No address found');
  }

  const network = walletClient.chain.id === Connect.GEO_TESTNET.id ? 'TESTNET' : 'MAINNET';
  const publishResult = await Ipfs.publishEdit({
    name,
    ops: ops,
    author: address,
    network,
  });

  const cid = publishResult.cid;

  // This returns the correct contract address and calldata depending on the space id
  const result = await fetch(`https://v2-postgraphile.up.railway.app/space/${space}/edit/calldata`, {
    method: 'POST',
    body: JSON.stringify({ cid }),
  });

  const { to, data } = await result.json();

  const txResult = await walletClient.sendUserOperation({
    calls: [
      {
        to: to,
        value: 0n,
        data: data,
      },
    ],
  });

  return { txResult: txResult as `0x${string}`, to, data, cid };
};
