import React, { useEffect } from "react";
import { SpaceProvider, createDocumentId } from "../schema";
import { AddEvent } from "./add-event";
import { AddUser } from "./add-user";
import { Events } from "./events";
import { Users } from "./users";

export const Space: React.FC = () => {
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
        <main className="flex-1">
          <section className="w-full py-12 md:py-24">
            <div className="container px-4 md:px-6">
              <h1>Events of Space w/ ID: {id}</h1>

              <AddUser />
              <Users />
              <hr />
              <AddEvent />
              <Events />
            </div>
          </section>
        </main>
      </SpaceProvider>
    </>
  );
};
