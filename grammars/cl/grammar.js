const COMMANDS = require("../../data/cl-commands.json");
const BLOCK_COMMANDS = new Set([
  "PGM",
  "ENDPGM",
  "DO",
  "DOFOR",
  "DOUNTIL",
  "DOWHILE",
  "SELECT",
]);
const SIMPLE_COMMANDS = COMMANDS.filter((command) => !BLOCK_COMMANDS.has(command));

function structuralStatement($, command) {
  return seq(
    optional($.label),
    field("command", alias(command, $.command)),
    repeat(field("argument", $._argument)),
    $._newline,
  );
}

module.exports = grammar({
  name: "ibmi_cl",

  extras: ($) => [/[ \t\f]/, $.comment, $._line_continuation],

  word: ($) => $.identifier,

  rules: {
    source_file: ($) => repeat(choice($.program, $._body_item)),

    program: ($) =>
      seq(
        alias($._program_start, $.statement),
        repeat($._body_item),
        alias($._program_end, $.statement),
      ),

    do_block: ($) =>
      seq(
        alias($._do_start, $.statement),
        repeat($._body_item),
        alias($._do_end, $.statement),
      ),

    select_block: ($) =>
      seq(
        alias($._select_start, $.statement),
        repeat(choice($.statement, $.do_block, $._newline)),
        alias($._select_end, $.statement),
      ),

    _body_item: ($) =>
      choice($.do_block, $.select_block, $.statement, $._newline),

    statement: ($) =>
      seq(
        optional($.label),
        field("command", $.command),
        repeat(field("argument", $._argument)),
        $._newline,
      ),

    _program_start: ($) => structuralStatement($, "PGM"),
    _program_end: ($) => structuralStatement($, "ENDPGM"),
    _do_start: ($) =>
      structuralStatement($, choice("DO", "DOFOR", "DOUNTIL", "DOWHILE")),
    _do_end: ($) => structuralStatement($, "ENDDO"),
    _select_start: ($) => structuralStatement($, "SELECT"),
    _select_end: ($) => structuralStatement($, "ENDSELECT"),

    label: ($) =>
      seq(choice($.identifier, alias($.command, $.identifier)), ":"),

    command: () => token(prec(3, choice(...SIMPLE_COMMANDS))),

    _argument: ($) =>
      choice(
        $.parameter,
        $.builtin_call,
        $.builtin,
        $.argument_list,
        $.variable,
        $.hex_string,
        $.string,
        $.special_value,
        $.number,
        $.operator,
        $.identifier,
        $.punctuation,
      ),

    parameter: ($) =>
      prec(
        2,
        seq(field("name", $.identifier), field("value", $.argument_list)),
      ),

    builtin_call: ($) =>
      prec(
        2,
        seq(field("function", $.builtin), field("arguments", $.argument_list)),
      ),

    argument_list: ($) => seq("(", repeat($._argument), ")"),

    builtin: () => token(/%[A-Z][A-Z0-9_]*/),

    variable: () => token(/&[A-Z#@$§_][A-Z0-9#@$§_]*/),

    special_value: () => token(/\*[A-Z0-9#@$§_]+/),

    hex_string: () => token(/[Xx]'([0-9A-Fa-f]{2})*'/),

    string: () => token(/'([^'\r\n]|'')*'/),

    number: () => token(/[0-9]+(\.[0-9]+)?/),

    operator: () =>
      token(
        choice(
          "+",
          "-",
          "*",
          "/",
          "=",
          ">",
          "<",
          ">=",
          "<=",
          "<>",
          "¬=",
        ),
      ),

    identifier: () => token(/[A-Z#@$§_][A-Z0-9#@$§_.-]*/),

    punctuation: () => token(/[,]/),

    comment: () => token(seq("/*", /[^*]*\*+([^/*][^*]*\*+)*/, "/")),

    _line_continuation: () => token(seq(/[+-]/, /[ \t]*\r?\n/)),

    _newline: () => token(/\r?\n/),
  },
});
