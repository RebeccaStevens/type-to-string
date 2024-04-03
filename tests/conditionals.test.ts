import { describe, it } from "vitest";

import { runTests } from "./helpers";

describe("Conditionals", () => {
  it.each([
    "type Test<G> = G extends number ? number : string;",
    "type Test<G> = G extends number ? readonly number[] : readonly string[];",
    "type Test<G> = G extends number ? { foo: number } : { foo: string };",
    "type Test<G> = Readonly<G extends number ? { foo: number } : { foo: string }>;",
  ])("%s", (code) => {
    runTests(code);
  });
});
