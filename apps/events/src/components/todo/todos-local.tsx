import { useHardDeleteEntity, useQuery, useUpdateEntity } from '@graphprotocol/hypergraph-react';
import { Todo2 } from '../../schema';
import { Button } from '../ui/button';

export const TodosLocal = () => {
  const updateEntity = useUpdateEntity(Todo2);
  const hardDeleteEntity = useHardDeleteEntity();
  const { data: todosLocalData, deleted: deletedTodosLocalData } = useQuery(Todo2, { mode: 'local' });

  return (
    <>
      <h2 className="text-2xl font-bold">Todos (Local)</h2>
      {todosLocalData.map((todo) => (
        <div key={todo.id} className="flex flex-row items-center gap-2">
          <h2>{todo.name}</h2>
          <div className="text-xs">{todo.id}</div>
          {todo.assignees.map((assignee) => (
            <span key={assignee.id} className="border rounded-sm mr-1 p-1">
              {assignee.name}
            </span>
          ))}
          <input
            type="checkbox"
            checked={todo.checked}
            onChange={(e) => updateEntity(todo.id, { checked: e.target.checked })}
          />
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
    </>
  );
};
