import { describe, it } from "vitest";

import { runTests } from "./helpers";

describe("Unions", () => {
  it.each([
    "type Test = string | number",
    "type Test = Readonly<{ foo: string; }> | number;",
    "type Test = readonly string[] | readonly number[];",
    "type Test = { foo: string; } | { bar: string; };",
    "type Test = Readonly<{ foo: string; } | { bar: string; }>;",
  ])("%s", (code) => {
    runTests(code);
  });
});
