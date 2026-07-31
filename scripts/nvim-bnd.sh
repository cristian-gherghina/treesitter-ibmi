#!/usr/bin/env bash
# Build the binder parser temporarily and inspect it in a clean Neovim.

set -euo pipefail

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
source_file="${1:-$repo_root/fixtures/bnd/servicepgm.bnd}"
temp_dir="$(mktemp -d)"
parser_path="$temp_dir/ibmi_bnd.so"

cleanup() {
  rm -rf "$temp_dir"
}
trap cleanup EXIT

XDG_CACHE_HOME="$temp_dir/cache" \
  "$repo_root/node_modules/.bin/tree-sitter" build \
  --output "$parser_path" \
  "$repo_root/grammars/bnd"

TS_IBMI_LANGUAGE="ibmi_bnd" \
TS_IBMI_PARSER="$parser_path" \
TS_IBMI_HIGHLIGHTS="$repo_root/grammars/bnd/queries/highlights.scm" \
TS_IBMI_EXTENSIONS="bnd" \
XDG_CACHE_HOME="$temp_dir/nvim/cache" \
XDG_CONFIG_HOME="$temp_dir/nvim/config" \
XDG_DATA_HOME="$temp_dir/nvim/data" \
XDG_STATE_HOME="$temp_dir/nvim/state" \
  nvim --clean -u "$repo_root/editors/nvim/parser-demo.lua" "$source_file"
