import { describe, it } from "vitest";

import { runTests } from "./helpers";

describe("Call Signatures", () => {
  it.each([
    "type Test = { (): void; readonly bar: number };",
    "type Test = Readonly<{ (): void; bar: number }>;",
    "type Test = { (foo: number): string; readonly bar: number };",
    "type Test = Readonly<{ (foo: number): string; bar: number }>;",
    "type Test = { (foo: { baz: number }): string; readonly bar: number };",
    "type Test = Readonly<{ (foo: { baz: number }): string; bar: number }>;",
    "type Test = { (): void; readonly bar: readonly number[] };",
    "type Test = { (): void; readonly bar: readonly ({ foo: number })[] };",
    "type Test = { (): void; bar: number };",
    "type Test = { (): string; bar: number };",
    "type Test = { (foo: string): void; bar: number };",
    "type Test = { (foo: { baz: number }): string; bar: number };",
  ])("%s", (code) => {
    runTests(code);
  });
});
