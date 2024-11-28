import '@testing-library/jest-dom/vitest';
import { act, cleanup, renderHook } from '@testing-library/react';
// biome-ignore lint/style/useImportType: <explanation>
import React from 'react';
import { afterEach, beforeEach, describe, expect, expectTypeOf, it } from 'vitest';

import { createFunctions, repo, type } from '../src/context.js';

afterEach(() => {
  cleanup();
});

describe('Library Tests', () => {
  const schema = {
    types: {
      Person: {
        name: type.Text,
        age: type.Number,
        badges: type.Relation({
          types: ['Badge'] as const,
          cardinality: 'many',
        }),
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
        participants: type.Relation({
          types: ['Person'] as const,
          cardinality: 'many',
        }),
        author: type.Relation({
          types: ['User', 'Person'] as const,
          cardinality: 'one',
        }),
      },
    },
  };

  // Create functions from the schema
  const { useCreateEntity, useDeleteEntity, useQuery, SpaceProvider } = createFunctions(schema);

  let repoResult = repo.create();
  let wrapper = ({ children }: { children: React.ReactNode }) => (
    <SpaceProvider id={repoResult.documentId}>{children}</SpaceProvider>
  );

  beforeEach(() => {
    repoResult = repo.create();
    wrapper = ({ children }: { children: React.ReactNode }) => (
      <SpaceProvider id={repoResult.documentId}>{children}</SpaceProvider>
    );
  });

  it('should create one entity successfully', () => {
    expect([1]).toHaveLength(1);

    const { result: createResult } = renderHook(() => useCreateEntity(), {
      wrapper,
    });

    const { result: queryResult } = renderHook(() => useQuery({ types: ['Event'] }), { wrapper });

    act(() => {
      createResult.current(['Event'], {
        name: 'Conference',
        participants: [
          {
            name: 'Alice',
            age: 30,
            badges: [{ name: 'Speaker' }],
          },
          {
            name: 'Bob',
            age: 25,
            badges: [{ name: 'Attendee' }],
          },
        ],
        author: {
          name: 'Charlie',
          email: 'charlie@example.com',
          age: 35,
          badges: [{ name: 'VIP' }],
        },
      });
    });

    const events = queryResult.current;
    expect(events).toHaveLength(1);
  });

  it('should create and query entities with relations', () => {
    const { result: createResult } = renderHook(() => useCreateEntity(), {
      wrapper,
    });

    const { result: queryResult } = renderHook(() => useQuery({ types: ['Event'] }), { wrapper });

    act(() => {
      createResult.current(['Event'], {
        name: 'Conference',
        participants: [
          {
            name: 'Alice',
            age: 30,
            badges: [{ name: 'Speaker' }],
          },
          {
            name: 'Bob',
            age: 25,
            badges: [{ name: 'Attendee' }],
          },
        ],
        author: {
          name: 'Charlie',
          email: 'charlie@example.com',
          age: 35,
          badges: [{ name: 'VIP' }],
        },
      });
    });

    // Wait for the hook to update
    const events = queryResult.current;
    expect(events).toHaveLength(1);

    const event = events[0];
    if (!event) {
      throw new Error('Event not found');
    }
    expect(event.id).toBeTypeOf('string');
    expect(event.types).toStrictEqual(['Event']);
    expect(event.name).toBe('Conference');

    // Check participants
    expect(event.participants).toHaveLength(2);
    if (
      !event.participants[0] ||
      !event.participants[1] ||
      !event.participants[0].badges[0] ||
      !event.participants[1].badges[0]
    ) {
      throw new Error('Participants not found');
    }

    expect(event.participants[0].id).toBeTypeOf('string');
    expect(event.participants[0].types).toStrictEqual(['Person']);
    expect(event.participants[0].name).toBe('Alice');
    expect(event.participants[0].age).toBe(30);
    expect(event.participants[0].badges).toHaveLength(1);
    expect(event.participants[0].badges[0].name).toBe('Speaker');

    expect(event.participants[1].id).toBeTypeOf('string');
    expect(event.participants[1].types).toStrictEqual(['Person']);
    expect(event.participants[1].name).toBe('Bob');
    expect(event.participants[1].age).toBe(25);
    expect(event.participants[1].badges).toHaveLength(1);
    expect(event.participants[1].badges[0].name).toBe('Attendee');

    // Check author
    expect(event.author.id).toBeTypeOf('string');
    expect(event.author.types).toStrictEqual(['User', 'Person']);
    expect(event.author.name).toBe('Charlie');
    expect(event.author.email).toBe('charlie@example.com');

    expectTypeOf(event).toMatchTypeOf<{
      id: string;
      types: string[];
      name: string;
      participants: {
        id: string;
        types: string[];
        name: string;
        age: number;
        badges: {
          id: string;
          types: string[];
          name: string;
        }[];
      }[];
      author: {
        id: string;
        types: string[];
        name: string;
        age: number;
        email: string;
        badges: {
          id: string;
          types: string[];
          name: string;
        }[];
      };
    }>();
  });

  it('should create entities with nested relations and query them', () => {
    const { result: createResult } = renderHook(() => useCreateEntity(), {
      wrapper,
    });

    const { result: queryResult } = renderHook(() => useQuery({ types: ['Person'] }), { wrapper });

    act(() => {
      createResult.current(['Person'], {
        name: 'Dave',
        age: 40,
        badges: [{ name: 'VIP' }, { name: 'Contributor' }],
      });
    });

    // Wait for the hook to update
    const people = queryResult.current;
    expect(people).toHaveLength(1);

    const person = people[0];
    if (!person) {
      throw new Error('Person not found');
    }
    expect(person.name).toBe('Dave');
    expect(person.age).toBe(40);
    expect(person.badges).toHaveLength(2);
    if (!person.badges[0] || !person.badges[1]) {
      throw new Error('Badges not found');
    }
    expect(person.badges[0].name).toBe('VIP');
    expect(person.badges[1].name).toBe('Contributor');
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
      createResult.current(['Badge'], { name: 'Exclusive' });
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
});
