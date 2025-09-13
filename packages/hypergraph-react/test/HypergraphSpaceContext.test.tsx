import { Repo } from '@automerge/automerge-repo';
import { RepoContext } from '@automerge/automerge-repo-react-hooks';
import { Entity, store, Type } from '@graphprotocol/hypergraph';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom/vitest';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import type React from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  HypergraphSpaceProvider,
  useCreateEntity,
  useDeleteEntity,
  useQueryPrivate,
  useUpdateEntity,
} from '../src/HypergraphSpaceContext.js';
import { useEntity } from '../src/use-entity.js';

afterEach(() => {
  cleanup();
});

describe('HypergraphSpaceContext', () => {
  class Person extends Entity.Class<Person>('Person')({
    name: Type.String,
    age: Type.Number,
  }) {}

  class User extends Entity.Class<User>('User')({
    name: Type.String,
    email: Type.String,
  }) {}

  class Event extends Entity.Class<Event>('Event')({
    name: Type.String,
  }) {}

  const spaceId = '1e5e39da-a00d-4fd8-b53b-98095337112f';

  let repo = new Repo({});
  const queryClient = new QueryClient();
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
      const { result: queryEntitiesResult, rerender } = renderHook(() => useQueryPrivate(Event), { wrapper });
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
        expect(createdEntity).toEqual(
          expect.objectContaining({ name: 'Test', age: 1, type: Person.name, __deleted: false }),
        );
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
        id,
        name: 'Test User',
        age: 2112,
        type: Person.name,
        __schema: Person,
      });

      const { result: queryEntityResult } = renderHook(() => useEntity(Person, { id: id, mode: 'private' }), {
        wrapper,
      });
      expect(queryEntityResult.current).toEqual({
        data: {
          // @ts-expect-error - TODO: fix the types error
          ...createdEntity,
          __version: '',
          __deleted: false,
          __schema: Person,
        },
        invalidEntity: undefined,
        isPending: false,
        isError: false,
      });

      const { result: queryEntitiesResult, rerender } = renderHook(() => useQueryPrivate(Person), { wrapper });

      rerender();

      expect(queryEntitiesResult.current).toEqual({
        deletedEntities: [],
        // @ts-expect-error - TODO: fix the types error
        entities: [{ ...createdEntity, __version: '', __deleted: false, __schema: Person }],
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
        expect(createdEntity).toEqual(
          expect.objectContaining({ name: 'Test', email: 'test.user@edgeandnode.com', type: User.name }),
        );
      });

      const { result: queryEntitiesResult, rerender: rerenderQueryEntities } = renderHook(() => useQueryPrivate(User), {
        wrapper,
      });
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
