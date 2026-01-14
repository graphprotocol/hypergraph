import { ContentIds, SystemIds } from '@graphprotocol/grc-20';
import { Config } from '@graphprotocol/hypergraph';
import * as Either from 'effect/Either';
import * as EffectSchema from 'effect/Schema';
import { request } from 'graphql-request';

const spaceFields = `
  id
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
`;

const spacesQueryDocument = `
query spaces {
  spaces {
    ${spaceFields}
  }
}
`;

const memberSpacesQueryDocument = `
query memberSpaces($accountId: UUID!) {
  spaces(filter: {members: {some: {memberSpaceId: {is: $accountId}}}}) {
    ${spaceFields}
  }
}
`;

const editorSpacesQueryDocument = `
query editorSpaces($accountId: UUID!) {
  spaces(filter: {editors: {some: {memberSpaceId: {is: $accountId}}}}) {
    ${spaceFields}
  }
}
`;

export const PublicSpaceSchema = EffectSchema.Struct({
  id: EffectSchema.String,
  name: EffectSchema.String,
  avatar: EffectSchema.optional(EffectSchema.String),
});

export type PublicSpace = typeof PublicSpaceSchema.Type;

type SpacesQueryResult = {
  spaces?: {
    id: string;
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
  }[];
};

type SpacesQueryVariables = {
  accountId: string;
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

export const parseSpacesQueryResult = (queryResult: SpacesQueryResult) => {
  const data: PublicSpace[] = [];
  const invalidSpaces: Record<string, unknown>[] = [];
  const spaces = queryResult.spaces ?? [];

  for (const space of spaces) {
    const rawSpace: Record<string, unknown> = {
      id: space.id,
      name: space.page?.name ?? undefined,
      avatar: getAvatarFromSpace(space),
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
  | Readonly<{ memberId: string; editorId?: never }>
  | Readonly<{ editorId: string; memberId?: never }>
  | Readonly<{ memberId?: undefined; editorId?: undefined }>;

export type FindManyPublicParams = Readonly<{
  filter?: FindManyPublicFilter;
}>;

export const findManyPublic = async (params?: FindManyPublicParams) => {
  const filter = params?.filter;
  const memberId = filter?.memberId;
  const editorId = filter?.editorId;

  if (memberId && editorId) {
    throw new Error('Provide only one of memberId or editorId when calling findManyPublic().');
  }

  const endpoint = `${Config.getApiOrigin()}/v2/graphql`;

  if (memberId) {
    const queryResult = await request<SpacesQueryResult, SpacesQueryVariables>(endpoint, memberSpacesQueryDocument, {
      accountId: memberId,
    });
    return parseSpacesQueryResult(queryResult);
  }

  if (editorId) {
    const queryResult = await request<SpacesQueryResult, SpacesQueryVariables>(endpoint, editorSpacesQueryDocument, {
      accountId: editorId,
    });
    return parseSpacesQueryResult(queryResult);
  }

  const queryResult = await request<SpacesQueryResult>(endpoint, spacesQueryDocument);
  return parseSpacesQueryResult(queryResult);
};
