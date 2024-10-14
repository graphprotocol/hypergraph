import React from "react";
import { useQuery } from "../schema";
import { User } from "./user";

export const Users: React.FC = () => {
  const users = useQuery({ types: ["User"] });

  console.log("Rendering Users", users);

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {users.map((user) => {
        return <User key={user.id} name={user.name} />;
      })}
    </div>
  );
};
