import { describe, it } from "vitest";

import { runTests } from "./helpers";

describe("Intersections", () => {
  describe("simple", () => {
    it.each([
      "type Test = Readonly<{ foo: string; }> & Readonly<{ bar: string; }>;",
      "type Test = readonly (number | string)[] & readonly (number | boolean)[];",
      "type Test = { foo: string; } & { bar: string; };",
      "type Test = Readonly<{ foo: string; } & { bar: string; }>;",
    ])("%s", (code) => {
      runTests(code);
    });
  });

  describe("same props", () => {
    it.each([
      "type Test = { readonly foo: ReadonlyArray<string>; } & { readonly foo: Array<string>; };",
      "type Test = ReadonlyArray<number> & { readonly 0: number; };",
    ])("%s", (code) => {
      runTests(code);
    });
  });
});
