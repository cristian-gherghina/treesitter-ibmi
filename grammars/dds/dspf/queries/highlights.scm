(comment) @comment

(sequence) @comment
(form_type) @keyword
((conditioning) @constant
  (#match? @constant "[^ ]"))
((name_type) @keyword
  (#match? @keyword "[RH]"))
((reference) @keyword
  (#eq? @keyword "R"))
((data_type) @type
  (#match? @type "[ADEFGIJLMNOSTWXYZ]"))
((usage) @keyword
  (#match? @keyword "[OIBHMP]"))
((name) @variable
  (#match? @variable "[^ ]"))
((length) @number
  (#match? @number "[0-9]"))
((decimals) @number
  (#match? @number "[0-9]"))
((location_line) @number
  (#match? @number "[0-9+-]"))
((location_position) @number
  (#match? @number "[0-9+-]"))
(keyword
  (function_keyword) @keyword)
(quoted_text) @string
(continued_quoted_text) @string
(special_value) @constant
(number) @number
(continuation) @operator
