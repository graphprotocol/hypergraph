import { secp256k1 } from '@noble/curves/secp256k1';
import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex, canonicalize, hexToBytes, stringToUint8Array } from '../utils/index.js';
import { encryptMessage } from './encrypt-message.js';
import type { RequestCreateUpdate } from './types.js';

interface SignedMessageParams {
  accountId: string;
  ephemeralId: string;
  spaceId: string;
  message: Uint8Array;
  secretKey: string;
  signaturePrivateKey: string;
}

interface RecoverParams {
  update: Uint8Array;
  spaceId: string;
  ephemeralId: string;
  signature: {
    hex: string;
    recovery: number;
  };
  accountId: string;
}

export const signedUpdateMessage = ({
  accountId,
  ephemeralId,
  spaceId,
  message,
  secretKey,
  signaturePrivateKey,
}: SignedMessageParams): RequestCreateUpdate => {
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

  const recoverySignature = secp256k1.sign(messageToSign, hexToBytes(signaturePrivateKey), { prehash: true });

  const signature = {
    hex: recoverySignature.toCompactHex(),
    recovery: recoverySignature.recovery,
  };

  return {
    type: 'create-update',
    ephemeralId,
    update,
    spaceId,
    accountId,
    signature,
  };
};

export const recoverUpdateMessageSigner = ({
  update,
  spaceId,
  ephemeralId,
  signature,
  accountId,
}: RecoverParams | RequestCreateUpdate) => {
  const recoveredSignature = secp256k1.Signature.fromCompact(signature.hex).addRecoveryBit(signature.recovery);
  const signedMessage = stringToUint8Array(
    canonicalize({
      accountId,
      ephemeralId,
      update,
      spaceId,
    }),
  );
  const signedMessageHash = sha256(signedMessage);
  return bytesToHex(recoveredSignature.recoverPublicKey(signedMessageHash).toRawBytes(true));
};
