import { smartAccountWalletClient } from '@/lib/smart-account';
import type { Op } from '@graphprotocol/grc-20';
import {
  generateDeleteOps,
  publishOps,
  useCreateEntity,
  useDeleteEntity,
  useGenerateCreateOps,
  useHardDeleteEntity,
  useHypergraphSpace,
  _useQueryPublicGeo as usePublicQueryGeo,
  _useQueryPublicKg as usePublicQueryKg,
  useQuery,
  useQueryEntities,
} from '@graphprotocol/hypergraph-react';
import { useState } from 'react';
import { Todo2 } from '../schema';
import { Button } from './ui/button';
import { Input } from './ui/input';

export const Todos2 = () => {
  const { data: kgPublicData, isLoading: kgPublicIsLoading, isError: kgPublicIsError } = usePublicQueryKg(Todo2);
  const { data: geoPublicData, isLoading: geoPublicIsLoading, isError: geoPublicIsError } = usePublicQueryGeo(Todo2);
  const generateTodoOps = useGenerateCreateOps(Todo2);
  const space = useHypergraphSpace();
  const todos = useQueryEntities(Todo2);
  const createEntity = useCreateEntity(Todo2);
  const deleteEntity = useDeleteEntity();
  const hardDeleteEntity = useHardDeleteEntity();
  const [newTodoName, setNewTodoName] = useState('');
  const { data, isLoading, isError } = useQuery(Todo2);

  return (
    <>
      <h2 className="text-2xl font-bold">Todos (Merged)</h2>
      {isLoading && <div>Loading...</div>}
      {isError && <div>Error loading todos</div>}
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
          for (const todo of todos) {
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
        }}
      >
        Publish
      </Button>

      <h2 className="text-2xl font-bold">Todos (Local)</h2>
      {todos.map((todo) => (
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

      <h2 className="text-2xl font-bold">Todos (Public KG)</h2>
      {kgPublicIsLoading && <div>Loading...</div>}
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

      <h2 className="text-2xl font-bold">Todos (Public Geo)</h2>
      {geoPublicIsLoading && <div>Loading...</div>}
      {geoPublicIsError && <div>Error loading todos</div>}
      {geoPublicData.map((todo) => (
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
