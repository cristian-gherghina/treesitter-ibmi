#!/usr/bin/env node

// Run full-fixture and language-specific coverage checks for one parser.

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "..");
const cli = path.join(repoRoot, "node_modules", "tree-sitter-cli", "cli.js");
const parser = process.argv[2];
const ddsDialect = parser?.startsWith("dds-") ? parser.slice(4) : null;
const rpgleFixtureDirs = {
  rpgle: "fully-free",
  "rpgle-free": "free",
  "rpgle-fixed": "fixed",
  "rpgle-mixed": "mixed",
};
const grammar = ddsDialect
  ? path.join(repoRoot, "grammars", "dds", ddsDialect)
  : path.join(repoRoot, "grammars", parser?.startsWith("rpgle") ? "rpgle" : parser ?? "");
const fixtureRoot = parser?.startsWith("rpgle")
  ? path.join(repoRoot, "fixtures", "rpgle", rpgleFixtureDirs[parser] ?? "")
  : path.join(repoRoot, "fixtures", parser === "rpg400" ? "rpg" : parser ?? "");
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

// Extract SQL between fixed-form C/EXEC SQL and C/END-EXEC directives.
function fixedSqlStatements(source) {
  const statements = [];
  let current = null;
  for (const line of source.split(/\r?\n/)) {
    if (/^.{5}[Cc]\/EXEC\s+SQL\b/i.test(line)) {
      current = [line.slice(15, 80)];
    } else if (current && /^.{5}[Cc]\+/.test(line)) {
      current.push(line.slice(7, 80));
    } else if (current && /^.{5}[A-Za-z ]\*/.test(line)) {
      continue;
    } else if (current && /^.{5}[Cc]\/END-EXEC\b/i.test(line)) {
      statements.push(current.join("\n"));
      current = null;
    }
  }
  return statements;
}

// Extract free-form SQL bodies beginning with EXEC SQL and ending at semicolon.
function freeSqlStatements(source) {
  const statements = [];
  const lines = source.split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(/^\s*exec\s+sql\b(.*)$/i);
    if (!match) continue;
    const body = [match[1]];
    while (!body.join("\n").includes(";") && index + 1 < lines.length) {
      body.push(lines[index += 1]);
    }
    const joined = body.join("\n");
    statements.push(joined.slice(0, joined.indexOf(";")));
  }
  return statements;
}

// Extract reference-format COBOL EXEC SQL bodies and omit COBOL comment lines.
function cobolSqlStatements(source) {
  const content = source.split(/\r?\n/)
    .filter((line) => line[6] !== "*" && line[6] !== "/")
    .map((line) => line.slice(7, 72))
    .join("\n");
  return [...content.matchAll(/\bEXEC\s+SQL\b([\s\S]*?)\bEND-EXEC\b/gi)]
    .map((match) => match[1].trim());
}

const fixtureNames = fs
  .readdirSync(fixtureRoot)
  .filter((name) => fs.statSync(path.join(fixtureRoot, name)).isFile())
  .filter((name) => !parser?.startsWith("rpgle") || /\.(rpgle|rpgleinc|sqlrpgle)$/.test(name))
  .sort();

// Db2 coverage extracts embedded statements from every SQLRPGLE source layout.
if (parser === "db2i-rpgle") {
  const rpgleRoot = path.join(repoRoot, "fixtures", "rpgle");
  const sources = fs.readdirSync(rpgleRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((entry) => fs.readdirSync(path.join(rpgleRoot, entry.name))
      .filter((name) => name.endsWith(".sqlrpgle"))
      .map((name) => path.join(rpgleRoot, entry.name, name)))
    .sort();
  const outputRoot = path.join(cacheRoot, "db2i-rpgle-fixtures");
  fs.rmSync(outputRoot, { recursive: true, force: true });
  fs.mkdirSync(outputRoot, { recursive: true });

  const outputs = [];
  for (const sourcePath of sources) {
    const source = fs.readFileSync(sourcePath, "utf8");
    const statements = [...fixedSqlStatements(source), ...freeSqlStatements(source)];
    statements.forEach((statement, index) => {
      const relative = path.relative(rpgleRoot, sourcePath).replaceAll(path.sep, "-");
      const output = path.join(outputRoot, `${relative}-${index + 1}.sql`);
      fs.writeFileSync(output, `${statement.trim()}\n`);
      outputs.push(output);
    });
  }

  run(["parse", "-p", grammar, ...outputs, "--quiet"]);
  console.log(`Db2 for i SQL fixtures: ${sources.length} SQLRPGLE files; statements: ${outputs.length}`);
// DDS includes expected failures, incremental edits, and keyword coverage.
} else if (ddsDialect) {
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

  // SQL COBOL bodies must also parse with this repository's Db2 for i grammar.
  let cobolSqlCount = 0;
  if (parser === "cobol") {
    const outputRoot = path.join(cacheRoot, "cobol-sql-fixtures");
    fs.rmSync(outputRoot, { recursive: true, force: true });
    fs.mkdirSync(outputRoot, { recursive: true });
    const outputs = [];
    for (const name of fixtureNames.filter((value) => value.includes("sqlcbl"))) {
      const source = fs.readFileSync(path.join(fixtureRoot, name), "utf8");
      cobolSqlStatements(source).forEach((statement, index) => {
        const output = path.join(outputRoot, `${name}-${index + 1}.sql`);
        fs.writeFileSync(output, `${statement}\n`);
        outputs.push(output);
      });
    }
    run(["parse", "-p", path.join(repoRoot, "grammars", "db2i-cobol"), ...outputs, "--quiet"]);
    cobolSqlCount = outputs.length;
  }

  let rpg400SqlCount = 0;
  let rpg400ColumnChecks = 0;
  if (parser === "rpg400") {
    const outputRoot = path.join(cacheRoot, "rpg400-sql-fixtures");
    fs.rmSync(outputRoot, { recursive: true, force: true });
    fs.mkdirSync(outputRoot, { recursive: true });
    const outputs = [];
    for (const name of fixtureNames.filter((value) => value.endsWith(".sqlrpg"))) {
      const source = fs.readFileSync(path.join(fixtureRoot, name), "utf8");
      fixedSqlStatements(source).forEach((statement, index) => {
        const output = path.join(outputRoot, `${name}-${index + 1}.sql`);
        fs.writeFileSync(output, `${statement.trim()}\n`);
        outputs.push(output);
      });
    }
    run(["parse", "-p", path.join(repoRoot, "grammars", "db2i-rpg400"), ...outputs, "--quiet"]);
    rpg400SqlCount = outputs.length;

    const columnsFixture = path.join(fixtureRoot, "columns.rpg");
    const originalTree = run(["parse", "-p", grammar, columnsFixture]);
    if (!originalTree.includes("control_specification") || !originalTree.includes("embedded_sql_statement")) {
      throw new Error("RPG/400 column fixture is missing expected structural nodes");
    }
    const columnSource = fs.readFileSync(columnsFixture, "utf8");
    const columnLines = columnSource.split(/\r?\n/);
    const variants = path.join(cacheRoot, "rpg400-column-checks");
    fs.rmSync(variants, { recursive: true, force: true });
    fs.mkdirSync(variants, { recursive: true });

    const invalidFormPath = path.join(variants, "invalid-form.rpg");
    const invalidFormLines = [...columnLines];
    invalidFormLines[0] = `${invalidFormLines[0].slice(0, 5)}X${invalidFormLines[0].slice(6)}`;
    fs.writeFileSync(invalidFormPath, invalidFormLines.join("\n"));
    const invalidForm = run(["parse", "-p", grammar, invalidFormPath]);
    if (invalidForm.includes("control_specification")) {
      throw new Error("RPG/400 form type outside H in column 6 should not remain a control specification");
    }
    const invalidSqlPath = path.join(variants, "invalid-sql-marker.rpg");
    const invalidSqlLines = [...columnLines];
    invalidSqlLines[1] = `${invalidSqlLines[1].slice(0, 6)}X${invalidSqlLines[1].slice(7)}`;
    fs.writeFileSync(invalidSqlPath, invalidSqlLines.join("\n"));
    const invalidSqlMarker = run(["parse", "-p", grammar, invalidSqlPath]);
    if (invalidSqlMarker.includes("embedded_sql_statement")) {
      throw new Error("RPG/400 SQL slash removed from column 7 should not remain embedded SQL");
    }
    const tailPath = path.join(variants, "tail.rpg");
    const tailLines = [...columnLines];
    tailLines[5] = `${tailLines[5].padEnd(80)}X`;
    fs.writeFileSync(tailPath, tailLines.join("\n"));
    run(["parse", "-p", grammar, tailPath, "--quiet"]);
    rpg400ColumnChecks = 3;
  }

  // Fixed RPGLE must continue to recognize the form type specifically in column 6.
  if (parser === "rpgle-fixed") {
    const source = path.join(fixtureRoot, "control.rpgle");
    if (run(["parse", "-p", grammar, source, "--quiet", "--edits", "17,5 1 X"], true) !== null) {
      throw new Error("invalid fixed-form type in column 6 should fail");
    }
    if (run(["parse", "-p", grammar, source, "--quiet", "--edits", "17,5 1 h"], true) === null) {
      throw new Error("lowercase fixed-form type in column 6 should pass");
    }
  }

  // CL additionally verifies that parser generation retained its command table.
  if (parser === "cl") {
    const commands = JSON.parse(fs.readFileSync(path.join(repoRoot, "data", "cl-commands.json"), "utf8"));
    const generated = fs.readFileSync(path.join(grammar, "src", "grammar.json"), "utf8");
    const missing = commands.filter((command) => !generated.includes(`"value": "${command}"`));
    if (missing.length > 0) throw new Error(`generated commands missing: ${missing.join(", ")}`);
    console.log(`CL fixtures: ${fixtureNames.length}; generated commands: ${commands.length}`);
  } else {
    const labels = { bnd: "Binder", mi: "MI", cmd: "CMD", pnlgrp: "PNLGRP", cobol: "ILE COBOL/COBOL/400", rpg400: "RPG/400 and RPG III", rpgle: "RPGLE fully-free", "rpgle-free": "RPGLE column-limited free", "rpgle-fixed": "RPGLE fixed-form", "rpgle-mixed": "RPGLE mixed-format" };
    const suffix = parser === "rpgle-fixed" ? "; column edits: 2" : "";
    const sqlSuffix = parser === "cobol" ? `; SQL statements: ${cobolSqlCount}` : "";
    const rpg400Suffix = parser === "rpg400" ? `; SQL statements: ${rpg400SqlCount}; column checks: ${rpg400ColumnChecks}` : "";
    console.log(`${labels[parser] ?? parser} fixtures: ${fixtureNames.length}${suffix}${sqlSuffix}${rpg400Suffix}`);
  }
}
