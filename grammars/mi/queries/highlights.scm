(comment) @comment

(keyword) @keyword
(declaration_type) @type
(opcode) @function
(instruction_modifier (identifier) @attribute)

(label (identifier) @label)
(branch_targets
  condition: (identifier) @constant
  label: (identifier) @label)

(declaration name: (identifier) @variable)
(entry_statement name: (_) @function)

(special_value) @constant.builtin
(number) @number
(string) @string
(hex_string) @string.special

["(" ")" "," "/" ":" ";"] @punctuation.delimiter
