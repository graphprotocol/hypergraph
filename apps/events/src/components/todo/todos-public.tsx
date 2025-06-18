import { getSmartAccountWalletClient } from '@/lib/smart-account';
import { Id } from '@graphprotocol/grc-20';
import {
  _generateDeleteOps,
  publishOps,
  useCreateEntity,
  useHypergraphSpace,
  useQuery,
} from '@graphprotocol/hypergraph-react';
import { useGenerateCreateOps } from '@graphprotocol/hypergraph-react/internal/use-generate-create-ops';
import { Todo2 } from '../../schema';
import { Spinner } from '../spinner';
import { Button } from '../ui/button';

export const TodosPublic = () => {
  const space = useHypergraphSpace();
  const {
    data: dataPublic,
    isLoading: isLoadingPublic,
    isError: isErrorPublic,
  } = useQuery(Todo2, {
    mode: 'public',
    include: { assignees: {} },
  });

  const createTodo = useCreateEntity(Todo2);
  const generateCreateOps = useGenerateCreateOps(Todo2);

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
          <div className="text-xs">{todo.due.toLocaleDateString()}</div>
          <div className="text-xs">{todo.amount}</div>
          {todo.point && <div className="text-xs">{todo.point.join(', ')}</div>}
          {todo.website && <div className="text-xs">{todo.website.toString()}</div>}
          <input type="checkbox" checked={todo.checked} readOnly />
          {todo.assignees.map((assignee) => (
            <span key={assignee.id} className="border rounded-sm mr-1 p-1">
              {assignee.name}
            </span>
          ))}

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
      <Button
        onClick={async () => {
          const smartAccountWalletClient = await getSmartAccountWalletClient();
          if (!smartAccountWalletClient) {
            throw new Error('Missing smartAccountWalletClient');
          }
          const userId = Id.Id('8zPJjTGLBDPtUcj6q2tghg');
          const todo = createTodo({
            name: 'New Todo 22',
            checked: false,
            assignees: [userId],
            due: new Date('2025-08-20'),
            amount: 200,
            point: [12.34, 56.78],
            website: new URL('https://example.com'),
          });
          console.log('todo', todo);
          const { ops } = generateCreateOps(todo);
          console.log('ops', ops);
          const result = await publishOps({
            ops,
            walletClient: smartAccountWalletClient,
            space,
            name: 'Create Todo',
          });
          console.log('result', result);
        }}
      >
        Create
      </Button>
    </>
  );
};
