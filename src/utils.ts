import ts, {
  type EntityName,
  type Identifier,
  type PrivateIdentifier,
  type QualifiedName,
} from "typescript";

/**
 * Merge the given type and type arguments string representations.
 */
export function getTypeWithTypeArgumentsString(
  name: string,
  typeArguments: ReadonlyArray<string | null> | undefined,
) {
  if (typeArguments === undefined) {
    return name;
  }

  if (typeArguments.includes(null)) {
    return null;
  }

  return `${name}<${typeArguments.join(", ")}>`;
}

/**
 * Get string representations of the given entity name.
 */
export function entityNameToString(
  // eslint-disable-next-line functional/prefer-immutable-types
  entityName: EntityName,
): string {
  return ts.isIdentifier(entityName)
    ? identifierToString(entityName)
    : qualifiedNameToString(entityName);
}

/**
 * Get string representations of the given identifier.
 */
export function identifierToString(
  // eslint-disable-next-line functional/prefer-immutable-types
  identifier: Identifier | PrivateIdentifier,
): string {
  return identifier.escapedText as string;
}

/**
 * Get string representations of the given qualified name.
 */
// eslint-disable-next-line functional/prefer-immutable-types
export function qualifiedNameToString(qualifiedName: QualifiedName): string {
  return `${entityNameToString(qualifiedName.left)}.${identifierToString(
    qualifiedName.right,
  )}`;
}

/**
 * Get the highest set bit in the given value.
 */
export function bitwiseMax(value: number) {
  let m_shifts = 0;

  // eslint-disable-next-line functional/no-loop-statements, no-cond-assign, no-param-reassign
  while ((value >>= 1) !== 0) {
    // eslint-disable-next-line functional/no-expression-statements
    m_shifts++;
  }

  return 1 << m_shifts;
}
