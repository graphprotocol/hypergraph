import { Repo } from '@automerge/automerge-repo';
import { RepoContext } from '@automerge/automerge-repo-react-hooks';
import { Entity, Id, store, Type } from '@graphprotocol/hypergraph';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom/vitest';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import type React from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { HypergraphSpaceProvider } from '../src/HypergraphSpaceContext.js';
import { useCreateEntity } from '../src/hooks/use-create-entity.js';
import { useDeleteEntity } from '../src/hooks/use-delete-entity.js';
import { useEntity } from '../src/hooks/use-entity.js';
import { useUpdateEntity } from '../src/hooks/use-update-entity.js';
import { useEntitiesPrivate } from '../src/internal/use-entities-private.js';

afterEach(() => {
  cleanup();
});

describe('HypergraphSpaceContext', () => {
  const Person = Entity.Schema(
    {
      name: Type.String,
      age: Type.Number,
    },
    {
      types: [Id('bffa181e-a333-495b-949c-57f2831d7eca')],
      properties: {
        name: Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
        age: Id('a427183d-3519-4c96-b80a-5a0c64daed41'),
      },
    },
  );

  const User = Entity.Schema(
    {
      name: Type.String,
      email: Type.String,
    },
    {
      types: [Id('bffa181e-a333-495b-949c-57f2831d7eca')],
      properties: {
        name: Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
        email: Id('b667f951-4ede-40ef-83f8-fb5efee8c2ae'),
      },
    },
  );

  const Event = Entity.Schema(
    {
      name: Type.String,
    },
    {
      types: [Id('bffa181e-a333-495b-949c-57f2831d7eca')],
      properties: {
        name: Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
      },
    },
  );

  const spaceId = '1e5e39da-a00d-4fd8-b53b-98095337112f';

  let repo = new Repo({});
  let queryClient = new QueryClient();
  const createWrapper =
    () =>
    ({ children }: Readonly<{ children: React.ReactNode }>) => (
      <RepoContext.Provider value={repo}>
        <QueryClientProvider client={queryClient}>
          <HypergraphSpaceProvider space={spaceId}>{children}</HypergraphSpaceProvider>
        </QueryClientProvider>
      </RepoContext.Provider>
    );

  let wrapper = createWrapper();

  beforeEach(() => {
    repo = new Repo({});
    queryClient = new QueryClient();
    store.send({ type: 'reset' });
    store.send({ type: 'setRepo', repo });
    store.send({
      type: 'setSpace',
      spaceId,
      spaceState: {
        id: spaceId,
        members: {},
        invitations: {},
        removedMembers: {},
        inboxes: {},
        lastEventHash: '',
      },
      name: 'Test Space',
      updates: { updates: [], firstUpdateClock: 0, lastUpdateClock: 0 },
      events: [],
      inboxes: [],
      keys: [],
    });

    wrapper = createWrapper();
  });

  describe('useCreateEntity', () => {
    it('should be able to create an entity through the useCreateEntity Hook', async () => {
      const { result: queryEntitiesResult, rerender } = renderHook(() => useEntitiesPrivate(Event), { wrapper });
      const { result: createEntityResult } = renderHook(() => useCreateEntity(Event), { wrapper });

      let createdEntity: Entity.Entity<typeof Event> | null = null;

      act(() => {
        createdEntity = createEntityResult.current({ name: 'Conference' });
      });

      await waitFor(() => {
        expect(createdEntity).not.toBeNull();
      });

      if (createdEntity != null) {
        const { result: queryEntityResult } = renderHook(
          () => useEntity(Event, { id: createdEntity?.id || '', mode: 'private' }),
          {
            wrapper,
          },
        );
        expect(queryEntityResult.current).toEqual({
          data: createdEntity,
          invalidEntity: undefined,
          isPending: false,
          isError: false,
        });
      }

      rerender();

      expect(queryEntitiesResult.current).toEqual({ deletedEntities: [], entities: [createdEntity] });
    });
  });

  describe('useUpdateEntity', () => {
    it('should be able to update a created entity through the useUpdateEntity hook', async () => {
      const { result: createEntityResult } = renderHook(() => useCreateEntity(Person), { wrapper });

      let createdEntity: Entity.Entity<typeof Person> | null = null;

      act(() => {
        createdEntity = createEntityResult.current({ name: 'Test', age: 1 });
      });

      await waitFor(() => {
        expect(createdEntity).not.toBeNull();
        expect(createdEntity).toEqual(expect.objectContaining({ name: 'Test', age: 1, __deleted: false }));
      });

      if (createdEntity == null) {
        throw new Error('person not created successfully');
      }

      const id = (createdEntity as Entity.Entity<typeof Person>).id;

      const {
        result: { current: updateEntity },
      } = renderHook(() => useUpdateEntity(Person), { wrapper });

      act(() => {
        createdEntity = updateEntity(id, { name: 'Test User', age: 2112 });
      });

      expect(createdEntity).toEqual({
        __deleted: false,
        id,
        name: 'Test User',
        age: 2112,
        __schema: Person,
      });

      const { result: queryEntityResult } = renderHook(() => useEntity(Person, { id: id, mode: 'private' }), {
        wrapper,
      });
      expect(queryEntityResult.current).toEqual({
        data: {
          // @ts-expect-error - TODO: fix the types error
          ...createdEntity,
          __deleted: false,
          __schema: Person,
        },
        invalidEntity: undefined,
        isPending: false,
        isError: false,
      });

      const { result: queryEntitiesResult, rerender } = renderHook(() => useEntitiesPrivate(Person), { wrapper });

      rerender();

      expect(queryEntitiesResult.current).toEqual({
        deletedEntities: [],
        // @ts-expect-error - TODO: fix the types error
        entities: [{ ...createdEntity, __deleted: false, __schema: Person }],
      });
    });
  });

  describe('useDeleteEntity', () => {
    it('should be able to delete the created entity', async () => {
      const { result: createEntityResult } = renderHook(() => useCreateEntity(User), { wrapper });

      let createdEntity: Entity.Entity<typeof User> | null = null;

      act(() => {
        createdEntity = createEntityResult.current({ name: 'Test', email: 'test.user@edgeandnode.com' });
      });

      await waitFor(() => {
        expect(createdEntity).not.toBeNull();
        expect(createdEntity?.name).toEqual('Test');
      });

      const { result: queryEntitiesResult, rerender: rerenderQueryEntities } = renderHook(
        () => useEntitiesPrivate(User),
        {
          wrapper,
        },
      );
      rerenderQueryEntities();
      expect(queryEntitiesResult.current).toEqual({ deletedEntities: [], entities: [createdEntity] });

      const { result: deleteEntityResult } = renderHook(() => useDeleteEntity(), { wrapper });

      let deleted = false;
      act(() => {
        // biome-ignore lint/style/noNonNullAssertion: fine for testing
        deleted = deleteEntityResult.current(createdEntity!.id);
      });

      await waitFor(() => {
        expect(deleted).toBe(true);
      });

      rerenderQueryEntities();

      expect(queryEntitiesResult.current.entities).toHaveLength(0);
      expect(queryEntitiesResult.current.entities).toEqual([]);
      expect(queryEntitiesResult.current.deletedEntities).toHaveLength(1);
    });
  });
});
