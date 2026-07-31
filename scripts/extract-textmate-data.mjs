#!/usr/bin/env node

// One-time importer that converts keyword regexes from vscode-ibmi-languages
// TextMate grammars into sorted JSON tables used by this repository.

import fs from "node:fs";
import path from "node:path";

const sourceRoot = process.argv[2];
const outputRoot = process.argv[3] ?? "data";

if (!sourceRoot) {
  console.error(
    "usage: extract-textmate-data.mjs <vscode-ibmi-languages> [output-directory]",
  );
  process.exit(1);
}

// Load and parse one TextMate grammar from the source extension.
function readGrammar(name) {
  return JSON.parse(
    fs.readFileSync(path.join(sourceRoot, "syntaxes", name), "utf8"),
  );
}

// Extract literal alternatives and expand simple numeric ranges from a regex.
function alternationWords(pattern) {
  const groups = [
    ...pattern.matchAll(
      /\((?:\:)?([A-Z][A-Z0-9]*(?:\[[0-9]-[0-9]\])?(?:\|[A-Z][A-Z0-9]*(?:\[[0-9]-[0-9]\])?)+)\)/g,
    ),
  ];
  return groups.flatMap((match) =>
    match[1].split("|").flatMap((word) => {
      const range = word.match(/^([A-Z][A-Z0-9]*)\[([0-9])-([0-9])\]$/);
      if (!range) return word;
      const [, prefix, start, end] = range;
      return Array.from(
        { length: Number(end) - Number(start) + 1 },
        (_, index) => `${prefix}${Number(start) + index}`,
      );
    }),
  );
}

// Write a stable, duplicate-free keyword list and return its item count.
function writeJson(name, values) {
  const unique = [...new Set(values)].sort();
  fs.mkdirSync(outputRoot, { recursive: true });
  fs.writeFileSync(
    path.join(outputRoot, name),
    `${JSON.stringify(unique, null, 2)}\n`,
  );
  return unique.length;
}

const cl = readGrammar("cl.tmLanguage.json");
const clPatterns = cl.repository.keywords.patterns;
const clCommands = clPatterns
  .slice(2, 24)
  .flatMap((entry) => alternationWords(entry.match));

const counts = {
  "cl-commands.json": writeJson("cl-commands.json", clCommands),
};

for (const dialect of ["pf", "lf", "dspf", "prtf", "icff"]) {
  const grammar = readGrammar(`dds.${dialect}.tmLanguage.json`);
  const patterns = grammar.repository.keywords.patterns.filter((entry) =>
    entry.name?.endsWith(".funcs"),
  );
  const keywords = patterns.flatMap((entry) => alternationWords(entry.match));
  counts[`dds-${dialect}-keywords.json`] = writeJson(
    `dds-${dialect}-keywords.json`,
    keywords,
  );
}

const pnlgrp = readGrammar("pnlgrp.tmLanguage.json");
const terminalTagPatterns = pnlgrp.repository.tags.patterns.slice(-7);
const pnlgrpTags = terminalTagPatterns.flatMap((entry) =>
  alternationWords(entry.match),
);
counts["pnlgrp-tags.json"] = writeJson("pnlgrp-tags.json", pnlgrpTags);

for (const [name, count] of Object.entries(counts)) {
  console.log(`${name}: ${count}`);
}
