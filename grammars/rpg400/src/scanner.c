#include "tree_sitter/parser.h"

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
  H_FORM_TYPE,
  H_RESERVED,
  H_DEBUG,
  H_RESERVED_2,
  H_CURRENCY_SYMBOL,
  H_DATE_FORMAT,
  H_DATE_EDIT,
  H_DECIMAL_NOTATION,
  H_RESERVED_3,
  H_ALTERNATE_COLLATING_SEQUENCE,
  H_RESERVED_4,
  H_SIGN_HANDLING,
  H_FORMS_ALIGNMENT,
  H_RESERVED_5,
  H_FILE_TRANSLATION,
  H_RESERVED_6,
  H_TRANSPARENCY_CHECK,
  H_RESERVED_7,
  H_PROGRAM_IDENTIFICATION,
  F_FORM_TYPE,
  F_FILE_NAME,
  F_FILE_TYPE,
  F_FILE_DESIGNATION,
  F_END_OF_FILE,
  F_SEQUENCE,
  F_FILE_FORMAT,
  F_RESERVED,
  F_RECORD_LENGTH,
  F_LIMITS_PROCESSING,
  F_LENGTH_OF_KEY_OR_RECORD_ADDRESS,
  F_RECORD_ADDRESS_TYPE,
  F_FILE_ORGANIZATION,
  F_OVERFLOW_INDICATOR,
  F_KEY_FIELD_STARTING_LOCATION,
  F_EXTENSION_CODE,
  F_DEVICE,
  F_RESERVED_2,
  F_CONTINUATION_LINES,
  F_ROUTINE,
  F_RESERVED_3,
  F_FILE_ADDITION,
  F_RESERVED_4,
  F_FILE_CONDITION,
  F_RESERVED_5,
  F_COMMENTS,
  E_FORM_TYPE,
  E_RESERVED,
  E_FROM_FILE_NAME,
  E_TO_FILE_NAME,
  E_ARRAY_OR_TABLE_NAME,
  E_ENTRIES_PER_RECORD,
  E_ENTRIES_PER_ARRAY_OR_TABLE,
  E_LENGTH_OF_ENTRY,
  E_DATA_FORMAT,
  E_DECIMAL_POSITIONS,
  E_SEQUENCE,
  E_SECOND_ARRAY_DESCRIPTION,
  E_COMMENTS,
  E_COMMENTS_2,
  L_FORM_TYPE,
  L_FILE_NAME,
  L_LINES_PER_PAGE,
  L_FORM_LENGTH,
  L_OVERFLOW_LINE_NUMBER,
  L_OVERFLOW_LINE,
  L_RESERVED,
  L_COMMENTS,
  I_FORM_TYPE,
  I_FILE_NAME,
  I_LOGICAL_RELATIONSHIP,
  I_SEQUENCE,
  I_NUMBER,
  I_OPTION,
  I_RECORD_IDENTIFYING_INDICATOR_OR,
  I_RECORD_IDENTIFICATION_CODES,
  I_RESERVED,
  I_DATA_FORMAT,
  I_FIELD_LOCATION,
  I_DECIMAL_POSITIONS,
  I_FIELD_NAME,
  I_CONTROL_LEVEL,
  I_MATCHING_FIELDS,
  I_FIELD_RECORD_RELATION,
  I_FIELD_INDICATORS,
  I_RESERVED_2,
  I_COMMENTS,
  I_RECORD_NAME,
  I_RESERVED_3,
  I_RECORD_IDENTIFYING_INDICATOR,
  I_RECORD_IDENTIFICATION_CODE,
  I_RESERVED_4,
  I_RESERVED_5,
  I_EXTERNAL_FIELD_NAME,
  I_RESERVED_6,
  I_RESERVED_7,
  I_DATA_STRUCTURE_NAME,
  I_RESERVED_8,
  I_EXTERNAL_DESCRIPTION,
  I_EXTERNAL_FILE_NAME,
  I_RESERVED_9,
  I_DATA_STRUCTURE_OCCURRENCES,
  I_LENGTH,
  I_RESERVED_10,
  I_RESERVED_11,
  I_INITIALIZATION_OPTION,
  I_RESERVED_12,
  I_INITIALIZATION_VALUE,
  I_RESERVED_13,
  I_INTERNAL_DATA_FORMAT,
  I_RESERVED_14,
  I_CONSTANT,
  I_DATA_TYPE,
  I_RESERVED_15,
  I_CONSTANT_NAME,
  I_RESERVED_16,
  C_FORM_TYPE,
  C_CONTROL_LEVEL,
  C_INDICATORS,
  C_FACTOR_1,
  C_OPERATION,
  C_FACTOR_2,
  C_RESULT_FIELD,
  C_FIELD_LENGTH,
  C_DECIMAL_POSITIONS,
  C_OPERATION_EXTENDER,
  C_RESULTING_INDICATORS,
  C_COMMENTS,
  C_COMMENTS_2,
  O_FORM_TYPE,
  O_FILE_NAME,
  O_LOGICAL_RELATIONSHIP,
  O_TYPE,
  O_RECORD_ADDITION_DELETION,
  O_FETCH_OVERFLOW_RELEASE,
  O_SPACE_AND_SKIP,
  O_SPACE_BEFORE,
  O_SPACE_AFTER,
  O_SKIP_BEFORE,
  O_SKIP_AFTER,
  O_OUTPUT_INDICATORS,
  O_EXCPT_NAME,
  O_FIELD_NAME,
  O_EDIT_CODES,
  O_BLANK_AFTER,
  O_END_POSITION,
  O_DATA_FORMAT,
  O_CONSTANT_OR_EDIT_WORD,
  O_RESERVED,
  O_COMMENTS,
  O_RECORD_NAME,
  O_RELEASE,
  O_RECORD_ADDITION,
  O_FETCH_OVERFLOW_SPACE_SKIP,
};

static bool at_line_end(TSLexer *lexer) {
  return lexer->lookahead == '\n' || lexer->lookahead == '\r' || lexer->eof(lexer);
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
      (lexer->lookahead == '\n' || lexer->lookahead == '\r')) {
    if (lexer->lookahead == '\r') lexer->advance(lexer, true);
    if (lexer->lookahead == '\n') lexer->advance(lexer, true);
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
    case 'H': symbol = H_FORM_TYPE; break;
    case 'F': symbol = F_FORM_TYPE; break;
    case 'E': symbol = E_FORM_TYPE; break;
    case 'L': symbol = L_FORM_TYPE; break;
    case 'I': symbol = I_FORM_TYPE; break;
    case 'C': symbol = C_FORM_TYPE; break;
    case 'O': symbol = O_FORM_TYPE; break;
      default:
        if (!valid_symbols[COMPILE_TIME_DATA]) return false;
        consume_to_column(lexer, 80); lexer->result_symbol = COMPILE_TIME_DATA; return true;
    }
    if (!valid_symbols[symbol]) return false;
    lexer->result_symbol = symbol;
    return true;
  }

  if (column == 6 && valid_symbols[H_RESERVED])
    return emit_field(lexer, H_RESERVED, 14);
  if (column == 14 && valid_symbols[H_DEBUG])
    return emit_field(lexer, H_DEBUG, 15);
  if (column == 15 && valid_symbols[H_RESERVED_2])
    return emit_field(lexer, H_RESERVED_2, 17);
  if (column == 17 && valid_symbols[H_CURRENCY_SYMBOL])
    return emit_field(lexer, H_CURRENCY_SYMBOL, 18);
  if (column == 18 && valid_symbols[H_DATE_FORMAT])
    return emit_field(lexer, H_DATE_FORMAT, 19);
  if (column == 19 && valid_symbols[H_DATE_EDIT])
    return emit_field(lexer, H_DATE_EDIT, 20);
  if (column == 20 && valid_symbols[H_DECIMAL_NOTATION])
    return emit_field(lexer, H_DECIMAL_NOTATION, 21);
  if (column == 21 && valid_symbols[H_RESERVED_3])
    return emit_field(lexer, H_RESERVED_3, 25);
  if (column == 25 && valid_symbols[H_ALTERNATE_COLLATING_SEQUENCE])
    return emit_field(lexer, H_ALTERNATE_COLLATING_SEQUENCE, 26);
  if (column == 26 && valid_symbols[H_RESERVED_4])
    return emit_field(lexer, H_RESERVED_4, 39);
  if (column == 39 && valid_symbols[H_SIGN_HANDLING])
    return emit_field(lexer, H_SIGN_HANDLING, 40);
  if (column == 40 && valid_symbols[H_FORMS_ALIGNMENT])
    return emit_field(lexer, H_FORMS_ALIGNMENT, 41);
  if (column == 41 && valid_symbols[H_RESERVED_5])
    return emit_field(lexer, H_RESERVED_5, 42);
  if (column == 42 && valid_symbols[H_FILE_TRANSLATION])
    return emit_field(lexer, H_FILE_TRANSLATION, 43);
  if (column == 43 && valid_symbols[H_RESERVED_6])
    return emit_field(lexer, H_RESERVED_6, 56);
  if (column == 56 && valid_symbols[H_TRANSPARENCY_CHECK])
    return emit_field(lexer, H_TRANSPARENCY_CHECK, 57);
  if (column == 57 && valid_symbols[H_RESERVED_7])
    return emit_field(lexer, H_RESERVED_7, 74);
  if (column == 74 && valid_symbols[H_PROGRAM_IDENTIFICATION])
    return emit_field(lexer, H_PROGRAM_IDENTIFICATION, 80);
  if (column == 6 && valid_symbols[F_FILE_NAME])
    return emit_field(lexer, F_FILE_NAME, 14);
  if (column == 14 && valid_symbols[F_FILE_TYPE])
    return emit_field(lexer, F_FILE_TYPE, 15);
  if (column == 15 && valid_symbols[F_FILE_DESIGNATION])
    return emit_field(lexer, F_FILE_DESIGNATION, 16);
  if (column == 16 && valid_symbols[F_END_OF_FILE])
    return emit_field(lexer, F_END_OF_FILE, 17);
  if (column == 17 && valid_symbols[F_SEQUENCE])
    return emit_field(lexer, F_SEQUENCE, 18);
  if (column == 18 && valid_symbols[F_FILE_FORMAT])
    return emit_field(lexer, F_FILE_FORMAT, 19);
  if (column == 19 && valid_symbols[F_RESERVED])
    return emit_field(lexer, F_RESERVED, 23);
  if (column == 23 && valid_symbols[F_RECORD_LENGTH])
    return emit_field(lexer, F_RECORD_LENGTH, 27);
  if (column == 27 && valid_symbols[F_LIMITS_PROCESSING])
    return emit_field(lexer, F_LIMITS_PROCESSING, 28);
  if (column == 28 && valid_symbols[F_LENGTH_OF_KEY_OR_RECORD_ADDRESS])
    return emit_field(lexer, F_LENGTH_OF_KEY_OR_RECORD_ADDRESS, 30);
  if (column == 30 && valid_symbols[F_RECORD_ADDRESS_TYPE])
    return emit_field(lexer, F_RECORD_ADDRESS_TYPE, 31);
  if (column == 31 && valid_symbols[F_FILE_ORGANIZATION])
    return emit_field(lexer, F_FILE_ORGANIZATION, 32);
  if (column == 32 && valid_symbols[F_OVERFLOW_INDICATOR])
    return emit_field(lexer, F_OVERFLOW_INDICATOR, 34);
  if (column == 34 && valid_symbols[F_KEY_FIELD_STARTING_LOCATION])
    return emit_field(lexer, F_KEY_FIELD_STARTING_LOCATION, 38);
  if (column == 38 && valid_symbols[F_EXTENSION_CODE])
    return emit_field(lexer, F_EXTENSION_CODE, 39);
  if (column == 39 && valid_symbols[F_DEVICE])
    return emit_field(lexer, F_DEVICE, 46);
  if (column == 46 && valid_symbols[F_RESERVED_2])
    return emit_field(lexer, F_RESERVED_2, 52);
  if (column == 52 && valid_symbols[F_CONTINUATION_LINES])
    return emit_field(lexer, F_CONTINUATION_LINES, 53);
  if (column == 53 && valid_symbols[F_ROUTINE])
    return emit_field(lexer, F_ROUTINE, 59);
  if (column == 59 && valid_symbols[F_RESERVED_3])
    return emit_field(lexer, F_RESERVED_3, 65);
  if (column == 65 && valid_symbols[F_FILE_ADDITION])
    return emit_field(lexer, F_FILE_ADDITION, 66);
  if (column == 66 && valid_symbols[F_RESERVED_4])
    return emit_field(lexer, F_RESERVED_4, 70);
  if (column == 70 && valid_symbols[F_FILE_CONDITION])
    return emit_field(lexer, F_FILE_CONDITION, 72);
  if (column == 72 && valid_symbols[F_RESERVED_5])
    return emit_field(lexer, F_RESERVED_5, 74);
  if (column == 74 && valid_symbols[F_COMMENTS])
    return emit_field(lexer, F_COMMENTS, 80);
  if (column == 6 && valid_symbols[E_RESERVED])
    return emit_field(lexer, E_RESERVED, 10);
  if (column == 10 && valid_symbols[E_FROM_FILE_NAME])
    return emit_field(lexer, E_FROM_FILE_NAME, 18);
  if (column == 18 && valid_symbols[E_TO_FILE_NAME])
    return emit_field(lexer, E_TO_FILE_NAME, 26);
  if (column == 26 && valid_symbols[E_ARRAY_OR_TABLE_NAME])
    return emit_field(lexer, E_ARRAY_OR_TABLE_NAME, 32);
  if (column == 32 && valid_symbols[E_ENTRIES_PER_RECORD])
    return emit_field(lexer, E_ENTRIES_PER_RECORD, 35);
  if (column == 35 && valid_symbols[E_ENTRIES_PER_ARRAY_OR_TABLE])
    return emit_field(lexer, E_ENTRIES_PER_ARRAY_OR_TABLE, 39);
  if (column == 39 && valid_symbols[E_LENGTH_OF_ENTRY])
    return emit_field(lexer, E_LENGTH_OF_ENTRY, 42);
  if (column == 42 && valid_symbols[E_DATA_FORMAT])
    return emit_field(lexer, E_DATA_FORMAT, 43);
  if (column == 43 && valid_symbols[E_DECIMAL_POSITIONS])
    return emit_field(lexer, E_DECIMAL_POSITIONS, 44);
  if (column == 44 && valid_symbols[E_SEQUENCE])
    return emit_field(lexer, E_SEQUENCE, 45);
  if (column == 45 && valid_symbols[E_SECOND_ARRAY_DESCRIPTION])
    return emit_field(lexer, E_SECOND_ARRAY_DESCRIPTION, 57);
  if (column == 57 && valid_symbols[E_COMMENTS])
    return emit_field(lexer, E_COMMENTS, 74);
  if (column == 74 && valid_symbols[E_COMMENTS_2])
    return emit_field(lexer, E_COMMENTS_2, 80);
  if (column == 6 && valid_symbols[L_FILE_NAME])
    return emit_field(lexer, L_FILE_NAME, 14);
  if (column == 14 && valid_symbols[L_LINES_PER_PAGE])
    return emit_field(lexer, L_LINES_PER_PAGE, 17);
  if (column == 17 && valid_symbols[L_FORM_LENGTH])
    return emit_field(lexer, L_FORM_LENGTH, 19);
  if (column == 19 && valid_symbols[L_OVERFLOW_LINE_NUMBER])
    return emit_field(lexer, L_OVERFLOW_LINE_NUMBER, 22);
  if (column == 22 && valid_symbols[L_OVERFLOW_LINE])
    return emit_field(lexer, L_OVERFLOW_LINE, 24);
  if (column == 24 && valid_symbols[L_RESERVED])
    return emit_field(lexer, L_RESERVED, 74);
  if (column == 74 && valid_symbols[L_COMMENTS])
    return emit_field(lexer, L_COMMENTS, 80);
  if (column == 6 && valid_symbols[I_FILE_NAME])
    return emit_field(lexer, I_FILE_NAME, 14);
  if (column == 13 && valid_symbols[I_LOGICAL_RELATIONSHIP])
    return emit_field(lexer, I_LOGICAL_RELATIONSHIP, 16);
  if (column == 14 && valid_symbols[I_SEQUENCE])
    return emit_field(lexer, I_SEQUENCE, 16);
  if (column == 16 && valid_symbols[I_NUMBER])
    return emit_field(lexer, I_NUMBER, 17);
  if (column == 17 && valid_symbols[I_OPTION])
    return emit_field(lexer, I_OPTION, 18);
  if (column == 18 && valid_symbols[I_RECORD_IDENTIFYING_INDICATOR_OR])
    return emit_field(lexer, I_RECORD_IDENTIFYING_INDICATOR_OR, 20);
  if (column == 20 && valid_symbols[I_RECORD_IDENTIFICATION_CODES])
    return emit_field(lexer, I_RECORD_IDENTIFICATION_CODES, 41);
  if (column == 41 && valid_symbols[I_RESERVED])
    return emit_field(lexer, I_RESERVED, 42);
  if (column == 42 && valid_symbols[I_DATA_FORMAT])
    return emit_field(lexer, I_DATA_FORMAT, 43);
  if (column == 43 && valid_symbols[I_FIELD_LOCATION])
    return emit_field(lexer, I_FIELD_LOCATION, 51);
  if (column == 51 && valid_symbols[I_DECIMAL_POSITIONS])
    return emit_field(lexer, I_DECIMAL_POSITIONS, 52);
  if (column == 52 && valid_symbols[I_FIELD_NAME])
    return emit_field(lexer, I_FIELD_NAME, 58);
  if (column == 58 && valid_symbols[I_CONTROL_LEVEL])
    return emit_field(lexer, I_CONTROL_LEVEL, 60);
  if (column == 60 && valid_symbols[I_MATCHING_FIELDS])
    return emit_field(lexer, I_MATCHING_FIELDS, 62);
  if (column == 62 && valid_symbols[I_FIELD_RECORD_RELATION])
    return emit_field(lexer, I_FIELD_RECORD_RELATION, 64);
  if (column == 64 && valid_symbols[I_FIELD_INDICATORS])
    return emit_field(lexer, I_FIELD_INDICATORS, 70);
  if (column == 70 && valid_symbols[I_RESERVED_2])
    return emit_field(lexer, I_RESERVED_2, 74);
  if (column == 74 && valid_symbols[I_COMMENTS])
    return emit_field(lexer, I_COMMENTS, 80);
  if (column == 6 && valid_symbols[I_RECORD_NAME])
    return emit_field(lexer, I_RECORD_NAME, 14);
  if (column == 14 && valid_symbols[I_RESERVED_3])
    return emit_field(lexer, I_RESERVED_3, 18);
  if (column == 18 && valid_symbols[I_RECORD_IDENTIFYING_INDICATOR])
    return emit_field(lexer, I_RECORD_IDENTIFYING_INDICATOR, 20);
  if (column == 20 && valid_symbols[I_RECORD_IDENTIFICATION_CODE])
    return emit_field(lexer, I_RECORD_IDENTIFICATION_CODE, 41);
  if (column == 41 && valid_symbols[I_RESERVED_4])
    return emit_field(lexer, I_RESERVED_4, 74);
  if (column == 6 && valid_symbols[I_RESERVED_5])
    return emit_field(lexer, I_RESERVED_5, 20);
  if (column == 20 && valid_symbols[I_EXTERNAL_FIELD_NAME])
    return emit_field(lexer, I_EXTERNAL_FIELD_NAME, 30);
  if (column == 30 && valid_symbols[I_RESERVED_6])
    return emit_field(lexer, I_RESERVED_6, 52);
  if (column == 62 && valid_symbols[I_RESERVED_7])
    return emit_field(lexer, I_RESERVED_7, 64);
  if (column == 6 && valid_symbols[I_DATA_STRUCTURE_NAME])
    return emit_field(lexer, I_DATA_STRUCTURE_NAME, 12);
  if (column == 12 && valid_symbols[I_RESERVED_8])
    return emit_field(lexer, I_RESERVED_8, 16);
  if (column == 16 && valid_symbols[I_EXTERNAL_DESCRIPTION])
    return emit_field(lexer, I_EXTERNAL_DESCRIPTION, 17);
  if (column == 20 && valid_symbols[I_EXTERNAL_FILE_NAME])
    return emit_field(lexer, I_EXTERNAL_FILE_NAME, 30);
  if (column == 30 && valid_symbols[I_RESERVED_9])
    return emit_field(lexer, I_RESERVED_9, 43);
  if (column == 43 && valid_symbols[I_DATA_STRUCTURE_OCCURRENCES])
    return emit_field(lexer, I_DATA_STRUCTURE_OCCURRENCES, 47);
  if (column == 47 && valid_symbols[I_LENGTH])
    return emit_field(lexer, I_LENGTH, 51);
  if (column == 51 && valid_symbols[I_RESERVED_10])
    return emit_field(lexer, I_RESERVED_10, 74);
  if (column == 6 && valid_symbols[I_RESERVED_11])
    return emit_field(lexer, I_RESERVED_11, 7);
  if (column == 7 && valid_symbols[I_INITIALIZATION_OPTION])
    return emit_field(lexer, I_INITIALIZATION_OPTION, 8);
  if (column == 8 && valid_symbols[I_RESERVED_12])
    return emit_field(lexer, I_RESERVED_12, 20);
  if (column == 20 && valid_symbols[I_INITIALIZATION_VALUE])
    return emit_field(lexer, I_INITIALIZATION_VALUE, 42);
  if (column == 30 && valid_symbols[I_RESERVED_13])
    return emit_field(lexer, I_RESERVED_13, 42);
  if (column == 42 && valid_symbols[I_INTERNAL_DATA_FORMAT])
    return emit_field(lexer, I_INTERNAL_DATA_FORMAT, 43);
  if (column == 58 && valid_symbols[I_RESERVED_14])
    return emit_field(lexer, I_RESERVED_14, 74);
  if (column == 20 && valid_symbols[I_CONSTANT])
    return emit_field(lexer, I_CONSTANT, 42);
  if (column == 42 && valid_symbols[I_DATA_TYPE])
    return emit_field(lexer, I_DATA_TYPE, 43);
  if (column == 43 && valid_symbols[I_RESERVED_15])
    return emit_field(lexer, I_RESERVED_15, 52);
  if (column == 52 && valid_symbols[I_CONSTANT_NAME])
    return emit_field(lexer, I_CONSTANT_NAME, 58);
  if (column == 42 && valid_symbols[I_RESERVED_16])
    return emit_field(lexer, I_RESERVED_16, 74);
  if (column == 6 && valid_symbols[C_CONTROL_LEVEL])
    return emit_field(lexer, C_CONTROL_LEVEL, 8);
  if (column == 8 && valid_symbols[C_INDICATORS])
    return emit_field(lexer, C_INDICATORS, 17);
  if (column == 17 && valid_symbols[C_FACTOR_1])
    return emit_field(lexer, C_FACTOR_1, 27);
  if (column == 27 && valid_symbols[C_OPERATION])
    return emit_field(lexer, C_OPERATION, 32);
  if (column == 32 && valid_symbols[C_FACTOR_2])
    return emit_field(lexer, C_FACTOR_2, 42);
  if (column == 42 && valid_symbols[C_RESULT_FIELD])
    return emit_field(lexer, C_RESULT_FIELD, 48);
  if (column == 48 && valid_symbols[C_FIELD_LENGTH])
    return emit_field(lexer, C_FIELD_LENGTH, 51);
  if (column == 51 && valid_symbols[C_DECIMAL_POSITIONS])
    return emit_field(lexer, C_DECIMAL_POSITIONS, 52);
  if (column == 52 && valid_symbols[C_OPERATION_EXTENDER])
    return emit_field(lexer, C_OPERATION_EXTENDER, 53);
  if (column == 53 && valid_symbols[C_RESULTING_INDICATORS])
    return emit_field(lexer, C_RESULTING_INDICATORS, 59);
  if (column == 59 && valid_symbols[C_COMMENTS])
    return emit_field(lexer, C_COMMENTS, 74);
  if (column == 74 && valid_symbols[C_COMMENTS_2])
    return emit_field(lexer, C_COMMENTS_2, 80);
  if (column == 6 && valid_symbols[O_FILE_NAME])
    return emit_field(lexer, O_FILE_NAME, 14);
  if (column == 13 && valid_symbols[O_LOGICAL_RELATIONSHIP])
    return emit_field(lexer, O_LOGICAL_RELATIONSHIP, 16);
  if (column == 14 && valid_symbols[O_TYPE])
    return emit_field(lexer, O_TYPE, 15);
  if (column == 15 && valid_symbols[O_RECORD_ADDITION_DELETION])
    return emit_field(lexer, O_RECORD_ADDITION_DELETION, 18);
  if (column == 15 && valid_symbols[O_FETCH_OVERFLOW_RELEASE])
    return emit_field(lexer, O_FETCH_OVERFLOW_RELEASE, 16);
  if (column == 16 && valid_symbols[O_SPACE_AND_SKIP])
    return emit_field(lexer, O_SPACE_AND_SKIP, 22);
  if (column == 16 && valid_symbols[O_SPACE_BEFORE])
    return emit_field(lexer, O_SPACE_BEFORE, 17);
  if (column == 17 && valid_symbols[O_SPACE_AFTER])
    return emit_field(lexer, O_SPACE_AFTER, 18);
  if (column == 18 && valid_symbols[O_SKIP_BEFORE])
    return emit_field(lexer, O_SKIP_BEFORE, 20);
  if (column == 20 && valid_symbols[O_SKIP_AFTER])
    return emit_field(lexer, O_SKIP_AFTER, 22);
  if (column == 22 && valid_symbols[O_OUTPUT_INDICATORS])
    return emit_field(lexer, O_OUTPUT_INDICATORS, 31);
  if (column == 31 && valid_symbols[O_EXCPT_NAME])
    return emit_field(lexer, O_EXCPT_NAME, 37);
  if (column == 31 && valid_symbols[O_FIELD_NAME])
    return emit_field(lexer, O_FIELD_NAME, 37);
  if (column == 37 && valid_symbols[O_EDIT_CODES])
    return emit_field(lexer, O_EDIT_CODES, 38);
  if (column == 38 && valid_symbols[O_BLANK_AFTER])
    return emit_field(lexer, O_BLANK_AFTER, 39);
  if (column == 39 && valid_symbols[O_END_POSITION])
    return emit_field(lexer, O_END_POSITION, 43);
  if (column == 43 && valid_symbols[O_DATA_FORMAT])
    return emit_field(lexer, O_DATA_FORMAT, 44);
  if (column == 44 && valid_symbols[O_CONSTANT_OR_EDIT_WORD])
    return emit_field(lexer, O_CONSTANT_OR_EDIT_WORD, 70);
  if (column == 70 && valid_symbols[O_RESERVED])
    return emit_field(lexer, O_RESERVED, 74);
  if (column == 74 && valid_symbols[O_COMMENTS])
    return emit_field(lexer, O_COMMENTS, 80);
  if (column == 6 && valid_symbols[O_RECORD_NAME])
    return emit_field(lexer, O_RECORD_NAME, 14);
  if (column == 15 && valid_symbols[O_RELEASE])
    return emit_field(lexer, O_RELEASE, 16);
  if (column == 15 && valid_symbols[O_RECORD_ADDITION])
    return emit_field(lexer, O_RECORD_ADDITION, 18);
  if (column == 15 && valid_symbols[O_FETCH_OVERFLOW_SPACE_SKIP])
    return emit_field(lexer, O_FETCH_OVERFLOW_SPACE_SKIP, 22);
  if (valid_symbols[FIXED_WHITESPACE] &&
      (lexer->lookahead == ' ' || lexer->lookahead == '\t')) {
    while (lexer->lookahead == ' ' || lexer->lookahead == '\t')
      lexer->advance(lexer, true);
    lexer->mark_end(lexer); lexer->result_symbol = FIXED_WHITESPACE; return true;
  }
  return false;
}
