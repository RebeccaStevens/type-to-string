// eslint-disable-next-line unicorn/import-style, import/no-unassigned-import
import "typescript";

declare module "typescript" {
  interface TypeChecker {
    // internal TS APIs

    /**
     * The recursion identity of a type is an object identity that is shared among multiple instantiations of the type.
     * We track recursion identities in order to identify deeply nested and possibly infinite type instantiations with
     * the same origin. For example, when type parameters are in scope in an object type such as { x: T }, all
     * instantiations of that type have the same recursion identity. The default recursion identity is the object
     * identity of the type, meaning that every type is unique. Generally, types with constituents that could circularly
     * reference the type have a recursion identity that differs from the object identity.
     */
    getRecursionIdentity(type: Readonly<Type>): object;
  }
}
