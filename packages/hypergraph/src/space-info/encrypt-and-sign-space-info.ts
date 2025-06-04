import { secp256k1 } from '@noble/curves/secp256k1';
import { utf8ToBytes } from '@noble/hashes/utils';
import * as Schema from 'effect/Schema';
import { encryptMessage } from '../messages/encrypt-message.js';
import { canonicalize, hexToBytes, stringToUint8Array } from '../utils/index.js';
import { SpaceInfoContent } from './types.js';

interface EncryptAndSignInfoParams {
  accountAddress: string;
  name: string;
  secretKey: string;
  signaturePrivateKey: string;
  spaceId: string;
}

const encodeSpaceInfoContent = Schema.encodeSync(SpaceInfoContent);

export const encryptAndSignSpaceInfo = ({
  accountAddress,
  name,
  secretKey,
  signaturePrivateKey,
  spaceId,
}: EncryptAndSignInfoParams) => {
  const infoContent = encryptMessage({
    message: utf8ToBytes(JSON.stringify(encodeSpaceInfoContent({ name: name }))),
    secretKey: hexToBytes(secretKey),
  });

  const messageToSign = stringToUint8Array(
    canonicalize({
      accountAddress,
      infoContent,
      spaceId,
    }),
  );

  const recoverySignature = secp256k1.sign(messageToSign, hexToBytes(signaturePrivateKey), { prehash: true });

  const signature = {
    hex: recoverySignature.toCompactHex(),
    recovery: recoverySignature.recovery,
  };

  return {
    infoContent,
    accountAddress,
    signature,
  };
};
