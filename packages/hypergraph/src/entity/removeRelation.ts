import type { DocHandle } from '@automerge/automerge-repo';
import type { DocumentContent } from './types.js';

/**
 * Removes a relation from an entity
 */
export const removeRelation = (handle: DocHandle<DocumentContent>) => {
  return (relationId: string): boolean => {
    let result = false;

    // apply changes to the repo -> removes the existing entity by its id
    handle.change((doc) => {
      if (doc.relations?.[relationId] !== undefined) {
        doc.relations[relationId].__deleted = true;
        result = true;
      }
    });

    return result;
  };
};
