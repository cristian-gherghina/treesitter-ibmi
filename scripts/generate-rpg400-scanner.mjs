#!/usr/bin/env node

// Generate RPG/400 external field tokens directly from the tracked column chart.

import fs from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "..");
const columns = JSON.parse(fs.readFileSync(path.join(repoRoot, "data", "rpg3-cols.json"), "utf8"));
const fields = [];

function tokenName(form, label, occurrence) {
  const base = `${form.toLowerCase()}_${label.toLowerCase().replaceAll(/[^a-z0-9]+/g, "_").replaceAll(/^_|_$/g, "")}`;
  return occurrence > 1 ? `${base}_${occurrence}` : base;
}

for (const [form, definitions] of Object.entries(columns)) {
  const occurrences = new Map();
  for (const [start, end, label] of definitions) {
    const occurrence = (occurrences.get(label) ?? 0) + 1;
    occurrences.set(label, occurrence);
    fields.push({ form, start, end, token: tokenName(form, label, occurrence) });
  }
}

const enumFields = fields.map(({ token }) => `  ${token.toUpperCase()},`).join("\n");
const boundaryCases = fields.map(({ form, start, end, token }) => {
  if (start === 6) return "";
  return `  if (column == ${start - 1} && valid_symbols[${token.toUpperCase()}])\n    return emit_field(lexer, ${token.toUpperCase()}, ${end});`;
}).filter(Boolean).join("\n");
const formCases = fields.filter(({ start }) => start === 6)
  .map(({ form, token }) => `    case '${form}': symbol = ${token.toUpperCase()}; break;`)
  .join("\n");

const source = `#include "tree_sitter/parser.h"

#include <stdbool.h>
#include <stdint.h>
#include <string.h>

enum TokenType {
  COMMENT,
  COMPILER_DIRECTIVE,
  SQL_START,
  SQL_CONTINUATION,
  SQL_END,
  COMPILE_TIME_DATA,
  IGNORED_TAIL,
  FIXED_WHITESPACE,
${enumFields}
};

static bool at_line_end(TSLexer *lexer) {
  return lexer->lookahead == '\\n' || lexer->lookahead == '\\r' || lexer->eof(lexer);
}

static void consume_to_column(TSLexer *lexer, uint32_t limit) {
  while (!at_line_end(lexer) && lexer->get_column(lexer) < limit)
    lexer->advance(lexer, false);
  lexer->mark_end(lexer);
}

static bool emit_field(TSLexer *lexer, TSSymbol symbol, uint32_t end_column) {
  consume_to_column(lexer, end_column);
  lexer->result_symbol = symbol;
  return true;
}

void *tree_sitter_ibmi_rpg400_external_scanner_create(void) { return NULL; }
void tree_sitter_ibmi_rpg400_external_scanner_destroy(void *payload) { (void)payload; }
unsigned tree_sitter_ibmi_rpg400_external_scanner_serialize(void *payload, char *buffer) {
  (void)payload; (void)buffer; return 0;
}
void tree_sitter_ibmi_rpg400_external_scanner_deserialize(void *payload,
                                                           const char *buffer,
                                                           unsigned length) {
  (void)payload; (void)buffer; (void)length;
}

bool tree_sitter_ibmi_rpg400_external_scanner_scan(void *payload,
                                                    TSLexer *lexer,
                                                    const bool *valid_symbols) {
  (void)payload;
  uint32_t column = lexer->get_column(lexer);
  if (valid_symbols[FIXED_WHITESPACE] &&
      (lexer->lookahead == '\\n' || lexer->lookahead == '\\r')) {
    if (lexer->lookahead == '\\r') lexer->advance(lexer, true);
    if (lexer->lookahead == '\\n') lexer->advance(lexer, true);
    lexer->mark_end(lexer); lexer->result_symbol = FIXED_WHITESPACE; return true;
  }
  if (column == 80 && valid_symbols[IGNORED_TAIL] && !at_line_end(lexer))
    return emit_field(lexer, IGNORED_TAIL, UINT32_MAX);

  if (column == 0 && !at_line_end(lexer)) {
    char prefix[18] = {0};
    size_t length = 0;
    while (!at_line_end(lexer) && lexer->get_column(lexer) < 16) {
      int32_t character = lexer->lookahead;
      if (character >= 'a' && character <= 'z') character -= 'a' - 'A';
      if (length + 1 < sizeof(prefix)) prefix[length++] = (char)character;
      lexer->advance(lexer, false);
      if (lexer->get_column(lexer) == 6) lexer->mark_end(lexer);
    }
    char form = length > 5 ? prefix[5] : ' ';
    char indicator = length > 6 ? prefix[6] : ' ';

    if (indicator == '*' && valid_symbols[COMMENT]) {
      consume_to_column(lexer, 80); lexer->result_symbol = COMMENT; return true;
    }
    if (indicator == '/') {
      consume_to_column(lexer, 80);
      const char *directive = prefix + 6;
      TSSymbol symbol = COMPILER_DIRECTIVE;
      if (strncmp(directive, "/EXEC SQL", 9) == 0) symbol = SQL_START;
      else if (strncmp(directive, "/END-EXEC", 9) == 0) symbol = SQL_END;
      if (valid_symbols[symbol]) { lexer->result_symbol = symbol; return true; }
      return false;
    }
    if (indicator == '+' && form == 'C' && valid_symbols[SQL_CONTINUATION]) {
      consume_to_column(lexer, 80); lexer->result_symbol = SQL_CONTINUATION; return true;
    }

    TSSymbol symbol;
    switch (form) {
${formCases}
      default:
        if (!valid_symbols[COMPILE_TIME_DATA]) return false;
        consume_to_column(lexer, 80); lexer->result_symbol = COMPILE_TIME_DATA; return true;
    }
    if (!valid_symbols[symbol]) return false;
    lexer->result_symbol = symbol;
    return true;
  }

${boundaryCases}
  if (valid_symbols[FIXED_WHITESPACE] &&
      (lexer->lookahead == ' ' || lexer->lookahead == '\\t')) {
    while (lexer->lookahead == ' ' || lexer->lookahead == '\\t')
      lexer->advance(lexer, true);
    lexer->mark_end(lexer); lexer->result_symbol = FIXED_WHITESPACE; return true;
  }
  return false;
}
`;

fs.writeFileSync(path.join(repoRoot, "grammars", "rpg400", "src", "scanner.c"), source);
console.log(`RPG/400 scanner fields: ${fields.length}`);
