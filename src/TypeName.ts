/* eslint-disable functional/no-conditional-statements, functional/no-expression-statements */
import assert from "node:assert/strict";

import {
  hasType,
  isIntrinsicType,
  isSymbolFlagSet,
  isTypeReference,
} from "ts-api-utils";
import ts, {
  type TypeReference,
  type TypeReferenceNode,
  type Program,
  type EntityName,
  type Identifier,
  type PrivateIdentifier,
  type QualifiedName,
} from "typescript";

import { typeDataToString } from "./type-to-string";
import { type TypeToStringCache, type TypeData } from "./types";
import { getTypeData, isTypeNode } from "./utils";

export type TypeName = Readonly<{
  getName(): string | null;
  getNameWithArguments(): string | null;
  getAlias(): string | null;
  getAliasWithArguments(): string | null;
  getEvaluated(): string;
}>;

class TypeNameImpl implements TypeName {
  private readonly m_data: {
    name?: string | null;
    nameWithArguments?: string | null;
    alias?: string | null;
    aliasWithArguments?: string | null;
    evaluated?: string;
  };

  private m_wrapperType: TypeReferenceNode | undefined;

  public constructor(
    private readonly program: Program,
    private readonly cache: TypeToStringCache,
    private readonly typeData: Readonly<TypeData>,
  ) {
    this.m_data = {};
  }

  public getName(): string | null {
    if (this.m_data.name === undefined) {
      const checker = this.program.getTypeChecker();

      if (isIntrinsicType(this.typeData.type)) {
        this.m_data.name = this.typeData.type.intrinsicName;
      } else {
        const symbol = this.typeData.type.getSymbol();
        if (symbol === undefined) {
          const wrapperDeclarations =
            this.typeData.type.aliasSymbol?.declarations;
          const wrapperDeclaration =
            wrapperDeclarations?.length === 1
              ? wrapperDeclarations[0]
              : undefined;
          this.m_wrapperType =
            wrapperDeclaration !== undefined &&
            ts.isTypeAliasDeclaration(wrapperDeclaration) &&
            ts.isTypeReferenceNode(wrapperDeclaration.type)
              ? wrapperDeclaration.type
              : undefined;
          this.m_data.name =
            this.m_wrapperType === undefined
              ? null
              : entityNameToString(this.m_wrapperType.typeName);
        } else if (isSymbolFlagSet(symbol, ts.SymbolFlags.TypeLiteral)) {
          this.m_data.name = null;
        } else {
          this.m_data.name = checker.symbolToString(symbol);
        }
      }
    }
    return this.m_data.name;
  }

  public getNameWithArguments(): string | null {
    if (this.m_data.nameWithArguments === undefined) {
      const checker = this.program.getTypeChecker();

      if (this.m_data.name === undefined) {
        this.m_data.name = this.getName();
      }
      if (this.m_data.name === null || isIntrinsicType(this.typeData.type)) {
        this.m_data.nameWithArguments = null;
      } else {
        const symbol = this.typeData.type.getSymbol();
        if (symbol === undefined) {
          if (this.m_wrapperType?.typeArguments === undefined) {
            this.m_data.nameWithArguments = null;
          } else {
            const wrapperArguments = typeArgumentsToString(
              this.program,
              this.cache,
              getTypeData(
                checker.getTypeFromTypeNode(this.m_wrapperType),
                this.m_wrapperType,
              ),
              this.m_data.name,
              this.m_wrapperType.typeArguments.map((node) =>
                checker.getTypeFromTypeNode(node),
              ),
            );
            this.m_data.nameWithArguments =
              wrapperArguments === undefined
                ? null
                : `${this.m_data.name}<${wrapperArguments}>`;
          }
        } else {
          const typeArguments = isTypeReference(this.typeData.type)
            ? checker.getTypeArguments(this.typeData.type)
            : undefined;

          if (typeArguments === undefined || typeArguments.length === 0) {
            this.m_data.nameWithArguments = null;
          } else {
            const wrapperArguments = typeArgumentsToString(
              this.program,
              this.cache,
              this.typeData,
              this.m_data.name,
              typeArguments,
            );

            this.m_data.nameWithArguments =
              wrapperArguments === undefined
                ? null
                : `${this.m_data.name}<${wrapperArguments}>`;
          }
        }
      }
    }
    return this.m_data.nameWithArguments;
  }

  public getAlias(): string | null {
    if (this.m_data.alias === undefined) {
      this.m_data.alias = this.typeData.type.aliasSymbol?.escapedName ?? null;
    }
    return this.m_data.alias;
  }

  public getAliasWithArguments(): string | null {
    if (this.m_data.aliasWithArguments === undefined) {
      const checker = this.program.getTypeChecker();

      if (this.typeData.type.aliasSymbol === undefined) {
        this.m_data.aliasWithArguments = null;
      } else {
        if (this.m_data.alias === undefined) {
          this.m_data.alias = this.getAlias();
        }
        if (this.m_data.alias === null) {
          this.m_data.aliasWithArguments = null;
        } else {
          const aliasType = checker.getDeclaredTypeOfSymbol(
            this.typeData.type.aliasSymbol,
          );
          if (aliasType.aliasTypeArguments === undefined) {
            this.m_data.aliasWithArguments = null;
          } else {
            const aliasDeclarations =
              this.typeData.type.aliasSymbol.getDeclarations();
            const aliasDeclaration =
              (aliasDeclarations?.length ?? 0) === 1
                ? aliasDeclarations![0]
                : undefined;
            const aliasTypeNode =
              aliasDeclaration !== undefined && hasType(aliasDeclaration)
                ? aliasDeclaration.type
                : undefined;

            const aliasArguments = typeArgumentsToString(
              this.program,
              this.cache,
              getTypeData(aliasType, aliasTypeNode),
              this.m_data.alias,
              aliasType.aliasTypeArguments,
            );
            this.m_data.aliasWithArguments =
              aliasArguments === undefined
                ? null
                : `${this.m_data.alias}<${aliasArguments}>`;
          }
        }
      }
    }
    return this.m_data.aliasWithArguments;
  }

  public getEvaluated(): string {
    if (this.m_data.evaluated === undefined) {
      const checker = this.program.getTypeChecker();

      if (
        this.typeData.typeNode !== null &&
        ts.isTypeReferenceNode(this.typeData.typeNode)
      ) {
        const name = entityNameToString(this.typeData.typeNode.typeName);

        if (this.typeData.typeNode.typeArguments === undefined) {
          this.m_data.evaluated = name;
        } else {
          const typeArguments = typeArgumentsToString(
            this.program,
            this.cache,
            this.typeData,
            undefined,
            this.typeData.typeNode.typeArguments,
          );

          this.m_data.evaluated =
            typeArguments === undefined ? name : `${name}<${typeArguments}>`;
        }
      } else {
        this.m_data.evaluated = checker.typeToString(this.typeData.type);
      }
    }
    return this.m_data.evaluated;
  }
}

/**
 * Get string representations of the given type arguments.
 */
function typeArgumentsToString(
  program: ts.Program,
  cache: TypeToStringCache,
  typeData: Readonly<TypeData>,
  name: string | undefined,
  typeArguments: ReadonlyArray<ts.Type> | ts.NodeArray<ts.TypeNode>,
) {
  const typeArgumentStrings = typeArguments.map((typeLike, index) => {
    const typeArgument = isTypeNode(typeLike)
      ? getTypeData(
          program.getTypeChecker().getTypeFromTypeNode(typeLike),
          typeLike,
        )
      : getTypeData(typeLike, undefined);
    if (
      typeData.type === typeArgument.type ||
      (isTypeReference(typeArgument.type) &&
        (typeData.type as TypeReference).typeArguments?.[index] ===
          typeArgument.type)
    ) {
      return name;
    }
    const typeName = typeDataToString(program, cache, typeArgument);
    return (
      typeName.getNameWithArguments() ??
      typeName.getName() ??
      typeName.getEvaluated()
    );
  });

  if (typeArgumentStrings.includes(undefined)) {
    assert(typeArgumentStrings.every((type) => type === undefined));
    return undefined;
  }

  return typeArgumentStrings.join(",");
}

/**
 * Create a {@link TypeName}.
 */
export function createTypeName(
  program: Program,
  cache: TypeToStringCache,
  typeData: Readonly<TypeData>,
): TypeName {
  return new TypeNameImpl(program, cache, typeData);
}

/**
 * Get string representations of the given entity name.
 */
function entityNameToString(
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
function identifierToString(
  // eslint-disable-next-line functional/prefer-immutable-types
  identifier: Identifier | PrivateIdentifier,
): string {
  return identifier.escapedText as string;
}

/**
 * Get string representations of the given qualified name.
 */
// eslint-disable-next-line functional/prefer-immutable-types
function qualifiedNameToString(qualifiedName: QualifiedName): string {
  return `${entityNameToString(qualifiedName.left)}.${identifierToString(
    qualifiedName.right,
  )}`;
}
