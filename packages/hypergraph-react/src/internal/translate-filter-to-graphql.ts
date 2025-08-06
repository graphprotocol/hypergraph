import { Graph } from '@graphprotocol/grc-20';
import { type Entity, type Mapping, TypeUtils } from '@graphprotocol/hypergraph';
import type * as Schema from 'effect/Schema';

type GraphqlFilterEntry =
  | {
      values: {
        some:
          | {
              propertyId: { is: string };
              string: { is: string } | { startsWith: string } | { endsWith: string } | { includes: string };
            }
          | {
              propertyId: { is: string };
              boolean: { is: boolean };
            }
          | {
              propertyId: { is: string };
              number: { is: string } | { greaterThan: string } | { lessThan: string };
            };
      };
    }
  | {
      not: GraphqlFilterEntry;
    }
  | {
      or: GraphqlFilterEntry[];
    }
  | {
      and: GraphqlFilterEntry[];
    }
  | { [k: string]: never };

/**
 * Translates internal filter format to GraphQL filter format
 * Maps the internal EntityFieldFilter structure to the expected GraphQL filter structure
 */
export function translateFilterToGraphql<S extends Entity.AnyNoContext>(
  filter: { [K in keyof Schema.Schema.Type<S>]?: Entity.EntityFieldFilter<Schema.Schema.Type<S>[K]> } | undefined,
  type: S,
  mapping: Mapping.Mapping,
): GraphqlFilterEntry {
  if (!filter) {
    return {};
  }

  // @ts-expect-error TODO should use the actual type instead of the name in the mapping
  const typeName = type.name;

  const mappingEntry = mapping[typeName];
  if (!mappingEntry) {
    throw new Error(`Mapping entry for ${typeName} not found`);
  }

  const graphqlFilter: GraphqlFilterEntry[] = [];

  for (const [fieldName, fieldFilter] of Object.entries(filter)) {
    if (fieldName === 'or') {
      graphqlFilter.push({
        or: fieldFilter.map(
          (filter: { [K in keyof Schema.Schema.Type<S>]?: Entity.EntityFieldFilter<Schema.Schema.Type<S>[K]> }) =>
            translateFilterToGraphql(filter, type, mapping),
        ),
      });
      continue;
    }

    if (fieldName === 'not') {
      graphqlFilter.push({
        not: translateFilterToGraphql(fieldFilter, type, mapping),
      });
      continue;
    }

    if (!fieldFilter) continue;

    const propertyId = mappingEntry?.properties?.[fieldName];

    if (propertyId) {
      if (
        TypeUtils.isStringOrOptionalStringType(type.fields[fieldName]) &&
        (fieldFilter.is || fieldFilter.startsWith || fieldFilter.endsWith || fieldFilter.contains)
      ) {
        graphqlFilter.push({
          values: {
            some: {
              propertyId: { is: propertyId },
              string: fieldFilter.is
                ? { is: fieldFilter.is }
                : fieldFilter.startsWith
                  ? { startsWith: fieldFilter.startsWith }
                  : fieldFilter.endsWith
                    ? { endsWith: fieldFilter.endsWith }
                    : { includes: fieldFilter.contains },
            },
          },
        });
      }

      if (TypeUtils.isBooleanOrOptionalBooleanType(type.fields[fieldName]) && fieldFilter.is) {
        graphqlFilter.push({
          values: {
            some: {
              propertyId: { is: propertyId },
              boolean: { is: fieldFilter.is },
            },
          },
        });
      }

      if (
        TypeUtils.isNumberOrOptionalNumberType(type.fields[fieldName]) &&
        (fieldFilter.is || fieldFilter.greaterThan || fieldFilter.lessThan)
      ) {
        graphqlFilter.push({
          values: {
            some: {
              propertyId: { is: propertyId },
              number: fieldFilter.is
                ? { is: Graph.serializeNumber(fieldFilter.is) }
                : fieldFilter.greaterThan
                  ? { greaterThan: Graph.serializeNumber(fieldFilter.greaterThan) }
                  : { lessThan: Graph.serializeNumber(fieldFilter.lessThan) },
            },
          },
        });
      }
    }
  }

  if (graphqlFilter.length === 1) {
    return graphqlFilter[0];
  }

  return {
    and: graphqlFilter,
  };
}
