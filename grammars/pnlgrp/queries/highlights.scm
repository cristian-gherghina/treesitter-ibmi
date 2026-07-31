(comment) @comment
(imbed_directive) @keyword.directive

(start_tag name: (tag_name) @tag)
(end_tag name: (tag_name) @tag)
(tag name: (tag_name) @tag)

(attribute
  name: (attribute_name) @attribute)

(quoted_value) @string
(bare_value) @string.special
(entity) @constant.builtin

[":" "." "="] @punctuation.delimiter
