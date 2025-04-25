import type { Id } from '@graphprotocol/grc-20';
import { sha256 } from '@noble/hashes/sha256';
import { stringify as uuidStringify } from 'uuid';
import { encodeBase58 } from './base58.js';
import { decodeBase58 } from './internal/base58Utils.js';

type RelationIdParams = {
  fromId: Id.Id;
  toId: Id.Id;
  entityId: Id.Id;
};

export const relationId = ({ fromId, toId, entityId }: RelationIdParams): string => {
  const ids = [fromId, toId, entityId];

  // decode and verify all three inputs
  const decodedIds = ids.map((id) => {
    const buf = decodeBase58(id);
    if (buf.length !== 16) {
      throw new Error(`Invalid UUID length for ID: ${id}`);
    }
    return buf;
  });

  // concatenate into 48 bytes
  const combined = new Uint8Array(48);
  decodedIds.forEach((buf, i) => combined.set(buf, i * 16));

  let attempt = 0;
  while (true) {
    // deterministic “salt” = combined || attempt
    const seed = new Uint8Array(combined.length + 1);
    seed.set(combined);
    seed[combined.length] = attempt;

    // hash → first 16 bytes → set UUIDv4 bits
    const hash = sha256(seed).slice(0, 16);
    hash[6] = (hash[6] & 0x0f) | 0x40;
    hash[8] = (hash[8] & 0x3f) | 0x80;

    const uuidString = uuidStringify(hash);
    const stripped = uuidString.replaceAll(/-/g, '');
    // encode and check length
    const result = encodeBase58(stripped);
    if (result.length === 22) return result;

    attempt++;
  }
};
