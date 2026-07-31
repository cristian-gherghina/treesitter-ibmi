#!/usr/bin/env bash
# Build one DDS parser temporarily and inspect it in a clean Neovim.

set -euo pipefail

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
dialect="${1:-pf}"

case "$dialect" in
  pf)
    extensions="dds,pf,pf38"
    default_source="$repo_root/fixtures/dds-pf/orders.pf"
    ;;
  lf)
    extensions="lf,lf38"
    default_source="$repo_root/fixtures/dds-lf/orders.lf"
    ;;
  icff)
    extensions="icff"
    default_source="$repo_root/fixtures/dds-icff/orders.icff"
    ;;
  dspf)
    extensions="dspf,dspf38"
    default_source="$repo_root/fixtures/dds-dspf/orders.dspf"
    ;;
  prtf)
    extensions="prtf,prtf38"
    default_source="$repo_root/fixtures/dds-prtf/orders.prtf"
    ;;
  *)
    echo "Unsupported DDS dialect: $dialect" >&2
    exit 2
    ;;
esac

source_file="${2:-$default_source}"
temp_dir="$(mktemp -d)"
language="dds_$dialect"
parser_path="$temp_dir/$language.so"

cleanup() {
  rm -rf "$temp_dir"
}
trap cleanup EXIT

XDG_CACHE_HOME="$temp_dir/cache" \
  "$repo_root/node_modules/.bin/tree-sitter" build \
  --output "$parser_path" \
  "$repo_root/grammars/dds/$dialect"

TS_IBMI_LANGUAGE="$language" \
TS_IBMI_PARSER="$parser_path" \
TS_IBMI_HIGHLIGHTS="$repo_root/grammars/dds/$dialect/queries/highlights.scm" \
TS_IBMI_EXTENSIONS="$extensions" \
XDG_CACHE_HOME="$temp_dir/nvim/cache" \
XDG_CONFIG_HOME="$temp_dir/nvim/config" \
XDG_DATA_HOME="$temp_dir/nvim/data" \
XDG_STATE_HOME="$temp_dir/nvim/state" \
  nvim --clean -u "$repo_root/editors/nvim/parser-demo.lua" "$source_file"
