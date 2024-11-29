import { blake3 } from '@noble/hashes/blake3';
import { bytesToHex } from '@noble/hashes/utils';

import { canonicalize } from '@graph-framework/utils';

import type { SpaceEvent } from './types.js';

export const hashEvent = (event: SpaceEvent): string => {
  const hash = blake3(canonicalize(event));
  return bytesToHex(hash);
};
