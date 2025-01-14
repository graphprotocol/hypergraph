import type { AnyDocumentId } from '@automerge/automerge-repo';
import { Repo } from '@automerge/automerge-repo';
import { RepoContext } from '@automerge/automerge-repo-react-hooks';
import '@testing-library/jest-dom/vitest';
import { act, cleanup, renderHook } from '@testing-library/react';
// biome-ignore lint/style/useImportType: <explanation>
import React from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { idToAutomergeId } from '../../src/utils/automergeId.js';

import {
  SpacesProvider,
  useCreateEntity,
  useDeleteEntity,
  useQuery,
  useUpdateEntity,
} from '../../src/schema/context.js';
import { Model, Types } from '../../src/schema/index.js';

afterEach(() => {
  cleanup();
});

describe('Library Tests', () => {
  class Person extends Model.Class<Person>('Person')({
    id: Model.Generated(Types.Text),
    name: Types.Text,
    age: Types.Number,
  }) {}

  class User extends Model.Class<User>('User')({
    id: Model.Generated(Types.Text),
    name: Types.Text,
    email: Types.Text,
  }) {}

  class Badge extends Model.Class<Badge>('Badge')({
    id: Model.Generated(Types.Text),
    name: Types.Text,
  }) {}

  class Event extends Model.Class<Event>('Event')({
    id: Model.Generated(Types.Text),
    name: Types.Text,
  }) {}

  const spaceId = '52gTkePWSoGdXmgZF3nRU';

  let repo = new Repo({});
  let wrapper = ({ children }: { children: React.ReactNode }) => (
    <RepoContext.Provider value={repo}>
      <SpacesProvider defaultSpace={spaceId}>{children}</SpacesProvider>
    </RepoContext.Provider>
  );

  beforeEach(() => {
    repo = new Repo({});
    const automergeDocHandle = repo.find(idToAutomergeId(spaceId) as AnyDocumentId);
    // set it to ready to interact with the document
    automergeDocHandle.doneLoading();

    wrapper = ({ children }: { children: React.ReactNode }) => (
      <RepoContext.Provider value={repo}>
        <SpacesProvider defaultSpace={spaceId}>{children}</SpacesProvider>
      </RepoContext.Provider>
    );
  });

  it('should create one entity successfully', () => {
    expect([1]).toHaveLength(1);

    const { result: createResult } = renderHook(() => useCreateEntity(Event), {
      wrapper,
    });

    const { result: queryResult } = renderHook(() => useQuery(Event), { wrapper });

    act(() => {
      createResult.current({
        name: 'Conference',
      });
    });

    const events = queryResult.current;
    expect(events).toHaveLength(1);
  });

  it('should delete an entity', () => {
    const { result: createResult } = renderHook(() => useCreateEntity(Badge), {
      wrapper,
    });

    const { result: deleteResult } = renderHook(() => useDeleteEntity(), {
      wrapper,
    });

    const { result: queryResult } = renderHook(() => useQuery(Badge), { wrapper });

    let badgeId: string | undefined;

    act(() => {
      createResult.current({ name: 'Exclusive' });
    });

    act(() => {
      const badges = queryResult.current;
      expect(badges).toHaveLength(1);
      badgeId = badges[0]?.id;
    });

    act(() => {
      expect(badgeId).not.toBeNull();
      expect(badgeId).not.toBeUndefined();
      if (badgeId) {
        const success = deleteResult.current(badgeId);
        expect(success).toBe(true);
      }
    });

    act(() => {
      const badgesAfterDelete = queryResult.current;
      expect(badgesAfterDelete).toHaveLength(0);
    });
  });

  it('should update an entity', () => {
    const { result: createResult } = renderHook(() => useCreateEntity(Person), {
      wrapper,
    });

    const { result: updateResult } = renderHook(() => useUpdateEntity(Person), {
      wrapper,
    });

    const { result: queryResult } = renderHook(() => useQuery(Person), { wrapper });

    // Create a person
    act(() => {
      createResult.current({
        name: 'John',
        age: 25,
      });
    });

    let personId: string | undefined;

    // Get the created person's ID
    act(() => {
      const people = queryResult.current;
      expect(people).toHaveLength(1);
      expect(people[0]?.name).toBe('John');
      expect(people[0]?.age).toBe(25);
      personId = people[0]?.id;
    });

    // Update the person
    act(() => {
      expect(personId).not.toBeNull();
      expect(personId).not.toBeUndefined();
      if (personId) {
        const success = updateResult.current(personId, {
          name: 'John Doe',
          age: 26,
        });
        expect(success).toBe(true);
      }
    });

    // Verify the update
    act(() => {
      const peopleAfterUpdate = queryResult.current;
      expect(peopleAfterUpdate).toHaveLength(1);
      expect(peopleAfterUpdate[0]?.name).toBe('John Doe');
      expect(peopleAfterUpdate[0]?.age).toBe(26);
    });
  });

  it('should only query entities of the specified type', () => {
    const { result: createResult } = renderHook(() => useCreateEntity(Person), {
      wrapper,
    });

    const { result: createResult2 } = renderHook(() => useCreateEntity(User), {
      wrapper,
    });

    const { result: queryResult } = renderHook(() => useQuery(Person), { wrapper });

    act(() => {
      createResult.current({ name: 'John', age: 25 });
      createResult2.current({ name: 'Jane', email: 'jane@example.com' });
    });

    const people = queryResult.current;
    expect(people).toHaveLength(1);
    expect(people[0]?.name).toBe('John');
    expect(people[0]?.age).toBe(25);
  });
});
