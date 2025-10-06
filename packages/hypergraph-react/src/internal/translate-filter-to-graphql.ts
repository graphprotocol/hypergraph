import { Graph } from '@graphprotocol/grc-20';
import { Constants, type Entity } from '@graphprotocol/hypergraph';
import * as Option from 'effect/Option';
import type * as Schema from 'effect/Schema';
import * as SchemaAST from 'effect/SchemaAST';

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
export function translateFilterToGraphql<S extends Schema.Schema.AnyNoContext>(
  filter: { [K in keyof Schema.Schema.Type<S>]?: Entity.EntityFieldFilter<Schema.Schema.Type<S>[K]> } | undefined,
  type: S,
): GraphqlFilterEntry {
  if (!filter) {
    return {};
  }

  const graphqlFilter: GraphqlFilterEntry[] = [];

  for (const [fieldName, fieldFilter] of Object.entries(filter)) {
    if (fieldName === 'or') {
      graphqlFilter.push({
        or: fieldFilter.map(
          (filter: { [K in keyof Schema.Schema.Type<S>]?: Entity.EntityFieldFilter<Schema.Schema.Type<S>[K]> }) =>
            translateFilterToGraphql(filter, type),
        ),
      });
      continue;
    }

    if (fieldName === 'not') {
      graphqlFilter.push({
        not: translateFilterToGraphql(fieldFilter, type),
      });
      continue;
    }

    if (!fieldFilter) continue;

    const ast = type.ast as SchemaAST.TypeLiteral;
    const propertySignature = ast.propertySignatures.find((a) => a.name === fieldName);
    if (!propertySignature) continue;

    // find the property id for the field
    const propertyId = SchemaAST.getAnnotation<string>(Constants.PropertyIdSymbol)(propertySignature.type);
    const propertyType = SchemaAST.getAnnotation<string>(Constants.PropertyTypeSymbol)(propertySignature.type);

    if (!Option.isSome(propertyId) || !Option.isSome(propertyType)) continue;

    if (
      propertyType.value === 'string' &&
      (fieldFilter.is || fieldFilter.startsWith || fieldFilter.endsWith || fieldFilter.contains)
    ) {
      graphqlFilter.push({
        values: {
          some: {
            propertyId: { is: propertyId.value },
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

    if (propertyType.value === 'boolean' && fieldFilter.is) {
      graphqlFilter.push({
        values: {
          some: {
            propertyId: { is: propertyId.value },
            boolean: { is: fieldFilter.is },
          },
        },
      });
    }

    if (propertyType.value === 'number' && (fieldFilter.is || fieldFilter.greaterThan || fieldFilter.lessThan)) {
      graphqlFilter.push({
        values: {
          some: {
            propertyId: { is: propertyId.value },
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

  if (graphqlFilter.length === 1) {
    return graphqlFilter[0];
  }

  return {
    and: graphqlFilter,
  };
}
