(comment) @comment
(fixed_comment) @comment
(fully_free_marker) @keyword.directive
(compiler_directive) @keyword.directive
(fixed_directive) @keyword.directive
(fixed_sql_start) @keyword.directive
(fixed_sql_end) @keyword.directive
(legacy_free_end) @keyword.directive
(compile_time_data_header) @keyword.directive

(fixed_operation) @keyword
(fixed_file_name) @type
(fixed_definition_name) @variable
(fixed_procedure_name) @function
(fixed_input_file_name) @type
(fixed_input_field_name) @variable
(fixed_output_file_name) @type
(fixed_output_field_name) @variable
(fixed_constant_or_edit_word) @string

(keyword) @keyword
(embedded_sql_statement
  [exec: (keyword) language: (keyword)] @keyword)
(declaration_keyword) @keyword
(opcode (identifier) @function)
(known_builtin_name) @function.builtin
(builtin_name) @function

(procedure_start name: (identifier) @function)
(prototype_start name: (_) @function)
(interface_start name: (_) @function)
(data_structure_start name: (_) @type)
(enumeration_start name: (identifier) @type)
(enumeration_member name: (identifier) @constant)

(named_declaration name: (_) @variable)
(parameter_declaration name: (_) @variable.parameter)
(subfield_declaration name: (identifier) @property)

(special_value) @constant.builtin
(number) @number
(string) @string
(hex_string) @string.special
(sql_string) @string
(sql_quoted_identifier) @string.special
(sql_line_comment) @comment
(sql_block_comment) @comment
(operator) @operator
(assignment_operator) @operator

["(" ")"] @punctuation.bracket
[":" "." ";"] @punctuation.delimiter
