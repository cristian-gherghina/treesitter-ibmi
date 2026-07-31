#!/usr/bin/env node

// Run full-fixture and language-specific coverage checks for one parser.

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "..");
const cli = path.join(repoRoot, "node_modules", "tree-sitter-cli", "cli.js");
const parser = process.argv[2];
const ddsDialect = parser?.startsWith("dds-") ? parser.slice(4) : null;
const grammar = ddsDialect
  ? path.join(repoRoot, "grammars", "dds", ddsDialect)
  : path.join(repoRoot, "grammars", parser ?? "");
const fixtureRoot = path.join(repoRoot, "fixtures", parser ?? "");
const cacheRoot = path.join(repoRoot, ".cache");

if (!parser || !fs.existsSync(grammar) || !fs.existsSync(fixtureRoot)) {
  throw new Error(`unsupported parser: ${parser ?? "(missing)"}`);
}

// Run Tree-sitter and return stdout, or null when a recoverable check fails.
function run(args, allowFailure = false) {
  try {
    return execFileSync(process.execPath, [cli, ...args], {
      cwd: repoRoot,
      env: { ...process.env, XDG_CACHE_HOME: cacheRoot },
      encoding: "utf8",
      stdio: "pipe",
    });
  } catch (error) {
    if (!allowFailure) throw error;
    if (error.stderr) process.stderr.write(error.stderr);
    return null;
  }
}

const fixtureNames = fs
  .readdirSync(fixtureRoot)
  .filter((name) => fs.statSync(path.join(fixtureRoot, name)).isFile())
  .sort();

// DDS includes expected failures, incremental edits, and keyword coverage.
if (ddsDialect) {
  const expectedErrors = new Set(ddsDialect === "pf" ? ["keywords.pf"] : []);
  for (const name of fixtureNames) {
    const successful = run([
      "parse", "-p", grammar, path.join(fixtureRoot, name), "--quiet",
    ], true) !== null;
    if (successful === expectedErrors.has(name)) {
      throw new Error(`${name}: unexpected parse result`);
    }
  }

  let incrementalChecks = 0;
  const cases = {
    pf: { fixture: "columns.pf", invalid: [["7,5 1 B"], ["7,16 1 M"], ["9,34 1 X"]], valid: [["9,34 1 S"]] },
    icff: { fixture: "columns.icff", invalid: [["20,8 1 X"]], valid: [["20,8 1 9"], ["20,8 1 X", "20,8 1 0"]] },
    dspf: { fixture: "columns.dspf", invalid: [["10,40 1 X"]], valid: [["10,40 1 4"], ["10,40 1 X", "10,40 1 3"]] },
    prtf: { fixture: "columns.prtf", invalid: [["9,40 1 X"]], valid: [["9,40 1 5"], ["9,40 1 X", "9,40 1 4"]] },
  };
  const incremental = cases[ddsDialect];
  if (incremental) {
    const source = path.join(fixtureRoot, incremental.fixture);
    for (const edits of incremental.invalid) {
      if (run(["parse", "-p", grammar, source, "--quiet", "--edits", ...edits], true) !== null) {
        throw new Error(`incremental edit should fail: ${edits.join("; ")}`);
      }
      incrementalChecks += 1;
    }
    for (const edits of incremental.valid) {
      if (run(["parse", "-p", grammar, source, "--quiet", "--edits", ...edits], true) === null) {
        throw new Error(`incremental edit should pass: ${edits.join("; ")}`);
      }
      incrementalChecks += 1;
    }
  }

  const output = run([
    "query", "-p", grammar, path.join(grammar, "queries", "keywords.scm"),
    ...fixtureNames.map((name) => path.join(fixtureRoot, name)),
  ]);
  const captured = new Set(
    [...output.matchAll(/text: `([A-Z0-9]+)`/g)].map((match) => match[1]),
  );
  const expected = JSON.parse(fs.readFileSync(
    path.join(repoRoot, "data", `dds-${ddsDialect}-keywords.json`), "utf8",
  ));
  const missing = expected.filter((keyword) => !captured.has(keyword));
  if (missing.length > 0) throw new Error(`keyword fixture is missing: ${missing.join(", ")}`);

  console.log(`DDS/${ddsDialect.toUpperCase()} fixtures: ${fixtureNames.length}; incremental edits: ${incrementalChecks}; keywords: ${expected.length}`);
} else {
  run(["parse", "-p", grammar, ...fixtureNames.map((name) => path.join(fixtureRoot, name)), "--quiet"]);

  // CL additionally verifies that parser generation retained its command table.
  if (parser === "cl") {
    const commands = JSON.parse(fs.readFileSync(path.join(repoRoot, "data", "cl-commands.json"), "utf8"));
    const generated = fs.readFileSync(path.join(grammar, "src", "grammar.json"), "utf8");
    const missing = commands.filter((command) => !generated.includes(`"value": "${command}"`));
    if (missing.length > 0) throw new Error(`generated commands missing: ${missing.join(", ")}`);
    console.log(`CL fixtures: ${fixtureNames.length}; generated commands: ${commands.length}`);
  } else {
    const labels = { bnd: "Binder", mi: "MI" };
    console.log(`${labels[parser] ?? parser} fixtures: ${fixtureNames.length}`);
  }
}
