import { ContentIds, SystemIds } from '@graphprotocol/grc-20';
import { Config } from '@graphprotocol/hypergraph';
import * as Either from 'effect/Either';
import * as EffectSchema from 'effect/Schema';
import { request } from 'graphql-request';

const spaceFields = `
  id
  type
  page {
    name
    relationsList(filter: {
      typeId: { is: "${ContentIds.AVATAR_PROPERTY}"}
    }) {
      toEntity {
        valuesList(filter: {
          propertyId: { is: "${SystemIds.IMAGE_URL_PROPERTY}"}
        }) {
          propertyId
          string
        }
      }
    }
  }
  editorsList {
    memberSpaceId
  }
  membersList {
    memberSpaceId
  }
`;

export const SpaceTypeSchema = EffectSchema.Union(EffectSchema.Literal('PERSONAL'), EffectSchema.Literal('DAO'));

export type SpaceType = typeof SpaceTypeSchema.Type;

export const PublicSpaceSchema = EffectSchema.Struct({
  id: EffectSchema.String,
  type: SpaceTypeSchema,
  name: EffectSchema.String,
  avatar: EffectSchema.optional(EffectSchema.String),
  editorIds: EffectSchema.Array(EffectSchema.String),
  memberIds: EffectSchema.Array(EffectSchema.String),
});

export type PublicSpace = typeof PublicSpaceSchema.Type;

type SpacesQueryResult = {
  spaces?: {
    id: string;
    type: 'PERSONAL' | 'DAO';
    page: {
      name?: string | null;
      relationsList?: {
        toEntity?: {
          valuesList?: {
            propertyId: string;
            string: string | null;
          }[];
        } | null;
      }[];
    } | null;
    editorsList?: {
      memberSpaceId: string;
    }[];
    membersList?: {
      memberSpaceId: string;
    }[];
  }[];
};

type SpaceQueryEntry = NonNullable<SpacesQueryResult['spaces']>[number];

const decodeSpace = EffectSchema.decodeUnknownEither(PublicSpaceSchema);

const getAvatarFromSpace = (space: SpaceQueryEntry) => {
  const firstRelation = space.page?.relationsList?.[0];
  const firstValue = firstRelation?.toEntity?.valuesList?.[0];
  const avatar = firstValue?.string;
  if (typeof avatar === 'string') {
    return avatar;
  }
  return undefined;
};

const getEditorIdsFromSpace = (space: SpaceQueryEntry): string[] => {
  return (space.editorsList ?? []).map((e) => e.memberSpaceId).filter((id): id is string => typeof id === 'string');
};

const getMemberIdsFromSpace = (space: SpaceQueryEntry): string[] => {
  return (space.membersList ?? []).map((m) => m.memberSpaceId).filter((id): id is string => typeof id === 'string');
};

export const parseSpacesQueryResult = (queryResult: SpacesQueryResult) => {
  const data: PublicSpace[] = [];
  const invalidSpaces: Record<string, unknown>[] = [];
  const spaces = queryResult.spaces ?? [];

  for (const space of spaces) {
    const rawSpace: Record<string, unknown> = {
      id: space.id,
      type: space.type,
      name: space.page?.name ?? undefined,
      avatar: getAvatarFromSpace(space),
      editorIds: getEditorIdsFromSpace(space),
      memberIds: getMemberIdsFromSpace(space),
    };

    const decodedSpace = decodeSpace(rawSpace);

    if (Either.isRight(decodedSpace)) {
      data.push(decodedSpace.right);
    } else {
      invalidSpaces.push(rawSpace);
    }
  }

  return { data, invalidSpaces };
};

export type FindManyPublicFilter =
  | Readonly<{ memberId: string; editorId?: never; spaceType?: SpaceType }>
  | Readonly<{ editorId: string; memberId?: never; spaceType?: SpaceType }>
  | Readonly<{ memberId?: undefined; editorId?: undefined; spaceType?: SpaceType }>;

export type FindManyPublicParams = Readonly<{
  filter?: FindManyPublicFilter;
}>;

const buildFilterString = (filter?: FindManyPublicFilter): string | undefined => {
  const conditions: string[] = [];

  if (filter?.memberId) {
    conditions.push(`members: {some: {memberSpaceId: {is: "${filter.memberId}"}}}`);
  }

  if (filter?.editorId) {
    conditions.push(`editors: {some: {memberSpaceId: {is: "${filter.editorId}"}}}`);
  }

  if (filter?.spaceType) {
    conditions.push(`type: {is: ${filter.spaceType}}`);
  }

  if (conditions.length === 0) {
    return undefined;
  }

  return `filter: {${conditions.join(', ')}}`;
};

const buildSpacesQuery = (filter?: FindManyPublicFilter): string => {
  const filterString = buildFilterString(filter);
  const filterClause = filterString ? `(${filterString})` : '';

  return `
query spaces {
  spaces${filterClause} {
    ${spaceFields}
  }
}
`;
};

export const findManyPublic = async (params?: FindManyPublicParams) => {
  const filter = params?.filter;
  const memberId = filter?.memberId;
  const editorId = filter?.editorId;

  if (memberId && editorId) {
    throw new Error('Provide only one of memberId or editorId when calling findManyPublic().');
  }

  const endpoint = `${Config.getApiOrigin()}/v2/graphql`;
  const queryDocument = buildSpacesQuery(filter);
  const queryResult = await request<SpacesQueryResult>(endpoint, queryDocument);
  return parseSpacesQueryResult(queryResult);
};
