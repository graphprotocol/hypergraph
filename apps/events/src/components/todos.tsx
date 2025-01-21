import { Space } from '@graphprotocol/hypergraph-react';
import { useState } from 'react';
import { Todo } from '../schema';
import { Button } from './ui/button';
import { Input } from './ui/input';

export const Todos = () => {
  const todos = Space.useQueryEntities(Todo);
  const createEntity = Space.useCreateEntity(Todo);
  const updateEntity = Space.useUpdateEntity(Todo);
  const deleteEntity = Space.useDeleteEntity();
  const [newTodoTitle, setNewTodoTitle] = useState('');

  return (
    <>
      <h1 className="text-2xl font-bold">Todos</h1>
      <div className="flex flex-row gap-2">
        <Input type="text" value={newTodoTitle} onChange={(e) => setNewTodoTitle(e.target.value)} />
        <Button
          onClick={() => {
            createEntity({ name: newTodoTitle, completed: false });
            setNewTodoTitle('');
          }}
        >
          Create Todo
        </Button>
      </div>
      {todos.map((todo) => (
        <div key={todo.id} className="flex flex-row items-center gap-2">
          <h2>{todo.name}</h2>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={(e) => updateEntity(todo.id, { completed: e.target.checked })}
          />
          <Button onClick={() => deleteEntity(todo.id)}>Delete</Button>
        </div>
      ))}
    </>
  );
};
