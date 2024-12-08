export const BASE58_ALLOWED_CHARS = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

export function decodeBase58(str: string) {
  let x = BigInt(0);
  for (let i = 0; i < str.length; i++) {
    const charIndex = BASE58_ALLOWED_CHARS.indexOf(str[i]);
    if (charIndex < 0) {
      throw new Error('Invalid Base58 character');
    }
    x = x * 58n + BigInt(charIndex);
  }

  const bytes: number[] = [];
  while (x > 0) {
    bytes.push(Number(x % 256n));
    x = x >> 8n;
  }

  bytes.reverse();
  // Pad to 16 bytes for a UUID
  while (bytes.length < 16) {
    bytes.unshift(0);
  }

  return new Uint8Array(bytes);
}

export function encodeBase58(data: Uint8Array) {
  let x = BigInt(0);
  for (const byte of data) {
    x = (x << 8n) + BigInt(byte);
  }

  let encoded = '';
  while (x > 0) {
    const remainder = x % 58n;
    x = x / 58n;
    encoded = BASE58_ALLOWED_CHARS[Number(remainder)] + encoded;
  }

  // deal with leading zeros (0x00 bytes)
  for (let i = 0; i < data.length && data[i] === 0; i++) {
    encoded = `1${encoded}`;
  }

  return encoded;
}
