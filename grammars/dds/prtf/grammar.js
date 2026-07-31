const defineGrammar = require("../define-grammar");
const functionKeywords = require("../../../data/dds-prtf-keywords.json");

module.exports = defineGrammar({
  name: "dds_prtf",
  conditioning: true,
  location: true,
  recordTypes: [
    { value: "R", rule: "record_format" },
    { value: " ", rule: "field_or_file" },
  ],
  dataTypes: "AFGLOPSTZ",
  usage: "O",
  functionKeywords,
});
