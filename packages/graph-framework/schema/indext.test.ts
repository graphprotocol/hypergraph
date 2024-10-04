import { expect, test } from "vitest";
import { createFunctions, type as t } from "./index.js";

test("test schema", () => {
  const { createEntity } = createFunctions({
    attributes: {
      name: t.Text,
      age: t.Number,
      isActive: t.Checkbox,
      email: t.Text,
    },
    types: {
      Person: ["name", "age"],
      User: ["name", "email", "isActive"],
    },
  });

  // Creating an entity combining 'Person' and 'User' types
  const personUser = createEntity({
    types: ["Person", "User"],
    data: {
      name: "Alice",
      age: 30,
      email: "alice@example.com",
      isActive: true,
    },
  });

  expect(personUser).toStrictEqual({
    name: "Alice",
    age: 30,
    email: "alice@example.com",
    isActive: true,
  });
});
