console.log('Hello, world!');
import bs58check from 'bs58check';
import { v4 as uuidv4 } from 'uuid';

const BASE58_ALLOWED_CHARS = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

export type Base58 = string;

export function encodeBase58(val: string): Base58 {
  const hex = BigInt(`0x${val}`);
  let remainder = hex;
  const result: string[] = []; // Use an array to store encoded characters

  while (remainder > 0n) {
    const mod = remainder % 58n;
    const base58CharAtMod = BASE58_ALLOWED_CHARS[Number(mod)];
    if (base58CharAtMod) {
      result.push(base58CharAtMod);
    }
    remainder = remainder / 58n;
  }

  // Reverse and join the array to get the final Base58 encoded string
  return result.reverse().join('');
}

function base58Encode(data: Uint8Array): string {
  const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

  if (data.length === 0) {
    return '';
  }

  // Count leading zeros
  let zeroCount = 0;
  for (let i = 0; i < data.length && data[i] === 0; i++) {
    zeroCount++;
  }

  // Convert data into a big integer
  let x = BigInt(0);
  for (let i = 0; i < data.length; i++) {
    x = (x << 8n) + BigInt(data[i]);
  }

  // Base58 encode the integer
  let encoded = '';
  while (x > 0) {
    const remainder = x % 58n;
    x = x / 58n;
    encoded = BASE58_ALPHABET[Number(remainder)] + encoded;
  }

  // Add '1' for each leading zero byte
  for (let i = 0; i < zeroCount; i++) {
    encoded = '1' + encoded;
  }

  return encoded;
}

const generateId1 = () => {
  const id = uuidv4({}, new Uint8Array(16));
  return bs58check.encode(id);
};

const generateId2 = () => {
  const id = uuidv4();
  // @ts-expect-error replaceAll is not supported in the types
  const stripped = id.replaceAll(/-/g, '');
  return encodeBase58(stripped);
};

const generateId3 = () => {
  const id = uuidv4({}, new Uint8Array(16));
  return base58Encode(id);
};

const iterations = 5;

for (let i = 0; i < iterations; i++) {
  const id = generateId1();
  console.log(id.length);
}

console.log('--------------------------------');

for (let i = 0; i < iterations; i++) {
  const id = generateId2();
  console.log(id.length);
}

console.log('--------------------------------');

for (let i = 0; i < iterations; i++) {
  const id = generateId3();
  console.log(id.length);
}
