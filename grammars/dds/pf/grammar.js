const defineGrammar = require("../define-grammar");
const functionKeywords = require("../../../data/dds-pf-keywords.json");

module.exports = defineGrammar({
  name: "dds_pf",
  recordTypes: [
    { value: "R", rule: "record_format" },
    { value: "K", rule: "key_field" },
    { value: " ", rule: "field_or_file" },
  ],
  dataTypes: "PSBFALTZHJEOG5",
  usage: "B",
  functionKeywords,
});
