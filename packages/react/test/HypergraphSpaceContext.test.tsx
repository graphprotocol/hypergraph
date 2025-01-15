import '@testing-library/jest-dom/vitest';
import { type AnyDocumentId, Repo } from '@automerge/automerge-repo';
import { QueryClient } from '@tanstack/react-query';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
// biome-ignore lint/style/useImportType: <explanation>
import React from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { Schema, Utils } from '@graphprotocol/hypergraph';

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
    age: Schema.Number,
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

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Disable retries to simplify testing
      },
    },
  });

  let repo = new Repo({});
  let wrapper = ({ children }: Readonly<{ children: React.ReactNode }>) => (
    <HypergraphSpaceProvider repo={repo} defaultSpaceId={spaceId} spaces={[spaceId]} queryClient={queryClient}>
      {children}
    </HypergraphSpaceProvider>
  );

  beforeEach(() => {
    repo = new Repo({});
    const automergeDocHandle = repo.find(Utils.idToAutomergeId(spaceId) as AnyDocumentId);
    // set it to ready to interact with the document
    automergeDocHandle.doneLoading();

    wrapper = ({ children }: Readonly<{ children: React.ReactNode }>) => (
      <HypergraphSpaceProvider repo={repo} defaultSpaceId={spaceId} spaces={[spaceId]} queryClient={queryClient}>
        {children}
      </HypergraphSpaceProvider>
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
      const { result: createEntityResult } = renderHook(() => useCreateEntity<Event>(), { wrapper });

      act(() => {
        createEntityResult.current.mutate({ type: Event, data: { name: 'Conference' } });
      });

      await waitFor(() => {
        expect(createEntityResult.current.isSuccess).toBe(true);
        expect(createEntityResult.current.data).toEqual(
          expect.objectContaining({ name: 'Conference', type: Event.name }),
        );
      });

      const createdEntityId = createEntityResult.current.data?.id;
      expect(createdEntityId).not.toBeNull();
      expect(createdEntityId).not.toBeUndefined();

      const { result: queryEntitiesResult } = renderHook(() => useQueryEntities<Event>({ type: Event }), { wrapper });
      await waitFor(() => expect(queryEntitiesResult.current.isSuccess).toBe(true));
      expect(queryEntitiesResult.current.data).toEqual([{ id: createdEntityId, type: Event.name, name: 'Conference' }]);

      const { result: queryEntityResult } = renderHook(
        () => useQueryEntity<Event>({ id: createdEntityId, type: Event }),
        { wrapper },
      );
      await waitFor(() => expect(queryEntityResult.current.isSuccess).toBe(true));
      expect(queryEntityResult.current.data).toEqual({ id: createdEntityId, type: Event.name, name: 'Conference' });
    });
  });

  describe('useUpdateEntity', () => {
    it('should be able to update a created entity through the useUpdateEntity hook', async () => {
      const { result: createEntityResult } = renderHook(() => useCreateEntity<Person>(), { wrapper });

      act(() => {
        createEntityResult.current.mutate({ type: Person, data: { name: 'Test', age: 1 } });
      });

      await waitFor(() => {
        expect(createEntityResult.current.isSuccess).toBe(true);
        expect(createEntityResult.current.data).toEqual(
          expect.objectContaining({ name: 'Test', age: 1, type: Person.name }),
        );
      });

      const createdEntityId = createEntityResult.current.data?.id;
      expect(createdEntityId).not.toBeNull();
      expect(createdEntityId).not.toBeUndefined();

      const { result: updateEntityResult } = renderHook(() => useUpdateEntity<Person>(), { wrapper });

      act(() => {
        updateEntityResult.current.mutate({ type: Person, id: createdEntityId, data: { name: 'Updated', age: 2112 } });
      });

      await waitFor(() => {
        expect(updateEntityResult.current.isSuccess).toBe(true);
        expect(updateEntityResult.current.data).toEqual({
          id: createdEntityId,
          name: 'Updated',
          age: 2112,
          type: Person.name,
        });
      });

      const { result: queryEntitiesResult } = renderHook(() => useQueryEntities<Person>({ type: Person }), { wrapper });
      await waitFor(() => expect(queryEntitiesResult.current.isSuccess).toBe(true));
      expect(queryEntitiesResult.current.data).toEqual([
        { id: createdEntityId, type: Person.name, name: 'Updated', age: 2112 },
      ]);

      const { result: queryEntityResult } = renderHook(
        () => useQueryEntity<Person>({ id: createdEntityId, type: Person }),
        { wrapper },
      );
      await waitFor(() => expect(queryEntityResult.current.isSuccess).toBe(true));
      expect(queryEntityResult.current.data).toEqual({
        id: createdEntityId,
        type: Person.name,
        name: 'Updated',
        age: 2112,
      });
    });
  });

  describe('useDeleteEntity', () => {
    it('should be able to delete the created entity', async () => {
      const { result: createEntityResult } = renderHook(() => useCreateEntity<User>(), { wrapper });

      act(() => {
        createEntityResult.current.mutate({ type: User, data: { name: 'Test', email: 'test.user@edgeandnode.com' } });
      });

      await waitFor(() => {
        expect(createEntityResult.current.isSuccess).toBe(true);
        expect(createEntityResult.current.data).toEqual(
          expect.objectContaining({ name: 'Test', email: 'test.user@edgeandnode.com', type: User.name }),
        );
      });

      const createdEntityId = createEntityResult.current.data?.id;
      expect(createdEntityId).not.toBeNull();
      expect(createdEntityId).not.toBeUndefined();

      const { result: queryEntitiesResult, rerender: rerenderQueryEntities } = renderHook(
        () => useQueryEntities<User>({ type: User }),
        { wrapper },
      );
      await waitFor(() => expect(queryEntitiesResult.current.isSuccess).toBe(true));
      expect(queryEntitiesResult.current.data).toEqual([
        { id: createdEntityId, type: User.name, name: 'Test', email: 'test.user@edgeandnode.com' },
      ]);

      const { result: deleteEntityResult } = renderHook(() => useDeleteEntity<User>(), { wrapper });

      act(() => {
        deleteEntityResult.current.mutate({ id: createdEntityId });
      });

      await waitFor(() => {
        expect(deleteEntityResult.current.isSuccess).toBe(true);
        expect(deleteEntityResult.current.data).toBe(true);
      });

      // refetch the entities
      rerenderQueryEntities();

      await waitFor(() => expect(queryEntitiesResult.current.isSuccess).toBe(true));
      expect(queryEntitiesResult.current.data).toEqual([]);
    });
  });
});
