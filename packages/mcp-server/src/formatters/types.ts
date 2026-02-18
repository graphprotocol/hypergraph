import type { TypeInfoWithProperties } from '../store.js';

export const formatTypesList = (types: TypeInfoWithProperties[], spaceName: string): string => {
  if (types.length === 0) {
    return `## Entity Types in ${spaceName}\n\nNo entity types found.`;
  }

  const header = '| Type | ID | Properties |\n|------|-----|------------|';
  const rows = types.map((t) => {
    const props = t.properties.length > 0 ? t.properties.map((p) => p.name).join(', ') : '(none)';
    return `| ${t.name} | ${t.id} | ${props} |`;
  });
  return `## Entity Types in ${spaceName}\n\n${header}\n${rows.join('\n')}`;
};
