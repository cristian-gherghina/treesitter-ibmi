#include "tree_sitter/parser.h"

#include <stdbool.h>
#include <stdint.h>

enum TokenType {
  COMMENT_RECORD,
  DATA_RECORD,
  BLANK_LINE,
};

void *tree_sitter_dds_pf_external_scanner_create(void) { return NULL; }

void tree_sitter_dds_pf_external_scanner_destroy(void *payload) {
  (void)payload;
}

unsigned tree_sitter_dds_pf_external_scanner_serialize(void *payload,
                                                       char *buffer) {
  (void)payload;
  (void)buffer;
  return 0;
}

void tree_sitter_dds_pf_external_scanner_deserialize(void *payload,
                                                     const char *buffer,
                                                     unsigned length) {
  (void)payload;
  (void)buffer;
  (void)length;
}

static bool is_name_type(int32_t character) {
  return character == ' ' || character == 'R' || character == 'K';
}

static bool is_data_type(int32_t character) {
  switch (character) {
    case ' ':
    case 'P':
    case 'S':
    case 'B':
    case 'F':
    case 'A':
    case 'L':
    case 'T':
    case 'Z':
    case 'H':
    case 'J':
    case 'E':
    case 'O':
    case 'G':
    case '5':
      return true;
    default:
      return false;
  }
}

bool tree_sitter_dds_pf_external_scanner_scan(void *payload, TSLexer *lexer,
                                              const bool *valid_symbols) {
  (void)payload;

  if (lexer->get_column(lexer) != 0 || lexer->eof(lexer)) {
    return false;
  }

  if ((lexer->lookahead == '\n' || lexer->lookahead == '\r') &&
      valid_symbols[BLANK_LINE]) {
    if (lexer->lookahead == '\r') {
      lexer->advance(lexer, false);
    }
    if (lexer->lookahead == '\n') {
      lexer->advance(lexer, false);
    }
    lexer->mark_end(lexer);
    lexer->result_symbol = BLANK_LINE;
    return true;
  }

  int32_t form_type = 0;
  int32_t comment_marker = 0;
  int32_t name_type = ' ';
  int32_t data_type = ' ';
  int32_t usage = ' ';
  bool has_form_type = false;
  bool saw_tab = false;

  while (!lexer->eof(lexer) && lexer->lookahead != '\n' &&
         lexer->lookahead != '\r') {
    const uint32_t column = lexer->get_column(lexer);
    const int32_t character = lexer->lookahead;

    if (character == '\t') {
      saw_tab = true;
    }
    if (column == 5) {
      form_type = character;
      has_form_type = true;
    } else if (column == 6) {
      comment_marker = character;
    } else if (column == 16) {
      name_type = character;
    } else if (column == 34) {
      data_type = character;
    } else if (column == 37) {
      usage = character;
    }

    lexer->advance(lexer, false);
  }
  if (lexer->lookahead == '\r') {
    lexer->advance(lexer, false);
  }
  if (lexer->lookahead == '\n') {
    lexer->advance(lexer, false);
  }
  lexer->mark_end(lexer);

  if (saw_tab || !has_form_type) {
    return false;
  }

  if (comment_marker == '*' && valid_symbols[COMMENT_RECORD]) {
    lexer->result_symbol = COMMENT_RECORD;
    return true;
  }

  if (form_type == 'A' && is_name_type(name_type) &&
      is_data_type(data_type) && (usage == ' ' || usage == 'B') &&
      valid_symbols[DATA_RECORD]) {
    lexer->result_symbol = DATA_RECORD;
    return true;
  }

  return false;
}
