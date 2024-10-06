import React from "react";
import { useCreateEntity } from "../schema";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export const AddUser: React.FC = () => {
  const [newUserName, setNewUserName] = React.useState("");
  const createEntity = useCreateEntity();

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        createEntity(["User", "Person"], {
          name: newUserName,
          age: 30,
          email: "example@example.com",
        });
        setNewUserName("");
      }}
      className="flex space-x-4"
    >
      <Input
        placeholder="User Name"
        onChange={(event) => setNewUserName(event.target.value)}
        value={newUserName}
        required
      />
      <Button>Add</Button>
    </form>
  );
};
