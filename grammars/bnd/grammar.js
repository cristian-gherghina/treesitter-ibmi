module.exports = grammar({
  name: "ibmi_bnd",

  extras: ($) => [/\s/, $.comment, $._line_continuation],

  word: ($) => $.identifier,

  rules: {
    source_file: ($) => repeat($.export_block),

    export_block: ($) =>
      seq(
        $.start_export_block,
        repeat($.export_statement),
        $.end_export_block,
      ),

    start_export_block: ($) =>
      seq(
        alias("STRPGMEXP", $.keyword),
        repeat(
          choice(
            $.program_level,
            $.signature,
            $.level_check,
            $.parameter,
          ),
        ),
      ),

    end_export_block: ($) => alias("ENDPGMEXP", $.keyword),

    export_statement: ($) =>
      seq(alias("EXPORT", $.keyword), $.symbol_parameter),

    program_level: ($) =>
      seq(
        alias("PGMLVL", $.parameter_name),
        "(",
        field("value", choice("*CURRENT", "*PRV")),
        ")",
      ),

    signature: ($) =>
      seq(
        alias("SIGNATURE", $.parameter_name),
        "(",
        field("value", choice("*GEN", $.string, $.hex_string)),
        ")",
      ),

    level_check: ($) =>
      seq(
        alias("LVLCHK", $.parameter_name),
        "(",
        field("value", choice("*YES", "*NO")),
        ")",
      ),

    symbol_parameter: ($) =>
      seq(
        alias("SYMBOL", $.parameter_name),
        "(",
        field("symbol", choice($.string, $.identifier, $.wildcard_symbol)),
        ")",
      ),

    parameter: ($) =>
      seq(
        field("name", $.identifier),
        "(",
        repeat(field("value", $._value)),
        ")",
      ),

    _value: ($) =>
      choice(
        $.string,
        $.hex_string,
        $.special_value,
        $.number,
        $.identifier,
      ),

    wildcard_symbol: () =>
      token(
        choice(
          "<<<",
          /[A-Za-z0-9_#$@§]*<<<[A-Za-z0-9_#$@§<>]*/,
          /[A-Za-z0-9_#$@§]+>>>[A-Za-z0-9_#$@§<>]*/,
        ),
      ),

    identifier: () => token(/[A-Za-z_#$@§][A-Za-z0-9_#$@§]*/),

    special_value: () => token(/\*[A-Z0-9_]+/),

    number: () => token(/[0-9]+(\.[0-9]+)?/),

    string: () => token(/'([^'\r\n]|'')*'/),

    hex_string: () => token(/[Xx]'([0-9A-Fa-f]{2})*'/),

    comment: () =>
      token(
        choice(
          seq("/*", /[^*]*\*+([^/*][^*]*\*+)*/, "/"),
          seq("--", /[^\r\n]*/),
        ),
      ),

    _line_continuation: () => token(seq("+", /[ \t]*\r?\n/)),
  },
});
