import { getSmartAccountWalletClient } from '@/lib/smart-account';
import {
  _generateDeleteOps,
  publishOps,
  useHypergraphSpace,
  _useQueryPublicKg as useQueryPublicKg,
} from '@graphprotocol/hypergraph-react';
import { Todo2 } from '../../schema';
import { Spinner } from '../spinner';
import { Button } from '../ui/button';

export const TodosPublicKg = () => {
  const space = useHypergraphSpace();
  const { data: kgPublicData, isLoading: kgPublicIsLoading, isError: kgPublicIsError } = useQueryPublicKg(Todo2);

  return (
    <>
      <div className="flex flex-row gap-4 items-center">
        <h2 className="text-2xl font-bold">Todos (Public KG)</h2>
        {kgPublicIsLoading && <Spinner size="sm" />}
      </div>
      {kgPublicIsError && <div>Error loading todos</div>}
      {kgPublicData.map((todo) => (
        <div key={todo.id} className="flex flex-row items-center gap-2">
          <h2>{todo.name}</h2>
          <div className="text-xs">{todo.id}</div>
          <div className="text-xs">{todo.due.toLocaleDateString()}</div>
          <div className="text-xs">{todo.amount}</div>
          {todo.point && <div className="text-xs">{todo.point.join(', ')}</div>}
          {todo.website && <div className="text-xs">{todo.website.toString()}</div>}
          <input type="checkbox" checked={todo.checked} readOnly />
          <Button
            onClick={async () => {
              const smartAccountWalletClient = await getSmartAccountWalletClient();
              if (!smartAccountWalletClient) {
                throw new Error('Missing smartAccountWalletClient');
              }
              const ops = await _generateDeleteOps({ id: todo.id, space });
              const result = await publishOps({
                ops,
                walletClient: smartAccountWalletClient,
                space,
                name: 'Delete Todo',
              });
              console.log('result', result);
            }}
          >
            Delete
          </Button>
        </div>
      ))}
    </>
  );
};
