module.exports = grammar({
  name: "dds_pf",

  externals: ($) => [$.comment_record, $.data_record, $._blank_line],

  extras: () => [],

  rules: {
    source_file: ($) => repeat(choice($.comment, $.record, $._blank_line)),

    comment: ($) => $.comment_record,

    record: ($) => $.data_record,
  },
});
