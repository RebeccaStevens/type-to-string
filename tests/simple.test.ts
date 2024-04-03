import { type ClassDeclaration } from "typescript";
import { describe, it } from "vitest";

import { runTests } from "./helpers";

describe("primitives", () => {
  it.each([
    "null",
    "undefined",
    "string",
    "number",
    "boolean",
    "symbol",
    "unique symbol",
    "bigint",
  ])("%s", (test) => {
    runTests(`type Test = ${test};`);
  });
});

describe("records", () => {
  it.each([
    "type Test = { foo: string; };",
    "type Test = { readonly foo: string; };",
    "type Test = Readonly<{ foo: string; }>;",
  ])("%s", (code) => {
    runTests(code);
  });
});

describe("arrays", () => {
  it.each([
    "type Test = readonly string[];",
    "type Test = ReadonlyArray<string>;",
    "type Test = readonly { foo: string }[];",
    "type Test = ReadonlyArray<{ foo: string }>;",
    "type Test = string[];",
    "type Test = Array<string>;",
    "type Test = Readonly<string[]>;",
    "type Test = Readonly<Array<string>>;",
  ])("%s", (code) => {
    runTests(code);
  });
});

describe("tuples", () => {
  it.each([
    "type Test = readonly [string, number, boolean];",
    "type Test = Readonly<[string, number, boolean]>;",
    "type Test = [string, number, boolean];",
    "type Test = readonly [{ foo: string }, { bar: number }];",
    "type Test = Readonly<[{ foo: string }, { bar: number }]>;",
    "type Test = [{ foo: string }, { bar: number }];",
  ])("%s", (code) => {
    runTests(code);
  });
});

describe("sets and maps", () => {
  it.each([
    "type Test = Readonly<ReadonlySet<string>>;",
    "type Test = Readonly<ReadonlyMap<string, string>>;",
    "type Test = ReadonlySet<string>;",
    "type Test = ReadonlyMap<string, string>;",
    "type Test = ReadonlySet<{ foo: string }>;",
    "type Test = ReadonlyMap<{ foo: string }, { bar: string }>;",
    "type Test = Set<string>;",
    "type Test = Map<string, string>;",
  ])("%s", (code) => {
    runTests(code);
  });
});

describe("functions", () => {
  it.each([
    "type Test = () => number;",
    "type Test = (foo: { bar: string; }) => { baz: number; };",
    "type Test = { (): number; };",
    "type Test = { (foo: { bar: string; }): { baz: number; } };",
  ])("%s", (code) => {
    runTests(code);
  });
});

describe("methods", () => {
  it.each([
    "type Test = { readonly foo: () => string; };",
    "type Test = Readonly<{ foo(): string; }>;",
    "type Test = { foo: () => string; };",
    "type Test = { foo(): string; };",
  ])("%s", (code) => {
    runTests(code);
  });
});

describe("private identifiers", () => {
  it.each([
    'class Foo { readonly #readonlyPrivateField = "foo"; }',
    'class Foo { #privateField = "foo"; }',
    "class Foo { #privateMember() {}; }",
  ])("%s", (code) => {
    runTests(code, (statement) => (statement as ClassDeclaration).members[0]!);
  });
});
