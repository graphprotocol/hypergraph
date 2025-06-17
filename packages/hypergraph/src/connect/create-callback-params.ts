import { bytesToHex, hexToBytes, utf8ToBytes } from '@noble/hashes/utils';
import { cryptoBoxSeal } from '@serenity-kit/noble-sodium';

type CreateAuthUrlParams = {
  ephemeralPublicKey: string;
  expiry: number;
  nonce: string;
  appId: string;
  appIdentityAddress: string;
  appIdentityAddressPrivateKey: string;
  signaturePublicKey: string;
  signaturePrivateKey: string;
  encryptionPublicKey: string;
  encryptionPrivateKey: string;
  sessionToken: string;
  sessionTokenExpires: number;
  spaces: { id: string }[];
};

export const createCallbackParams = ({ nonce, ephemeralPublicKey, ...rest }: CreateAuthUrlParams) => {
  const ciphertext = cryptoBoxSeal({
    message: utf8ToBytes(JSON.stringify(rest)),
    publicKey: hexToBytes(ephemeralPublicKey.replace(/^0x/, '')),
  });

  return {
    ciphertext: bytesToHex(ciphertext),
    nonce,
  };
};
