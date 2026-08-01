(fixed_comment) @comment
(floating_comment) @comment
(compiler_directive) @keyword.directive
(fixed_continuation) @keyword.directive

(keyword) @keyword
(function_name name: (word) @function.builtin)
(division_header name: (keyword) @module)
(section_header name: (word) @namespace)
(paragraph_header name: (word) @function)
(data_description_entry name: (_) @variable)
(level_number) @number
(figurative_constant) @constant.builtin
(picture) @type
(number) @number
(string) @string
(hex_string) @string.special
(boolean_string) @boolean
(operator) @operator
["." (punctuation)] @punctuation.delimiter
