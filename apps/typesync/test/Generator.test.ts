import { describe, expect, it } from '@effect/vitest';

// @ts-ignore - fix the ts setup
import { buildMappingFile } from '../src/Generator.js';

describe('buildMappingFile', () => {
  it('should build a valid mapping file', () => {
    const expectedMapping = `import { Id } from '@graphprotocol/grc-20';
import type { Mapping } from '@graphprotocol/hypergraph';

export const mapping: Mapping = {
  Space: {
    typeIds: [Id.Id('362c1dbd-dc64-44bb-a3c4-652f38a642d7')],
    properties: {
      name: Id.Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
      description: Id.Id('9b1f76ff-9711-404c-861e-59dc3fa7d037'),
    },
  },
  Activity: {
    typeIds: [Id.Id('8275c359-4662-40fb-9aec-27177b520cd2')],
    properties: {
      name: Id.Id('a126ca53-0c8e-48d5-b888-82c734c38935'),
      description: Id.Id('9b1f76ff-9711-404c-861e-59dc3fa7d037'),
    },
    relations: {
      relatedSpaces: Id.Id('5b722cd3-61d6-494e-8887-1310566437ba'),
    },
  },
};`;

    const mapping = buildMappingFile({
      name: 'test',
      description: 'test',
      directory: 'test',
      template: 'vite_react',
      types: [
        {
          name: 'Space',
          knowledgeGraphId: '362c1dbd-dc64-44bb-a3c4-652f38a642d7',
          properties: [
            {
              name: 'Name',
              knowledgeGraphId: 'a126ca53-0c8e-48d5-b888-82c734c38935',
              dataType: 'Text',
            },
            {
              name: 'Description',
              knowledgeGraphId: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
              dataType: 'Text',
            },
          ],
        },
        {
          name: 'Activity',
          knowledgeGraphId: '8275c359-4662-40fb-9aec-27177b520cd2',
          properties: [
            {
              name: 'Name',
              knowledgeGraphId: 'a126ca53-0c8e-48d5-b888-82c734c38935',
              dataType: 'Text',
            },
            {
              name: 'Description',
              knowledgeGraphId: '9b1f76ff-9711-404c-861e-59dc3fa7d037',
              dataType: 'Text',
            },
            {
              name: 'Related spaces',
              knowledgeGraphId: '5b722cd3-61d6-494e-8887-1310566437ba',
              dataType: 'Relation(Related spaces)',
              relationType: 'Related spaces',
            },
          ],
        },
      ],
    });
    expect(mapping).toBe(expectedMapping);
  });
});
