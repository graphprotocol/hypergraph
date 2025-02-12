import type { DocHandle } from '@automerge/automerge-repo';
import type { DocumentContent } from './types.js';

/**
 * Deletes the exiting entity from the repo.
 */
export const delete$ = (handle: DocHandle<DocumentContent>) => {
  return (id: string): boolean => {
    let result = false;

    // apply changes to the repo -> removes the existing entity by its id
    handle.change((doc) => {
      if (doc.entities?.[id] !== undefined) {
        delete doc.entities[id];
        result = true;
      }
    });

    return result;
  };
};

export { delete$ as delete };
