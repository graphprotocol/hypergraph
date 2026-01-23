import type { AnyDocumentId, DocHandle } from '@automerge/automerge-repo';
import { Repo } from '@automerge/automerge-repo';
import { Id } from '@geoprotocol/geo-sdk';
import { beforeEach, describe, expect, it } from 'vitest';
import * as Entity from '../../src/entity/index.js';
import * as Type from '../../src/type/type.js';
import { idToAutomergeId } from '../../src/utils/automergeId.js';

describe('Entity', () => {
  const Person = Entity.Schema(
    {
      name: Type.String,
      age: Type.Number,
    },
    {
      types: [Id('bffa181ea333495b949c57f2831d7eca')],
      properties: {
        name: Id('a126ca530c8e48d5b88882c734c38935'),
        age: Id('a427183d35194c96b80a5a0c64daed41'),
      },
    },
  );

  const User = Entity.Schema(
    {
      name: Type.String,
      email: Type.String,
    },
    {
      types: [Id('2a7db9c2df004a1982d091522777f980')],
      properties: {
        name: Id('a126ca530c8e48d5b88882c734c38935'),
        email: Id('b667f9514ede40ef83f8fb5efee8c2ae'),
      },
    },
  );

  const Badge = Entity.Schema(
    {
      name: Type.String,
    },
    {
      types: [Id('2ce4d8ffa6ca49778b4e11c272a7eb1c')],
      properties: {
        name: Id('a126ca530c8e48d5b88882c734c38935'),
      },
    },
  );

  const Event = Entity.Schema(
    {
      name: Type.String,
    },
    {
      types: [Id('2ce4d8ffa6ca49778b4e11c272a7eb1c')],
      properties: {
        name: Id('a126ca530c8e48d5b88882c734c38935'),
      },
    },
  );

  const spaceId = '1e5e39daa00d4fd8b53b98095337112f';
  const automergeDocId = idToAutomergeId(spaceId);

  let repo: Repo;
  let handle: DocHandle<Entity.DocumentContent>;

  beforeEach(() => {
    repo = new Repo({}); // reset to new Repo instance to clear created entities in tests
    const result = repo.findWithProgress<Entity.DocumentContent>(automergeDocId as AnyDocumentId);
    handle = result.handle;
    // set it to ready to interact with the document
    handle.doneLoading();
  });

  describe('create', () => {
    it('should create an entity in the repo and be discoverable by querying', () => {
      const created = Entity.create(handle, Event)({ name: 'Conference' });
      expect(created).toEqual(expect.objectContaining({ name: 'Conference' }));

      const id = created.id;
      expect(id).not.toBeNull();
      expect(id).not.toBeUndefined();

      const entities = Entity.findManyPrivate(handle, Event, undefined, undefined);
      expect(entities.entities).toHaveLength(1);
      expect(entities.entities[0]).toEqual({
        id,
        name: 'Conference',
        __deleted: false,
        __schema: Event,
      });

      const found = Entity.findOne(handle, Event)(id);
      expect(found).not.toBeNull();
      expect(found).toEqual({
        id,
        name: 'Conference',
        __deleted: false,
        __schema: Event,
      });
    });
  });

  describe('update', () => {
    it('should update an existing entity and see the updates when querying', () => {
      const created = Entity.create(handle, Person)({ name: 'Test', age: 1 });
      expect(created).toEqual(expect.objectContaining({ name: 'Test', age: 1 }));

      const id = created.id;
      expect(id).not.toBeNull();
      expect(id).not.toBeUndefined();

      const entities = Entity.findManyPrivate(handle, Person, undefined, undefined);
      expect(entities.entities).toHaveLength(1);
      expect(entities.entities[0]).toEqual({
        id,
        name: 'Test',
        age: 1,
        __deleted: false,
        __schema: Person,
      });
      const found = Entity.findOne(handle, Person)(id);
      expect(found).not.toBeNull();
      expect(found).toEqual({
        id,
        name: 'Test',
        age: 1,
        __deleted: false,
        __schema: Person,
      });
      // update the entity, validate we see the updates
      const updated = Entity.update(handle, Person)(id, { name: 'Test Updated', age: 2112 });
      expect(updated).toEqual({
        id,
        name: 'Test Updated',
        age: 2112,
        __schema: Person,
        __deleted: false,
      });

      const updatedEntities = Entity.findManyPrivate(handle, Person, undefined, undefined);
      expect(updatedEntities.entities).toHaveLength(1);

      // TODO: fix this
      // expect(updatedEntities.entities[0]).toEqual({ id, type: Person.name, name: 'Test Updated', age: 2112 });
      const foundUpdated = Entity.findOne(handle, Person)(id);
      expect(foundUpdated).not.toBeNull();
      expect(foundUpdated).toEqual({
        id,
        name: 'Test Updated',
        age: 2112,
        __deleted: false,
        __schema: Person,
      });
    });

    it('should throw an error if attempting to update an entity that does not exist in the repo', () => {
      expect(() => {
        Entity.update(handle, Person)('person_dne', { name: 'does not exist' });
      }).toThrowError();
    });
  });

  describe('delete', () => {
    it('should be able to delete a created entity and no longer be found by querying', () => {
      const created = Entity.create(
        handle,
        User,
      )({
        name: 'Test',
        email: 'test.user@thegraph.com',
      });

      expect(created).toEqual(expect.objectContaining({ name: 'Test', email: 'test.user@thegraph.com' }));

      const id = created.id;
      expect(id).not.toBeNull();
      expect(id).not.toBeUndefined();

      const entities = Entity.findManyPrivate(handle, User, undefined, undefined);
      expect(entities.entities).toHaveLength(1);
      expect(entities.entities[0]).toEqual({
        id,
        name: 'Test',
        email: 'test.user@thegraph.com',
        __deleted: false,
        __schema: User,
      });
      const found = Entity.findOne(handle, User)(id);
      expect(found).not.toBeNull();
      expect(found).toEqual({
        id,
        name: 'Test',
        email: 'test.user@thegraph.com',
        __deleted: false,
        __schema: User,
      });

      const deleted = Entity.delete(handle)(id);
      expect(deleted).toBe(true);

      expect(Entity.findManyPrivate(handle, User, undefined, undefined).entities).toHaveLength(0);
      expect(Entity.findOne(handle, User)(id)).toBeUndefined();
    });

    it('should return false if no entity exists with the given id', () => {
      expect(Entity.delete(handle)('entity_dne')).toBe(false);
    });
  });

  describe('findMany', () => {
    it('should only query entities of the given type', () => {
      const create = Entity.create(handle, User);
      const createdUser = create({
        name: 'Test',
        email: 'test.user@thegraph.com',
      });

      expect(createdUser).toEqual(expect.objectContaining({ name: 'Test', email: 'test.user@thegraph.com' }));

      const createdBadge = Entity.create(handle, Badge)({ name: 'WeDidIt' });
      expect(createdBadge).toEqual(expect.objectContaining({ name: 'WeDidIt' }));

      // should only return users
      const users = Entity.findManyPrivate(handle, User, undefined, undefined);
      expect(users.entities).toHaveLength(1);
      // should only return badges
      const badges = Entity.findManyPrivate(handle, Badge, undefined, undefined);
      expect(badges.entities).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return undefined if not entity found', () => {
      expect(Entity.findOne(handle, User)('dne')).toBeUndefined();
    });
  });
});
