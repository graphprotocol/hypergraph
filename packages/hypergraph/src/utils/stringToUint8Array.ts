const encoder = new TextEncoder();

export const stringToUint8Array = (str: string): Uint8Array => {
  return encoder.encode(str);
};
