const RESERVED_WORDS = require("../../data/db2i-reserved-words.json").words;

const STATEMENT_KEYWORDS = [
  "ALLOCATE", "ALTER", "ASSOCIATE", "CALL", "CLOSE", "COMMENT", "COMMIT",
  "CONNECT", "CREATE", "DEALLOCATE", "DECLARE", "DELETE", "DESCRIBE",
  "DISCONNECT", "DROP", "EXECUTE", "FETCH", "FREE", "GET", "GRANT", "HOLD",
  "INCLUDE", "INSERT", "LABEL", "LOCK", "MERGE", "OPEN", "PREPARE",
  "REFRESH", "RELEASE", "RENAME", "REVOKE", "ROLLBACK", "SAVEPOINT",
  "SELECT", "SET", "TRANSFER", "TRUNCATE", "UPDATE", "VALUES", "WHENEVER",
  "WITH",
];

module.exports = function createDb2iGrammar(name, hostVariablePattern) {
  return grammar({
    name,

    extras: ($) => [
      /\s/,
      $.line_comment,
      $.block_comment,
      $.rpg_fixed_prefix,
      $.rpg_fixed_comment,
    ],

    word: ($) => $.identifier,

    rules: {
      source_file: ($) => optional($.statement),
      statement: ($) =>
        seq(field("kind", $.statement_keyword), repeat($._item), optional(";")),
      statement_keyword: () =>
        token(prec(4, choice(...STATEMENT_KEYWORDS.map(caseInsensitive)))),
      _item: ($) => choice(
        $.parenthesized_expression,
        $.host_variable,
        $.special_value,
        $.hex_string,
        $.string,
        $.quoted_identifier,
        $.number,
        $.keyword,
        $.identifier,
        $.operator,
        $.punctuation,
        $.parameter_marker,
      ),
      parenthesized_expression: ($) => seq("(", repeat($._item), ")"),
      host_variable: () => token(hostVariablePattern),
      special_value: () => token(/\*[A-Za-z0-9_]+/),
      hex_string: () => token(/[Xx]'[0-9A-Fa-f]*'/),
      string: () => token(seq("'", repeat(choice(/[^']+/, "''")), "'")),
      quoted_identifier: () => token(seq('"', repeat(choice(/[^"]+/, '""')), '"')),
      number: () => token(/[0-9]+(\.[0-9]+)?([Ee][+-]?[0-9]+)?/),
      keyword: () => token(prec(3, choice(...RESERVED_WORDS.map(caseInsensitive)))),
      identifier: () => token(/[A-Za-z_#$@§][A-Za-z0-9_#$@§]*/),
      operator: () => token(choice("||", "<=", ">=", "<>", "!=", "=", "<", ">", "+", "-", "*", "/")),
      punctuation: () => token(/[,.\[\]{}:]/),
      parameter_marker: () => "?",
      line_comment: () => token(seq("--", /[^\r\n]*/)),
      block_comment: () => token(seq("/*", /[^*]*\*+([^/*][^*]*\*+)*/, "/")),
      rpg_fixed_prefix: () => token(/[0-9 ]{5}[Cc](\/EXEC[ ]+SQL|\+)/),
      rpg_fixed_comment: () => token(/[0-9 ]{5}[A-Za-z ]\*[^\r\n]*/),
    },
  });
};

function caseInsensitive(value) {
  return new RegExp(value.split("").map((character) =>
    `[${character}${character.toLowerCase()}]`).join(""));
}
