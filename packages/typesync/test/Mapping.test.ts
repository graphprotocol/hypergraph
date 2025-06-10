import { describe, expect, it } from 'vitest';

import { type Mapping, generateMapping, mapSchemaDataTypeToGRC20PropDataType } from '../src/Mapping.js';

describe('Mapping', () => {
  describe('mapSchemaDataTypeToGRC20PropDataType', () => {
    it('should be able to map the schema dataType to the correct GRC-20 dataType', () => {
      expect(mapSchemaDataTypeToGRC20PropDataType('Boolean')).toEqual('CHECKBOX');
      expect(mapSchemaDataTypeToGRC20PropDataType('Number')).toEqual('NUMBER');
      expect(mapSchemaDataTypeToGRC20PropDataType('Date')).toEqual('TIME');
      expect(mapSchemaDataTypeToGRC20PropDataType('Point')).toEqual('POINT');
      expect(mapSchemaDataTypeToGRC20PropDataType('Url')).toEqual('TEXT');
      expect(mapSchemaDataTypeToGRC20PropDataType('Text')).toEqual('TEXT');
      expect(mapSchemaDataTypeToGRC20PropDataType('Relation(Event)')).toEqual('RELATION');
    });
  });

  describe('generateMapping', () => {
    it('should be able to map the input schema to a resulting Mapping definition', async () => {
      const actual = await generateMapping({
        types: [
          {
            name: 'Account',
            knowledgeGraphId: null,
            properties: [
              {
                name: 'username',
                dataType: 'Text',
                knowledgeGraphId: null,
              },
              {
                name: 'createdAt',
                dataType: 'Date',
                knowledgeGraphId: null,
              },
            ],
          },
          {
            name: 'Event',
            knowledgeGraphId: null,
            properties: [
              {
                name: 'name',
                dataType: 'Text',
                knowledgeGraphId: null,
              },
              {
                name: 'description',
                dataType: 'Text',
                knowledgeGraphId: null,
              },
              {
                name: 'speaker',
                dataType: 'Relation(Account)',
                knowledgeGraphId: null,
              },
            ],
          },
        ],
      });
      const expected: Mapping = {
        Account: {
          typeIds: [expect.any(String)],
          properties: {
            username: expect.any(String),
            createdAt: expect.any(String),
          },
        },
        Event: {
          typeIds: [expect.any(String)],
          properties: {
            name: expect.any(String),
            description: expect.any(String),
            speaker: expect.any(String),
          },
        },
      };

      expect(actual).toEqual(expected);
    });
  });
});
