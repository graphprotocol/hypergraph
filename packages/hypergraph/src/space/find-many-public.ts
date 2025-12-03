import { ContentIds, Graph, SystemIds } from '@graphprotocol/grc-20';
import * as Either from 'effect/Either';
import * as EffectSchema from 'effect/Schema';
import { request } from 'graphql-request';

const spacesQueryDocument = `
query spaces {
  spaces {
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

export const findSpaces = async () => {
  const queryResult = await request<SpacesQueryResult>(`${Graph.TESTNET_API_ORIGIN}/graphql`, spacesQueryDocument);
  return parseSpacesQueryResult(queryResult);
};
