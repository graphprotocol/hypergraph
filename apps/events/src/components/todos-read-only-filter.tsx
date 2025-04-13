import { useQuery } from '@graphprotocol/hypergraph-react';
import { Todo } from '../schema';

export const TodosReadOnlyFilter = () => {
  const { data: todosCompleted } = useQuery(Todo, { mode: 'local', filter: { completed: true } });
  const { data: todosNotCompleted } = useQuery(Todo, { mode: 'local', filter: { completed: false } });

  return (
    <>
      <h1 className="text-2xl font-bold">Todos Filter (read only)</h1>
      <h2 className="text-lg font-bold">Not completed</h2>
      {todosNotCompleted.map((todo) => (
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

      <h2 className="text-lg font-bold">Completed</h2>
      {todosCompleted.map((todo) => (
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
