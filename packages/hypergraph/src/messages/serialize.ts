// biome-ignore lint/suspicious/noExplicitAny: same as stringify
export function serialize(obj: any): string {
  return JSON.stringify(obj, (_key, value) => {
    if (value instanceof Uint8Array) {
      return { __type: 'Uint8Array', data: Array.from(value) };
    }
    if (value instanceof Date) {
      return { __type: 'Date', data: value.toISOString() };
    }
    return value;
  });
}

export function serializeV2(obj: any): any {
  return JSON.parse(
    JSON.stringify(obj, (_key, value) => {
      if (value instanceof Uint8Array) {
        return { __type: 'Uint8Array', data: Array.from(value) };
      }
      if (value instanceof Date) {
        return { __type: 'Date', data: value.toISOString() };
      }
      return value;
    }),
  );
}

export function deserialize(json: string): unknown {
  return JSON.parse(json, (_key, value) => {
    if (value && value.__type === 'Uint8Array') {
      return value.data;
    }
    if (value && value.__type === 'Date') {
      return new Date(value.data);
    }
    return value;
  });
}
