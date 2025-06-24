import { Graph, type Op } from '@graphprotocol/grc-20';
import type { Connect } from '@graphprotocol/hypergraph';
import { publishOps, useHypergraphApp } from '@graphprotocol/hypergraph-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

const createPropertiesAndTypesEvent = async ({
  smartSessionClient,
  space,
}: { smartSessionClient: Connect.SmartSessionClient; space: string }) => {
  const ops: Array<Op> = [];
  const { id: salaryPropertyId, ops: createSalaryPropertyOps } = Graph.createProperty({
    dataType: 'NUMBER',
    name: 'Salary',
  });
  ops.push(...createSalaryPropertyOps);

  const { id: jobOfferTypeId, ops: createJobOfferTypeOps } = Graph.createType({
    name: 'Job Offer',
    properties: [salaryPropertyId],
  });
  ops.push(...createJobOfferTypeOps);

  const { id: jobOffersRelationTypeId, ops: createJobOffersRelationTypeOps } = Graph.createProperty({
    dataType: 'RELATION',
    name: 'Job Offer',
    relationValueTypes: [jobOfferTypeId],
  });
  ops.push(...createJobOffersRelationTypeOps);

  const { id: companyTypeId, ops: createCompanyTypeOps } = Graph.createType({
    name: 'Company',
    properties: [salaryPropertyId, jobOffersRelationTypeId],
  });
  ops.push(...createCompanyTypeOps);

  const { id: sponsorsRelationTypeId, ops: createSponsorsRelationTypeOps } = Graph.createProperty({
    dataType: 'RELATION',
    name: 'Sponsor',
    relationValueTypes: [companyTypeId],
  });
  ops.push(...createSponsorsRelationTypeOps);

  const { id: eventTypeId, ops: createEventTypeOps } = Graph.createType({
    name: 'Event',
    properties: [sponsorsRelationTypeId],
  });
  ops.push(...createEventTypeOps);

  const result = await publishOps({
    ops,
    walletClient: smartSessionClient,
    space,
    name: 'Create properties and types',
  });
  return {
    result,
    eventTypeId,
    companyTypeId,
    jobOfferTypeId,
    salaryPropertyId,
    jobOffersRelationTypeId,
    sponsorsRelationTypeId,
  };
};

export const CreatePropertiesAndTypesEvent = ({ space }: { space: string }) => {
  const [mapping, setMapping] = useState<string>('');
  const { getSmartSessionClient } = useHypergraphApp();

  return (
    <div>
      {mapping && (
        <Card>
          <CardContent>
            <pre>{mapping}</pre>
          </CardContent>
        </Card>
      )}
      <Button
        onClick={async () => {
          const smartSessionClient = await getSmartSessionClient();
          if (!smartSessionClient) {
            throw new Error('Missing smartSessionClient');
          }
          const {
            eventTypeId,
            companyTypeId,
            jobOfferTypeId,
            salaryPropertyId,
            jobOffersRelationTypeId,
            sponsorsRelationTypeId,
          } = await createPropertiesAndTypesEvent({
            smartSessionClient,
            space,
          });

          const newMapping = `Event: {
  typeIds: [Id.Id('${eventTypeId}')],
  properties: {
    name: Id.Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
  },
  relations: {
      sponsors: Id.Id('${sponsorsRelationTypeId}'),
  },
},
Company: {
  typeIds: [Id.Id('${companyTypeId}')],
  properties: {
    name: Id.Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
    jobOffers: Id.Id('${jobOffersRelationTypeId}'),
  },
},
JobOffer: {
  typeIds: [Id.Id('${jobOfferTypeId}')],
  properties: {
    name: Id.Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
    salary: Id.Id('${salaryPropertyId}'),
  },
},
`;
          setMapping(newMapping);
        }}
      >
        Create properties and types for Event, Company and JobOffer
      </Button>
    </div>
  );
};
