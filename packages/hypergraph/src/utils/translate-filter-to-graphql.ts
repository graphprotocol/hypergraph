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
              text: { is: string } | { startsWith: string } | { endsWith: string } | { includes: string };
            }
          | {
              propertyId: { is: string };
              boolean: { is: boolean };
            }
          | {
              propertyId: { is: string };
              float: { is: number } | { greaterThan: number } | { lessThan: number };
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
  | {
      relations: {
        some: {
          typeId: { is: string };
        };
      };
    }
  | {
      id: {
        is: string;
      };
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

  const buildRelationExistsFilter = (propertyId: string): GraphqlFilterEntry => ({
    relations: {
      some: {
        typeId: { is: propertyId },
      },
    },
  });

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

    if (fieldName === 'id') {
      const idFilter = fieldFilter as Entity.EntityIdFilter;
      if (typeof idFilter.is === 'string') {
        graphqlFilter.push({
          id: { is: idFilter.is },
        });
      }
      continue;
    }

    const ast = type.ast as SchemaAST.TypeLiteral;
    const propertySignature = ast.propertySignatures.find((a) => a.name === fieldName);
    if (!propertySignature) continue;

    // find the property id for the field
    const propertyId = SchemaAST.getAnnotation<string>(Constants.PropertyIdSymbol)(propertySignature.type);
    const propertyType = SchemaAST.getAnnotation<string>(Constants.PropertyTypeSymbol)(propertySignature.type);

    if (!Option.isSome(propertyId) || !Option.isSome(propertyType)) continue;

    if (propertyType.value === 'relation') {
      const relationFilter = fieldFilter as { exists?: boolean };

      if (relationFilter.exists === true) {
        graphqlFilter.push(buildRelationExistsFilter(propertyId.value));
        continue;
      }

      if (relationFilter.exists === false) {
        const existsFilter = buildRelationExistsFilter(propertyId.value);
        graphqlFilter.push({
          not: existsFilter,
        });
        continue;
      }
    }

    if (
      propertyType.value === 'string' &&
      (fieldFilter.is || fieldFilter.startsWith || fieldFilter.endsWith || fieldFilter.contains)
    ) {
      graphqlFilter.push({
        values: {
          some: {
            propertyId: { is: propertyId.value },
            text: fieldFilter.is
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
            float: fieldFilter.is
              ? { is: fieldFilter.is }
              : fieldFilter.greaterThan
                ? { greaterThan: fieldFilter.greaterThan }
                : { lessThan: fieldFilter.lessThan },
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
