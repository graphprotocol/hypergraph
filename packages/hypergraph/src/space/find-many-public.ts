import { ContentIds, Graph, SystemIds } from '@graphprotocol/grc-20';
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
query memberSpaces($accountAddress: String!) {
  spaces(filter: {members: {some: {address: {is: $accountAddress}}}}) {
    ${spaceFields}
  }
}
`;

const editorSpacesQueryDocument = `
query editorSpaces($accountAddress: String!) {
  spaces(filter: {editors: {some: {address: {is: $accountAddress}}}}) {
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
  accountAddress: string;
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
  | Readonly<{ memberAccountAddress: string; editorAccountAddress?: never }>
  | Readonly<{ editorAccountAddress: string; memberAccountAddress?: never }>
  | Readonly<{ memberAccountAddress?: undefined; editorAccountAddress?: undefined }>;

export type FindManyPublicParams = Readonly<{
  filter?: FindManyPublicFilter;
}>;

export const findManyPublic = async (params?: FindManyPublicParams) => {
  const filter = params?.filter;
  const memberAccountAddress = filter?.memberAccountAddress;
  const editorAccountAddress = filter?.editorAccountAddress;

  if (memberAccountAddress && editorAccountAddress) {
    throw new Error('Provide only one of memberAccountAddress or editorAccountAddress when calling findManyPublic().');
  }

  const endpoint = `${Graph.TESTNET_API_ORIGIN}/graphql`;

  if (memberAccountAddress) {
    const queryResult = await request<SpacesQueryResult, SpacesQueryVariables>(endpoint, memberSpacesQueryDocument, {
      accountAddress: memberAccountAddress,
    });
    return parseSpacesQueryResult(queryResult);
  }

  if (editorAccountAddress) {
    const queryResult = await request<SpacesQueryResult, SpacesQueryVariables>(endpoint, editorSpacesQueryDocument, {
      accountAddress: editorAccountAddress,
    });
    return parseSpacesQueryResult(queryResult);
  }

  const queryResult = await request<SpacesQueryResult>(endpoint, spacesQueryDocument);
  return parseSpacesQueryResult(queryResult);
};
