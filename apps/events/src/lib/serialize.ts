// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const serialize = (data: any) => {
  return JSON.stringify(data, (key, value) => {
    if (value instanceof Uint8Array) {
      return { type: "Uint8Array", data: Array.from(value) };
    }
    return value;
  });
};
