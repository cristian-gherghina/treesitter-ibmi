const defineGrammar = require("../define-grammar");
const functionKeywords = require("../../../data/dds-icff-keywords.json");

module.exports = defineGrammar({
  name: "dds_icff",
  conditioning: true,
  recordTypes: [
    { value: "R", rule: "record_format" },
    { value: "H", rule: "help_record" },
    { value: " ", rule: "field_or_file" },
  ],
  dataTypes: "PSBFAO",
  usage: "BP",
  functionKeywords,
});
