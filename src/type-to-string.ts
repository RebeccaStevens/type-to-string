import { type Program, type Type, type TypeNode } from "typescript";

import { type TypeName, createTypeName } from "./TypeName";
import { type TypeToStringCache, type TypeData } from "./types";
import { cacheTypeName, getCachedTypeName, getTypeData } from "./utils";

/**
 * A global cache that can be used between consumers.
 */
const globalTypeCache: TypeToStringCache = new WeakMap();

/**
 * Get string representations of the given {@link Type}.
 *
 * If you have access to the {@link TypeNode}, use {@link typeNodeToString}
 * instead as it contains more infomation about the type.
 */
export function typeToString(
  program: Program,
  // eslint-disable-next-line functional/prefer-immutable-types
  type: Type,
  useCache: TypeToStringCache | boolean = true,
): TypeName {
  const typeData = getTypeData(type, null);
  return typeDataToString(program, useCache, typeData);
}

/**
 * Get string representations of the given {@link TypeNode}.
 */
export function typeNodeToString(
  program: Program,
  // eslint-disable-next-line functional/prefer-immutable-types
  typeNode: TypeNode,
  useCache: TypeToStringCache | boolean = true,
): TypeName {
  const typeData = getTypeData(
    program.getTypeChecker().getTypeFromTypeNode(typeNode),
    typeNode,
  );
  return typeDataToString(program, useCache, typeData);
}

/**
 * Calculate the string representations of the given {@link TypeData}.
 */
export function typeDataToString(
  program: Program,
  useCache: TypeToStringCache | boolean,
  typeData: Readonly<TypeData>,
): TypeName {
  const cache: TypeToStringCache =
    useCache === true
      ? globalTypeCache
      : useCache === false
        ? new WeakMap()
        : useCache;

  const cached = getCachedTypeName(program, cache, typeData);
  if (cached !== undefined) {
    return cached;
  }

  const typeName = createTypeName(program, cache, typeData);
  cacheTypeName(program, cache, typeData, typeName);

  return typeName;
}
