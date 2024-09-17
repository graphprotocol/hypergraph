import { expect, test } from "vitest";
import { hello } from "./index.js";

test("add(10, 20) should return 30", () => {
  expect(hello()).toBe("Hello from graph-framework");
});
