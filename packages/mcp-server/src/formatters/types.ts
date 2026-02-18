import type { TypeInfo } from '../store.js';

export const formatTypesList = (types: TypeInfo[], spaceName: string): string => {
  if (types.length === 0) {
    return `## Entity Types in ${spaceName}\n\nNo entity types found.`;
  }

  const header = '| Type | ID |\n|------|-----|';
  const rows = types.map((t) => `| ${t.name} | ${t.id} |`);
  return `## Entity Types in ${spaceName}\n\n${header}\n${rows.join('\n')}`;
};
