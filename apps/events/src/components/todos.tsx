import { useState } from 'react';

import { Schema } from '@graphprotocol/hypergraph';

import { Todo } from '../schema';
import { Button } from './ui/button';
import { Input } from './ui/input';

export const Todos = () => {
  const todos = Schema.useQuery(Todo);
  const createEntity = Schema.useCreateEntity(Todo);
  const updateEntity = Schema.useUpdateEntity(Todo);
  const deleteEntity = Schema.useDeleteEntity();
  const [newTodoTitle, setNewTodoTitle] = useState('');
  Schema.useChanges();

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
