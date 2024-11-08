// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const serialize = (data: any) => {
  return JSON.stringify(data, (_key, value) => {
    if (value instanceof Uint8Array) {
      return { type: 'Uint8Array', data: Array.from(value) };
    }
    return value;
  });
};
