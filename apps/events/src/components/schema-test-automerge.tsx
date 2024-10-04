import {
  createDocumentId,
  SpaceProvider,
  type,
  useSpaceDocument,
  useSpaceId,
} from "graph-framework";
import React, { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";

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
      <SpaceProvider
        id={id}
        schema={{
          attributes: {
            name: type.Text,
            age: type.Number,
            isActive: type.Checkbox,
            email: type.Text,
          },
          types: {
            Person: ["name", "age"],
            User: ["name", "email", "isActive"],
          },
        }}
      >
        <Events />
      </SpaceProvider>
    </>
  );
};

export const Events: React.FC = () => {
  const [newTodo, setNewTodo] = React.useState("");
  const id = useSpaceId();
  const [doc, changeDoc] = useSpaceDocument();

  return (
    <main className="flex-1">
      <section className="w-full py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <h1>Events of Space w/ ID: {id}</h1>

          <form
            onSubmit={(event) => {
              event.preventDefault();

              changeDoc((doc) => {
                if (!doc.events) doc.events = {};
                const id = uuidv4();
                doc.events[id] = {
                  value: newTodo,
                  completed: false,
                  createdAt: new Date().getTime(),
                };
              });
              setNewTodo("");
            }}
          >
            <Input
              placeholder="Event Title"
              onChange={(event) => setNewTodo(event.target.value)}
              value={newTodo}
            />
            <Button>Add</Button>
          </form>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {doc.events &&
              Object.keys(doc.events)
                .map((id) => {
                  return {
                    ...doc.events[id],
                    id,
                  };
                })
                .sort((a, b) => b.createdAt - a.createdAt)
                .map((event) => (
                  <Card key={event.id}>
                    <CardHeader>
                      <CardTitle>
                        <Input
                          className="edit"
                          onChange={(evt) => {
                            changeDoc((doc) => {
                              doc.events[event.id].value = evt.target.value;
                            });
                          }}
                          value={event.value}
                        />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>A new event</p>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      <Button
                        onClick={(evt) => {
                          evt.preventDefault();
                          changeDoc((doc) => {
                            delete doc.events[event.id];
                          });
                        }}
                      >
                        Delete
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
          </div>
        </div>
      </section>
    </main>
  );
};
