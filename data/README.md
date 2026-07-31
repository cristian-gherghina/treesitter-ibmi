# IBM i language data

These tracked tables are inputs to the tree-sitter grammars.

## Provenance

The initial import was made on 2026-07-30 from
[`barrettotte/vscode-ibmi-languages`](https://github.com/barrettotte/vscode-ibmi-languages)
at commit `e6c1cf0b541f77f23abd7c32b257a85a741facc9` (v0.7.0). That extension records
coverage through the July 2026 IBM i 7.6 and 7.5 PTF enhancements.

| Files | IBM source | Retrieval/version notes |
| --- | --- | --- |
| `rpgiv-cols.json`, `rpgle-definition-keyword-syntax.json`, `rpgle-definition-keywords.json`, `rpgle-builtins.json`, `rpgle-closed-sets.json` | ILE RPG Reference SC09-2508 | IBM i 7.5 reference; keyword updates through July 2026 PTF enhancements |
| `rpg3-cols.json` | RPG/400 Reference SC09-1817 | First edition, June 1994; column charts cross-checked by the source fixture generators |
| `sql-patterns.json` | Db2 for i SQL Reference and Embedded SQL Programming | IBM i 7.5; imported 2026-07-30 |
| `cl-commands.json` | IBM i CL command reference | IBM i 7.5/7.6 coverage; extracted from the extension grammar on 2026-07-30 |
| `dds-pf-keywords.json`, `dds-lf-keywords.json` | DDS for physical and logical files | IBM i 7.5; source material retrieved 2026-07-28 |
| `dds-dspf-keywords.json` | DDS for display files | IBM i 7.5; source material retrieved 2026-07-28 |
| `dds-prtf-keywords.json` | DDS for printer files | IBM i 7.5; source material retrieved 2026-07-28 |
| `dds-icff-keywords.json` | DDS for ICF files | IBM i 7.5; source material retrieved 2026-07-28 |
| `pnlgrp-tags.json` | Application Display Programming SC41-5715, appendix A | IBM i V6R1 manual; source material retrieved 2026-07-28 |

The extraction-only script `scripts/extract-textmate-data.mjs` documents how
keyword alternations were converted to sorted JSON lists. It is not a sync
mechanism and normal builds do not require the extension repository.
