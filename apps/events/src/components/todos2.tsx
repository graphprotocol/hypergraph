import { getSmartAccountWalletClient } from '@/lib/smart-account';
import { cn } from '@/lib/utils';
import type { PublishDiffInfo } from '@graphprotocol/hypergraph-react';
import {
  PublishDiff,
  publishOps,
  useCreateEntity,
  useDeleteEntity,
  useHypergraphSpace,
  useQuery,
  useUpdateEntity,
} from '@graphprotocol/hypergraph-react';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import Select from 'react-select';
import { Todo2, User } from '../schema';
import { Spinner } from './spinner';
import { TodosLocal } from './todo/todos-local';
import { TodosPublicGeo } from './todo/todos-public-geo';
import { TodosPublicKg } from './todo/todos-public-kg';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Modal } from './ui/modal';

export const Todos2 = () => {
  const {
    data: dataTodos,
    isLoading: isLoadingTodos,
    isError: isErrorTodos,
    preparePublish: preparePublishTodos,
  } = useQuery(Todo2);
  const {
    data: dataUsers,
    isLoading: isLoadingUsers,
    isError: isErrorUsers,
    preparePublish: preparePublishUsers,
  } = useQuery(User);
  const space = useHypergraphSpace();
  const createTodo = useCreateEntity(Todo2);
  const updateTodo = useUpdateEntity(Todo2);
  const createUser = useCreateEntity(User);
  const deleteEntity = useDeleteEntity();
  const [newTodoName, setNewTodoName] = useState('');
  const [newTodoAssignees, setNewTodoAssignees] = useState<{ value: string; label: string }[]>([]);
  const [newUserName, setNewUserName] = useState('');
  const queryClient = useQueryClient();
  const [publishData, setPublishData] = useState<PublishDiffInfo | null>(null);
  const [isPublishDiffModalOpen, setIsPublishDiffModalOpen] = useState(false);
  const [isPreparingPublish, setIsPreparingPublish] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    setNewTodoAssignees((prevFilteredAssignees) => {
      // filter out assignees that are not in the users array whenever users change
      return prevFilteredAssignees.filter((assignee) => dataUsers.some((user) => user.id === assignee.value));
    });
  }, [dataUsers]);

  const userOptions = dataUsers.map((user) => ({ value: user.id, label: user.name }));

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
            {/* @ts-expect-error */}
            <div className="text-xs">{user.__version}</div>
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
            {/* @ts-expect-error */}
            <div className="text-xs">{todo.__version}</div>
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
            createTodo({ name: newTodoName, checked: false, assignees: newTodoAssignees.map(({ value }) => value) });
            setNewTodoName('');
          }}
        >
          Create Todo
        </Button>
      </div>

      <Button
        onClick={async () => {
          try {
            setIsPreparingPublish(true);
            const usersResult = await preparePublishUsers();
            console.log('users ops & diff', usersResult);
            const todosResult = await preparePublishTodos();
            console.log('todos ops & diff', todosResult);

            if (todosResult && usersResult) {
              setPublishData({
                newEntities: [...todosResult.newEntities, ...usersResult.newEntities],
                deletedEntities: [...todosResult.deletedEntities, ...usersResult.deletedEntities],
                updatedEntities: [...todosResult.updatedEntities, ...usersResult.updatedEntities],
              });
              setIsPublishDiffModalOpen(true);
            } else {
              console.error('preparing publishing error', todosResult, usersResult);
              throw new Error('Failed to prepare the publishing operations');
            }
          } catch (error) {
            console.error('preparing publishing error', error);
            alert('Failed to prepare the publishing operations');
          } finally {
            setIsPreparingPublish(false);
          }
        }}
        disabled={isPreparingPublish}
      >
        {isPreparingPublish ? 'Preparing …' : 'Prepare Publish'}
      </Button>

      <Modal isOpen={isPublishDiffModalOpen} onOpenChange={setIsPublishDiffModalOpen}>
        <div className="p-4 flex flex-col gap-4 min-w-96">
          <PublishDiff
            newEntities={publishData?.newEntities ?? []}
            deletedEntities={publishData?.deletedEntities ?? []}
            updatedEntities={publishData?.updatedEntities ?? []}
          />
          <Button
            onClick={async () => {
              try {
                const smartAccountWalletClient = await getSmartAccountWalletClient();
                if (!smartAccountWalletClient) {
                  throw new Error('Missing smartAccountWalletClient');
                }
                if (publishData) {
                  setIsPublishing(true);
                  const ops = [
                    ...publishData.newEntities.map((entity) => entity.ops),
                    ...publishData.updatedEntities.map((entity) => entity.ops),
                    ...publishData.deletedEntities.map((entity) => entity.ops),
                  ].flat();
                  const publishOpsResult = await publishOps({
                    ops,
                    walletClient: smartAccountWalletClient,
                    space,
                  });
                  console.log('publishOpsResult', publishOpsResult);
                  setIsPublishDiffModalOpen(false);
                  setPublishData(null);
                  setTimeout(() => {
                    queryClient.invalidateQueries({ queryKey: [`entities:${Todo2.name}`] });
                    queryClient.invalidateQueries({ queryKey: [`entities:geo:${Todo2.name}`] });
                  }, 1000);
                }
              } catch (error) {
                console.error('publishing error', error);
              } finally {
                setIsPublishing(false);
              }
            }}
            disabled={
              (publishData?.newEntities.length === 0 &&
                publishData?.updatedEntities.length === 0 &&
                publishData?.deletedEntities.length === 0) ||
              isPublishing
            }
          >
            {isPublishing ? 'Publishing …' : 'Publish'}
          </Button>
        </div>
      </Modal>

      <TodosLocal />

      <TodosPublicGeo />

      <TodosPublicKg />
    </>
  );
};
