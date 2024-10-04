import { useCreateEntity, useQuery, useSpaceId } from "graph-framework";
import React, { useEffect } from "react";
import { schema } from "./schema";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";

export const Events: React.FC = () => {
  const [newTodo, setNewTodo] = React.useState("");
  const id = useSpaceId();
  const createEntity = useCreateEntity<
    typeof schema.attributes,
    typeof schema.types
  >();

  const entities = useQuery({
    // TODO include it a where clause
    types: ["Event"] as const,
  });

  const entities = useQuery({
    where: {
      name: {
        equals: "Alice",
      },
      // TODO include it a where clause
      types: {
        contains: ["Person"] as const,
      },
      select: {
        name: true,
        friends: {
          // where: {},
          select: {
            name: true,
          },
        },
      },
    },
  });

  useEffect(() => {
    // createEntity({
    //   types: ["Event"],
    //   data: {
    //     name: "Silvester in NY",
    //   },
    // });

    // TODO create - can be an object or an array
    createEntity({
      types: ["Person", "User"], // TODO can types be inferred if they are located in data?
      data: {
        name: "Alice",
        age: 30,
        email: "alice@example.com",
        isActive: true,
        // friends: ["abc", "def"], // ids to connect
        // friends: [
        //   { id: "abc", name: "abc" },
        //   { id: "def", name: "lala" },
        // ], // create objects or overwrite existing ones
        // friends: ["abc", { id: "def", name: "lala" }], // mix between connect and create
      },
    });

    // createEntity(["Person", "User"], {
    //   name: "Alice",
    //   age: 30,
    //   email: "alice@example.com",
    //   isActive: true,
    // });
  }, []);

  // TODO different API for setting a Triple with a value on a entities

  console.log("entities:", entities);

  return (
    <main className="flex-1">
      <section className="w-full py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <h1>Events of Space w/ ID: {id}</h1>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              createEntity({
                types: ["Event"],
                data: {
                  name: "Bob",
                },
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
            {entities &&
              Object.keys(entities).map((entityId) => {
                const entity = entities[entityId];
                return (
                  <Card key={entity.name}>
                    <CardHeader>
                      <CardTitle>
                        <Input
                          className="edit"
                          onChange={(evt) => {
                            // changeDoc((doc) => {
                            //   doc.events[event.id].value = evt.target.value;
                            // });
                          }}
                          value={entity.name}
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
                          // changeDoc((doc) => {
                          //   delete doc.events[event.id];
                          // });
                        }}
                      >
                        Delete
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
          </div>
        </div>
      </section>
    </main>
  );
};
