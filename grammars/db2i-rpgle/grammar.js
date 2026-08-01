const createDb2iGrammar = require("./grammar-factory");

module.exports = createDb2iGrammar(
  "ibmi_db2i_sql_rpgle",
  /:[A-Za-z_#$@§][A-Za-z0-9_#$@§.]*/,
);
