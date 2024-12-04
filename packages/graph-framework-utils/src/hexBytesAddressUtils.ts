import { bytesToHex as nobleBytesToHex, hexToBytes as nobleHexToBytes } from '@noble/ciphers/utils';
import { ProjectivePoint } from '@noble/secp256k1';
import { publicKeyToAddress as viemPublicKeyToAddress } from 'viem/accounts';

export type Hex = `0x${string}`;

export const bytesToHex = (bytes: Uint8Array): Hex => {
  return `0x${nobleBytesToHex(bytes)}`;
};

export const hexToBytes = (hex: Hex): Uint8Array => {
  return nobleHexToBytes(hex.slice(2));
};

function decompressPublicKey(compressedKey: Hex): Hex {
  // Decompress the public key
  const point = ProjectivePoint.fromHex(compressedKey.slice(2));

  // Get the uncompressed public key
  const uncompressedKey = point.toRawBytes(false); // `false` = uncompressed format
  return bytesToHex(uncompressedKey);
}
export const publicKeyToAddress = (publicKey: Hex): string => {
  const uncompressedKey = decompressPublicKey(publicKey);
  return viemPublicKeyToAddress(uncompressedKey);
};
