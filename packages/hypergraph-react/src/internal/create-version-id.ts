import { Base58 } from '@graphprotocol/grc-20';
import { md5 } from '@noble/hashes/legacy';
import { v4 } from 'uuid';

function createIdFromUniqueString(text: string) {
  const encoded = new TextEncoder().encode(text);
  const hashed = md5(encoded);
  const uuid = v4({ random: hashed });
  return Base58.encodeBase58(uuid.split('-').join(''));
}

export function createVersionId({ proposalId, entityId }: { proposalId: string; entityId: string }): string {
  return createIdFromUniqueString(`${proposalId}:${entityId}`);
}
