import type { GeoSmartAccount, Op } from '@graphprotocol/grc-20';
import { Ipfs } from '@graphprotocol/grc-20';
import type { Hash } from 'viem';

type PublishParams = {
  name: string;
  ops: Op[];
  walletClient: GeoSmartAccount;
  space: string;
  network: 'TESTNET' | 'MAINNET';
};

type PublishResult = {
  txResult: Hash;
  to: Hash;
  data: Hash;
  cid: string;
};

export const publishOps = async ({
  name,
  ops,
  walletClient,
  space,
  network,
}: PublishParams): Promise<PublishResult> => {
  const address = walletClient.account?.address;
  if (!address) {
    throw new Error('No address found');
  }

  const publishResult = await Ipfs.publishEdit({
    name,
    ops: ops,
    author: address,
    network,
  });

  const cid = publishResult.cid;

  // This returns the correct contract address and calldata depending on the space id
  const result = await fetch(`https://hypergraph-v2-testnet.up.railway.app/space/${space}/edit/calldata`, {
    method: 'POST',
    body: JSON.stringify({ cid }),
  });

  const { to, data } = await result.json();

  const txResult = await walletClient.sendTransaction({
    to: to,
    value: 0n,
    data: data,
  });

  return { txResult, to, data, cid };
};
