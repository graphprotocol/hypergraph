export function shorten(val: string): string {
  if (val.length <= 18) {
    return val;
  }
  return `${val.substring(0, 6)}...${val.substring(val.length - 6, val.length)}`;
}
