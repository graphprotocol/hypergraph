import { smartAccountWalletClient } from '@/lib/smart-account';
import { _generateDeleteOps, publishOps, useHypergraphSpace, useQuery } from '@graphprotocol/hypergraph-react';
import { Todo2 } from '../../schema';
import { Spinner } from '../spinner';
import { Button } from '../ui/button';

export const TodosPublicGeo = () => {
  const space = useHypergraphSpace();
  const { data: dataPublic, isLoading: isLoadingPublic, isError: isErrorPublic } = useQuery(Todo2, { mode: 'public' });

  return (
    <>
      <div className="flex flex-row gap-4 items-center">
        <h2 className="text-2xl font-bold">Todos (Public Geo)</h2>
        {isLoadingPublic && <Spinner size="sm" />}
      </div>
      {isErrorPublic && <div>Error loading todos</div>}
      {dataPublic.map((todo) => (
        <div key={todo.id} className="flex flex-row items-center gap-2">
          <h2>{todo.name}</h2>
          <div className="text-xs">{todo.id}</div>
          <input type="checkbox" checked={todo.checked} readOnly />
          <Button
            onClick={async () => {
              const ops = await _generateDeleteOps({ id: todo.id, space });
              const result = await publishOps({ ops, walletClient: smartAccountWalletClient, space });
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
