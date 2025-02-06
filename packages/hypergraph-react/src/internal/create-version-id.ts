import { Base58 } from '@graphprotocol/grc-20';
import { createHash } from 'node:crypto';
import { v4 } from 'uuid';

function createIdFromUniqueString(text: string) {
  const hashed = createHash('md5').update(text).digest('hex');
  const bytes = hexToBytesArray(hashed);
  // @ts-expect-error
  const uuid = v4({ random: bytes });
  return Base58.encodeBase58(uuid.split('-').join(''));
}

function hexToBytesArray(hex: string) {
  const bytes: number[] = [];

  for (let character = 0; character < hex.length; character += 2) {
    bytes.push(Number.parseInt(hex.slice(character, character + 2), 16));
  }

  return bytes;
}

export function createVersionId({ proposalId, entityId }: { proposalId: string; entityId: string }): string {
  return createIdFromUniqueString(`${proposalId}:${entityId}`);
}
