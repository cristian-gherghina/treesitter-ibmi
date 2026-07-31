const STATEMENTS = ["CMD", "PARM", "QUAL", "ELEM", "DEP", "PMTCTL"];

module.exports = grammar({
  name: "ibmi_cmd",

  extras: ($) => [/[ \t\f]/, $.comment, $._line_continuation],

  word: ($) => $.identifier,

  rules: {
    source_file: ($) => repeat(choice($.statement, $._newline)),

    statement: ($) =>
      seq(
        optional($.label),
        field("kind", $.statement_kind),
        repeat(field("parameter", $.parameter)),
        $._newline,
      ),

    label: ($) => seq(field("name", $.identifier), ":"),

    statement_kind: () => token(prec(2, choice(...STATEMENTS))),

    parameter: ($) =>
      prec(
        2,
        seq(
          field("name", $.identifier),
          field("value", $.argument_list),
        ),
      ),

    argument_list: ($) => seq("(", repeat($._argument), ")"),

    _argument: ($) =>
      choice(
        $.parameter,
        $.argument_list,
        $.variable,
        $.hex_string,
        $.string,
        $.special_value,
        $.number,
        $.identifier,
        $.punctuation,
      ),

    variable: () => token(/&[A-Za-zÀ-ÖØ-öø-ÿ#@$§£¥_][A-Za-z0-9À-ÖØ-öø-ÿ#@$§£¥_]*/),

    special_value: () => token(/\*[A-Z0-9#@$§£¥_]+/),

    hex_string: () => token(/[Xx]'([0-9A-Fa-f]{2})*'/),

    string: () => token(/'([^'\r\n]|'')*'/),

    number: () => token(/[+-]?[0-9]+(\.[0-9]+)?/),

    identifier: () =>
      token(/[A-Za-zÀ-ÖØ-öø-ÿ#@$§£¥_][A-Za-z0-9À-ÖØ-öø-ÿ#@$§£¥_.-]*/),

    punctuation: () => token(choice(",", "/")),

    comment: () => token(seq("/*", /[^*]*\*+([^/*][^*]*\*+)*/, "/")),

    _line_continuation: () => token(seq("+", /[ \t]*\r?\n/)),

    _newline: () => token(/\r?\n/),
  },
});
