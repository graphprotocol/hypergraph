/**
 * Export all data from Hypergraph knowledge graph spaces to CSV files.
 *
 * Usage: npx tsx scripts/export-csv.ts <space_id_1> [space_id_2] ...
 *
 * Output structure:
 *   output/{space_id}/types.csv              — types with properties & relations summary
 *   output/{space_id}/type_schemas.csv        — detailed per-type property & relation rows
 *   output/{space_id}/properties.csv
 *   output/{space_id}/entities_{TypeName}.csv
 *   output/{space_id}/relations.csv
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const ENDPOINT = 'https://testnet-api.geobrowser.io/graphql';
const PAGE_SIZE = 10_000;

// ---------------------------------------------------------------------------
// GraphQL queries (copied from packages/mcp-server/src/graphql-client.ts)
// ---------------------------------------------------------------------------

const TYPES_LIST_QUERY = /* GraphQL */ `
  query TypesList($spaceId: UUID!, $first: Int) {
    typesList(spaceId: $spaceId, first: $first) {
      id
      name
    }
  }
`;

const PROPERTIES_QUERY = /* GraphQL */ `
  query Properties($spaceId: UUID!, $first: Int, $offset: Int) {
    properties(spaceId: $spaceId, first: $first, offset: $offset) {
      id
      name
      dataTypeName
    }
  }
`;

const ENTITIES_QUERY = /* GraphQL */ `
  query PrefetchEntities($spaceId: UUID!, $first: Int, $offset: Int) {
    entities(spaceId: $spaceId, first: $first, offset: $offset) {
      id
      name
      typeIds
      valuesList(filter: { spaceId: { is: $spaceId } }) {
        propertyId
        text
        boolean
        float
        datetime
        point
        schedule
      }
      relationsList(filter: { spaceId: { is: $spaceId } }) {
        typeId
        toEntity {
          id
          name
        }
      }
    }
  }
`;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type GqlType = { id: string; name: string | null };
type GqlProperty = { id: string; name: string | null; dataTypeName: string | null };
type GqlValue = {
  propertyId: string;
  text: string | null;
  boolean: boolean | null;
  float: number | null;
  datetime: string | null;
  point: unknown | null;
  schedule: unknown | null;
};
type GqlRelation = { typeId: string; toEntity: { id: string; name: string | null } };
type GqlEntity = {
  id: string;
  name: string | null;
  typeIds: string[];
  valuesList: GqlValue[];
  relationsList: GqlRelation[];
};

// ---------------------------------------------------------------------------
// GraphQL fetch helper
// ---------------------------------------------------------------------------

async function gql<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`GraphQL request failed: ${res.status} ${res.statusText}`);
  const json = (await res.json()) as { data: T; errors?: unknown[] };
  if (json.errors) throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`);
  return json.data;
}

// ---------------------------------------------------------------------------
// Paginated fetchers
// ---------------------------------------------------------------------------

async function fetchTypes(spaceId: string): Promise<GqlType[]> {
  const data = await gql<{ typesList: GqlType[] | null }>(TYPES_LIST_QUERY, { spaceId, first: 1000 });
  return data.typesList ?? [];
}

async function fetchAllProperties(spaceId: string): Promise<GqlProperty[]> {
  const all: GqlProperty[] = [];
  let offset = 0;
  while (true) {
    const data = await gql<{ properties: GqlProperty[] }>(PROPERTIES_QUERY, {
      spaceId,
      first: PAGE_SIZE,
      offset,
    });
    all.push(...data.properties);
    if (data.properties.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }
  return all;
}

async function fetchAllEntities(spaceId: string): Promise<GqlEntity[]> {
  const all: GqlEntity[] = [];
  let offset = 0;
  while (true) {
    const data = await gql<{ entities: GqlEntity[] }>(ENTITIES_QUERY, {
      spaceId,
      first: PAGE_SIZE,
      offset,
    });
    all.push(...data.entities);
    if (data.entities.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }
  return all;
}

// ---------------------------------------------------------------------------
// CSV helpers
// ---------------------------------------------------------------------------

function escapeField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function toCsv(headers: string[], rows: string[][]): string {
  const lines = [headers.map(escapeField).join(',')];
  for (const row of rows) {
    lines.push(row.map(escapeField).join(','));
  }
  return lines.join('\n') + '\n';
}

function extractValue(v: GqlValue): string {
  if (v.text != null) return v.text;
  if (v.float != null) return String(v.float);
  if (v.boolean != null) return String(v.boolean);
  if (v.datetime != null) return v.datetime;
  return '';
}

/** Sanitize a type name for use in a filename. */
function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, '_');
}

// ---------------------------------------------------------------------------
// Export logic
// ---------------------------------------------------------------------------

async function exportSpace(spaceId: string) {
  console.log(`\nFetching data for space: ${spaceId}`);

  const [types, properties, entities] = await Promise.all([
    fetchTypes(spaceId),
    fetchAllProperties(spaceId),
    fetchAllEntities(spaceId),
  ]);

  console.log(`  Types: ${types.length}, Properties: ${properties.length}, Entities: ${entities.length}`);

  // Build lookup maps
  const typeById = new Map(types.map((t) => [t.id, t.name ?? t.id]));
  const propById = new Map(properties.map((p) => [p.id, p]));

  const outDir = join(process.cwd(), 'output', spaceId);
  await mkdir(outDir, { recursive: true });

  // --- Infer type-to-property and type-to-relation mappings from entities ---
  const typePropertyIds = new Map<string, Set<string>>();
  // Maps: typeId -> relTypeId -> Set<targetEntityId>
  const typeRelationIndex = new Map<string, Map<string, Set<string>>>();

  for (const entity of entities) {
    for (const typeId of entity.typeIds) {
      // Track properties
      let propIds = typePropertyIds.get(typeId);
      if (!propIds) { propIds = new Set(); typePropertyIds.set(typeId, propIds); }
      for (const v of entity.valuesList) {
        propIds.add(v.propertyId);
      }
      // Track relations
      let relMap = typeRelationIndex.get(typeId);
      if (!relMap) { relMap = new Map(); typeRelationIndex.set(typeId, relMap); }
      for (const rel of entity.relationsList) {
        let targetSet = relMap.get(rel.typeId);
        if (!targetSet) { targetSet = new Set(); relMap.set(rel.typeId, targetSet); }
        targetSet.add(rel.toEntity.id);
      }
    }
  }

  // Build entity-to-typeNames lookup for resolving relation targets
  const entityTypeNames = new Map<string, Set<string>>();
  for (const entity of entities) {
    const names = new Set<string>();
    for (const tid of entity.typeIds) {
      const tName = typeById.get(tid);
      if (tName) names.add(tName);
    }
    entityTypeNames.set(entity.id, names);
  }

  // Resolve type properties: typeId -> Array<{id, name, dataType}>
  const resolvedTypeProperties = new Map<string, Array<{ id: string; name: string; dataType: string }>>();
  for (const [typeId, propIds] of typePropertyIds) {
    const props: Array<{ id: string; name: string; dataType: string }> = [];
    for (const pid of propIds) {
      const info = propById.get(pid);
      if (info) {
        props.push({ id: pid, name: info.name ?? pid, dataType: info.dataTypeName ?? 'unknown' });
      }
    }
    props.sort((a, b) => a.name.localeCompare(b.name));
    resolvedTypeProperties.set(typeId, props);
  }

  // Resolve type relations: typeId -> Array<{name, targetTypes}>
  const resolvedTypeRelations = new Map<string, Array<{ id: string; name: string; targetTypes: string[] }>>();
  for (const [typeId, relMap] of typeRelationIndex) {
    const relations: Array<{ id: string; name: string; targetTypes: string[] }> = [];
    for (const [relTypeId, targetEntityIds] of relMap) {
      const relName = propById.get(relTypeId)?.name ?? relTypeId;
      const targetTypeNames = new Set<string>();
      for (const targetId of targetEntityIds) {
        const names = entityTypeNames.get(targetId);
        if (names) {
          for (const n of names) targetTypeNames.add(n);
        }
      }
      relations.push({ id: relTypeId, name: relName, targetTypes: [...targetTypeNames].sort() });
    }
    relations.sort((a, b) => a.name.localeCompare(b.name));
    resolvedTypeRelations.set(typeId, relations);
  }

  // --- types.csv (enhanced with properties and relations summary) ---
  const typesRows = types.map((t) => {
    const props = resolvedTypeProperties.get(t.id) ?? [];
    const rels = resolvedTypeRelations.get(t.id) ?? [];
    const propsSummary = props.map((p) => `${p.name} (${p.dataType})`).join('; ');
    const relsSummary = rels.map((r) => `${r.name} → ${r.targetTypes.join('/')}`).join('; ');
    return [t.id, t.name ?? '', propsSummary, relsSummary];
  });
  await writeFile(join(outDir, 'types.csv'), toCsv(['type_id', 'type_name', 'properties', 'relations'], typesRows));
  console.log(`  Wrote types.csv (${types.length} rows)`);

  // --- type_schemas.csv (one row per type-property, detailed) ---
  const schemaRows: string[][] = [];
  for (const t of types) {
    const props = resolvedTypeProperties.get(t.id) ?? [];
    const rels = resolvedTypeRelations.get(t.id) ?? [];
    for (const p of props) {
      schemaRows.push([t.id, t.name ?? '', 'property', p.id, p.name, p.dataType, '']);
    }
    for (const r of rels) {
      schemaRows.push([t.id, t.name ?? '', 'relation', r.id, r.name, '', r.targetTypes.join('; ')]);
    }
  }
  await writeFile(
    join(outDir, 'type_schemas.csv'),
    toCsv(['type_id', 'type_name', 'kind', 'attribute_id', 'attribute_name', 'data_type', 'target_types'], schemaRows),
  );
  console.log(`  Wrote type_schemas.csv (${schemaRows.length} rows)`);

  // --- properties.csv ---
  const propsRows = properties.map((p) => [p.id, p.name ?? '', p.dataTypeName ?? '']);
  await writeFile(
    join(outDir, 'properties.csv'),
    toCsv(['property_id', 'property_name', 'data_type'], propsRows),
  );
  console.log(`  Wrote properties.csv (${properties.length} rows)`);

  // --- relations.csv ---
  const relationRows: string[][] = [];
  for (const entity of entities) {
    for (const rel of entity.relationsList) {
      relationRows.push([
        entity.id,
        entity.name ?? '',
        rel.typeId,
        typeById.get(rel.typeId) ?? rel.typeId,
        rel.toEntity.id,
        rel.toEntity.name ?? '',
      ]);
    }
  }
  await writeFile(
    join(outDir, 'relations.csv'),
    toCsv(
      ['from_entity_id', 'from_entity_name', 'relation_type_id', 'relation_type_name', 'to_entity_id', 'to_entity_name'],
      relationRows,
    ),
  );
  console.log(`  Wrote relations.csv (${relationRows.length} rows)`);

  // --- entities_{TypeName}.csv (one per type) ---
  // Group entities by type
  const entitiesByType = new Map<string, GqlEntity[]>();
  for (const entity of entities) {
    for (const typeId of entity.typeIds) {
      let list = entitiesByType.get(typeId);
      if (!list) {
        list = [];
        entitiesByType.set(typeId, list);
      }
      list.push(entity);
    }
  }

  for (const [typeId, typeEntities] of entitiesByType) {
    const typeName = typeById.get(typeId) ?? typeId;

    // Collect all property IDs used by entities of this type
    const propIdsUsed = new Set<string>();
    for (const e of typeEntities) {
      for (const v of e.valuesList) {
        propIdsUsed.add(v.propertyId);
      }
    }

    // Build column list with disambiguation for duplicate names
    const propIds = [...propIdsUsed];
    const nameCount = new Map<string, number>();
    for (const pid of propIds) {
      const name = propById.get(pid)?.name ?? pid;
      nameCount.set(name, (nameCount.get(name) ?? 0) + 1);
    }

    const colName = new Map<string, string>();
    for (const pid of propIds) {
      const name = propById.get(pid)?.name ?? pid;
      if ((nameCount.get(name) ?? 0) > 1) {
        colName.set(pid, `${name} (${pid.slice(0, 8)})`);
      } else {
        colName.set(pid, name);
      }
    }

    const headers = ['entity_id', 'entity_name', ...propIds.map((pid) => colName.get(pid)!)];
    const rows: string[][] = [];
    for (const e of typeEntities) {
      const valByProp = new Map(e.valuesList.map((v) => [v.propertyId, v]));
      const row = [e.id, e.name ?? ''];
      for (const pid of propIds) {
        const v = valByProp.get(pid);
        row.push(v ? extractValue(v) : '');
      }
      rows.push(row);
    }

    const filename = `entities_${sanitizeFilename(typeName)}.csv`;
    await writeFile(join(outDir, filename), toCsv(headers, rows));
    console.log(`  Wrote ${filename} (${rows.length} rows)`);
  }

  console.log(`  Done. Output: ${outDir}`);
}

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------

async function main() {
  const spaceIds = process.argv.slice(2);
  if (spaceIds.length === 0) {
    console.error('Usage: npx tsx scripts/export-csv.ts <space_id_1> [space_id_2] ...');
    process.exit(1);
  }

  for (const spaceId of spaceIds) {
    await exportSpace(spaceId);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
