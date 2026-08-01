module.exports = grammar({
  name: "ibmi_cobol",

  externals: ($) => [
    $.fixed_prefix,
    $.fixed_continuation,
    $.fixed_comment,
    $._fixed_ignored_tail,
    $._fixed_whitespace,
  ],

  extras: ($) => [
    $.fixed_prefix,
    $.fixed_continuation,
    $.fixed_comment,
    $._fixed_ignored_tail,
    $._fixed_whitespace,
    $.floating_comment,
  ],

  word: ($) => $.word,

  rules: {
    source_file: ($) => repeat(choice(
      $.compiler_directive,
      $.process_statement,
      $.division_header,
      $.section_header,
      $.data_description_entry,
      $.embedded_sql_statement,
      $.paragraph_header,
      $.sentence,
    )),

    process_statement: ($) => prec(6, seq(
      alias(caseInsensitive("PROCESS"), $.keyword),
      repeat($._atom),
      ".",
    )),

    division_header: ($) => prec(6, seq(
      field("name", alias(choice(
        caseInsensitive("IDENTIFICATION"),
        caseInsensitive("ENVIRONMENT"),
        caseInsensitive("DATA"),
        caseInsensitive("PROCEDURE"),
      ), $.keyword)),
      alias(caseInsensitive("DIVISION"), $.keyword),
      repeat($._atom),
      ".",
    )),

    section_header: ($) => prec(5, seq(
      field("name", $.word),
      alias(caseInsensitive("SECTION"), $.keyword),
      repeat($._atom),
      ".",
    )),

    paragraph_header: ($) => prec(3, seq(field("name", $.word), ".")),

    data_description_entry: ($) => prec(4, seq(
      field("level", $.level_number),
      field("name", choice($.word, $.figurative_constant)),
      repeat($._atom),
      ".",
    )),

    sentence: ($) => seq(repeat1($._atom), "."),

    embedded_sql_statement: ($) => prec(8, seq(
      field("exec", alias(caseInsensitive("EXEC"), $.keyword)),
      field("language", alias(caseInsensitive("SQL"), $.keyword)),
      field("body", $.sql_body),
      alias($.end_exec, $.keyword),
      optional("."),
    )),

    sql_body: ($) => repeat1(choice(
      $.string,
      $.sql_quoted_identifier,
      $.sql_line_comment,
      $.sql_block_comment,
      $.sql_text,
    )),

    compiler_directive: () => token(prec(8, seq(">>", /[^\r\n]*/))),
    floating_comment: () => token(prec(8, seq("*>", /[^\r\n]*/))),

    _atom: ($) => choice(
      $.function_name,
      $.figurative_constant,
      $.picture,
      $.string,
      $.continued_string_fragment,
      $.hex_string,
      $.boolean_string,
      $.number,
      $.word,
      $.operator,
      $.punctuation,
    ),

    function_name: ($) => prec(3, seq(
      alias(caseInsensitive("FUNCTION"), $.keyword),
      field("name", $.word),
    )),
    figurative_constant: () => token(prec(2, choice(
      caseInsensitive("ZERO"), caseInsensitive("ZEROS"), caseInsensitive("ZEROES"),
      caseInsensitive("SPACE"), caseInsensitive("SPACES"),
      caseInsensitive("HIGH-VALUE"), caseInsensitive("HIGH-VALUES"),
      caseInsensitive("LOW-VALUE"), caseInsensitive("LOW-VALUES"),
      caseInsensitive("QUOTE"), caseInsensitive("QUOTES"),
      caseInsensitive("NULL"), caseInsensitive("NULLS"),
      caseInsensitive("TRUE"), caseInsensitive("FALSE"),
    ))),
    level_number: () => token(prec(3, /(?:0[1-9]|[1-4][0-9]|66|77|88)/)),
    picture: () => token(prec(2, /(?:[AXNSVZP$][AX9NSVZP$*+\-,.\/]*(?:\([0-9]+\))?[AX9NSVZP$*+\-,.\/]*|9\([0-9]+\)[AX9NSVZP$*+\-,.\/]*)/i)),
    word: () => token(/[A-Za-z0-9][A-Za-z0-9_-]*/),
    number: () => token(/[0-9]+(?:\.[0-9]+)?/),
    string: () => token(choice(
      seq('"', repeat(choice(/[^"\r\n]+/, '""')), '"'),
      seq("'", repeat(choice(/[^'\r\n]+/, "''")), "'"),
    )),
    continued_string_fragment: () => token(prec(-1, /"[^"\r\n]*/)),
    hex_string: () => token(/[NXnx](?:"[0-9A-Fa-f]*"|'[0-9A-Fa-f]*')/),
    boolean_string: () => token(/[Bb](?:"[01]+"|'[01]+')/),
    operator: () => token(choice("**", ">=", "<=", "<>", "=", ">", "<", "+", "-", "*", "/")),
    punctuation: () => token(/[,():;]/),

    sql_string: () => token(seq("'", repeat(choice(/[^']+/, "''")), "'")),
    sql_quoted_identifier: () => token(seq('"', repeat(choice(/[^"]+/, '""')), '"')),
    sql_line_comment: () => token(seq("--", /[^\r\n]*/)),
    sql_block_comment: () => token(seq("/*", /[^*]*\*+([^/*][^*]*\*+)*/, "/")),
    end_exec: () => token(prec(5, caseInsensitive("END-EXEC"))),
    sql_text: () => token(prec(1, choice(/[^'".\s]+/, /[A-Za-z0-9_]+/, "."))),
  },
});

function caseInsensitive(value) {
  return new RegExp(value.split("").map((character) =>
    /[A-Za-z]/.test(character)
      ? `[${character.toUpperCase()}${character.toLowerCase()}]`
      : character,
  ).join(""));
}
