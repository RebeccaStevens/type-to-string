import { describe, it } from "vitest";

import { runTests } from "./helpers";

describe("Property Signatures", () => {
  it.each([
    "type Test = { readonly [key: string]: string };",
    "type Test = { readonly [key: string]: { readonly foo: string; }; };",
    "type Test = { readonly [key: string]: readonly string[] };",
    "type Test = { readonly [key: string]: { foo: string[]; }; };",
    "type Test = { [key: string]: string };",
  ])("%s", (code) => {
    runTests(code);
  });
});
