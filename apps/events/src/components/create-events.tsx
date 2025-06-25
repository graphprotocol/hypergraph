import { Graph, type Op } from '@graphprotocol/grc-20';
import type { Connect } from '@graphprotocol/hypergraph';
import { publishOps, useHypergraphApp } from '@graphprotocol/hypergraph-react';
import { mapping } from '../mapping';
import { Button } from './ui/button';

const createEvents = async ({
  smartSessionClient,
  space,
}: { smartSessionClient: Connect.SmartSessionClient; space: string }) => {
  try {
    const ops: Array<Op> = [];

    const { id: jobOfferTypeId, ops: createJobOfferTypeOps } = Graph.createEntity({
      name: 'My Test Job Offer',
      types: mapping.JobOffer.typeIds,
      values: [
        {
          property: mapping.JobOffer.properties?.salary as string,
          value: '80000',
        },
      ],
    });
    ops.push(...createJobOfferTypeOps);

    const { id: jobOfferTypeId2, ops: createJobOfferTypeOps2 } = Graph.createEntity({
      name: 'My Test Job Offer 2',
      types: mapping.JobOffer.typeIds,
      values: [
        {
          property: mapping.JobOffer.properties?.salary as string,
          value: '90000',
        },
      ],
    });
    ops.push(...createJobOfferTypeOps2);

    console.log('jobOfferTypeId', jobOfferTypeId);
    console.log('jobOfferTypeId2', jobOfferTypeId2);

    const { id: companyTypeId, ops: createCompanyTypeOps } = Graph.createEntity({
      name: 'My Test Company',
      types: mapping.Company.typeIds,
      relations: {
        [mapping.Company.relations?.jobOffers as string]: [{ toEntity: jobOfferTypeId }, { toEntity: jobOfferTypeId2 }],
      },
    });
    ops.push(...createCompanyTypeOps);

    const { ops: createEventTypeOps } = Graph.createEntity({
      name: 'My Test Event',
      types: mapping.Event.typeIds,
      relations: {
        [mapping.Event.relations?.sponsors as string]: [{ toEntity: companyTypeId }],
      },
    });
    ops.push(...createEventTypeOps);

    const result = await publishOps({
      ops,
      walletClient: smartSessionClient,
      space,
      name: 'Create Job Offers, Companies and Events',
    });
    console.log('result', result);
    alert('Events created');
  } catch (error) {
    console.error('error', error);
  }
};

export const CreateEvents = ({ space }: { space: string }) => {
  const { getSmartSessionClient } = useHypergraphApp();
  return (
    <div>
      <Button
        onClick={async () => {
          const smartSessionClient = await getSmartSessionClient();
          if (!smartSessionClient) {
            throw new Error('Missing smartSessionClient');
          }
          await createEvents({
            smartSessionClient,
            space,
          });
        }}
      >
        Create Job Offers, Companies and Events
      </Button>
    </div>
  );
};
