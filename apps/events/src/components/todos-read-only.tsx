import { useQuery } from '@graphprotocol/hypergraph-react';
import { Todo } from '../schema';

export const TodosReadOnly = () => {
  const { data: todos } = useQuery(Todo, { mode: 'local' });

  return (
    <>
      <h1 className="text-2xl font-bold">Todos (read only)</h1>
      {todos.map((todo) => (
        <div key={todo.id} className="flex flex-row items-center gap-2">
          <h2>{todo.name}</h2>
          <input type="checkbox" checked={todo.completed} readOnly />
        </div>
      ))}
    </>
  );
};
