import { Input } from "@/components/ui/input";
import { createSchema, t } from "@/query/graph-lib";
import { CalendarDays, MapPin } from "lucide-react";
import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import * as Yjs from "yjs";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";

const schema = {
  entities: {
    user: { id: t.String, name: t.String },
    event: { id: t.String, title: t.String, attendees: t.Number },
  },
} as const;

export const SchemaTestYjs: React.FC = () => {
  const [yDoc] = useState(() => {
    return new Yjs.Doc();
  });
  const { useQuery, createEntity, deleteEntity } = createSchema({
    schema,
    yDoc,
  });

  useEffect(() => {
    createEntity({
      entity: "user",
      data: { id: uuidv4(), name: "Jane" },
    });
  }, []);

  const events = useQuery({ entity: "event" });
  const users = useQuery({ entity: "user" });

  // local state for the text of a new event
  const [newEventTitle, setNewEventTitle] = useState("");

  return (
    <main className="flex-1">
      <section className="w-full py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <h1>{users[0] ? `${users[0].name}'s Events` : ""}</h1>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              createEntity({
                entity: "event",
                data: { id: uuidv4(), title: newEventTitle, attendees: 0 },
              });
              setNewEventTitle("");
            }}
          >
            <Input
              placeholder="New Event Title"
              onChange={(event) => setNewEventTitle(event.target.value)}
              value={newEventTitle}
            />
            <Button className="add">Add</Button>
          </form>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => {
              return (
                <Card key={event.id}>
                  <CardHeader>
                    <CardTitle>{event.title}</CardTitle>
                    <CardDescription>
                      <div className="flex items-center mt-2">
                        <CalendarDays className="mr-2 h-4 w-4" />
                        {
                          // @ts-expect-error tinybase types issue
                          new Date(event.date).toLocaleDateString()
                        }
                      </div>
                      <div className="flex items-center mt-2">
                        <MapPin className="mr-2 h-4 w-4" />
                        New York, NY
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>A new event</p>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button
                      onClick={() => {
                        deleteEntity({ entity: "event", id: event.id });
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
