import { useState } from 'react';
import { useCreateEntity, useDeleteEntity, useQuery, useUpdateEntity } from '../schema';
import { Button } from './ui/button';
import { Input } from './ui/input';

export const TodosApp = () => {
  const createEntity = useCreateEntity();
  const updateEntity = useUpdateEntity();
  const deleteEntity = useDeleteEntity();
  const todos = useQuery({ types: ['Todo'] });
  const [newTodoTitle, setNewTodoTitle] = useState('');

  return (
    <div>
      <h1>Todos</h1>
      <div className="flex flex-row gap-2">
        <Input type="text" value={newTodoTitle} onChange={(e) => setNewTodoTitle(e.target.value)} />
        <Button
          onClick={() => {
            createEntity({
              types: ['Todo'],
              data: { title: newTodoTitle, completed: false },
            });
            setNewTodoTitle('');
          }}
        >
          Create Todo
        </Button>
      </div>
      {todos.map((todo) => (
        <div key={todo.id} className="flex flex-row items-center gap-2">
          <h2>{todo.title}</h2>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={(e) =>
              updateEntity({
                id: todo.id,
                types: ['Todo'],
                data: { completed: e.target.checked },
              })
            }
          />
          <Button onClick={() => deleteEntity(todo.id)}>Delete</Button>
        </div>
      ))}
    </div>
  );
};
