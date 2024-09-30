import { createSchema, t } from "@/query/graph-lib";
import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import * as Yjs from "yjs";

const schema = {
  entities: {
    user: { id: t.String, name: t.String },
    events: { id: t.String, title: t.String, attendees: t.Number },
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

  const events = useQuery({ entity: "events" });

  // local state for the text of a new event
  const [newEventTitle, setNewEventTitle] = useState("");

  return (
    <div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          createEntity({
            entity: "events",
            data: { id: uuidv4(), title: newEventTitle, attendees: 0 },
          });
          setNewEventTitle("");
        }}
      >
        <input
          placeholder="New Event Title"
          onChange={(event) => setNewEventTitle(event.target.value)}
          value={newEventTitle}
        />
        <button className="add">Add</button>
      </form>

      <ul>
        {events.map((event) => {
          return (
            <li key={event.id}>
              <div>{event.title}</div>
              <button
                onClick={() => {
                  deleteEntity({ entity: "events", id: event.id });
                }}
              >
                x
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
