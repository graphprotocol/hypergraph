import { useCreateEntity, useDeleteEntity, useQuery, useSpace, useUpdateEntity } from '@graphprotocol/hypergraph-react';
import { useEffect, useState } from 'react';
import Select from 'react-select';
import { cn } from '@/lib/utils';
import { Todo2, User } from '../schema';
import { Spinner } from './spinner';
import { TodosLocal } from './todo/todos-local';
import { TodosPublic } from './todo/todos-public';
import { Button } from './ui/button';
import { Input } from './ui/input';

export const Todos2 = () => {
  const {
    data: dataTodos,
    isLoading: isLoadingTodos,
    isError: isErrorTodos,
    // preparePublish: preparePublishTodos,
  } = useQuery(Todo2, { mode: 'private', include: { assignees: {} } });
  const {
    data: dataUsers,
    isLoading: isLoadingUsers,
    isError: isErrorUsers,
    // preparePublish: preparePublishUsers,
  } = useQuery(User, { mode: 'private' });
  const { ready: spaceReady } = useSpace({ mode: 'private' });
  const createTodo = useCreateEntity(Todo2);
  const updateTodo = useUpdateEntity(Todo2);
  const createUser = useCreateEntity(User);
  const deleteEntity = useDeleteEntity();
  const [newTodoName, setNewTodoName] = useState('');
  const [newTodoAssignees, setNewTodoAssignees] = useState<{ value: string; label: string }[]>([]);
  const [newUserName, setNewUserName] = useState('');

  useEffect(() => {
    setNewTodoAssignees((prevFilteredAssignees) => {
      // filter out assignees that are not in the users array whenever users change
      return prevFilteredAssignees.filter((assignee) => dataUsers.some((user) => user.id === assignee.value));
    });
  }, [dataUsers]);

  const userOptions = dataUsers.map((user) => ({ value: user.id, label: user.name }));

  if (!spaceReady) {
    return <div>Loading space...</div>;
  }

  return (
    <>
      <div className="flex flex-row gap-4 items-center">
        <h2 className="text-2xl font-bold">Users (Merged)</h2>
        {isLoadingUsers && <Spinner size="sm" />}
      </div>
      {isErrorUsers && <div>Error loading todos</div>}
      <div className={`flex flex-col gap-4 ${cn({ 'opacity-50': isLoadingUsers })}`}>
        {dataUsers.map((user) => (
          <div key={user.id} className="flex flex-row items-center gap-2">
            <h2>{user.name}</h2>
            <div className="text-xs">{user.id}</div>
            <Button variant="outline" size="sm" onClick={() => deleteEntity(user.id)}>
              Delete
            </Button>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <Input type="text" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} />
        <Button
          onClick={() => {
            if (newUserName === '') {
              alert('User name is required');
              return;
            }
            createUser({ name: newUserName });
            setNewUserName('');
          }}
        >
          Create User
        </Button>
      </div>

      <div className="flex flex-row gap-4 items-center">
        <h2 className="text-2xl font-bold">Todos (Merged)</h2>
        {isLoadingTodos && <Spinner size="sm" />}
      </div>
      {isErrorTodos && <div>Error loading todos</div>}
      <div className={`flex flex-col gap-4 ${cn({ 'opacity-50': isLoadingTodos })}`}>
        {dataTodos.map((todo) => (
          <div key={todo.id} className="flex flex-row items-center gap-2">
            <h2>{todo.name}</h2>
            <div className="text-xs">{todo.id}</div>
            <input
              type="checkbox"
              checked={todo.checked}
              onChange={(e) => updateTodo(todo.id, { checked: e.target.checked })}
            />
            <div className="text-xs">{todo.due.toLocaleDateString()}</div>
            <div className="text-xs">{todo.amount}</div>
            {todo.point && <div className="text-xs">{todo.point.join(', ')}</div>}
            {todo.website && <div className="text-xs">{todo.website.toString()}</div>}
            {todo.assignees.length > 0 && (
              <span className="text-xs text-gray-500">
                Assigned to:{' '}
                {todo.assignees.map((assignee) => (
                  <span key={assignee.id} className="border rounded-sm mr-1 p-1">
                    {assignee.name}
                    <button
                      type="button"
                      onClick={() =>
                        // updateTodo(todo.id, {
                        //   assignees: todo.assignees.map((assignee) => assignee.id).filter((id) => id !== assignee.id),
                        // })
                        alert('TODO')
                      }
                      className="cursor-pointer ml-1 text-red-400"
                    >
                      x
                    </button>
                  </span>
                ))}
              </span>
            )}
            <Button variant="outline" size="sm" onClick={() => deleteEntity(todo.id)}>
              Delete
            </Button>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2 mb-8">
        <Input type="text" value={newTodoName} onChange={(e) => setNewTodoName(e.target.value)} />
        <Select
          isMulti
          value={newTodoAssignees}
          onChange={(e) => setNewTodoAssignees(e.map((a) => a))}
          options={userOptions}
        />
        <Button
          onClick={() => {
            if (newTodoName === '') {
              alert('Todo text is required');
              return;
            }
            createTodo({
              name: newTodoName,
              checked: false,
              assignees: newTodoAssignees.map(({ value }) => value),
              due: new Date('2025-08-20'),
              amount: 100,
              point: [12.34, 56.78],
              website: 'https://example.com',
            });
            setNewTodoName('');
          }}
        >
          Create Todo
        </Button>
      </div>

      <TodosLocal />

      <TodosPublic />
    </>
  );
};
