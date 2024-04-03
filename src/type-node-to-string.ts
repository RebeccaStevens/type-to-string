import assert from "node:assert/strict";

import { isIntrinsicErrorType, isIntrinsicType } from "ts-api-utils";
import ts, {
  type ArrayTypeNode,
  type Node,
  type Program,
  type TupleTypeNode,
  type Type,
  type TypeFormatFlags,
  type TypeLiteralNode,
  type TypeNode,
  type TypeQueryNode,
  type TypeReferenceNode,
} from "typescript";

import { typeToString } from "./type-to-string";
import {
  bitwiseMax,
  entityNameToString,
  getTypeWithTypeArgumentsString,
  identifierToString,
} from "./utils";

const typeFormatFlagsMaxValue = bitwiseMax(
  Object.values(ts.TypeFormatFlags).reduce(
    (carry, current): number =>
      typeof current === "number" ? carry | current : carry,
    0,
  ),
);

/**
 * The same as {@link TypeFormatFlags} but with a few extra options added on.
 */
export const TypeNodeFormatFlags = {
  ...ts.TypeFormatFlags,
  OmitTypeLiterals: typeFormatFlagsMaxValue << 1,
} as const;

/**
 * Get the alias name of the given {@link TypeNode}.
 */
export function getTypeNodeAliasAsString(
  // eslint-disable-next-line functional/prefer-immutable-types
  typeNode: TypeNode,
  withArguments = false,
): string | null {
  if (ts.isTypeAliasDeclaration(typeNode.parent)) {
    const name = identifierToString(typeNode.parent.name);
    if (!withArguments) {
      return name;
    }

    const typeArguments = typeNode.parent.typeParameters?.map((type) =>
      identifierToString(type.name),
    );

    return getTypeWithTypeArgumentsString(name, typeArguments);
  }

  return null;
}

/**
 * Get the name of the given {@link TypeReferenceNode}.
 *
 * If the given {@link Node} is not a {@link TypeReferenceNode}, `null` will be returned.
 */
export function getTypeReferenceNodeAsString(
  program: Program,
  node: Node,
  withArguments = false,
): string | null {
  if (ts.isTypeReferenceNode(node)) {
    const name = entityNameToString(node.typeName);
    if (!withArguments) {
      return name;
    }

    const checker = program.getTypeChecker();
    const type = checker.getTypeAtLocation(node.typeName);

    const symbol = type.aliasSymbol ?? type.getSymbol();
    assert(symbol?.getName() === name);

    const typeArgumentsNodes =
      type.aliasTypeArguments ??
      (assert("typeParameters" in type),
      type.typeParameters as undefined | ReadonlyArray<Type>);

    const typeArguments = typeArgumentsNodes?.map(
      (parameter) => parameter.getSymbol()?.getName() ?? null,
    );

    return getTypeWithTypeArgumentsString(name, typeArguments);
  }

  if (ts.isArrayTypeNode(node)) {
    return withArguments ? "Array<T>" : "Array";
  }

  if (
    ts.isTypeOperatorNode(node) &&
    node.operator === ts.SyntaxKind.ReadonlyKeyword &&
    ts.isArrayTypeNode(node.type)
  ) {
    return withArguments ? "ReadonlyArray<T>" : "ReadonlyArray";
  }

  return null;
}

/**
 * Get the {@link TypeNode} as written.
 */
export function typeNodeAsWritten(
  // eslint-disable-next-line functional/prefer-immutable-types
  typeNode: TypeNode,
  keepAllWhiteSpace = false,
): string {
  if (keepAllWhiteSpace) {
    return typeNode.getFullText();
  }
  return typeNode.getText();
}

/**
 * Get string representations of the given {@link TypeNode}.
 *
 * @throws When the given type node is anonymous.
 */
export function typeNodeToString(
  program: Program,
  // eslint-disable-next-line functional/prefer-immutable-types
  typeNode: TypeNode,
  flags: number = ts.TypeFormatFlags.None,
): string | null {
  return getTypeNodeString(program, typeNode, flags);
}

function getTypeNodeString(
  program: Program,
  // eslint-disable-next-line functional/prefer-immutable-types
  typeNode: TypeNode,
  flags: number,
  readonly = false,
): string | null {
  if (ts.isTypeOperatorNode(typeNode)) {
    return getTypeNodeString(
      program,
      typeNode.type,
      flags,
      typeNode.operator === ts.SyntaxKind.ReadonlyKeyword,
    );
  }

  if (ts.isTypeReferenceNode(typeNode)) {
    return typeReferenceNodeToString(program, typeNode, flags);
  }

  if (ts.isArrayTypeNode(typeNode)) {
    return arrayTypeNodeToString(program, typeNode, flags, readonly);
  }

  if (ts.isTupleTypeNode(typeNode)) {
    return tupleTypeNodeToString(program, typeNode, flags, readonly);
  }

  if (ts.isTypeLiteralNode(typeNode)) {
    return typeLiteralNodeToString(program, typeNode, flags);
  }

  if (ts.isTypeQueryNode(typeNode)) {
    return typeQueryNodeToString(program, typeNode, flags);
  }

  const checker = program.getTypeChecker();
  const type = checker.getTypeAtLocation(typeNode);
  if (isIntrinsicType(type)) {
    return type.intrinsicName;
  }

  // TODO: implement
  return null;
}

function typeReferenceNodeToString(
  program: Program,
  // eslint-disable-next-line functional/prefer-immutable-types
  typeNode: TypeReferenceNode,
  flags: number,
): string | null {
  const name = entityNameToString(typeNode.typeName);
  const typeArguments = typeNode.typeArguments?.map((type) =>
    getTypeNodeString(program, type, flags),
  );

  return getTypeWithTypeArgumentsString(name, typeArguments);
}

function typeLiteralNodeToString(
  program: Program,
  // eslint-disable-next-line functional/prefer-immutable-types
  typeNode: TypeLiteralNode,
  flags: number,
): string | null {
  if ((flags & TypeNodeFormatFlags.OmitTypeLiterals) !== 0) {
    return "{}";
  }

  // TODO: implement
  return "{}";
}

function arrayTypeNodeToString(
  program: Program,
  // eslint-disable-next-line functional/prefer-immutable-types
  typeNode: ArrayTypeNode,
  flags: number,
  readonly: boolean,
): string | null {
  const typeArgument = getTypeNodeString(program, typeNode.elementType, flags);

  if ((flags & TypeNodeFormatFlags.WriteArrayAsGenericType) !== 0) {
    const name = readonly ? "ReadonlyArray" : "Array";
    return getTypeWithTypeArgumentsString(name, [typeArgument]);
  }

  return `${readonly ? "readonly " : ""}${typeArgument}[]`;
}

function tupleTypeNodeToString(
  program: Program,
  // eslint-disable-next-line functional/prefer-immutable-types
  typeNode: TupleTypeNode,
  flags: number,
  readonly: boolean,
): string | null {
  const typeArguments = typeNode.elements.map((type) =>
    getTypeNodeString(
      program,
      ts.isNamedTupleMember(type) ? type.type : type,
      flags,
    ),
  );

  return `${readonly ? "readonly " : ""}[${typeArguments.join(", ")}]`;
}

function typeQueryNodeToString(
  program: Program,
  // eslint-disable-next-line functional/prefer-immutable-types
  typeNode: TypeQueryNode,
  flags: number,
): string | null {
  const checker = program.getTypeChecker();
  const type = checker.getTypeAtLocation(typeNode.exprName);

  if (isIntrinsicErrorType(type)) {
    return null;
  }

  return typeToString(program, type, typeNode.exprName, flags);
}
