import ts, { type Node, type Program, type Type } from "typescript";

import { getTypeReferenceNodeAsString } from "./type-node-to-string";
import { getTypeWithTypeArgumentsString } from "./utils";

/**
 * Get string representations of the given {@link Type}.
 */
export function typeToString(
  program: Program,
  // eslint-disable-next-line functional/prefer-immutable-types
  type: Type,
  enclosingDeclaration: ts.Node | undefined = undefined,
  flags: ts.TypeFormatFlags = ts.TypeFormatFlags.None,
): string {
  const checker = program.getTypeChecker();
  return checker.typeToString(type, enclosingDeclaration, flags);
}

/**
 * Get the alias name of the given {@link Type}.
 */
export function getTypeAliasAsString(
  // eslint-disable-next-line functional/prefer-immutable-types
  type: Type,
  withArguments = false,
): string | null {
  const t = "target" in type ? (type.target as Type) : type;

  const name = t.aliasSymbol?.getName() ?? null;
  if (!withArguments || name === null) {
    return name;
  }

  const typeArguments = t.aliasTypeArguments?.map(
    (argument) => argument.getSymbol()?.getName() ?? null,
  );

  return getTypeWithTypeArgumentsString(name, typeArguments);
}

/**
 * Get the name of the type reference on the given {@link Type}.
 *
 * If the given {@link Type} is not a type reference, `null` will be returned.
 */
export function getTypeReferenceAsString(
  program: Program,
  // eslint-disable-next-line functional/prefer-immutable-types
  type: Type,
  withArguments = false,
): string | null {
  if (!("node" in type)) {
    return null;
  }

  return getTypeReferenceNodeAsString(
    program,
    type.node as Node,
    withArguments,
  );
}
