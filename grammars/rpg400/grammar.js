const COLUMNS = require("../../data/rpg3-cols.json");
const FIELDS = buildFields(COLUMNS);

module.exports = grammar({
  name: "ibmi_rpg400",

  externals: ($) => [
    $.comment,
    $.compiler_directive,
    $.sql_start,
    $.sql_continuation,
    $.sql_end,
    $.compile_time_data,
    $._ignored_tail,
    $._fixed_whitespace,
    ...FIELDS.map(({ token }) => $[token]),
  ],

  extras: ($) => [$._fixed_whitespace],

  rules: {
    source_file: ($) => repeat(choice(
      seq($.comment, optional($._ignored_tail)),
      seq($.compiler_directive, optional($._ignored_tail)),
      $.embedded_sql_statement,
      $.control_specification,
      $.file_specification,
      $.extension_specification,
      $.line_counter_specification,
      $.input_specification,
      $.calculation_specification,
      $.output_specification,
      seq($.compile_time_data, optional($._ignored_tail)),
    )),

    control_specification: ($) => specification($, "H"),
    file_specification: ($) => specification($, "F"),
    extension_specification: ($) => specification($, "E"),
    line_counter_specification: ($) => specification($, "L"),
    input_specification: ($) => specification($, "I"),
    calculation_specification: ($) => specification($, "C"),
    output_specification: ($) => specification($, "O"),

    embedded_sql_statement: ($) => seq(
      $.sql_start,
      optional($._ignored_tail),
      repeat(seq($.sql_continuation, optional($._ignored_tail))),
      $.sql_end,
      optional($._ignored_tail),
    ),
  },
});

function buildFields(columns) {
  const fields = [];
  for (const [form, definitions] of Object.entries(columns)) {
    const occurrences = new Map();
    for (const [start, end, label] of definitions) {
      const occurrence = (occurrences.get(label) ?? 0) + 1;
      occurrences.set(label, occurrence);
      const base = `${form.toLowerCase()}_${label.toLowerCase().replaceAll(/[^a-z0-9]+/g, "_").replaceAll(/^_|_$/g, "")}`;
      fields.push({ form, start, end, token: occurrence > 1 ? `${base}_${occurrence}` : base });
    }
  }
  return fields;
}

function specification($, form) {
  const fields = FIELDS.filter((field) => field.form === form);
  return seq(
    $[fields[0].token],
    repeat(choice(...fields.slice(1).map(({ token }) => $[token]))),
    optional($._ignored_tail),
  );
}
