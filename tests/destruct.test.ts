import dedent from "dedent";
import { describe, it } from "vitest";

import { runTests } from "./helpers";

describe("destructuring arrays", () => {
  it.each([
    dedent`
      const [a, b, ...c] = [1, 2, 3, 4];"
      type Test = typeof a;
    `,
    dedent`
      const [a, b, ...c] = [1, 2, 3, 4];"
      type Test = typeof b;
    `,
    dedent`
      const [a, b, ...c] = [1, 2, 3, 4];
      type Test = typeof c;
    `,
  ])("%s", (code) => {
    runTests(code);
  });
});

describe("destructuring objects", () => {
  it.each([
    dedent`
      const { a, b, ...c } = { a: 1, b: 2, d: 4, e: 5 };"
      type Test = typeof a;
    `,
    dedent`
      const { a, b, ...c } = { a: 1, b: 2, d: 4, e: 5 };"
      type Test = typeof b;
    `,
    dedent`
      const { a, b, ...c } = { a: 1, b: 2, d: 4, e: 5 };
      type Test = typeof c;
    `,
  ])("%s", (code) => {
    runTests(code);
  });
});
