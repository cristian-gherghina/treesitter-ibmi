#!/usr/bin/env node

// Runs DDS dialect fixture, keyword, and optional incremental-edit checks.

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

// Resolve the selected dialect's grammar, fixtures, and local parser cache.
const repoRoot = path.resolve(import.meta.dirname, "..");
const cli = path.join(repoRoot, "node_modules", "tree-sitter-cli", "cli.js");
const dialect = process.argv[2] ?? "pf";
const grammar = path.join(repoRoot, "grammars", "dds", dialect);
const fixtureRoot = path.join(repoRoot, "fixtures", `dds-${dialect}`);
const cacheRoot = path.join(repoRoot, ".cache");
const expectedErrorFixtures = new Set(
  dialect === "pf" ? ["keywords.pf"] : [],
);

// Run Tree-sitter and return stdout, or null when the command fails.
function run(args) {
  try {
    return execFileSync(process.execPath, [cli, ...args], {
      cwd: repoRoot,
      env: { ...process.env, XDG_CACHE_HOME: cacheRoot },
      encoding: "utf8",
      stdio: "pipe",
    });
  } catch (error) {
    if (error.stderr) {
      process.stderr.write(error.stderr);
    }
    return null;
  }
}

// Return whether a source file parsed without ERROR or MISSING nodes.
function parse(args) {
  return run(["parse", "-p", grammar, ...args]) !== null;
}

// Verify every fixture has its expected parse result.
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

// Exercise incremental edits for shared and dialect-specific column fields.
let incrementalChecks = 0;
const incrementalCases = {
  pf: {
    fixture: "columns.pf",
    invalid: [["7,5 1 B"], ["7,16 1 M"], ["9,34 1 X"]],
    valid: [["9,34 1 S"]],
  },
  icff: {
    fixture: "columns.icff",
    invalid: [["20,8 1 X"]],
    valid: [["20,8 1 9"], ["20,8 1 X", "20,8 1 0"]],
  },
  dspf: {
    fixture: "columns.dspf",
    invalid: [["10,40 1 X"]],
    valid: [["10,40 1 4"], ["10,40 1 X", "10,40 1 3"]],
  },
  prtf: {
    fixture: "columns.prtf",
    invalid: [["9,40 1 X"]],
    valid: [["9,40 1 5"], ["9,40 1 X", "9,40 1 4"]],
  },
};
const incrementalCase = incrementalCases[dialect];
if (incrementalCase) {
  const incrementalFixture = path.join(
    fixtureRoot,
    incrementalCase.fixture,
  );
  for (const edits of incrementalCase.invalid) {
    const args = [incrementalFixture, "--quiet", "--edits", ...edits];
    if (parse(args)) {
      throw new Error(
        `incremental edit should produce an error: ${edits.join("; ")}`,
      );
    }
    incrementalChecks += 1;
  }
  for (const edits of incrementalCase.valid) {
    const args = [incrementalFixture, "--quiet", "--edits", ...edits];
    if (!parse(args)) {
      throw new Error(
        `valid incremental edit produced an error: ${edits.join("; ")}`,
      );
    }
    incrementalChecks += 1;
  }
}

// Capture every keyword recognized across the dialect's fixtures.
const keywordOutput = run([
  "query",
  "-p",
  grammar,
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

// Ensure the fixtures exercise the complete extracted keyword table.
const expectedKeywords = JSON.parse(
  fs.readFileSync(
    path.join(repoRoot, "data", `dds-${dialect}-keywords.json`),
    "utf8",
  ),
);
const missingKeywords = expectedKeywords.filter(
  (keyword) => !capturedKeywords.has(keyword),
);
if (missingKeywords.length > 0) {
  throw new Error(
    `${dialect} keyword fixture is missing: ${missingKeywords.join(", ")}`,
  );
}

console.log(
  `DDS/${dialect.toUpperCase()} fixtures: ${checked}; incremental edits: ${incrementalChecks}; keywords: ${expectedKeywords.length}`,
);
