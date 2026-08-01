#!/usr/bin/env bash
# Build one parser temporarily and inspect it in a clean Neovim.

set -euo pipefail

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
parser="${1:-dds-pf}"

case "$parser" in
  dds-pf)   language="dds_pf";   grammar="dds/pf";   extensions="dds,pf,pf38";  default_source="fixtures/dds-pf/orders.pf" ;;
  dds-lf)   language="dds_lf";   grammar="dds/lf";   extensions="lf,lf38";       default_source="fixtures/dds-lf/orders.lf" ;;
  dds-icff) language="dds_icff"; grammar="dds/icff"; extensions="icff";          default_source="fixtures/dds-icff/orders.icff" ;;
  dds-dspf) language="dds_dspf"; grammar="dds/dspf"; extensions="dspf,dspf38";   default_source="fixtures/dds-dspf/orders.dspf" ;;
  dds-prtf) language="dds_prtf"; grammar="dds/prtf"; extensions="prtf,prtf38";   default_source="fixtures/dds-prtf/orders.prtf" ;;
  cl)       language="ibmi_cl";  grammar="cl";       extensions="cl,clle,clp,clp38"; default_source="fixtures/cl/program.clle" ;;
  bnd)      language="ibmi_bnd"; grammar="bnd";      extensions="bnd";           default_source="fixtures/bnd/servicepgm.bnd" ;;
  mi)       language="ibmi_mi";  grammar="mi";       extensions="mi";            default_source="fixtures/mi/program.mi" ;;
  cmd)      language="ibmi_cmd"; grammar="cmd";      extensions="cmd";           default_source="fixtures/cmd/command.cmd" ;;
  pnlgrp)   language="ibmi_pnlgrp"; grammar="pnlgrp"; extensions="pnlgrp";        default_source="fixtures/pnlgrp/panel.pnlgrp" ;;
  rpgle)    language="ibmi_rpgle"; grammar="rpgle"; extensions="rpgle,rpgleinc,sqlrpgle"; default_source="fixtures/rpgle/fully-free/program.rpgle" ;;
  db2i-rpgle) language="ibmi_db2i_sql_rpgle"; grammar="db2i-rpgle"; extensions="sql"; default_source="fixtures/db2i-rpgle/select.sql" ;;
  cobol)    language="ibmi_cobol"; grammar="cobol"; extensions="cblle,cbl,cbl38,sqlcbl,sqlcblle"; default_source="fixtures/cobol/program.cblle" ;;
  *)
    echo "Unsupported parser: $parser" >&2
    exit 2
    ;;
esac

grammar_path="$repo_root/grammars/$grammar"
source_file="${2:-$repo_root/$default_source}"
temp_dir="$(mktemp -d)"
parser_path="$temp_dir/$language.so"

cleanup() {
  rm -rf "$temp_dir"
}
trap cleanup EXIT

XDG_CACHE_HOME="$temp_dir/cache" \
  "$repo_root/node_modules/.bin/tree-sitter" build \
  --output "$parser_path" \
  "$grammar_path"

TS_IBMI_LANGUAGE="$language" \
TS_IBMI_PARSER="$parser_path" \
TS_IBMI_HIGHLIGHTS="$grammar_path/queries/highlights.scm" \
TS_IBMI_EXTENSIONS="$extensions" \
XDG_CACHE_HOME="$temp_dir/nvim/cache" \
XDG_CONFIG_HOME="$temp_dir/nvim/config" \
XDG_DATA_HOME="$temp_dir/nvim/data" \
XDG_STATE_HOME="$temp_dir/nvim/state" \
  nvim --clean -u "$repo_root/editors/nvim/parser-demo.lua" "$source_file"
