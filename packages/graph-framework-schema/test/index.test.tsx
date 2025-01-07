import '@testing-library/jest-dom/vitest';
import { act, cleanup, renderHook } from '@testing-library/react';
// biome-ignore lint/style/useImportType: <explanation>
import React from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import type { AnyDocumentId } from '@automerge/automerge-repo';
import { Repo } from '@automerge/automerge-repo';
import { RepoContext } from '@automerge/automerge-repo-react-hooks';
import { idToAutomergeId } from '@graph-framework/utils';
import { SpacesProvider, createSchemaHooks, type } from '../src/context.js';

afterEach(() => {
  cleanup();
});

describe('Library Tests', () => {
  const schema = {
    Person: {
      name: type.Text,
      age: type.Number,
    },
    User: {
      name: type.Text,
      email: type.Text,
    },
    Badge: {
      name: type.Text,
    },
    Event: {
      name: type.Text,
    },
  };

  const spaceId = '52gTkePWSoGdXmgZF3nRU';

  // Create functions from the schema
  const { useCreateEntity, useDeleteEntity, useQuery, useUpdateEntity } = createSchemaHooks(schema);

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

    const { result: createResult } = renderHook(() => useCreateEntity(), {
      wrapper,
    });

    const { result: queryResult } = renderHook(() => useQuery({ types: ['Event'] }), { wrapper });

    act(() => {
      createResult.current({
        types: ['Event'],
        data: {
          name: 'Conference',
        },
      });
    });

    const events = queryResult.current;
    expect(events).toHaveLength(1);
  });

  it('should delete an entity', () => {
    const { result: createResult } = renderHook(() => useCreateEntity(), {
      wrapper,
    });

    const { result: deleteResult } = renderHook(() => useDeleteEntity(), {
      wrapper,
    });

    const { result: queryResult } = renderHook(() => useQuery({ types: ['Badge'] }), { wrapper });

    let badgeId: string | undefined;

    act(() => {
      createResult.current({
        types: ['Badge'],
        data: { name: 'Exclusive' },
      });
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
    const { result: createResult } = renderHook(() => useCreateEntity(), {
      wrapper,
    });

    const { result: updateResult } = renderHook(() => useUpdateEntity(), {
      wrapper,
    });

    const { result: queryResult } = renderHook(() => useQuery({ types: ['Person'] }), { wrapper });

    // Create a person
    act(() => {
      createResult.current({
        types: ['Person'],
        data: {
          name: 'John',
          age: 25,
        },
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
        const success = updateResult.current({
          id: personId,
          types: ['Person'],
          data: {
            name: 'John Doe',
            age: 26,
          },
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
});

describe.only('Relations Tests', () => {
  const schema = {
    User: {
      name: type.Text,
      email: type.Text,
      events: type.Relation({
        key: 'AttendeeOf',
        type: 'Event',
      }),
    },
    Event: {
      name: type.Text,
      attendees: type.Relation({
        key: 'AttendeeOf',
        type: 'User',
      }),
    },
  };

  const spaceId = '52gTkePWSoGdXmgZF3nRU';
  const { useCreateEntity, useQuery } = createSchemaHooks(schema);

  let repo = new Repo({});
  let wrapper = ({ children }: { children: React.ReactNode }) => (
    <RepoContext.Provider value={repo}>
      <SpacesProvider defaultSpace={spaceId}>{children}</SpacesProvider>
    </RepoContext.Provider>
  );

  beforeEach(() => {
    repo = new Repo({});
    const automergeDocHandle = repo.find(idToAutomergeId(spaceId) as AnyDocumentId);
    automergeDocHandle.doneLoading();

    wrapper = ({ children }: { children: React.ReactNode }) => (
      <RepoContext.Provider value={repo}>
        <SpacesProvider defaultSpace={spaceId}>{children}</SpacesProvider>
      </RepoContext.Provider>
    );
  });

  // it('should create entities with relations', () => {
  //   const { result: createResult } = renderHook(() => useCreateEntity(), {
  //     wrapper,
  //   });

  //   const { result: queryUsersResult } = renderHook(() => useQuery({ types: ['User'], include: { events: true } }), {
  //     wrapper,
  //   });

  //   const { result: queryEventsResult } = renderHook(
  //     () => useQuery({ types: ['Event'], include: { attendees: true } }),
  //     { wrapper },
  //   );

  //   // Create an event
  //   let eventId: string;
  //   act(() => {
  //     const { id } = createResult.current({
  //       types: ['Event'],
  //       data: {
  //         name: 'Tech Conference',
  //       },
  //     });
  //     console.log('eventId', id);
  //     eventId = queryEventsResult.current[0].id;
  //   });

  //   // Create a user with relation to the event
  //   act(() => {
  //     createResult.current({
  //       types: ['User'],
  //       data: {
  //         name: 'John Doe',
  //         email: 'john@example.com',
  //         events: [eventId],
  //       },
  //     });
  //   });

  //   // Verify relations
  //   act(() => {
  //     const users = queryUsersResult.current;
  //     const events = queryEventsResult.current;

  //     expect(users).toHaveLength(1);
  //     expect(users[0].events).toHaveLength(1);
  //     expect(users[0].events[0].name).toBe('Tech Conference');

  //     expect(events).toHaveLength(1);
  //     expect(events[0].attendees).toHaveLength(1);
  //     expect(events[0].attendees[0].name).toBe('John Doe');
  //   });
  // });
});
