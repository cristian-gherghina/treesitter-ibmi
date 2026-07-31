const defineGrammar = require("../define-grammar");
const functionKeywords = require("../../../data/dds-dspf-keywords.json");

module.exports = defineGrammar({
  name: "dds_dspf",
  conditioning: true,
  location: true,
  recordTypes: [
    { value: "R", rule: "record_format" },
    { value: "H", rule: "help_specification" },
    { value: " ", rule: "field_or_file" },
  ],
  dataTypes: "ADEFGIJLMNOSTWXYZ",
  usage: "OIBHMP",
  functionKeywords,
});
