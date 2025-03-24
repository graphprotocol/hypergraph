import { smartAccountWalletClient } from '@/lib/smart-account';
import { cn } from '@/lib/utils';
import type { Op } from '@graphprotocol/grc-20';
import type { PublishDiffInfo } from '@graphprotocol/hypergraph-react';
import {
  PublishDiff,
  _generateDeleteOps,
  publishOps,
  useCreateEntity,
  useDeleteEntity,
  useHardDeleteEntity,
  useHypergraphSpace,
  useQuery,
  _useQueryPublicKg as useQueryPublicKg,
  useUpdateEntity,
} from '@graphprotocol/hypergraph-react';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Todo2 } from '../schema';
import { Spinner } from './spinner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Modal } from './ui/modal';
export const Todos2 = () => {
  const { data: kgPublicData, isLoading: kgPublicIsLoading, isError: kgPublicIsError } = useQueryPublicKg(Todo2);
  const { data: dataPublic, isLoading: isLoadingPublic, isError: isErrorPublic } = useQuery(Todo2, { mode: 'public' });
  const { data, isLoading, isError, preparePublish } = useQuery(Todo2);
  const { data: todosLocalData, deleted: deletedTodosLocalData } = useQuery(Todo2, { mode: 'local' });
  const space = useHypergraphSpace();
  const createEntity = useCreateEntity(Todo2);
  const updateEntity = useUpdateEntity(Todo2);
  const deleteEntity = useDeleteEntity();
  const hardDeleteEntity = useHardDeleteEntity();
  const [newTodoName, setNewTodoName] = useState('');
  const queryClient = useQueryClient();
  const [publishData, setPublishData] = useState<{ diff: PublishDiffInfo<typeof Todo2>; ops: Array<Op> } | null>(null);
  const [isPublishDiffModalOpen, setIsPublishDiffModalOpen] = useState(false);
  const [isPreparingPublish, setIsPreparingPublish] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  return (
    <>
      <div className="flex flex-row gap-4 items-center">
        <h2 className="text-2xl font-bold">Todos (Merged)</h2>
        {isLoading && <Spinner size="sm" />}
      </div>
      {isError && <div>Error loading todos</div>}
      <div className={`flex flex-col gap-4 ${cn({ 'opacity-50': isLoading })}`}>
        {data.map((todo) => (
          <div key={todo.id} className="flex flex-row items-center gap-2">
            <h2>{todo.name}</h2>
            <div className="text-xs">{todo.id}</div>
            <input
              type="checkbox"
              checked={todo.checked}
              onChange={(e) => updateEntity(todo.id, { checked: e.target.checked })}
            />
            <div className="text-xs">{todo.__version}</div>
            <Button variant="outline" size="sm" onClick={() => deleteEntity(todo.id)}>
              Delete
            </Button>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <Input type="text" value={newTodoName} onChange={(e) => setNewTodoName(e.target.value)} />
        <Button
          onClick={() => {
            if (newTodoName === '') {
              alert('Todo text is required');
              return;
            }
            createEntity({ name: newTodoName, checked: false });
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
            const result = await preparePublish();

            console.log('ops & diff', result);
            if (result) {
              setPublishData(result);
              setIsPublishDiffModalOpen(true);
            }
          } catch (error) {
            console.error('preparing publishing error', error);
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
          <PublishDiff<typeof Todo2>
            newEntities={publishData?.diff.newEntities ?? []}
            deletedEntities={publishData?.diff.deletedEntities ?? []}
            updatedEntities={publishData?.diff.updatedEntities ?? []}
          />
          <Button
            onClick={async () => {
              try {
                if (publishData) {
                  setIsPublishing(true);
                  const publishOpsResult = await publishOps({
                    ops: publishData.ops,
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
            disabled={publishData?.ops.length === 0 || isPublishing}
          >
            {isPublishing ? 'Publishing …' : 'Publish'}
          </Button>
        </div>
      </Modal>

      <h2 className="text-2xl font-bold">Todos (Local)</h2>
      {todosLocalData.map((todo) => (
        <div key={todo.id} className="flex flex-row items-center gap-2">
          <h2>{todo.name}</h2>
          <div className="text-xs">{todo.id}</div>
          <input
            type="checkbox"
            checked={todo.checked}
            onChange={(e) => updateEntity(todo.id, { checked: e.target.checked })}
          />
          <div className="text-xs">{todo.__deleted ? 'deleted' : 'not deleted'}</div>
          <div className="text-xs">{todo.__version}</div>
          <Button variant="secondary" size="sm" onClick={() => hardDeleteEntity(todo.id)}>
            Hard Delete
          </Button>
        </div>
      ))}
      <h2 className="text-2xl font-bold">Deleted Todos (Local)</h2>
      {deletedTodosLocalData.map((todo) => (
        <div key={todo.id} className="flex flex-row items-center gap-2">
          <h2>{todo.name}</h2>
          <div className="text-xs">{todo.id}</div>
          <Button variant="secondary" size="sm" onClick={() => hardDeleteEntity(todo.id)}>
            Hard Delete
          </Button>
        </div>
      ))}

      <div className="flex flex-row gap-4 items-center">
        <h2 className="text-2xl font-bold">Todos (Public Geo)</h2>
        {isLoadingPublic && <Spinner size="sm" />}
      </div>
      {isErrorPublic && <div>Error loading todos</div>}
      {dataPublic.map((todo) => (
        <div key={todo.id} className="flex flex-row items-center gap-2">
          <h2>{todo.name}</h2>
          <div className="text-xs">{todo.id}</div>
          <input type="checkbox" checked={todo.checked} readOnly />
          <Button
            onClick={async () => {
              const ops = await _generateDeleteOps({ id: todo.id, space });
              const result = await publishOps({ ops, walletClient: smartAccountWalletClient, space });
              console.log('result', result);
            }}
          >
            Delete
          </Button>
        </div>
      ))}

      <div className="flex flex-row gap-4 items-center">
        <h2 className="text-2xl font-bold">Todos (Public KG)</h2>
        {kgPublicIsLoading && <Spinner size="sm" />}
      </div>
      {kgPublicIsError && <div>Error loading todos</div>}
      {kgPublicData.map((todo) => (
        <div key={todo.id} className="flex flex-row items-center gap-2">
          <h2>{todo.name}</h2>
          <div className="text-xs">{todo.id}</div>
          <input type="checkbox" checked={todo.checked} readOnly />
          <Button
            onClick={async () => {
              const ops = await _generateDeleteOps({ id: todo.id, space });
              const result = await publishOps({ ops, walletClient: smartAccountWalletClient, space });
              console.log('result', result);
            }}
          >
            Delete
          </Button>
        </div>
      ))}
    </>
  );
};
