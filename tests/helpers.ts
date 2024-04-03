import * as tsvfs from "@typescript/vfs";
import { hasType, isIntrinsicErrorType } from "ts-api-utils";
import ts, { type Node, type Statement } from "typescript";
import { expect } from "vitest";

import {
  getTypeAliasAsString,
  getTypeNodeAliasAsString,
  getTypeReferenceAsString,
  getTypeReferenceNodeAsString,
  typeNodeAsWritten,
  typeNodeToString,
  typeToString,
} from "../src";

/**
 * Create a TS environment to run the tests in.
 *
 * @throws When something goes wrong.
 */
function createTSTestEnvironment(code: string) {
  const compilerOptions: ts.CompilerOptions = {
    lib: ["ES2022"],
    target: ts.ScriptTarget.ES2022,
  };

  const fsMap = tsvfs.createDefaultMapFromNodeModules(compilerOptions, ts);
  fsMap.set("index.ts", code);

  const system = tsvfs.createSystem(fsMap);
  const env = tsvfs.createVirtualTypeScriptEnvironment(
    system,
    ["index.ts"],
    ts,
    compilerOptions,
  );

  const program = env.languageService.getProgram();
  if (program === undefined) {
    expect.fail("Failed to get program.");
  }

  const ast = env.getSourceFile("index.ts");
  if (ast === undefined) {
    expect.fail("Failed to get ast.");
  }

  return { program, ast };
}

/**
 * Get the first type defined in the given code.
 *
 * @throws When failed to find the statement.
 */
function getType(
  code: string,
  accessor: (statement: Statement) => Node = defaultAccessor,
) {
  const { ast, program } = createTSTestEnvironment(code);

  const statement = ast.statements.at(-1)!;
  const checker = program.getTypeChecker();
  const node = accessor(statement);

  return {
    type: checker.getTypeAtLocation(node),
    typeNode: hasType(node) ? node.type : undefined,
    program,
  };
}

export function runTests(
  code: string,
  accessor?: (statement: Statement) => Node,
  flags = ts.TypeFormatFlags.AddUndefined | ts.TypeFormatFlags.NoTruncation,
): void {
  const { program, type, typeNode } = getType(code, accessor);

  if (!isIntrinsicErrorType(type)) {
    expect({
      typeAlias: getTypeAliasAsString(type, true),
      typeReference: getTypeReferenceAsString(program, type, true),
      typeToString: typeToString(program, type, undefined, flags),
    }).toMatchSnapshot();
  }

  if (typeNode !== undefined) {
    expect({
      typeNodeAlias: getTypeNodeAliasAsString(typeNode, true),
      typeReferenceNode: getTypeReferenceNodeAsString(program, typeNode, true),
      typeNodeAsWritten: typeNodeAsWritten(typeNode, false),
      typeNodeToString: typeNodeToString(program, typeNode, flags),
    }).toMatchSnapshot();
  }
}

function defaultAccessor(statement: Statement): Node {
  return statement;
}
