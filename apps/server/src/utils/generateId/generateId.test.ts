import { generateId } from "./generateId";

// test for generateId
test("should generate a unique id", () => {
  const id1 = generateId();
  const id2 = generateId();
  expect(id1).not.toBe(id2);
});
