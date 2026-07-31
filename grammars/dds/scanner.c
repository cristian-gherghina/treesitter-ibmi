#include "tree_sitter/parser.h"

#include <stdbool.h>
#include <stdint.h>

enum TokenType {
  SEQUENCE,
  COMMENT_TEXT,
  TO_NAME_TYPE,
  TO_NAME,
  NAME,
  LENGTH,
  DECIMALS,
  TO_FUNCTIONS,
  IGNORED_TAIL,
  NEWLINE,
};

void *tree_sitter_dds_external_scanner_create(void) { return NULL; }

void tree_sitter_dds_external_scanner_destroy(void *payload) {
  (void)payload;
}

unsigned tree_sitter_dds_external_scanner_serialize(void *payload,
                                                   char *buffer) {
  (void)payload;
  (void)buffer;
  return 0;
}

void tree_sitter_dds_external_scanner_deserialize(void *payload,
                                                 const char *buffer,
                                                 unsigned length) {
  (void)payload;
  (void)buffer;
  (void)length;
}

static bool at_line_end(const TSLexer *lexer) {
  return lexer->eof(lexer) || lexer->lookahead == '\n' ||
         lexer->lookahead == '\r';
}

static void consume_to_column(TSLexer *lexer, uint32_t end_column) {
  while (!at_line_end(lexer) && lexer->get_column(lexer) < end_column) {
    if (lexer->lookahead == '\t') {
      break;
    }
    lexer->advance(lexer, false);
  }
  lexer->mark_end(lexer);
}

static bool emit_fixed_field(TSLexer *lexer, TSSymbol symbol,
                             uint32_t end_column) {
  if (at_line_end(lexer)) {
    return false;
  }
  consume_to_column(lexer, end_column);
  lexer->result_symbol = symbol;
  return true;
}

bool tree_sitter_dds_external_scanner_scan(void *payload, TSLexer *lexer,
                                          const bool *valid_symbols) {
  (void)payload;

  const uint32_t column = lexer->get_column(lexer);

  if (valid_symbols[NEWLINE] &&
      (lexer->lookahead == '\n' || lexer->lookahead == '\r')) {
    if (lexer->lookahead == '\r') {
      lexer->advance(lexer, false);
    }
    if (lexer->lookahead == '\n') {
      lexer->advance(lexer, false);
    }
    lexer->mark_end(lexer);
    lexer->result_symbol = NEWLINE;
    return true;
  }

  if (valid_symbols[SEQUENCE] && column == 0) {
    return emit_fixed_field(lexer, SEQUENCE, 5);
  }
  if (valid_symbols[COMMENT_TEXT] && column == 6 &&
      lexer->lookahead == '*') {
    consume_to_column(lexer, UINT32_MAX);
    lexer->result_symbol = COMMENT_TEXT;
    return true;
  }
  if (valid_symbols[TO_NAME_TYPE] && column == 6) {
    return emit_fixed_field(lexer, TO_NAME_TYPE, 16);
  }
  if (valid_symbols[TO_NAME] && column == 17) {
    return emit_fixed_field(lexer, TO_NAME, 18);
  }
  if (valid_symbols[NAME] && column == 18) {
    return emit_fixed_field(lexer, NAME, 28);
  }
  if (valid_symbols[LENGTH] && column == 29) {
    return emit_fixed_field(lexer, LENGTH, 34);
  }
  if (valid_symbols[DECIMALS] && column == 35) {
    return emit_fixed_field(lexer, DECIMALS, 37);
  }
  if (valid_symbols[TO_FUNCTIONS] && column == 38) {
    return emit_fixed_field(lexer, TO_FUNCTIONS, 44);
  }
  if (valid_symbols[IGNORED_TAIL] && column == 80) {
    consume_to_column(lexer, UINT32_MAX);
    lexer->result_symbol = IGNORED_TAIL;
    return true;
  }

  return false;
}
