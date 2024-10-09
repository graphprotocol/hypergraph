import { createFunctions, type } from "graph-framework";

export const schema = {
  types: {
    Person: {
      name: type.Text,
      age: type.Number,
    },
    User: {
      name: type.Text,
      email: type.Text,
    },
    Event: {
      name: type.Text,
      author: type.Relation(["User", "Person"], { cardinality: "one" }),
    },
  },
};

export const {
  SpaceProvider,
  useCreateEntity,
  useDeleteEntity,
  useSpaceId,
  createDocumentId,
  useQuery,
} = createFunctions(schema);

// const createEntity = useCreateEntity();

// const alice = createEntity(["Person", "User"], {
//   name: "Alice",
//   age: 30,
//   email: "alice@example.com",
// });

// createEntity(["Event"], {
//   name: "Silvester in NY",
//   author: { // should result in a separate entity
//     name: "Tim",
//     age: 30,
//     email: "tim@example.com",
//   },
// });

// createEntity(["Event"], {
//   name: "Silvester in Vienna",
//   author: alice.id,
// });

// // author is automatically included in the query
// const events = useQuery({ types: ["Event"] });
