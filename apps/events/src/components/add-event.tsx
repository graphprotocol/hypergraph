import React from "react";
import { useCreateEntity } from "../schema";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export const AddEvent: React.FC = () => {
  const [newEventName, setNewEventName] = React.useState("");
  const createEntity = useCreateEntity();

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        createEntity(["Event"], {
          name: newEventName,
          author: {
            name: "Tim",
            age: 30,
            email: "tim@example.com",
            badge: { name: "VIP" },
          },
          participants: [
            {
              name: "Alice",
              age: 30,
              badge: { name: "Speaker" },
            },
            {
              name: "Bob",
              age: 25,
              badge: { name: "Attendee" },
            },
          ],
        });
        setNewEventName("");
      }}
      className="flex space-x-4"
    >
      <Input
        placeholder="Event Name"
        onChange={(event) => setNewEventName(event.target.value)}
        value={newEventName}
        required
      />
      <Button>Add</Button>
    </form>
  );
};
