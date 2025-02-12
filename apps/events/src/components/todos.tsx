import { useCreateEntity, useDeleteEntity, useQueryEntities, useUpdateEntity } from '@graphprotocol/hypergraph-react';
import { useEffect, useState } from 'react';
import Select from 'react-select';
import { Todo, User } from '../schema';
import { Button } from './ui/button';
import { Input } from './ui/input';

export const Todos = () => {
  const todos = useQueryEntities(Todo);
  const users = useQueryEntities(User);
  const createEntity = useCreateEntity(Todo);
  const updateEntity = useUpdateEntity(Todo);
  const deleteEntity = useDeleteEntity();
  const [newTodoName, setNewTodoName] = useState('');
  const [assignees, setAssignees] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    // filter out assignees that are not in the users array
    setAssignees((prevFilteredAssignees) => {
      return prevFilteredAssignees.filter((assignee) => users.some((user) => user.id === assignee.value));
    });
  }, [users]);

  const userOptions = users.map((user) => ({ value: user.id, label: user.name }));
  return (
    <>
      <h1 className="text-2xl font-bold">Todos</h1>
      <div className="flex flex-col gap-2">
        <Input type="text" value={newTodoName} onChange={(e) => setNewTodoName(e.target.value)} />
        <Select isMulti value={assignees} onChange={(e) => setAssignees(e.map((a) => a))} options={userOptions} />
        <Button
          onClick={() => {
            if (newTodoName === '') {
              alert('Todo text is required');
              return;
            }
            createEntity({ name: newTodoName, completed: false, assignees: assignees.map(({ value }) => value) });
            setNewTodoName('');
          }}
        >
          Create Todo
        </Button>
      </div>
      {todos.map((todo) => (
        <div key={todo.id} className="flex flex-row items-center gap-2">
          <h2>{todo.name}</h2>
          {todo.assignees.length > 0 && (
            <span className="text-xs text-gray-500">
              Assigned to: {todo.assignees.map((assignee) => assignee.name).join(', ')}
            </span>
          )}
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
