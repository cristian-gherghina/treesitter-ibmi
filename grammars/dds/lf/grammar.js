const defineGrammar = require("../define-grammar");
const functionKeywords = require("../../../data/dds-lf-keywords.json");

module.exports = defineGrammar({
  name: "dds_lf",
  recordTypes: [
    { value: "R", rule: "record_format" },
    { value: "K", rule: "key_field" },
    { value: "J", rule: "join_specification" },
    { value: "S", rule: "select_field" },
    { value: "O", rule: "omit_field" },
    { value: " ", rule: "field_or_file" },
  ],
  dataTypes: "PSBFALTZHJEOG5",
  usage: "BIN",
  functionKeywords,
});
