// biome-ignore lint/suspicious/noExplicitAny: same as stringify
export function serialize(obj: any): string {
  return JSON.stringify(obj, (_key, value) => {
    if (value instanceof Uint8Array) {
      return { __type: 'Uint8Array', data: Array.from(value) };
    }
    return value;
  });
}

export function deserialize(json: string): unknown {
  return JSON.parse(json, (_key, value) => {
    if (value && value.__type === 'Uint8Array') {
      return value.data;
    }
    return value;
  });
}
