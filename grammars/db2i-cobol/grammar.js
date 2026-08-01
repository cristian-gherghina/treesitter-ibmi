const createDb2iGrammar = require("../db2i-rpgle/grammar-factory");

module.exports = createDb2iGrammar(
  "ibmi_db2i_sql_cobol",
  /:[A-Za-z_#$@§][A-Za-z0-9_#$@§.-]*/,
);
