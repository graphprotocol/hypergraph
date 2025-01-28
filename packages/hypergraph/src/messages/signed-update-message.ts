import { secp256k1 } from '@noble/curves/secp256k1';
import { canonicalize, hexToBytes, stringToUint8Array } from '../utils/index.js';
import { encryptMessage } from './encrypt-message.js';
import type { RequestCreateUpdate } from './types.js';

interface Params {
  accountId: string;
  ephemeralId: string;
  spaceId: string;
  message: Uint8Array;
  secretKey: string;
  signaturePrivateKey: string;
}

export const signedUpdateMessage = ({
  accountId,
  ephemeralId,
  spaceId,
  message,
  secretKey,
  signaturePrivateKey,
}: Params): RequestCreateUpdate => {
  const update = encryptMessage({
    message,
    secretKey: hexToBytes(secretKey),
  });

  const messageToSign = stringToUint8Array(
    canonicalize({
      accountId,
      ephemeralId,
      update,
      spaceId,
    }),
  );

  const signature = secp256k1.sign(messageToSign, hexToBytes(signaturePrivateKey), { prehash: true }).toCompactHex();

  return {
    type: 'create-update',
    ephemeralId,
    update,
    spaceId,
    accountId,
    signature,
  };
};
