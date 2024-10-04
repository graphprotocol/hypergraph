import { createDocumentId, SpaceProvider } from "graph-framework";
import React, { useEffect } from "react";
import { Events } from "./events";
import { schema } from "./schema";

export const SchemaTestAutomerge: React.FC = () => {
  const [id, setId] = React.useState<string | null>(null);

  useEffect(() => {
    const id = createDocumentId();
    setId(id);
  }, []);

  if (!id) {
    return null;
  }

  return (
    <>
      <SpaceProvider schema={schema} id={id}>
        <Events />
      </SpaceProvider>
    </>
  );
};
