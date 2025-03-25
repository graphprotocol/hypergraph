import { smartAccountWalletClient } from '@/lib/smart-account';
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

  const { id: todoTypeId, ops: createTodoTypeOps } = Graph.createType({
    name: 'Todo',
    properties: [checkedPropertyId],
  });
  ops.push(...createTodoTypeOps);

  const { id: userId, ops: createUserOps } = Graph.createEntity({
    name: 'User',
  });
  ops.push(...createUserOps);

  const result = await publishOps({ ops, walletClient: smartAccountWalletClient, space });
  return { result, todoTypeId, checkedPropertyId, userId };
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
          const { todoTypeId, checkedPropertyId, userId } = await createPropertiesAndTypes({
            smartAccountWalletClient,
            space,
          });

          const newMapping = `Todo2: {
  typeIds: [Id.Id('${todoTypeId}')],
  properties: {
    name: Id.Id('LuBWqZAu6pz54eiJS5mLv8'),
    checked: Id.Id('${checkedPropertyId}'),
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
