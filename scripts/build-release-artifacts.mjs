#!/usr/bin/env node

// Builds versioned C-source archives for a tagged GitHub release.

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = path.resolve(import.meta.dirname, "..");
const version = process.argv[2];
if (!/^v\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(version ?? "")) {
  throw new Error("usage: build-release-artifacts.mjs v<major>.<minor>.<patch>");
}

const config = JSON.parse(await readFile(path.join(root, "tree-sitter.json"), "utf8"));
const output = path.join(root, "dist");
const staging = path.join(output, "staging");
const archives = [];

await rm(output, { recursive: true, force: true });
await mkdir(staging, { recursive: true });

// Converts a grammar's repository path into its release archive name.
function parserId(parser) {
  return parser.path.replace(/^grammars\//, "").replaceAll("/", "-");
}

// Produces metadata whose paths are valid inside a standalone parser archive.
function parserConfig(parser) {
  const local = { ...parser, path: "." };
  for (const query of ["highlights", "injections", "locals", "tags", "folds", "indents"]) {
    if (local[query]) local[query] = path.relative(parser.path, local[query]);
  }
  return {
    grammars: [local],
    metadata: { ...config.metadata, version: version.slice(1) },
    bindings: { c: true, node: false, python: false, rust: false, swift: false, go: false },
  };
}

// Creates a reproducible gzip-compressed tar archive from one staged directory.
function archiveDirectory(directory, archive) {
  execFileSync("tar", [
    "--sort=name",
    "--mtime=UTC 1970-01-01",
    "--owner=0",
    "--group=0",
    "--numeric-owner",
    "-czf", archive,
    "-C", staging,
    directory,
  ]);
}

for (const parser of config.grammars) {
  const id = parserId(parser);
  const directory = `tree-sitter-ibmi-${id}`;
  const destination = path.join(staging, directory);
  await mkdir(destination, { recursive: true });
  await cp(path.join(root, parser.path, "src"), path.join(destination, "src"), { recursive: true });
  await cp(path.join(root, parser.path, "queries"), path.join(destination, "queries"), { recursive: true });
  await cp(path.join(root, "LICENSE"), path.join(destination, "LICENSE"));
  await writeFile(
    path.join(destination, "tree-sitter.json"),
    `${JSON.stringify(parserConfig(parser), null, 2)}\n`,
  );

  const archive = path.join(output, `${directory}-${version}.tar.gz`);
  archiveDirectory(directory, archive);
  archives.push(archive);
}

const combined = path.join(output, `treesitter-ibmi-${version}.tar.gz`);
execFileSync("tar", [
  "--sort=name",
  "--mtime=UTC 1970-01-01",
  "--owner=0",
  "--group=0",
  "--numeric-owner",
  "-czf", combined,
  "-C", staging,
  ...config.grammars.map((parser) => `tree-sitter-ibmi-${parserId(parser)}`),
]);
archives.push(combined);

const checksums = [];
for (const archive of archives.sort()) {
  const digest = createHash("sha256").update(await readFile(archive)).digest("hex");
  checksums.push(`${digest}  ${path.basename(archive)}`);
}
await writeFile(path.join(output, "SHA256SUMS"), `${checksums.join("\n")}\n`);
await rm(staging, { recursive: true, force: true });

console.log(`Built ${archives.length} release archives for ${version}.`);
