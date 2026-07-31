#!/usr/bin/env bash
# Build the CL parser temporarily and inspect it in a clean Neovim.

set -euo pipefail

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
source_file="${1:-$repo_root/fixtures/cl/program.clle}"
temp_dir="$(mktemp -d)"
parser_path="$temp_dir/ibmi_cl.so"

cleanup() {
  rm -rf "$temp_dir"
}
trap cleanup EXIT

XDG_CACHE_HOME="$temp_dir/cache" \
  "$repo_root/node_modules/.bin/tree-sitter" build \
  --output "$parser_path" \
  "$repo_root/grammars/cl"

TS_IBMI_LANGUAGE="ibmi_cl" \
TS_IBMI_PARSER="$parser_path" \
TS_IBMI_HIGHLIGHTS="$repo_root/grammars/cl/queries/highlights.scm" \
TS_IBMI_EXTENSIONS="cl,clle,clp,clp38" \
XDG_CACHE_HOME="$temp_dir/nvim/cache" \
XDG_CONFIG_HOME="$temp_dir/nvim/config" \
XDG_DATA_HOME="$temp_dir/nvim/data" \
XDG_STATE_HOME="$temp_dir/nvim/state" \
  nvim --clean -u "$repo_root/editors/nvim/parser-demo.lua" "$source_file"
