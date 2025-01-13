import { useState } from 'react';
import { Todo } from '../schema';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useCreateEntity, useQuery, useUpdateEntity, useDeleteEntity } from '@graph-framework/schema';

export const TodosApp = () => {
  const todos = useQuery(Todo);
  const createEntity = useCreateEntity(Todo);
  const updateEntity = useUpdateEntity(Todo);
  const deleteEntity = useDeleteEntity();
  const [newTodoTitle, setNewTodoTitle] = useState('');

  return (
    <div>
      <h1>Todos</h1>
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
    </div>
  );
};
