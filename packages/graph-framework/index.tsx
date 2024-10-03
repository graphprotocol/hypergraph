import { isValidAutomergeUrl, Repo } from "@automerge/automerge-repo";
import {
  RepoContext,
  useDocument,
} from "@automerge/automerge-repo-react-hooks";
import { createContext, useContext } from "react";

const repo = new Repo({
  network: [],
});

export const hello = () => {
  return "Hello from graph-framework";
};

type SpaceContextType = {
  id: string;
  schema: any;
};

const SpaceContext = createContext<SpaceContextType>({
  id: "",
  schema: {},
});

type SpaceProviderProps = SpaceContextType & {
  children: React.ReactNode;
};

export const SpaceProvider = ({ id, schema, ...rest }: SpaceProviderProps) => {
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
      <SpaceContext.Provider value={{ id, schema }} {...rest} />
    </RepoContext.Provider>
  );
};

export const useSpaceId = () => {
  return useContext(SpaceContext).id;
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
