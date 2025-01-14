import { bytesToHex as nobleBytesToHex, hexToBytes as nobleHexToBytes } from '@noble/ciphers/utils';
import { ProjectivePoint } from '@noble/secp256k1';
import type { Hex } from 'viem';
import { publicKeyToAddress as viemPublicKeyToAddress } from 'viem/accounts';

export const bytesToHex = (bytes: Uint8Array): string => {
  return `0x${nobleBytesToHex(bytes)}`;
};

export const hexToBytes = (hex: string): Uint8Array => {
  return nobleHexToBytes(hex.slice(2));
};

function decompressPublicKey(compressedKey: string): string {
  // Decompress the public key
  const point = ProjectivePoint.fromHex(compressedKey.slice(2));

  // Get the uncompressed public key
  const uncompressedKey = point.toRawBytes(false); // `false` = uncompressed format
  return bytesToHex(uncompressedKey);
}
export const publicKeyToAddress = (publicKey: string): string => {
  const uncompressedKey = decompressPublicKey(publicKey);
  return viemPublicKeyToAddress(uncompressedKey as Hex);
};
