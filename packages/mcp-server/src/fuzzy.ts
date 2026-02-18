import type { SpaceInfo, TypeInfo } from './store.js';

export const normalize = (input: string): string =>
  input
    .toLowerCase()
    .replace(/\b(the|space|one|program)\b/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();

export const resolveSpace = (input: string, spaces: SpaceInfo[]): SpaceInfo | undefined => {
  const normalized = normalize(input);
  if (normalized === '') return undefined;

  return (
    spaces.find((s) => normalize(s.name) === normalized) ??
    spaces.find((s) => normalize(s.name).startsWith(normalized)) ??
    spaces.find((s) => normalize(s.name).includes(normalized)) ??
    spaces.find((s) => normalized.includes(normalize(s.name)))
  );
};

export const resolveType = <T extends TypeInfo>(name: string, types: T[]): T | undefined => {
  const lower = name.toLowerCase();

  return (
    types.find((t) => t.name.toLowerCase() === lower) ??
    types.find((t) => t.name.toLowerCase().startsWith(lower)) ??
    types.find((t) => t.name.toLowerCase().includes(lower))
  );
};
