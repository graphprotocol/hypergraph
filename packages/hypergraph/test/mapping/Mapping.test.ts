import { Id } from '@graphprotocol/grc-20';
import { describe, expect, it } from 'vitest';

import {
  allRelationPropertyTypesExist,
  generateMapping,
  type Mapping,
  mapSchemaDataTypeToGRC20PropDataType,
  type Schema,
} from '../../src/mapping/Mapping.js';

describe('Mapping', () => {
  describe('mapSchemaDataTypeToGRC20PropDataType', () => {
    it('should be able to map the schema dataType to the correct GRC-20 dataType', () => {
      expect(mapSchemaDataTypeToGRC20PropDataType('Checkbox')).toEqual('CHECKBOX');
      expect(mapSchemaDataTypeToGRC20PropDataType('Number')).toEqual('NUMBER');
      expect(mapSchemaDataTypeToGRC20PropDataType('Date')).toEqual('TIME');
      expect(mapSchemaDataTypeToGRC20PropDataType('Point')).toEqual('POINT');
      expect(mapSchemaDataTypeToGRC20PropDataType('Text')).toEqual('TEXT');
      expect(mapSchemaDataTypeToGRC20PropDataType('Relation(Event)')).toEqual('RELATION');
    });
  });

  describe('allRelationPropertyTypesExist', () => {
    it('should return true if the submitted schema contains all required types', () => {
      const types: Schema['types'] = [
        {
          name: 'Account',
          knowledgeGraphId: null,
          properties: [{ name: 'username', dataType: 'Text', knowledgeGraphId: null }],
        },
        {
          name: 'Event',
          knowledgeGraphId: null,
          properties: [
            { name: 'speaker', dataType: 'Relation(Account)', relationType: 'Account', knowledgeGraphId: null },
          ],
        },
      ];

      expect(allRelationPropertyTypesExist(types)).toEqual(true);
    });
    it('should return false if the submitted schema relation properties', () => {
      const types: Schema['types'] = [
        {
          name: 'Event',
          knowledgeGraphId: null,
          properties: [
            { name: 'speaker', dataType: 'Relation(Account)', relationType: 'Account', knowledgeGraphId: null },
          ],
        },
      ];

      expect(allRelationPropertyTypesExist(types)).toEqual(false);
    });
  });

  describe('generateMapping', () => {
    it('should be able to map the input schema to a resulting Mapping definition', () => {
      const [mapping] = generateMapping({
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
                relationType: 'Account',
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
          },
          relations: {
            speaker: expect.any(String),
          },
        },
      };

      expect(mapping).toEqual(expected);
    });
    it('should use the existing KG ids if provided', () => {
      const [mapping] = generateMapping({
        types: [
          {
            name: 'Account',
            knowledgeGraphId: 'a5fd07b1-120f-46c6-b46f-387ef98396a6',
            properties: [
              {
                name: 'username',
                dataType: 'Text',
                knowledgeGraphId: '994edcff-6996-4a77-9797-a13e5e3efad8',
              },
              {
                name: 'createdAt',
                dataType: 'Date',
                knowledgeGraphId: '64bfba51-a69b-4746-be4b-213214a879fe',
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
                knowledgeGraphId: '3808e060-fb4a-4d08-8069-35b8c8a1902b',
              },
              {
                name: 'description',
                dataType: 'Text',
                knowledgeGraphId: null,
              },
              {
                name: 'speaker',
                dataType: 'Relation(Account)',
                relationType: 'Account',
                knowledgeGraphId: null,
              },
            ],
          },
        ],
      });
      const expected: Mapping = {
        Account: {
          typeIds: [Id.Id('a5fd07b1-120f-46c6-b46f-387ef98396a6')],
          properties: {
            username: Id.Id('994edcff-6996-4a77-9797-a13e5e3efad8'),
            createdAt: Id.Id('64bfba51-a69b-4746-be4b-213214a879fe'),
          },
        },
        Event: {
          typeIds: [expect.any(String)],
          properties: {
            name: Id.Id('3808e060-fb4a-4d08-8069-35b8c8a1902b'),
            description: expect.any(String),
          },
          relations: {
            speaker: expect.any(String),
          },
        },
      };

      expect(mapping).toEqual(expected);
    });
    it('should handle relation properties where the related type has a knowledgeGraphId', () => {
      const [mapping] = generateMapping({
        types: [
          {
            name: 'Account',
            knowledgeGraphId: 'a5fd07b1-120f-46c6-b46f-387ef98396a6',
            properties: [
              {
                name: 'username',
                dataType: 'Text',
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
                name: 'organizer',
                dataType: 'Relation(Account)',
                relationType: 'Account',
                knowledgeGraphId: null,
              },
            ],
          },
        ],
      });
      const expected: Mapping = {
        Account: {
          typeIds: [Id.Id('a5fd07b1-120f-46c6-b46f-387ef98396a6')],
          properties: {
            username: expect.any(String),
          },
        },
        Event: {
          typeIds: [expect.any(String)],
          properties: {
            name: expect.any(String),
          },
          relations: {
            organizer: expect.any(String),
          },
        },
      };

      expect(mapping).toEqual(expected);
    });
    it('should handle relation properties where the related type does NOT have a knowledgeGraphId (second pass)', () => {
      const [mapping] = generateMapping({
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
                name: 'organizer',
                dataType: 'Relation(Account)',
                relationType: 'Account',
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
          },
        },
        Event: {
          typeIds: [expect.any(String)],
          properties: {
            name: expect.any(String),
          },
          relations: {
            organizer: expect.any(String),
          },
        },
      };

      expect(mapping).toEqual(expected);
    });
    it('should handle mixed scenarios with some relation types having knowledgeGraphId and others not', () => {
      const [mapping] = generateMapping({
        types: [
          {
            name: 'Account',
            knowledgeGraphId: 'a5fd07b1-120f-46c6-b46f-387ef98396a6',
            properties: [
              {
                name: 'username',
                dataType: 'Text',
                knowledgeGraphId: '994edcff-6996-4a77-9797-a13e5e3efad8',
              },
            ],
          },
          {
            name: 'Venue',
            knowledgeGraphId: null,
            properties: [
              {
                name: 'name',
                dataType: 'Text',
                knowledgeGraphId: null,
              },
              {
                name: 'location',
                dataType: 'Point',
                knowledgeGraphId: null,
              },
            ],
          },
          {
            name: 'Event',
            knowledgeGraphId: null,
            properties: [
              {
                name: 'title',
                dataType: 'Text',
                knowledgeGraphId: null,
              },
              {
                name: 'speaker',
                dataType: 'Relation(Account)',
                relationType: 'Account',
                knowledgeGraphId: null,
              },
              {
                name: 'venue',
                dataType: 'Relation(Venue)',
                relationType: 'Venue',
                knowledgeGraphId: null,
              },
            ],
          },
        ],
      });
      const expected: Mapping = {
        Account: {
          typeIds: [Id.Id('a5fd07b1-120f-46c6-b46f-387ef98396a6')],
          properties: {
            username: Id.Id('994edcff-6996-4a77-9797-a13e5e3efad8'),
          },
        },
        Venue: {
          typeIds: [expect.any(String)],
          properties: {
            name: expect.any(String),
            location: expect.any(String),
          },
        },
        Event: {
          typeIds: [expect.any(String)],
          properties: {
            title: expect.any(String),
          },
          relations: {
            speaker: expect.any(String),
            venue: expect.any(String),
          },
        },
      };

      expect(mapping).toEqual(expected);
    });
    describe('schema validation failures', () => {
      it('should throw an error if the Schema does not pass validation: type names are not unique', () => {
        expect(() =>
          generateMapping({
            types: [
              {
                name: 'Account',
                knowledgeGraphId: null,
                properties: [{ name: 'username', dataType: 'Text', knowledgeGraphId: null }],
              },
              {
                name: 'Account',
                knowledgeGraphId: null,
                properties: [{ name: 'image', dataType: 'Text', knowledgeGraphId: null }],
              },
            ],
          }),
        ).toThrowError();
      });
      it('should throw an error if the Schema does not pass validation: type property names are not unique', () => {
        expect(() =>
          generateMapping({
            types: [
              {
                name: 'Account',
                knowledgeGraphId: null,
                properties: [
                  { name: 'username', dataType: 'Text', knowledgeGraphId: null },
                  { name: 'username', dataType: 'Text', knowledgeGraphId: null },
                ],
              },
            ],
          }),
        ).toThrowError();
      });
      it('should throw an error if the Schema does not pass validation: referenced relation property does not have matching type in schema', () => {
        expect(() =>
          generateMapping({
            types: [
              {
                name: 'Event',
                knowledgeGraphId: null,
                properties: [
                  { name: 'speaker', dataType: 'Relation(Account)', relationType: 'Account', knowledgeGraphId: null },
                ],
              },
            ],
          }),
        ).toThrowError();
      });
    });
  });
});
