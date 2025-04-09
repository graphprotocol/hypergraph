import type { DocHandle } from '@automerge/automerge-repo';
import type { DocumentContent } from './types.js';

/**
 * Deletes the exiting entity from the repo.
 */
const delete$ = (handle: DocHandle<DocumentContent>) => {
  return (id: string): boolean => {
    let result = false;

    // apply changes to the repo -> removes the existing entity by its id
    handle.change((doc) => {
      if (doc.entities?.[id] !== undefined) {
        delete doc.entities[id];
        result = true;
      }
      for (const [key, relation] of Object.entries(doc.relations ?? {})) {
        if (doc.relations?.[key] && relation.from === id) {
          delete doc.relations[key];
        }
      }
    });

    return result;
  };
};

export { delete$ as delete };

/**
 * Deletes the exiting entity from the repo.
 */
export const markAsDeleted = (handle: DocHandle<DocumentContent>) => {
  return (id: string): boolean => {
    let result = false;

    // apply changes to the repo -> removes the existing entity by its id
    handle.change((doc) => {
      if (doc.entities?.[id] !== undefined) {
        doc.entities[id].__deleted = true;
        result = true;
      }
      for (const [key, relation] of Object.entries(doc.relations ?? {})) {
        if (doc.relations?.[key] && relation.from === id) {
          doc.relations[key].__deleted = true;
        }
      }
    });

    return result;
  };
};
