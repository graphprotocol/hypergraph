import '@testing-library/jest-dom/vitest';
import { type AnyDocumentId, Repo } from '@automerge/automerge-repo';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
// biome-ignore lint/style/useImportType: <explanation>
import React from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { Schema, Utils } from '@graphprotocol/hypergraph';

import { RepoContext } from '@automerge/automerge-repo-react-hooks';
import {
  HypergraphSpaceProvider,
  useCreateEntity,
  useDeleteEntity,
  useHypergraphDefaultAutomergeDocId,
  useHypergraphDefaultSpaceId,
  useQueryEntities,
  useQueryEntity,
  useUpdateEntity,
} from '../src/HypergraphSpaceContext.js';

afterEach(() => {
  cleanup();
});

describe('HypergraphSpaceContext', () => {
  class Person extends Schema.Class<Person>('Person')({
    id: Schema.Generated(Schema.Text),
    name: Schema.Text,
    age: Schema.Number.pipe(Schema.positive(), Schema.int()),
  }) {}

  class User extends Schema.Class<User>('User')({
    id: Schema.Generated(Schema.Text),
    name: Schema.Text,
    email: Schema.Text,
  }) {}

  class Event extends Schema.Class<Event>('Event')({
    id: Schema.Generated(Schema.Text),
    name: Schema.Text,
  }) {}

  const spaceId = '52gTkePWSoGdXmgZF3nRU';
  const defaultAutomergeDocId = Utils.idToAutomergeId(spaceId);

  let repo = new Repo({});
  let wrapper = ({ children }: Readonly<{ children: React.ReactNode }>) => (
    <RepoContext.Provider value={repo}>
      <HypergraphSpaceProvider defaultSpaceId={spaceId} spaces={[spaceId]}>
        {children}
      </HypergraphSpaceProvider>
    </RepoContext.Provider>
  );

  beforeEach(() => {
    repo = new Repo({});
    const automergeDocHandle = repo.find(Utils.idToAutomergeId(spaceId) as AnyDocumentId);
    // set it to ready to interact with the document
    automergeDocHandle.doneLoading();

    wrapper = ({ children }: Readonly<{ children: React.ReactNode }>) => (
      <RepoContext.Provider value={repo}>
        <HypergraphSpaceProvider defaultSpaceId={spaceId} spaces={[spaceId]}>
          {children}
        </HypergraphSpaceProvider>
      </RepoContext.Provider>
    );
  });

  it('should have access to context through hooks', () => {
    const { result: spaceIdResult } = renderHook(() => useHypergraphDefaultSpaceId(), { wrapper });
    expect(spaceIdResult.current).toEqual(spaceId);

    const { result: automergeDocIdResult } = renderHook(() => useHypergraphDefaultAutomergeDocId(), { wrapper });
    expect(automergeDocIdResult.current).toEqual(defaultAutomergeDocId);
  });

  describe('useCreateEntity', () => {
    it('should be able to create an entity through the useCreateEntity Hook', async () => {
      const { result: createEntityResult } = renderHook(() => useCreateEntity(Event), { wrapper });

      let createdEntity: Schema.Entity<typeof Event> | null = null;

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

      const { result: queryEntitiesResult } = renderHook(() => useQueryEntities(Event), { wrapper });
      expect(queryEntitiesResult.current).toEqual([createdEntity]);
    });
  });

  describe('useUpdateEntity', () => {
    it('should be able to update a created entity through the useUpdateEntity hook', async () => {
      const { result: createEntityResult } = renderHook(() => useCreateEntity(Person), { wrapper });

      let createdEntity: Schema.Entity<typeof Person> | null = null;

      act(() => {
        createdEntity = createEntityResult.current({ name: 'Test', age: 1 });
      });

      await waitFor(() => {
        expect(createdEntity).not.toBeNull();
        expect(createdEntity).toEqual(expect.objectContaining({ name: 'Test', age: 1, type: Person.name }));
      });

      if (createdEntity == null) {
        throw new Error('person not created successfully');
      }

      const id = (createdEntity as Schema.Entity<typeof Person>).id;

      const { result: updateEntityResult } = renderHook(() => useUpdateEntity(Person), { wrapper });

      act(() => {
        createdEntity = updateEntityResult.current({ id, data: { name: 'Test User', age: 2112 } });
      });

      expect(createdEntity).toEqual({ id, name: 'Test User', age: 2112, type: Person.name });

      const { result: queryEntityResult } = renderHook(() => useQueryEntity(Person, id), { wrapper });
      expect(queryEntityResult.current).toEqual(createdEntity);

      const { result: queryEntitiesResult } = renderHook(() => useQueryEntities(Person), { wrapper });
      expect(queryEntitiesResult.current).toEqual([createdEntity]);
    });
  });

  describe('useDeleteEntity', () => {
    it('should be able to delete the created entity', async () => {
      const { result: createEntityResult } = renderHook(() => useCreateEntity(User), { wrapper });

      let createdEntity: Schema.Entity<typeof User> | null = null;

      act(() => {
        createdEntity = createEntityResult.current({ name: 'Test', email: 'test.user@edgeandnode.com' });
      });

      await waitFor(() => {
        expect(createdEntity).not.toBeNull();
        expect(createdEntity).toEqual(
          expect.objectContaining({ name: 'Test', email: 'test.user@edgeandnode.com', type: User.name }),
        );
      });

      const { result: queryEntitiesResult, rerender: rerenderQueryEntities } = renderHook(
        () => useQueryEntities(User),
        { wrapper },
      );
      expect(queryEntitiesResult.current).toEqual([createdEntity]);

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

      expect(queryEntitiesResult.current).toHaveLength(0);
      expect(queryEntitiesResult.current).toEqual([]);
    });
  });
});
