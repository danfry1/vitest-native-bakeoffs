// Await codemod for adopting RNTL 14's async APIs. RNTL 14 made render / renderHook
// / fireEvent / act / rerender / unmount / cleanup return Promises; this inserts
// `await` at those call sites and marks the enclosing function `async`. Awaiting is
// back-compatible with RNTL 12/13 (sync there — `await` on a non-Promise is a no-op).
//
// Run with the cloned app's own node_modules on the resolution path (it provides
// @babel/core; magic-string is installed by setup-rntl14.sh):
//   node rntl14-await-codemod.mjs <file> [<file> ...]
import babel from "@babel/core";
import MagicString from "magic-string";
import fs from "node:fs";

const { parseSync, traverse, types: t } = babel;

const TARGET_IDENTS = new Set([
  "render",
  "renderHook",
  "fireEvent",
  "act",
  "rerender",
  "unmount",
  "cleanup",
]);

const files = process.argv.slice(2);
let totalAwaits = 0;
let totalAsync = 0;
const changed = [];

for (const file of files) {
  const code = fs.readFileSync(file, "utf8");
  let ast;
  try {
    ast = parseSync(code, {
      filename: file,
      configFile: false,
      babelrc: false,
      parserOpts: { sourceType: "module", plugins: ["typescript", "jsx"] },
    });
  } catch (e) {
    console.error(`PARSE FAIL ${file}: ${e.message}`);
    continue;
  }

  const s = new MagicString(code);
  const fnsToAsync = new Set();
  let awaits = 0;

  traverse(ast, {
    CallExpression(path) {
      const callee = path.node.callee;
      let isTarget = false;
      if (t.isIdentifier(callee)) {
        if (TARGET_IDENTS.has(callee.name)) isTarget = true;
      } else if (
        t.isMemberExpression(callee) &&
        t.isIdentifier(callee.object) &&
        callee.object.name === "fireEvent"
      ) {
        isTarget = true;
      }
      if (!isTarget) return;
      if (path.parentPath.isAwaitExpression()) return;
      // Chained call — `render(...).toJSON()` must become `(await render(...)).toJSON()`,
      // not `await render(...).toJSON()` (which calls the method on the Promise).
      const parent = path.parentPath;
      const chained = parent.isMemberExpression() && parent.node.object === path.node;
      if (chained) {
        s.prependLeft(path.node.start, "(await ");
        s.appendRight(path.node.end, ")");
      } else {
        s.appendLeft(path.node.start, "await ");
      }
      awaits++;
      const fn = path.getFunctionParent();
      if (fn && !fn.node.async) fnsToAsync.add(fn);
    },
  });

  let asyncs = 0;
  for (const fnPath of fnsToAsync) {
    const node = fnPath.node;
    if (node.async) continue;
    if (
      t.isArrowFunctionExpression(node) ||
      t.isFunctionExpression(node) ||
      t.isFunctionDeclaration(node) ||
      t.isObjectMethod(node) ||
      t.isClassMethod(node)
    ) {
      s.appendLeft(node.start, "async ");
      asyncs++;
    }
  }

  if (awaits > 0) {
    totalAwaits += awaits;
    totalAsync += asyncs;
    changed.push(`${file}: +${awaits} await, +${asyncs} async`);
    fs.writeFileSync(file, s.toString());
  }
}

console.log(`${changed.length} files, +${totalAwaits} await, +${totalAsync} async`);
