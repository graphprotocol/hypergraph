import type { TypeInfoWithProperties } from '../store.js';

export const formatTypesList = (types: TypeInfoWithProperties[], spaceName: string): string => {
  if (types.length === 0) {
    return `## Entity Types in ${spaceName}\n\nNo entity types found.`;
  }

  // Deduplicate by name, merge properties and collect all IDs
  const byName = new Map<
    string,
    { ids: string[]; properties: Map<string, { id: string; name: string; dataType: string }> }
  >();

  for (const t of types) {
    let entry = byName.get(t.name);
    if (!entry) {
      entry = { ids: [], properties: new Map() };
      byName.set(t.name, entry);
    }
    entry.ids.push(t.id);
    for (const p of t.properties) {
      entry.properties.set(p.id, p);
    }
  }

  const header = '| Type | IDs | Properties |\n|------|-----|------------|';
  const rows = [...byName.entries()].map(([name, entry]) => {
    const ids = entry.ids.join(', ');
    const propNames =
      entry.properties.size > 0 ? [...entry.properties.values()].map((p) => p.name).join(', ') : '(none)';
    return `| ${name} | ${ids} | ${propNames} |`;
  });
  return `## Entity Types in ${spaceName}\n\n${header}\n${rows.join('\n')}`;
};
