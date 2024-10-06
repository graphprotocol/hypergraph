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
        createEntity({
          types: ["Event"],
          data: {
            name: "Bob",
          },
        });
        setNewEventName("");
      }}
    >
      <Input
        placeholder="Event Name"
        onChange={(event) => setNewEventName(event.target.value)}
        value={newEventName}
      />
      <Button>Add</Button>
    </form>
  );
};
