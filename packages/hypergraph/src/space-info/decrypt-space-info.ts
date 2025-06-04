import { bytesToUtf8 } from '@noble/hashes/utils';
import * as Schema from 'effect/Schema';
import { decryptMessage } from '../messages/index.js';
import { hexToBytes } from '../utils/index.js';
import { SpaceInfoContent } from './types.js';

const decodeSpaceInfoContent = Schema.decodeSync(SpaceInfoContent);

export const decryptSpaceInfo = ({
  spaceInfo,
  secretKey,
}: {
  spaceInfo: Uint8Array;
  secretKey: string;
}) => {
  const decrypted = decryptMessage({
    nonceAndCiphertext: spaceInfo,
    secretKey: hexToBytes(secretKey),
  });
  const spaceInfoContent = decodeSpaceInfoContent(JSON.parse(bytesToUtf8(decrypted)));
  return spaceInfoContent;
};
