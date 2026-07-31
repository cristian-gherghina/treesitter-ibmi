(comment) @comment

(statement_kind) @keyword
(label name: (identifier) @label)
(parameter name: (identifier) @property)

(variable) @variable
(special_value) @constant.builtin
(number) @number
(string) @string
(hex_string) @string.special

["(" ")"] @punctuation.bracket
[(punctuation) ":"] @punctuation.delimiter
