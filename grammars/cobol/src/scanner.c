#include "tree_sitter/parser.h"

#include <stdbool.h>
#include <stdint.h>

enum TokenType {
  FIXED_PREFIX,
  FIXED_CONTINUATION,
  FIXED_COMMENT,
  FIXED_IGNORED_TAIL,
  FIXED_WHITESPACE,
};

static bool at_line_end(TSLexer *lexer) {
  return lexer->lookahead == '\n' || lexer->lookahead == '\r' || lexer->eof(lexer);
}

static void consume_line(TSLexer *lexer) {
  while (!at_line_end(lexer)) lexer->advance(lexer, false);
  lexer->mark_end(lexer);
}

void *tree_sitter_ibmi_cobol_external_scanner_create(void) { return NULL; }
void tree_sitter_ibmi_cobol_external_scanner_destroy(void *payload) { (void)payload; }
unsigned tree_sitter_ibmi_cobol_external_scanner_serialize(void *payload, char *buffer) {
  (void)payload;
  (void)buffer;
  return 0;
}
void tree_sitter_ibmi_cobol_external_scanner_deserialize(void *payload,
                                                          const char *buffer,
                                                          unsigned length) {
  (void)payload;
  (void)buffer;
  (void)length;
}

bool tree_sitter_ibmi_cobol_external_scanner_scan(void *payload,
                                                   TSLexer *lexer,
                                                   const bool *valid_symbols) {
  (void)payload;
  uint32_t column = lexer->get_column(lexer);

  if (valid_symbols[FIXED_WHITESPACE] &&
      (lexer->lookahead == '\n' || lexer->lookahead == '\r')) {
    if (lexer->lookahead == '\r') lexer->advance(lexer, true);
    if (lexer->lookahead == '\n') lexer->advance(lexer, true);
    lexer->mark_end(lexer);
    lexer->result_symbol = FIXED_WHITESPACE;
    return true;
  }

  if (column == 72 && valid_symbols[FIXED_IGNORED_TAIL] && !at_line_end(lexer)) {
    consume_line(lexer);
    lexer->result_symbol = FIXED_IGNORED_TAIL;
    return true;
  }

  if (column != 0 && valid_symbols[FIXED_WHITESPACE] &&
      (lexer->lookahead == ' ' || lexer->lookahead == '\t')) {
    while (lexer->lookahead == ' ' || lexer->lookahead == '\t')
      lexer->advance(lexer, true);
    lexer->mark_end(lexer);
    lexer->result_symbol = FIXED_WHITESPACE;
    return true;
  }

  if (column != 0 && column != 6) return false;
  if (column == 0) {
    for (uint32_t index = 0; index < 6; index++) {
      if (at_line_end(lexer)) {
        if (!valid_symbols[FIXED_WHITESPACE]) return false;
        lexer->mark_end(lexer);
        lexer->result_symbol = FIXED_WHITESPACE;
        return true;
      }
      lexer->advance(lexer, false);
    }
  }

  int32_t indicator = lexer->lookahead;
  if (at_line_end(lexer)) return false;
  lexer->advance(lexer, false);
  lexer->mark_end(lexer);

  if ((indicator == '*' || indicator == '/') && valid_symbols[FIXED_COMMENT]) {
    consume_line(lexer);
    lexer->result_symbol = FIXED_COMMENT;
    return true;
  }

  if (indicator == '-' && valid_symbols[FIXED_CONTINUATION]) {
    lexer->result_symbol = FIXED_CONTINUATION;
    return true;
  }
  if ((indicator == ' ' || indicator == 'D' || indicator == 'd') &&
      valid_symbols[FIXED_PREFIX]) {
    lexer->result_symbol = FIXED_PREFIX;
    return true;
  }

  return false;
}
