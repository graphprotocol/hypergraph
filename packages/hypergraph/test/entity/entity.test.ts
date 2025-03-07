import type { AnyDocumentId, DocHandle } from '@automerge/automerge-repo';
import { Repo } from '@automerge/automerge-repo';
import { beforeEach, describe, expect, it } from 'vitest';

import * as Entity from '../../src/entity/index.js';
import { idToAutomergeId } from '../../src/utils/automergeId.js';

describe('Entity', () => {
  class Person extends Entity.Class<Person>('Person')({
    id: Entity.Generated(Entity.Text),
    name: Entity.Text,
    age: Entity.Number,
  }) {}

  class User extends Entity.Class<User>('User')({
    id: Entity.Generated(Entity.Text),
    name: Entity.Text,
    email: Entity.Text,
  }) {}

  class Badge extends Entity.Class<Badge>('Badge')({
    id: Entity.Generated(Entity.Text),
    name: Entity.Text,
  }) {}

  class Event extends Entity.Class<Event>('Event')({
    id: Entity.Generated(Entity.Text),
    name: Entity.Text,
  }) {}

  const spaceId = '52gTkePWSoGdXmgZF3nRU';
  const automergeDocId = idToAutomergeId(spaceId);

  let repo: Repo;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  let handle: DocHandle<any>;

  beforeEach(() => {
    repo = new Repo({}); // reset to new Repo instance to clear created entities in tests
    handle = repo.find(automergeDocId as AnyDocumentId);
    // set it to ready to interact with the document
    handle.doneLoading();
  });

  describe('create', () => {
    it('should create an entity in the repo and be discoverable by querying', () => {
      const created = Entity.create(handle, Event)({ name: 'Conference' });
      expect(created).toEqual(expect.objectContaining({ type: Event.name, name: 'Conference' }));

      const id = created.id;
      expect(id).not.toBeNull();
      expect(id).not.toBeUndefined();

      const entities = Entity.findMany(handle, Event);
      expect(entities).toHaveLength(1);
      expect(entities[0]).toEqual({ id, type: Event.name, name: 'Conference' });

      const found = Entity.findOne(handle, Event)(id);
      expect(found).not.toBeNull();
      expect(found).toEqual({ id, type: Event.name, name: 'Conference' });
    });
  });

  describe('update', () => {
    it('should update an existing entity and see the updates when querying', () => {
      const created = Entity.create(handle, Person)({ name: 'Test', age: 1 });
      expect(created).toEqual(expect.objectContaining({ type: Person.name, name: 'Test', age: 1 }));

      const id = created.id;
      expect(id).not.toBeNull();
      expect(id).not.toBeUndefined();

      const entities = Entity.findMany(handle, Person);
      expect(entities).toHaveLength(1);
      expect(entities[0]).toEqual({ id, type: Person.name, name: 'Test', age: 1 });

      const found = Entity.findOne(handle, Person)(id);
      expect(found).not.toBeNull();
      expect(found).toEqual({ id, type: Person.name, name: 'Test', age: 1 });

      // update the entity, validate we see the updates
      const updated = Entity.update(handle, Person)(id, { name: 'Test Updated', age: 2112 });
      expect(updated).toEqual({ id, type: Person.name, name: 'Test Updated', age: 2112 });

      const updatedEntities = Entity.findMany(handle, Person);
      console.log(updatedEntities);
      expect(updatedEntities).toHaveLength(1);

      expect(updatedEntities[0]).toEqual({ id, type: Person.name, name: 'Test Updated', age: 2112 });
      const foundUpdated = Entity.findOne(handle, Person)(id);
      expect(foundUpdated).not.toBeNull();
      expect(foundUpdated).toEqual({ id, type: Person.name, name: 'Test Updated', age: 2112 });
    });

    it('should throw an error if attempting to update an entity that does not exist in the repo', () => {
      expect(() => {
        Entity.update(handle, Person)('person_dne', { name: 'does not exist' });
      }).toThrowError(Entity.EntityNotFoundError);
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

      expect(created).toEqual(
        expect.objectContaining({ type: User.name, name: 'Test', email: 'test.user@thegraph.com' }),
      );

      const id = created.id;
      expect(id).not.toBeNull();
      expect(id).not.toBeUndefined();

      const entities = Entity.findMany(handle, User);
      expect(entities).toHaveLength(1);
      expect(entities[0]).toEqual({ id, type: User.name, name: 'Test', email: 'test.user@thegraph.com' });

      const found = Entity.findOne(handle, User)(id);
      expect(found).not.toBeNull();
      expect(found).toEqual({ id, type: User.name, name: 'Test', email: 'test.user@thegraph.com' });

      const deleted = Entity.delete(handle)(id);
      expect(deleted).toBe(true);

      expect(Entity.findMany(handle, User)).toHaveLength(0);
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

      expect(createdUser).toEqual(
        expect.objectContaining({ type: User.name, name: 'Test', email: 'test.user@thegraph.com' }),
      );

      const createdBadge = Entity.create(handle, Badge)({ name: 'WeDidIt' });
      expect(createdBadge).toEqual(expect.objectContaining({ type: Badge.name, name: 'WeDidIt' }));

      // should only return users
      const users = Entity.findMany(handle, User);
      expect(users).toHaveLength(1);
      for (const user of users) {
        expect(user.type).toEqual(User.name);
      }
      // should only return badges
      const badges = Entity.findMany(handle, Badge);
      expect(badges).toHaveLength(1);
      for (const badge of badges) {
        expect(badge.type).toEqual(Badge.name);
      }
    });
  });

  describe('findOne', () => {
    it('should return undefined if not entity found', () => {
      expect(Entity.findOne(handle, User)('dne')).toBeUndefined();
    });
  });
});
