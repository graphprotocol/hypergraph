import { useState } from 'react';
import { useCreateEntity, useQuery } from '../schema';
import { Button } from './ui/button';
import { Input } from './ui/input';

export const TodosApp = () => {
  const createEntity = useCreateEntity();
  const todos = useQuery({ types: ['Todo'] });
  const [newTodoTitle, setNewTodoTitle] = useState('');

  return (
    <div>
      <h1>Todos</h1>
      <div className="flex flex-row gap-2">
        <Input type="text" value={newTodoTitle} onChange={(e) => setNewTodoTitle(e.target.value)} />
        <Button
          onClick={() => {
            createEntity(['Todo'], { title: newTodoTitle, completed: false });
            setNewTodoTitle('');
          }}
        >
          Create Todo
        </Button>
      </div>
      {todos.map((todo) => (
        <div key={todo.id} className="flex flex-row gap-2">
          <h2>{todo.title}</h2>
          <input type="checkbox" checked={todo.completed} />
        </div>
      ))}
    </div>
  );
};
