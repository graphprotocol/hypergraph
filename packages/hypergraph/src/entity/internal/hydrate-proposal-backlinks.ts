import { Config } from '@graphprotocol/hypergraph';
import { request } from 'graphql-request';
import type { RelationsListWithNodes } from '../../utils/convert-relations.js';
import type { RelationTypeIdInfo } from '../../utils/get-relation-type-ids.js';
import { getRelationAlias } from '../../utils/relation-query-helpers.js';

type QueryEntityWithRelations = {
  id: string;
} & Partial<Record<`relations_${string}`, RelationsListWithNodes | undefined>>;

type ProposalRelationRef = {
  proposalId: string;
  relationId: string;
};

type ProposalQueryResult = {
  id: string;
} & Record<string, unknown>;

type ProposalsByIdsQueryResult = {
  proposals: ProposalQueryResult[];
};

const proposalsByIdsQueryDocument = `
query proposalsByIds($ids: [UUID!]!) {
  proposals(filter: { id: { in: $ids } }) {
    id
    proposedBy
    executedAt
    spaceId
    votingMode
    startTime
    endTime
    quorum
    threshold
    name
    createdAt
    noCount
    yesCount
    createdAtBlock
  }
}
`;

const getProposalBacklinkInfo = (relationInfo: RelationTypeIdInfo[]) =>
  relationInfo.filter((info) => info.includeNodes && info.resolutionStrategy === 'proposalBacklink');

const collectProposalBacklinkRefs = (queryEntities: QueryEntityWithRelations[], relationInfo: RelationTypeIdInfo[]) => {
  const backlinkInfo = getProposalBacklinkInfo(relationInfo);
  const refsByParentId = new Map<string, Map<string, ProposalRelationRef[]>>();
  const proposalIds = new Set<string>();

  for (const queryEntity of queryEntities) {
    const refsByPropertyName = new Map<string, ProposalRelationRef[]>();

    for (const info of backlinkInfo) {
      const alias = getRelationAlias(info.typeId, info.targetTypeIds);
      const relationNodes = queryEntity[alias]?.nodes ?? [];
      const relationRefs: ProposalRelationRef[] = [];

      for (const relationNode of relationNodes) {
        if (!relationNode?.toEntity?.id || !relationNode.id) {
          continue;
        }
        relationRefs.push({
          proposalId: relationNode.toEntity.id,
          relationId: relationNode.id,
        });
        proposalIds.add(relationNode.toEntity.id);
      }

      refsByPropertyName.set(info.propertyName, relationRefs);
    }

    refsByParentId.set(queryEntity.id, refsByPropertyName);
  }

  return {
    refsByParentId,
    proposalIds: Array.from(proposalIds),
  };
};

const fetchProposalsByIds = async (proposalIds: readonly string[]) => {
  if (proposalIds.length === 0) {
    return new Map<string, ProposalQueryResult>();
  }

  const response = await request<ProposalsByIdsQueryResult>(
    `${Config.getApiOrigin()}/graphql`,
    proposalsByIdsQueryDocument,
    {
      ids: proposalIds,
    },
  );

  return new Map(response.proposals.map((proposal) => [proposal.id, proposal]));
};

export const hydrateProposalBacklinks = async <T extends { id: string }>(
  queryEntities: QueryEntityWithRelations[],
  entities: T[],
  relationInfo: RelationTypeIdInfo[],
) => {
  const proposalBacklinkInfo = getProposalBacklinkInfo(relationInfo);
  if (proposalBacklinkInfo.length === 0 || entities.length === 0) {
    return;
  }

  const { refsByParentId, proposalIds } = collectProposalBacklinkRefs(queryEntities, relationInfo);
  const proposalsById = await fetchProposalsByIds(proposalIds);

  for (const entity of entities) {
    const refsByPropertyName = refsByParentId.get(entity.id);
    if (!refsByPropertyName) {
      continue;
    }

    const entityRecord = entity as Record<string, unknown>;

    for (const info of proposalBacklinkInfo) {
      const refs = refsByPropertyName.get(info.propertyName) ?? [];
      entityRecord[info.propertyName] = refs.flatMap((ref) => {
        const proposal = proposalsById.get(ref.proposalId);
        if (!proposal) {
          return [];
        }

        return [
          {
            ...proposal,
            _relation: {
              id: ref.relationId,
            },
          },
        ];
      });
    }
  }
};
