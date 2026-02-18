import { request } from 'graphql-request';

export const TYPES_WITH_PROPERTIES_QUERY = /* GraphQL */ `
  query TypesWithProperties($spaceId: UUID!, $first: Int) {
    typesList(spaceId: $spaceId, first: $first) {
      id
      name
      properties {
        id
        name
        dataType
        relationValueTypes {
          id
          name
        }
      }
    }
  }
`;

export const ENTITIES_QUERY = /* GraphQL */ `
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

export type TypeProperty = {
  id: string;
  name: string | null;
  dataType: string;
  relationValueTypes: Array<{ id: string; name: string | null }>;
};

export type TypesListResult = {
  typesList: Array<{
    id: string;
    name: string | null;
    properties: TypeProperty[] | null;
  }> | null;
};

export type EntitiesResult = {
  entities: Array<{
    id: string;
    name: string | null;
    typeIds: string[];
    valuesList: Array<{
      propertyId: string;
      text: string | null;
      boolean: boolean | null;
      float: number | null;
      datetime: string | null;
      point: unknown | null;
      schedule: unknown | null;
    }>;
    relationsList: Array<{
      typeId: string;
      toEntity: {
        id: string;
        name: string | null;
      };
    }>;
  }>;
};

export const fetchTypes = async (
  endpoint: string,
  spaceId: string,
): Promise<TypesListResult['typesList']> => {
  const result = await request<TypesListResult>(`${endpoint}/graphql`, TYPES_WITH_PROPERTIES_QUERY, {
    spaceId,
    first: 1000,
  });
  return result.typesList ?? [];
};

export const fetchEntities = async (
  endpoint: string,
  spaceId: string,
  first: number,
  offset: number,
): Promise<EntitiesResult['entities']> => {
  const result = await request<EntitiesResult>(`${endpoint}/graphql`, ENTITIES_QUERY, {
    spaceId,
    first,
    offset,
  });
  return result.entities;
};
