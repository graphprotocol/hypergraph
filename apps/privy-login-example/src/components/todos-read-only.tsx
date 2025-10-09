import { useEntities } from '@graphprotocol/hypergraph-react';
import { Todo } from '../schema';

export const TodosReadOnly = () => {
  const { data: todos } = useEntities(Todo, { mode: 'private' });

  return (
    <>
      <h1 className="text-2xl font-bold">Todos (read only)</h1>
      {todos.map((todo) => (
        <div key={todo.id} className="flex flex-row items-center gap-2">
          <h2>{todo.name}</h2>
          {todo.assignees.length > 0 && (
            <span className="text-xs text-gray-500">
              Assigned to:{' '}
              {todo.assignees.map((assignee) => (
                <span key={assignee.id} className="border rounded-sm mr-1 p-1">
                  {assignee.name}
                </span>
              ))}
            </span>
          )}
          <input type="checkbox" checked={todo.completed} readOnly />
        </div>
      ))}
    </>
  );
};
