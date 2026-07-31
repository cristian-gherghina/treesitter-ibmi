#!/usr/bin/env node

// Parse every CL fixture and verify the generated command table is complete.

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "..");
const cli = path.join(repoRoot, "node_modules", "tree-sitter-cli", "cli.js");
const grammar = path.join(repoRoot, "grammars", "cl");
const fixtureRoot = path.join(repoRoot, "fixtures", "cl");
const cacheRoot = path.join(repoRoot, ".cache");

// Run Tree-sitter with a repository-local cache.
function run(args) {
  execFileSync(process.execPath, [cli, ...args], {
    cwd: repoRoot,
    env: { ...process.env, XDG_CACHE_HOME: cacheRoot },
    encoding: "utf8",
    stdio: "pipe",
  });
}

// Require every realistic source member to parse without recovery nodes.
const fixtureNames = fs.readdirSync(fixtureRoot).sort();
run([
  "parse",
  "-p",
  grammar,
  ...fixtureNames.map((name) => path.join(fixtureRoot, name)),
  "--quiet",
]);

// Confirm generation retained every command from the extracted IBM table.
const commands = JSON.parse(
  fs.readFileSync(path.join(repoRoot, "data", "cl-commands.json"), "utf8"),
);
const generatedGrammar = fs.readFileSync(
  path.join(grammar, "src", "grammar.json"),
  "utf8",
);
const missingCommands = commands.filter(
  (command) => !generatedGrammar.includes(`"value": "${command}"`),
);
if (missingCommands.length > 0) {
  throw new Error(`generated commands missing: ${missingCommands.join(", ")}`);
}

console.log(
  `CL fixtures: ${fixtureNames.length}; generated commands: ${commands.length}`,
);
