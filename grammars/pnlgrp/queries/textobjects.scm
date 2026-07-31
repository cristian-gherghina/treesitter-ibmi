(element) @class.outer

(element
  open: (start_tag) @_start
  close: (end_tag) @_end
  (#make-range! "class.inner" @_start @_end))
