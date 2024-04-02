import { type Type, type TypeNode } from "typescript";

import { type TypeName } from "./TypeName";

/**
 * A cache used to keep track of the encountered types.
 */
export type TypeToStringCache = WeakMap<object, TypeName>;

/**
 * A {@link Type} and its corresponding {@link TypeNode}
 */
export type TypeData = {
  type: Type;
  typeNode: TypeNode | null;
};
