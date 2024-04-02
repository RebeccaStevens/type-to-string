import { isIntrinsicErrorType } from "ts-api-utils";
import { type Program, type Type, type TypeNode } from "typescript";

import { type TypeName } from "./TypeName";
import { type TypeToStringCache, type TypeData } from "./types";

/**
 * Get the {@link TypeData} from the given {@link Type} and {@link TypeNode}.
 *
 * @throws if the type is an error type.
 */
export function getTypeData(
  type: Readonly<Type>,
  typeNode: Readonly<TypeNode> | null | undefined,
): TypeData {
  if (isIntrinsicErrorType(type)) {
    throw new Error("ErrorType encountered.");
  }

  if (
    typeNode === undefined ||
    typeNode === null ||
    isAnonymousTypeNode(typeNode)
  ) {
    return {
      type,
      typeNode: null,
    };
  }

  return {
    type,
    typeNode,
  };
}

/**
 * Check if a {@link TypeNode} is anonymous.
 */
export function isAnonymousTypeNode(typeNode: Readonly<TypeNode>): boolean {
  return typeNode.pos < 0;
}

/**
 * Is the given type-like a {@link TypeNode}.
 */
export function isTypeNode(typeLike: Type | TypeNode): typeLike is TypeNode {
  return Object.hasOwn(typeLike, "kind");
}

/**
 * Cache a {@link TypeName} by a its {@link TypeData}.
 */
// eslint-disable-next-line functional/no-return-void
export function cacheTypeName(
  program: Program,
  cache: TypeToStringCache,
  typeData: Readonly<TypeData>,

  value: TypeName,
) {
  const { type, typeNode } = typeData;

  const checker = program.getTypeChecker();
  const identity = checker.getRecursionIdentity(type);

  // eslint-disable-next-line functional/no-conditional-statements
  if (typeNode !== null) {
    // eslint-disable-next-line functional/no-expression-statements
    cache.set(typeNode, value);
  }
  // eslint-disable-next-line functional/no-expression-statements
  cache.set(identity, value);
}

/**
 * Get the {@link TypeName} for the given {@link TypeData}.
 */
export function getCachedTypeName(
  program: Program,
  cache: TypeToStringCache,
  typeData: Readonly<TypeData>,
): TypeName | undefined {
  const checker = program.getTypeChecker();

  const { type, typeNode } = typeData;

  if (typeNode !== null) {
    const value = cache.get(typeNode);
    if (value !== undefined) {
      return value;
    }
  }
  return cache.get(checker.getRecursionIdentity(type));
}
