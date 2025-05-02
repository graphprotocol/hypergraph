const encoder = new TextEncoder();
const decoder = new TextDecoder();
export const stringToUint8Array = (str: string): Uint8Array => {
  return encoder.encode(str);
};

export const uint8ArrayToString = (uint8Array: Uint8Array): string => {
  return decoder.decode(uint8Array);
};
