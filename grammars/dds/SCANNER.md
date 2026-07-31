# Column scanner findings

The DDS/PF spike validated the column strategy shared by fixed-format IBM i
grammars. PF and LF now use `dds/scanner.c` through small language-symbol
wrappers in each generated parser directory.

## Strategy

The external scanner uses `TSLexer.get_column()` to consume the unconstrained
ranges between fixed fields. Dialect-specific single-column values remain
ordinary grammar tokens. This separation is important:

- edits to constrained values invalidate ordinary tokens reliably;
- a generated DDS grammar can provide different character sets for each
  dialect without duplicating the scanner;
- the scanner handles positioning, short records, comments, and the ignored
  tail without owning language semantics.

The DDS grammars expose sequence, name, reference, length, data type, decimals,
usage, and functions-area nodes. Dialects that use columns 7–16 also expose a
validated conditioning field. Functions-area keywords and arguments are parsed
by the generated dialect grammar after the scanner positions the lexer at
column 45. This keeps each dialect's keyword set in tracked JSON and out of
scanner C code.

External scanner tokens must not consume input and then return `false`.
Tree-sitter does not rewind those lexer side effects in every recovery path.
The scanner therefore stops before a tab or constrained field and lets the
grammar produce an `ERROR` node.

## Confirmed behavior

- Columns are zero-based in the scanner and map directly to the IBM
  documentation's one-based columns.
- CRLF and LF line endings are consumed by one external newline token.
- Records may end at documented field boundaries without padding to column 80.
- Tabs are rejected in positional fields rather than expanded ambiguously.
- UTF-8 text is safe in the functions area, where no later positional field is
  interpreted. Fixed-column offsets follow Tree-sitter's byte columns, matching
  the byte-oriented source-record model.
- Columns 81 and later are emitted as a hidden ignored-tail token.
- Incremental replacements in form type, name type, and data type are reparsed
  and invalid replacements produce errors.

The scanner uses no serialized state. The same approach is shared across the
five DDS dialects and can be adapted for RPGLE, RPG/400, and COBOL layouts.
