((embedded_sql_statement
  [(sql_start) (sql_continuation)] @injection.content)
  (#set! injection.language "ibmi_db2i_sql_rpg400")
  (#set! injection.combined))
