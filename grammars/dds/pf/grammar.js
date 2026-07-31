const PF_KEYWORDS = require("../../../data/dds-pf-keywords.json");

module.exports = grammar({
  name: "dds_pf",

  externals: ($) => [
    $.sequence,
    $.comment_text,
    $._to_name_type,
    $._to_name,
    $.name,
    $.length,
    $.decimals,
    $._to_functions,
    $._ignored_tail,
    $._newline,
  ],

  extras: () => [],

  rules: {
    source_file: ($) => repeat(choice($.comment, $.record, $._newline)),

    form_type: () => "A",
    reference: () => token(/[ R]/),
    data_type: () => token(/[ PSBFALTZHJEOG5]/),
    usage: () => token(/[ B]/),

    functions: ($) =>
      repeat1(
        choice(
          $.keyword,
          $.quoted_text,
          $.special_value,
          $.number,
          $.identifier,
          $._function_space,
          $._function_punctuation,
          $._function_character,
        ),
      ),

    keyword: ($) => seq($.function_keyword, optional($.argument_list)),

    function_keyword: () => token(prec(3, choice(...PF_KEYWORDS))),

    argument_list: ($) =>
      choice(
        seq("(", repeat($._argument_item), ")"),
        prec.right(seq("(", repeat($._argument_item), $.continuation)),
        prec.right(seq("(", repeat($._argument_item), $.continued_quoted_text)),
      ),

    _argument_item: ($) =>
      choice(
        $.quoted_text,
        $.special_value,
        $.number,
        $.identifier,
        $._function_space,
        $._argument_punctuation,
        $._argument_operator,
        $._function_character,
      ),

    quoted_text: () => token(/'([^'\r\n]|'')*'?/),

    continued_quoted_text: () => token(prec(4, /'[^'\r\n]*[+-]/)),

    special_value: () => token(/\*[A-Z0-9_]+/),

    number: () => token(/[0-9]+(\.[0-9]+)?/),

    identifier: () => token(prec(1, /[A-Z_#@$§][A-Z0-9_#@$§]*/)),

    _function_space: () => " ",

    _function_punctuation: () => token(/[(),/:+\-]/),

    _argument_punctuation: () => token(/[,/:]/),

    _argument_operator: () => token(prec(1, /[+-]/)),

    continuation: () => token(prec(3, /[+-]/)),

    _function_character: () => token(prec(-1, /[^ \r\n(),/:+\-]/)),

    comment: ($) =>
      seq($.sequence, $.form_type, $.comment_text, $._newline),

    record: ($) =>
      seq(
        $.sequence,
        $.form_type,
        choice(
          $._newline,
          seq(
            $._to_name_type,
            choice($._newline, $.record_format, $.key_field, $.field_or_file),
          ),
        ),
      ),

    record_format: ($) => seq(alias("R", $.name_type), $._record_tail),

    key_field: ($) => seq(alias("K", $.name_type), $._record_tail),

    field_or_file: ($) => seq(alias(" ", $.name_type), $._record_tail),

    _record_tail: ($) =>
      choice(
        $._newline,
        seq(
          $._to_name,
          choice(
            $._newline,
            seq(
              $.name,
              choice(
                $._newline,
                seq(
                  $.reference,
                  choice(
                    $._newline,
                    seq(
                      $.length,
                      choice(
                        $._newline,
                        seq(
                          $.data_type,
                          choice(
                            $._newline,
                            seq(
                              $.decimals,
                              choice(
                                $._newline,
                                seq(
                                  $.usage,
                                  choice(
                                    $._newline,
                                    seq(
                                      $._to_functions,
                                      choice(
                                        $._newline,
                                        seq(
                                          $.functions,
                                          optional($._ignored_tail),
                                          $._newline,
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
  },
});
