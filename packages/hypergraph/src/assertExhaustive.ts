export function assertExhaustive(_value: never, message = 'Reached unexpected case in exhaustive switch'): never {
  throw new Error(message);
}
