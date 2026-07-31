(comment) @comment

(sequence) @comment
(form_type) @keyword
((name_type) @keyword
  (#match? @keyword "[RK]"))
((reference) @keyword
  (#eq? @keyword "R"))
((data_type) @type
  (#match? @type "[PSBFALTZHJEOG5]"))
((usage) @keyword
  (#eq? @keyword "B"))
((name) @variable
  (#match? @variable "[^ ]"))
((length) @number
  (#match? @number "[0-9]"))
((decimals) @number
  (#match? @number "[0-9]"))
(keyword
  (function_keyword) @keyword)
(quoted_text) @string
(continued_quoted_text) @string
(special_value) @constant
(number) @number
(continuation) @operator
