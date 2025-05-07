import { getSmartAccountWalletClient } from '@/lib/smart-account';
import { type GeoSmartAccount, Graph, type Op } from '@graphprotocol/grc-20';
import { publishOps, useHypergraphSpace } from '@graphprotocol/hypergraph-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

const createPropertiesAndTypes = async ({
  smartAccountWalletClient,
  space,
}: { smartAccountWalletClient: GeoSmartAccount; space: string }) => {
  const ops: Array<Op> = [];
  const { id: checkedPropertyId, ops: createCheckedPropertyOps } = Graph.createProperty({
    type: 'CHECKBOX',
    name: 'Checked',
  });
  ops.push(...createCheckedPropertyOps);

  const { id: userId, ops: createUserOps } = Graph.createType({
    name: 'User',
  });
  ops.push(...createUserOps);

  const { id: assigneesRelationTypeId, ops: createAssigneesRelationTypeOps } = Graph.createProperty({
    type: 'RELATION',
    name: 'Assignees',
    relationValueTypes: [userId],
  });
  ops.push(...createAssigneesRelationTypeOps);

  const { id: todoTypeId, ops: createTodoTypeOps } = Graph.createType({
    name: 'Todo',
    properties: [checkedPropertyId, assigneesRelationTypeId],
  });
  ops.push(...createTodoTypeOps);

  const result = await publishOps({
    ops,
    walletClient: smartAccountWalletClient,
    space,
    name: 'Create properties and types',
  });
  return { result, todoTypeId, checkedPropertyId, userId, assigneesRelationTypeId };
};

export const CreatePropertiesAndTypes = () => {
  const [mapping, setMapping] = useState<string>('');
  const space = useHypergraphSpace();

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
          const smartAccountWalletClient = await getSmartAccountWalletClient();
          if (!smartAccountWalletClient) {
            throw new Error('Missing smartAccountWalletClient');
          }
          const { todoTypeId, checkedPropertyId, userId, assigneesRelationTypeId } = await createPropertiesAndTypes({
            smartAccountWalletClient,
            space,
          });

          const newMapping = `Todo2: {
  typeIds: [Id.Id('${todoTypeId}')],
  properties: {
    name: Id.Id('LuBWqZAu6pz54eiJS5mLv8'),
    checked: Id.Id('${checkedPropertyId}'),
  },
  relations: {
    assignees: Id.Id('${assigneesRelationTypeId}'),
  },
},
User: {
  typeIds: [Id.Id('${userId}')],
  properties: {
    name: Id.Id('LuBWqZAu6pz54eiJS5mLv8'),
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
