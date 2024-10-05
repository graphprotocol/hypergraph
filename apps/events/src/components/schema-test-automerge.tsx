import React, { useEffect } from "react";
import { Events } from "./events";
import { SpaceProvider, createDocumentId } from "./schema";

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
      <SpaceProvider id={id}>
        <Events />
      </SpaceProvider>
    </>
  );
};
