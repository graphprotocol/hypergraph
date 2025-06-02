import { type AnyDocumentId, Repo } from '@automerge/automerge-repo';
import { RepoContext } from '@automerge/automerge-repo-react-hooks';
import { Entity, Type, Utils } from '@graphprotocol/hypergraph';
import '@testing-library/jest-dom/vitest';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
// biome-ignore lint/style/useImportType: <explanation>
import React from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  HypergraphSpaceProvider,
  useCreateEntity,
  useDeleteEntity,
  useQueryEntity,
  useQueryLocal,
  useUpdateEntity,
} from '../src/HypergraphSpaceContext.js';

afterEach(() => {
  cleanup();
});

describe('HypergraphSpaceContext', () => {
  class Person extends Entity.Class<Person>('Person')({
    name: Type.Text,
    age: Type.Number,
  }) {}

  class User extends Entity.Class<User>('User')({
    name: Type.Text,
    email: Type.Text,
  }) {}

  class Event extends Entity.Class<Event>('Event')({
    name: Type.Text,
  }) {}

  const spaceId = '52gTkePWSoGdXmgZF3nRU';

  let repo = new Repo({});
  let wrapper = ({ children }: Readonly<{ children: React.ReactNode }>) => (
    <RepoContext.Provider value={repo}>
      <HypergraphSpaceProvider space={spaceId}>{children}</HypergraphSpaceProvider>
    </RepoContext.Provider>
  );

  beforeEach(() => {
    repo = new Repo({});
    const result = repo.findWithProgress(Utils.idToAutomergeId(spaceId) as AnyDocumentId);
    const automergeDocHandle = result.handle;
    // set it to ready to interact with the document
    automergeDocHandle.doneLoading();

    wrapper = ({ children }: Readonly<{ children: React.ReactNode }>) => (
      <RepoContext.Provider value={repo}>
        <HypergraphSpaceProvider space={spaceId}>{children}</HypergraphSpaceProvider>
      </RepoContext.Provider>
    );
  });

  describe('useCreateEntity', () => {
    it('should be able to create an entity through the useCreateEntity Hook', async () => {
      const { result: createEntityResult } = renderHook(() => useCreateEntity(Event), { wrapper });

      let createdEntity: Entity.Entity<typeof Event> | null = null;

      act(() => {
        createdEntity = createEntityResult.current({ name: 'Conference' });
      });

      await waitFor(() => {
        expect(createdEntity).not.toBeNull();
      });

      if (createdEntity != null) {
        const { result: queryEntityResult } = renderHook(() => useQueryEntity(Event, createdEntity?.id || ''), {
          wrapper,
        });
        expect(queryEntityResult.current).toEqual(createdEntity);
      }

      const { result: queryEntitiesResult } = renderHook(() => useQueryLocal(Event), { wrapper });
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

      expect(createdEntity).toEqual({ id, name: 'Test User', age: 2112, type: Person.name });

      const { result: queryEntityResult } = renderHook(() => useQueryEntity(Person, id), { wrapper });
      expect(queryEntityResult.current).toEqual({ ...createdEntity, __version: '', __deleted: false });

      const { result: queryEntitiesResult } = renderHook(() => useQueryLocal(Person), { wrapper });
      expect(queryEntitiesResult.current).toEqual({
        deletedEntities: [],
        entities: [{ ...createdEntity, __version: '', __deleted: false }],
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

      const { result: queryEntitiesResult, rerender: rerenderQueryEntities } = renderHook(() => useQueryLocal(User), {
        wrapper,
      });
      expect(queryEntitiesResult.current).toEqual({ deletedEntities: [], entities: [createdEntity] });

      const { result: deleteEntityResult } = renderHook(() => useDeleteEntity(), { wrapper });

      let deleted = false;
      act(() => {
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
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
