import React from "react";
import { useQuery } from "../schema";
import { User } from "./user";

export const Users: React.FC = () => {
  const users = useQuery({ types: ["User"] });

  console.log("Rendering Users", users);

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
      {users &&
        Object.keys(users).map((userId) => {
          const user = users[userId];
          return <User name={user.name} key={userId} />;
        })}
    </div>
  );
};
