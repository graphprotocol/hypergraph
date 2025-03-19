import { smartAccountWalletClient } from '@/lib/smart-account';
import { cn } from '@/lib/utils';
import type { Op } from '@graphprotocol/grc-20';
import {
  generateDeleteOps,
  publishOps,
  useCreateEntity,
  useDeleteEntity,
  useGenerateCreateOps,
  useHardDeleteEntity,
  useHypergraphSpace,
  useQuery,
  _useQueryPublicKg as useQueryPublicKg,
} from '@graphprotocol/hypergraph-react';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Todo2 } from '../schema';
import { Spinner } from './spinner';
import { Button } from './ui/button';
import { Input } from './ui/input';
export const Todos2 = () => {
  const { data: kgPublicData, isLoading: kgPublicIsLoading, isError: kgPublicIsError } = useQueryPublicKg(Todo2);
  const { data: dataPublic, isLoading: isLoadingPublic, isError: isErrorPublic } = useQuery(Todo2, { mode: 'public' });
  const { data, isLoading, isError } = useQuery(Todo2);
  const { data: todosLocalData, deleted: deletedTodosLocalData } = useQuery(Todo2, { mode: 'local' });
  const generateTodoOps = useGenerateCreateOps(Todo2);
  const space = useHypergraphSpace();
  const createEntity = useCreateEntity(Todo2);
  const deleteEntity = useDeleteEntity();
  const hardDeleteEntity = useHardDeleteEntity();
  const [newTodoName, setNewTodoName] = useState('');
  const queryClient = useQueryClient();

  return (
    <>
      <div className="flex flex-row gap-4 items-center">
        <h2 className="text-2xl font-bold">Todos (Merged)</h2>
        {isLoading && <Spinner size="sm" />}
      </div>
      {isError && <div>Error loading todos</div>}
      <div className={`flex flex-col gap-4 ${cn({ 'opacity-50': isLoading })}`}>
        {data.map((todo) => (
          <div key={todo.id} className="flex flex-row items-center gap-2">
            <h2>{todo.name}</h2>
            <div className="text-xs">{todo.id}</div>
            <input type="checkbox" defaultChecked={todo.checked} />
            <div className="text-xs">{todo.__version}</div>
            <Button variant="outline" size="sm" onClick={() => deleteEntity(todo.id)}>
              Delete
            </Button>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <Input type="text" value={newTodoName} onChange={(e) => setNewTodoName(e.target.value)} />
        <Button
          onClick={() => {
            if (newTodoName === '') {
              alert('Todo text is required');
              return;
            }
            createEntity({ name: newTodoName, checked: false });
            setNewTodoName('');
          }}
        >
          Create Todo
        </Button>
      </div>

      <Button
        onClick={async () => {
          const ops: Op[] = [];
          for (const todo of todosLocalData) {
            if (todo.__deleted) {
              console.log('todo is deleted', todo.id);
              try {
                const deleteOps = await generateDeleteOps({ id: todo.id, space });
                ops.push(...deleteOps);
              } catch (error) {
                console.error('error', error);
              }
            } else {
              console.log('todo is not deleted', todo.id);
              const { ops: todoOps } = generateTodoOps(todo);
              ops.push(...todoOps);
            }
          }
          console.log('ops', ops);
          const result = await publishOps({ ops, walletClient: smartAccountWalletClient, space });
          console.log('result', result);
          setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: [`entities:${Todo2.name}`] });
            queryClient.invalidateQueries({ queryKey: [`entities:geo:${Todo2.name}`] });
          }, 1000);
        }}
      >
        Publish
      </Button>

      <h2 className="text-2xl font-bold">Todos (Local)</h2>
      {todosLocalData.map((todo) => (
        <div key={todo.id} className="flex flex-row items-center gap-2">
          <h2>{todo.name}</h2>
          <div className="text-xs">{todo.id}</div>
          <input type="checkbox" defaultChecked={todo.checked} />
          <div className="text-xs">{todo.__deleted ? 'deleted' : 'not deleted'}</div>
          <div className="text-xs">{todo.__version}</div>
          <Button variant="secondary" size="sm" onClick={() => hardDeleteEntity(todo.id)}>
            Hard Delete
          </Button>
        </div>
      ))}
      <h2 className="text-2xl font-bold">Deleted Todos (Local)</h2>
      {deletedTodosLocalData.map((todo) => (
        <div key={todo.id} className="flex flex-row items-center gap-2">
          <h2>{todo.name}</h2>
          <div className="text-xs">{todo.id}</div>
          <Button variant="secondary" size="sm" onClick={() => hardDeleteEntity(todo.id)}>
            Hard Delete
          </Button>
        </div>
      ))}

      <div className="flex flex-row gap-4 items-center">
        <h2 className="text-2xl font-bold">Todos (Public Geo)</h2>
        {isLoadingPublic && <Spinner size="sm" />}
      </div>
      {isErrorPublic && <div>Error loading todos</div>}
      {dataPublic.map((todo) => (
        <div key={todo.id} className="flex flex-row items-center gap-2">
          <h2>{todo.name}</h2>
          <div className="text-xs">{todo.id}</div>
          <input type="checkbox" defaultChecked={todo.checked} />
          <Button
            onClick={async () => {
              const ops = await generateDeleteOps({ id: todo.id, space });
              const result = await publishOps({ ops, walletClient: smartAccountWalletClient, space });
              console.log('result', result);
            }}
          >
            Delete
          </Button>
        </div>
      ))}

      <div className="flex flex-row gap-4 items-center">
        <h2 className="text-2xl font-bold">Todos (Public KG)</h2>
        {kgPublicIsLoading && <Spinner size="sm" />}
      </div>
      {kgPublicIsError && <div>Error loading todos</div>}
      {kgPublicData.map((todo) => (
        <div key={todo.id} className="flex flex-row items-center gap-2">
          <h2>{todo.name}</h2>
          <div className="text-xs">{todo.id}</div>
          <input type="checkbox" defaultChecked={todo.checked} />
          <Button
            onClick={async () => {
              const ops = await generateDeleteOps({ id: todo.id, space });
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
