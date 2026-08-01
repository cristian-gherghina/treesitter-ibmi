# treesitter-ibmi

Tree-sitter grammars for IBM i languages, based in part on
[`vscode-ibmi-languages`](https://github.com/barrettotte/vscode-ibmi-languages).

## Parsers

- ILE RPG (fully free, free, fixed, mixed, and SQLRPGLE) and RPG/400
- ILE COBOL, COBOL/400, and SQL COBOL
- DDS PF, LF, ICFF, DSPF, and PRTF
- CL, CMD, MI, binder language, and UIM panel groups
- Db2 for i SQL variants for RPGLE, RPG/400, and COBOL hosts

Fixed/reference-format parsers enforce source-type-specific column layouts.
See [REFERENCES.md](REFERENCES.md) for the IBM documentation used.

## Test

```bash
npm ci
npm test
npm run check:generated
```

Generated parser sources are committed and checked for drift in CI.

## Neovim preview

Open an isolated Neovim with highlighting and `:InspectTree` without loading or
modifying your normal configuration:

```bash
npm run demo:nvim
npm run demo:nvim:rpgle -- fixtures/rpgle/fully-free/program.rpgle
```

Available preview names are `pf`, `lf`, `icff`, `dspf`, `prtf`, `cl`, `bnd`,
`mi`, `cmd`, `pnlgrp`, `rpgle`, `db2i-rpgle`, `cobol`, and `rpg400`. Neovim
must include built-in Tree-sitter support.

## Releases

Version tags publish individual and combined C-source archives with SHA-256
checksums. No Node bindings or package registry are involved.

```bash
npm run build:release -- v0.1.0
git tag -a v0.1.0 -m "v0.1.0"
git push origin v0.1.0
```
