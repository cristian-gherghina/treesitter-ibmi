#!/usr/bin/env node

// Parse every binder-language fixture without recovery nodes.

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "..");
const cli = path.join(repoRoot, "node_modules", "tree-sitter-cli", "cli.js");
const grammar = path.join(repoRoot, "grammars", "bnd");
const fixtureRoot = path.join(repoRoot, "fixtures", "bnd");
const fixtureNames = fs.readdirSync(fixtureRoot).sort();

execFileSync(
  process.execPath,
  [
    cli,
    "parse",
    "-p",
    grammar,
    ...fixtureNames.map((name) => path.join(fixtureRoot, name)),
    "--quiet",
  ],
  {
    cwd: repoRoot,
    env: {
      ...process.env,
      XDG_CACHE_HOME: path.join(repoRoot, ".cache"),
    },
    stdio: "pipe",
  },
);

console.log(`Binder fixtures: ${fixtureNames.length}`);
