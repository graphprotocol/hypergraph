import { Graph, type Op } from '@graphprotocol/grc-20';
import type { Connect } from '@graphprotocol/hypergraph';
import { publishOps, useHypergraphApp } from '@graphprotocol/hypergraph-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

const createPropertiesAndTypesTodos = async ({
  smartSessionClient,
  space,
}: {
  smartSessionClient: Connect.SmartSessionClient;
  space: string;
}) => {
  const ops: Array<Op> = [];
  const { id: checkedPropertyId, ops: createCheckedPropertyOps } = Graph.createProperty({
    dataType: 'BOOLEAN',
    name: 'Checked',
  });
  ops.push(...createCheckedPropertyOps);

  const { id: userId, ops: createUserOps } = Graph.createType({
    name: 'User',
  });
  ops.push(...createUserOps);

  const { id: assigneesRelationTypeId, ops: createAssigneesRelationTypeOps } = Graph.createProperty({
    dataType: 'RELATION',
    name: 'Assignees',
    relationValueTypes: [userId],
  });
  ops.push(...createAssigneesRelationTypeOps);

  const { id: duePropertyId, ops: createDuePropertyOps } = Graph.createProperty({
    dataType: 'TIME',
    name: 'Due',
  });
  ops.push(...createDuePropertyOps);

  const { id: pointPropertyId, ops: createPointPropertyOps } = Graph.createProperty({
    dataType: 'POINT',
    name: 'Point',
  });
  ops.push(...createPointPropertyOps);

  const { id: amountPropertyId, ops: createAmountPropertyOps } = Graph.createProperty({
    dataType: 'FLOAT64',
    name: 'Amount',
  });
  ops.push(...createAmountPropertyOps);

  const { id: websitePropertyId, ops: createWebsitePropertyOps } = Graph.createProperty({
    dataType: 'TEXT',
    name: 'Website',
  });
  ops.push(...createWebsitePropertyOps);

  const { id: todoTypeId, ops: createTodoTypeOps } = Graph.createType({
    name: 'Todo',
    properties: [
      checkedPropertyId,
      assigneesRelationTypeId,
      duePropertyId,
      pointPropertyId,
      websitePropertyId,
      amountPropertyId,
    ],
  });
  ops.push(...createTodoTypeOps);

  const result = await publishOps({
    ops,
    walletClient: smartSessionClient,
    space,
    name: 'Create properties and types',
  });
  return {
    result,
    todoTypeId,
    checkedPropertyId,
    userId,
    assigneesRelationTypeId,
    duePropertyId,
    pointPropertyId,
    websitePropertyId,
    amountPropertyId,
  };
};

export const CreatePropertiesAndTypesTodos = ({ space }: { space: string }) => {
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
            todoTypeId,
            checkedPropertyId,
            userId,
            assigneesRelationTypeId,
            duePropertyId,
            pointPropertyId,
            websitePropertyId,
            amountPropertyId,
          } = await createPropertiesAndTypesTodos({
            smartSessionClient,
            space,
          });

          const newMapping = `Todo2: {
  typeIds: [Id('${todoTypeId}')],
  properties: {
    name: Id('a126ca530c8e48d5b88882c734c38935'),
    checked: Id('${checkedPropertyId}'),
    due: Id('${duePropertyId}'),
    point: Id('${pointPropertyId}'),
    website: Id('${websitePropertyId}'),
    amount: Id('${amountPropertyId}'),
  },
  relations: {
    assignees: Id('${assigneesRelationTypeId}'),
  },
},
User: {
  typeIds: [Id('${userId}')],
  properties: {
    name: Id('a126ca530c8e48d5b88882c734c38935'),
  },
}
`;
          setMapping(newMapping);
        }}
      >
        Create properties and types
      </Button>
    </div>
  );
};
