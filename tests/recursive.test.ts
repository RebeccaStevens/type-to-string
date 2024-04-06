import dedent from "dedent";
import { describe, it } from "vitest";

import { runTests } from "./helpers";

describe("Recursive Types", () => {
  describe("direct", () => {
    it.each([
      dedent`
        interface I { readonly [key: string]: string | I };
        const test: I = {};
      `,
      "type Test = string | ReadonlyArray<Test>;",
      "type Test = ReadonlyArray<Test | { foo: 1 }>;",
      "type Test = string | Test[];",
    ])("%s", (code) => {
      runTests(code);
    });
  });

  describe("generics", () => {
    it.each([
      "type Test<G> = Readonly<{ foo: Test<string> | string; }>;",
      "type Test<G> = G extends string ? Readonly<{ foo: string }> : Test<string>",
      "type Test<G> = Readonly<{ foo: ReadonlyArray<Test<string>> | G; }>;",
      "type Test<G> = G extends string ? ReadonlyArray<string> : Test<string>",
      "type Test<G> = Readonly<{ foo: Array<Test<string>> | string; }>;",
      "type Test<G> = G extends string ? Readonly<{ foo: Array<string>; }> : Test<string>",
      "type Test<G> = { foo: Test<string> | string; };",
      "type Test<G> = G extends string ? { foo: string } : Test<string>",
    ])("%s", (code) => {
      runTests(code);
    });
  });

  describe("nested", () => {
    it.each(["type Foo<U> = { readonly foo: Foo<Foo<U>>; };"])("%s", (code) => {
      runTests(code);
    });
  });

  describe("Complex", () => {
    it("%s", () => {
      const code = dedent`
        type TransposeArray<T extends ReadonlyArray<ReadonlyArray<unknown>>> =
          T extends readonly [infer X, ...infer XS]
            ? [X[], ...TransposeArray<XS>]
            : T extends ReadonlyArray<infer X>
              ? X[][]
              : never;
      `;

      runTests(code);
    });
  });
});
