# Fixtures

This corpus was imported on 2026-07-30 from the MIT-licensed
[`barrettotte/vscode-ibmi-languages`](https://github.com/barrettotte/vscode-ibmi-languages)
repository at commit `e6c1cf0b541f77f23abd7c32b257a85a741facc9`.

`fixtures/` contains the 113 current source fixtures from the extension's 13
language directories. The extension's `.snap` files are excluded because they
encode TextMate tokenization, not tree-sitter syntax trees. Its entire
`tests/legacy/` tree is also excluded because it predates the extension's unit
test suite.

Tree-sitter tests use exact expected syntax trees in each parser's
`test/corpus/` directory. Focused regression cases should be added there as bugs
are found.

Some keyword-coverage fixtures explicitly say they are non-compilable and may
contain deliberately invalid fields. Fixture test harnesses record those
expected errors individually; every other fixture must parse without an
`ERROR` or `MISSING` node.

Do not rewrite fixed-format fixture whitespace mechanically. Column positions
are part of the source language.
