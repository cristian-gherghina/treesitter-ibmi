(comment) @comment

(sequence) @comment
(form_type) @keyword
((conditioning) @constant
  (#match? @constant "[^ ]"))
((name_type) @keyword
  (#eq? @keyword "R"))
((reference) @keyword
  (#eq? @keyword "R"))
((data_type) @type
  (#match? @type "[AFGLOPSTZ]"))
((usage) @keyword
  (#eq? @keyword "O"))
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
