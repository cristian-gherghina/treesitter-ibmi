module.exports = grammar({
  name: "ibmi_mi",

  extras: ($) => [/\s/, $.comment],

  word: ($) => $.identifier,

  conflicts: ($) => [[$.attribute, $._value]],

  rules: {
    source_file: ($) => repeat($._statement),

    _statement: ($) =>
      choice(
        $.entry_statement,
        $.declaration,
        $.end_statement,
        $.instruction,
      ),

    entry_statement: ($) =>
      seq(
        alias(token(prec(1, "ENTRY")), $.keyword),
        field("name", choice($.special_value, $.identifier)),
        field("parameters", $.operand_list),
        repeat(field("attribute", $._value)),
        ";",
      ),

    declaration: ($) =>
      seq(
        alias(token(prec(1, "DCL")), $.keyword),
        field("type", $.declaration_type),
        field("name", $.identifier),
        repeat(field("attribute", $._value)),
        ";",
      ),

    declaration_type: () =>
      choice(
        "SPCPTR",
        "SYSPTR",
        "DD",
        "OL",
        "EXCM",
        "OPM",
        "PTR",
      ),

    end_statement: ($) =>
      seq(alias(token(prec(1, "PEND")), $.keyword), ";"),

    instruction: ($) =>
      seq(
        optional($.label),
        field("opcode", $.opcode),
        optional(field("modifier", $.instruction_modifier)),
        optional(field("operands", $.instruction_operands)),
        optional(field("branches", $.branch_targets)),
        ";",
      ),

    label: ($) => seq(field("name", $.identifier), ":"),

    opcode: ($) => $.identifier,

    instruction_modifier: ($) =>
      prec(
        1,
        seq(
        "(",
        commaSep1(field("option", $.identifier)),
        ")",
        ),
      ),

    instruction_operands: ($) => commaSep1($._value),

    branch_targets: ($) =>
      seq(
        "/",
        commaSep1(
          seq(
            field("condition", $.identifier),
            "(",
            field("label", $.identifier),
            ")",
          ),
        ),
      ),

    operand_list: ($) => seq("(", optional(commaSep1($._value)), ")"),

    attribute: ($) =>
      seq(
        field("name", $.identifier),
        "(",
        optional(commaSep1($._value)),
        ")",
      ),

    _value: ($) =>
      choice(
        $.attribute,
        $.string,
        $.hex_string,
        $.special_value,
        $.number,
        $.identifier,
        $.operand_list,
      ),

    identifier: () => token(/[A-Za-z_#$@§][A-Za-z0-9_#$@§]*/),

    special_value: () => token(/\*[A-Za-z0-9_#$@§]*/),

    number: () => token(/[+-]?[0-9]+(\.[0-9]+)?/),

    string: () => token(/'([^'\r\n]|'')*'/),

    hex_string: () => token(/[Xx]'([0-9A-Fa-f]{2})*'/),

    comment: () =>
      token(seq("/*", /[^*]*\*+([^/*][^*]*\*+)*/, "/")),
  },
});

function commaSep1(rule) {
  return seq(rule, repeat(seq(",", rule)));
}
