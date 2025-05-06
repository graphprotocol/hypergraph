import type { GeoSmartAccount, Op } from '@graphprotocol/grc-20';
import { Ipfs } from '@graphprotocol/grc-20';
import type { Hash } from 'viem';

type PublishParams = {
  ops: Op[];
  walletClient: GeoSmartAccount;
  space: string;
};

type PublishResult = {
  txResult: Hash;
  to: Hash;
  data: Hash;
  cid: string;
};

export const publishOps = async ({ ops, walletClient, space }: PublishParams): Promise<PublishResult> => {
  const address = walletClient.account?.address;
  if (!address) {
    throw new Error('No address found');
  }

  const publishResult = await Ipfs.publishEdit({
    name: 'Update todos',
    ops: ops,
    author: address,
  });

  const cid = publishResult.cid;

  // This returns the correct contract address and calldata depending on the space id
  const result = await fetch(`https://api-testnet.grc-20.thegraph.com/space/${space}/edit/calldata`, {
    method: 'POST',
    body: JSON.stringify({
      cid: cid,
      network: 'MAINNET',
    }),
  });

  const { to, data } = await result.json();

  const txResult = await walletClient.sendTransaction({
    to: to,
    value: 0n,
    data: data,
  });

  return { txResult, to, data, cid };
};
