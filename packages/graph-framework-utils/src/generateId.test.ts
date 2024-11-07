import { expect, it } from "vitest";
import { generateId } from "./generateId.js";

it("should generate an id", () => {
  expect(generateId()).toBeTypeOf("string");
});

it.skip("should have a length of 22 characters", () => {
  expect(generateId()).toHaveLength(22);
});
