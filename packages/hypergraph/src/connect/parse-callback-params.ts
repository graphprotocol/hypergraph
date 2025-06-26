import { bytesToUtf8, hexToBytes } from '@noble/hashes/utils';
import { cryptoBoxSealOpen } from '@serenity-kit/noble-sodium';
import * as Effect from 'effect/Effect';
import * as Either from 'effect/Either';
import * as Schema from 'effect/Schema';
import { ConnectCallbackDecryptedData, type ConnectCallbackResult, FailedToParseAuthCallbackUrl } from '../types.js';

type ParseCallbackUrlParams = {
  ciphertext: string;
  nonce: string;
  storedNonce: string;
  storedExpiry: number;
  storedSecretKey: string;
  storedPublicKey: string;
};

const decodeDecryptedResult = Schema.decodeEither(ConnectCallbackDecryptedData);

export const parseCallbackParams = ({
  ciphertext,
  nonce,
  storedNonce,
  storedExpiry,
  storedSecretKey,
  storedPublicKey,
}: ParseCallbackUrlParams): Effect.Effect<ConnectCallbackResult, FailedToParseAuthCallbackUrl> => {
  if (nonce !== storedNonce) {
    return Effect.fail(new FailedToParseAuthCallbackUrl({ message: 'Invalid nonce' }));
  }

  try {
    const publicKey = hexToBytes(storedPublicKey);
    const decryptionResult = cryptoBoxSealOpen({
      ciphertext: hexToBytes(ciphertext),
      privateKey: hexToBytes(storedSecretKey),
      publicKey,
    });
    const decoded = decodeDecryptedResult(JSON.parse(bytesToUtf8(decryptionResult)));
    if (Either.isLeft(decoded)) {
      return Effect.fail(
        new FailedToParseAuthCallbackUrl({ message: 'Failed to parse connect auth callback payload' }),
      );
    }
    const data = decoded.right;
    if (data.expiry !== storedExpiry) {
      return Effect.fail(new FailedToParseAuthCallbackUrl({ message: 'Incorrect expiry' }));
    }
    if (data.expiry < Date.now()) {
      return Effect.fail(new FailedToParseAuthCallbackUrl({ message: 'Expired nonce' }));
    }

    return Effect.succeed({
      appIdentityAddress: data.appIdentityAddress,
      appIdentityAddressPrivateKey: data.appIdentityAddressPrivateKey,
      accountAddress: data.accountAddress,
      permissionId: data.permissionId,
      signaturePublicKey: data.signaturePublicKey,
      signaturePrivateKey: data.signaturePrivateKey,
      encryptionPublicKey: data.encryptionPublicKey,
      encryptionPrivateKey: data.encryptionPrivateKey,
      sessionToken: data.sessionToken,
      sessionTokenExpires: new Date(data.sessionTokenExpires),
      privateSpaces: data.privateSpaces,
      publicSpaces: data.publicSpaces,
    });
  } catch (error) {
    console.error(error);
    return Effect.fail(new FailedToParseAuthCallbackUrl({ message: 'Failed to parse connect auth callback payload' }));
  }
};
