import { getSmartAccountWalletClient } from '@/lib/smart-account';
import { type GeoSmartAccount, Graph, type Op } from '@graphprotocol/grc-20';
import { publishOps } from '@graphprotocol/hypergraph-react';
import { Button } from './ui/button';

const createEvents = async ({
  smartAccountWalletClient,
  space,
}: { smartAccountWalletClient: GeoSmartAccount; space: string }) => {
  try {
    const ops: Array<Op> = [];

    const { id: jobOfferTypeId, ops: createJobOfferTypeOps } = Graph.createEntity({
      name: 'My Test Job Offer',
      types: ['a107c081-3089-4a94-8208-6a10775557d2'],
      values: [
        {
          property: '20d18713-5352-4e1f-987c-d853bf9f8831',
          value: '80000',
        },
      ],
    });
    ops.push(...createJobOfferTypeOps);

    const { id: jobOfferTypeId2, ops: createJobOfferTypeOps2 } = Graph.createEntity({
      name: 'My Test Job Offer 2',
      types: ['a107c081-3089-4a94-8208-6a10775557d2'],
      values: [
        {
          property: '20d18713-5352-4e1f-987c-d853bf9f8831',
          value: '90000',
        },
      ],
    });
    ops.push(...createJobOfferTypeOps2);

    console.log('jobOfferTypeId', jobOfferTypeId);
    console.log('jobOfferTypeId2', jobOfferTypeId2);

    const { id: companyTypeId, ops: createCompanyTypeOps } = Graph.createEntity({
      name: 'My Test Company',
      types: ['e8932986-67a9-4fff-89a6-07f03973014c'],
      relations: {
        '96beadca-0846-4e56-9628-c196f7f3c4cd': [{ toEntity: jobOfferTypeId }, { toEntity: jobOfferTypeId2 }],
      },
    });
    ops.push(...createCompanyTypeOps);

    const { id: eventTypeId, ops: createEventTypeOps } = Graph.createEntity({
      name: 'My Test Event',
      types: ['6b8dbe76-389f-4bde-acdd-db9d5e387882'],
      relations: {
        'd8e4ea54-cb8c-4dca-9c2b-64dbbbe78397': [{ toEntity: companyTypeId }],
      },
    });
    ops.push(...createEventTypeOps);

    const result = await publishOps({
      ops,
      walletClient: smartAccountWalletClient,
      space,
      name: 'Create Job Offers, Companies and Events',
      network: 'TESTNET',
    });
    console.log('result', result);
    alert('Events created');
  } catch (error) {
    console.error('error', error);
  }
};

export const CreateEvents = ({ space }: { space: string }) => {
  return (
    <div>
      <Button
        onClick={async () => {
          const smartAccountWalletClient = await getSmartAccountWalletClient();
          if (!smartAccountWalletClient) {
            throw new Error('Missing smartAccountWalletClient');
          }
          await createEvents({
            // @ts-expect-error TODO: in the future we probably only only use one smart account wallet client
            smartAccountWalletClient,
            space,
          });
        }}
      >
        Create Job Offers, Companies and Events
      </Button>
    </div>
  );
};
