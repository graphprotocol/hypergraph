import type { TypeInfoWithProperties } from '../store.js';

export const formatTypesList = (types: TypeInfoWithProperties[], spaceName: string): string => {
  if (types.length === 0) {
    return `## Entity Types in ${spaceName}\n\nNo entity types found.`;
  }

  // Deduplicate by name, merge properties/relations and collect all IDs
  const byName = new Map<
    string,
    {
      ids: string[];
      properties: Map<string, { id: string; name: string; dataType: string }>;
      relations: Map<string, { id: string; name: string; targetTypeNames: string[] }>;
    }
  >();

  for (const t of types) {
    let entry = byName.get(t.name);
    if (!entry) {
      entry = { ids: [], properties: new Map(), relations: new Map() };
      byName.set(t.name, entry);
    }
    entry.ids.push(t.id);
    for (const p of t.properties) {
      entry.properties.set(p.id, p);
    }
    for (const r of t.relations) {
      entry.relations.set(r.id, r);
    }
  }

  const header = '| Type | IDs | Properties | Relations |\n|------|-----|------------|-----------|';
  const rows = [...byName.entries()].map(([name, entry]) => {
    const ids = entry.ids.join(', ');
    const propNames =
      entry.properties.size > 0 ? [...entry.properties.values()].map((p) => p.name).join(', ') : '(none)';
    const relNames =
      entry.relations.size > 0
        ? [...entry.relations.values()]
            .map((r) => (r.targetTypeNames.length > 0 ? `${r.name} → ${r.targetTypeNames.join('/')}` : r.name))
            .join(', ')
        : '(none)';
    return `| ${name} | ${ids} | ${propNames} | ${relNames} |`;
  });
  return `## Entity Types in ${spaceName}\n\n${header}\n${rows.join('\n')}`;
};

export const formatAllSpacesTypesList = (
  spaces: Array<{ name: string; types: TypeInfoWithProperties[] }>,
): string => {
  const sections = spaces
    .filter((s) => s.types.length > 0)
    .map((s) => formatTypesList(s.types, s.name));

  if (sections.length === 0) {
    return '## Entity Types across all spaces\n\nNo entity types found.';
  }

  return `## Entity Types across all spaces\n\n${sections.join('\n\n')}`;
};
