import { isValidAutomergeUrl, Repo } from "@automerge/automerge-repo";
import {
  RepoContext,
  useDocument,
} from "@automerge/automerge-repo-react-hooks";
import * as S from "@effect/schema/Schema";
import { createContext, ReactNode, useContext } from "react";
import { createFunctions } from "./schema/create-functions.js";
export { type } from "./schema/types.js";

const repo = new Repo({
  network: [],
});

interface SpaceContextProps<
  Attributes extends { [attrName: string]: S.Schema<any> },
  Types extends { [typeName: string]: ReadonlyArray<keyof Attributes> },
> {
  attributes: Attributes;
  types: Types;
  createEntity: ReturnType<
    typeof createFunctions<Attributes, Types>
  >["createEntity"];
  id: string;
}

const SpaceContext = createContext<SpaceContextProps<any, any> | undefined>(
  undefined
);

interface SpaceProviderProps<
  Attributes extends { [attrName: string]: S.Schema<any> },
  Types extends { [typeName: string]: ReadonlyArray<keyof Attributes> },
> {
  schema: { attributes: Attributes; types: Types };
  id: string;
  children: ReactNode;
}

export function SpaceProvider<
  Attributes extends { [attrName: string]: S.Schema<any> },
  Types extends { [typeName: string]: ReadonlyArray<keyof Attributes> },
>({ schema, children, id }: SpaceProviderProps<Attributes, Types>) {
  const { createEntity } = createFunctions(schema);

  const contextValue: SpaceContextProps<Attributes, Types> = {
    ...schema,
    createEntity,
    id,
  };

  const docUrl = `automerge:${id}`;
  const handle = isValidAutomergeUrl(docUrl) && repo ? repo.find(docUrl) : null;

  if (!handle) {
    return <div>Not found</div>;
  }

  if (handle.isDeleted()) {
    return <div>Deleted</div>;
  }

  if (!handle.isReady()) {
    return null;
  }

  return (
    <RepoContext.Provider value={repo}>
      <SpaceContext.Provider value={contextValue}>
        {children}
      </SpaceContext.Provider>
    </RepoContext.Provider>
  );
}

// Custom hook to use the schema context
export function useSchema<
  Attributes extends { [attrName: string]: S.Schema<any> },
  Types extends { [typeName: string]: ReadonlyArray<keyof Attributes> },
>() {
  const context = useContext(SpaceContext);
  if (!context) {
    throw new Error("useSchema must be used within a SpaceProvider");
  }
  return context as SpaceContextProps<Attributes, Types>;
}

export const useSpaceId = () => {
  const context = useContext(SpaceContext);
  if (!context) {
    throw new Error("useSpaceId must be used within a SpaceProvider");
  }
  return context?.id;
};

export const useSpaceDocument = () => {
  const id = useSpaceId();
  // @ts-expect-error this is a valid URL
  return useDocument(id);
};

export const createDocumentId = () => {
  const { documentId } = repo.create();
  return documentId;
};
