((embedded_sql_statement
  body: (sql_body) @injection.content)
  (#set! injection.language "ibmi_db2i_sql_rpgle")
  (#set! injection.include-children))

((fixed_sql_statement
  [(fixed_sql_start) (fixed_sql_continuation)] @injection.content)
  (#set! injection.language "ibmi_db2i_sql_rpgle")
  (#set! injection.combined))
