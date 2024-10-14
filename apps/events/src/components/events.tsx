import React from "react";
import { useDeleteEntity, useQuery } from "../schema";
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
  const events = useQuery({ types: ["Event"] });
  const deleteEntity = useDeleteEntity();

  console.log("Rendering Events", events);

  // const entities = useQuery({
  //   where: {
  //     name: {
  //       equals: "Alice",
  //     },
  //     // TODO include it a where clause
  //     types: {
  //       contains: ["Person"] as const,
  //     },
  //     select: {
  //       name: true,
  //       friends: {
  //         // where: {},
  //         select: {
  //           name: true,
  //         },
  //       },
  //     },
  //   },
  // });

  // useEffect(() => {
  //   // createEntity({
  //   //   types: ["Event"],
  //   //   data: {
  //   //     name: "Silvester in NY",
  //   //   },
  //   // });

  //   // TODO create - can be an object or an array
  //   createEntity({
  //     types: ["Person", "User"], // TODO can types be inferred if they are located in data?
  //     data: {
  //       name: "Alice",
  //       age: 30,
  //       email: "alice@example.com",
  //       // isActive: true,
  //       // friends: ["abc", "def"], // ids to connect
  //       // friends: [
  //       //   { id: "abc", name: "abc" },
  //       //   { id: "def", name: "lala" },
  //       // ], // create objects or overwrite existing ones
  //       // friends: ["abc", { id: "def", name: "lala" }], // mix between connect and create
  //     },
  //   });

  //   // createEntity(["Person", "User"], {
  //   //   name: "Alice",
  //   //   age: 30,
  //   //   email: "alice@example.com",
  //   //   isActive: true,
  //   // });
  // }, []);

  // TODO different API for setting a Triple with a value on a entities

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {events &&
        Object.keys(events).map((eventId) => {
          const event = events[eventId];
          return (
            <Card key={eventId}>
              <CardHeader>
                <CardTitle>
                  <Input
                    className="edit"
                    onChange={() => {
                      // changeDoc((doc) => {
                      //   doc.events[event.id].value = evt.target.value;
                      // });
                    }}
                    value={event.name}
                  />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>by {event.author.name}</p>
                <p>Participants:</p>
                <ul>
                  {event.participants.map((participant) => (
                    <li key={participant.name}>
                      {participant.name} ({participant.badge.name})
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button
                  onClick={(evt) => {
                    evt.preventDefault();
                    deleteEntity(eventId);
                  }}
                >
                  Delete
                </Button>
              </CardFooter>
            </Card>
          );
        })}
    </div>
  );
};
