# treesitter-ibmi

Tree-sitter grammars for IBM i languages: RPGLE, RPG/400, CL, CMD, DDS, ILE
COBOL, MI, binder language, and UIM panel groups.

## Testing in Neovim

For a quick isolated view using a temporary parser and a clean Neovim config:

```bash
npm run demo:nvim
```

This opens the DDS/PF example. The other available DDS parsers have matching
commands:

```bash
npm run demo:nvim:pf
npm run demo:nvim:lf
npm run demo:nvim:icff
```

Each command opens a separate `--clean` Neovim with the built-in `habamax`
theme, highlighting, and `:InspectTree` already active on that dialect's
`orders` fixture. It does not load or write to your normal Neovim
configuration, data, cache, or state directories. Pass another source file
after `--`:

```bash
npm run demo:nvim -- fixtures/dds-pf/keys.pf
npm run demo:nvim:lf -- fixtures/dds-lf/join.lf
npm run demo:nvim:icff -- fixtures/dds-icff/columns.icff
```

The temporary parser is removed when Neovim exits. The command requires Neovim
with built-in Tree-sitter support.

## IBM language references

| Language | Authoritative reference |
| --- | --- |
| DDS physical and logical files | [IBM i 7.5 DDS for physical and logical files](https://www.ibm.com/docs/en/i/7.5?topic=files-dds-physical-logical) · [PDF](https://www.ibm.com/docs/en/ssw_ibm_i_75/rzakb/rzakbpdf.pdf) |
| DDS display files | [IBM i 7.5 DDS for display files](https://www.ibm.com/docs/en/i/7.5?topic=files-dds-display) · [PDF](https://www.ibm.com/docs/en/ssw_ibm_i_75/rzakc/rzakcpdf.pdf) |
| DDS printer files | [IBM i 7.5 DDS for printer files](https://www.ibm.com/docs/en/i/7.5?topic=files-dds-printer) · [PDF](https://www.ibm.com/docs/en/ssw_ibm_i_75/rzakd/rzakdpdf.pdf) |
| DDS ICF files | [IBM i 7.5 DDS for ICF files](https://www.ibm.com/docs/en/i/7.5?topic=files-dds-icf) · [PDF](https://www.ibm.com/docs/en/ssw_ibm_i_75/rzake/rzakepdf.pdf) |
| Binder language | [IBM i 7.5 Binder language](https://www.ibm.com/docs/en/i/7.5?topic=concepts-binder-language) · [ILE Concepts PDF](https://www.ibm.com/docs/en/ssw_ibm_i_75/ilec/sc415606.pdf) |
| ILE COBOL and COBOL/400 | [ILE COBOL Language Reference SC09-2539](https://www.ibm.com/docs/en/ssw_ibm_i_75/pdf/sc092539.pdf) · [Programmer's Guide SC09-2540](https://www.ibm.com/docs/en/ssw_ibm_i_75/pdf/sc092540.pdf) |
| Embedded SQL in COBOL | [IBM i 7.5 embedding SQL in COBOL](https://www.ibm.com/docs/en/i/7.5.0?topic=cssica-embedding-sql-statements-in-cobol-applications-that-use-sql) · [Embedded SQL Programming PDF](https://www.ibm.com/docs/en/ssw_ibm_i_75/pdf/rzajppdf.pdf) |
| CL and command definitions | [IBM i 7.5 Control Language](https://www.ibm.com/docs/en/i/7.5?topic=programming-control-language) · [PDF](https://www.ibm.com/docs/en/ssw_ibm_i_75/rbam6/rbam6pdf.pdf) |
| Machine Interface | [IBM i 7.5 Machine Interface instructions](https://www.ibm.com/docs/en/i/7.5?topic=programming-machine-interface-instructions) |
| ILE RPG | [ILE RPG Reference SC09-2508](https://www.ibm.com/docs/en/i/7.5?topic=rpg-ile-reference) · [PDF](https://www.ibm.com/docs/en/ssw_ibm_i_75/rzasd/sc092508.pdf) |
| Embedded SQL in ILE RPG | [IBM i 7.5 embedding SQL in ILE RPG](https://www.ibm.com/docs/en/i/7.5.0?topic=cssiira-embedding-sql-statements-in-ile-rpg-applications-that-use-sql) |
| Db2 for i SQL | [IBM i 7.5 SQL reference](https://www.ibm.com/docs/en/i/7.5?topic=reference-sql) · [PDF](https://www.ibm.com/docs/en/ssw_ibm_i_75/pdf/rbafzpdf.pdf) |
| UIM panel groups | [Application Display Programming SC41-5715](https://public.dhe.ibm.com/systems/power/docs/systemi/v6r1/en_US/sc415715.pdf), appendix A |
| RPG/400 and RPG III | RPG/400 Reference SC09-1817 (no longer hosted by IBM) · [searchable mirror](https://jss-grp.com/attachfile/RPG400%20Reference.pdf) |
| Embedded SQL in RPG/400 | [IBM i 7.5 embedding SQL in RPG/400](https://www.ibm.com/docs/en/i/7.5.0?topic=cssira-embedding-sql-statements-in-rpg400-applications-that-use-sql) |
