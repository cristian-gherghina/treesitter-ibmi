#!/usr/bin/env node

// Runs DDS/PF fixture and incremental-edit checks with explicit expectations.

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "..");
const cli = path.join(repoRoot, "node_modules", "tree-sitter-cli", "cli.js");
const grammar = path.join(repoRoot, "grammars", "dds", "pf");
const fixtureRoot = path.join(repoRoot, "fixtures", "dds-pf");
const cacheRoot = path.join(repoRoot, ".cache");
const expectedErrorFixtures = new Set(["keywords.pf"]);

// Run Tree-sitter and return stdout, or null when the command fails.
function run(args) {
  try {
    return execFileSync(process.execPath, [cli, ...args], {
      cwd: repoRoot,
      env: { ...process.env, XDG_CACHE_HOME: cacheRoot },
      encoding: "utf8",
      stdio: "pipe",
    });
  } catch {
    return null;
  }
}

// Return whether a source file parsed without ERROR or MISSING nodes.
function parse(args) {
  return run(["parse", "-p", grammar, ...args]) !== null;
}

let checked = 0;
const fixtureNames = fs
  .readdirSync(fixtureRoot)
  .filter((name) => fs.statSync(path.join(fixtureRoot, name)).isFile())
  .sort();
for (const name of fixtureNames) {
  const file = path.join(fixtureRoot, name);
  const successful = parse([file, "--quiet"]);
  const expected = !expectedErrorFixtures.has(name);
  if (successful !== expected) {
    throw new Error(
      `${name}: expected parse success=${expected}, got ${successful}`,
    );
  }
  checked += 1;
}

const incrementalFixture = path.join(fixtureRoot, "columns.pf");
for (const edit of ["7,5 1 B", "7,16 1 M", "9,34 1 X"]) {
  if (parse([incrementalFixture, "--quiet", "--edits", edit])) {
    throw new Error(`incremental edit should produce an error: ${edit}`);
  }
}
if (!parse([incrementalFixture, "--quiet", "--edits", "9,34 1 S"])) {
  throw new Error("valid incremental data-type edit produced an error");
}

const keywordOutput = run([
  "query",
  path.join(grammar, "queries", "keywords.scm"),
  ...fixtureNames.map((name) => path.join(fixtureRoot, name)),
]);
if (keywordOutput === null) {
  throw new Error("keyword coverage query failed");
}
const capturedKeywords = new Set(
  [...keywordOutput.matchAll(/text: `([A-Z0-9]+)`/g)].map(
    (match) => match[1],
  ),
);
const expectedKeywords = JSON.parse(
  fs.readFileSync(path.join(repoRoot, "data", "dds-pf-keywords.json"), "utf8"),
);
const missingKeywords = expectedKeywords.filter(
  (keyword) => !capturedKeywords.has(keyword),
);
if (missingKeywords.length > 0) {
  throw new Error(`keywords.pf is missing: ${missingKeywords.join(", ")}`);
}

console.log(
  `DDS/PF fixtures: ${checked}; incremental edits: 4; keywords: ${expectedKeywords.length}`,
);
