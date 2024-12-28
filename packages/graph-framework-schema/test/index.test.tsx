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
    types: {
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
    },
  };

  const spaceId = '52gTkePWSoGdXmgZF3nRU';

  // Create functions from the schema
  const { useCreateEntity, useDeleteEntity, useQuery } = createSchemaHooks(schema);

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
      createResult.current(['Event'], {
        name: 'Conference',
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
