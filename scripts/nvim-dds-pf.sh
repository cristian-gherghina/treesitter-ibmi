#!/usr/bin/env bash
# Build DDS/PF in a temporary directory and inspect it in a clean Neovim.

set -euo pipefail

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
source_file="${1:-$repo_root/fixtures/dds-pf/orders.pf}"
temp_dir="$(mktemp -d)"
parser_path="$temp_dir/dds_pf.so"

cleanup() {
  rm -rf "$temp_dir"
}
trap cleanup EXIT

XDG_CACHE_HOME="$temp_dir/cache" \
  "$repo_root/node_modules/.bin/tree-sitter" build \
  --output "$parser_path" \
  "$repo_root/grammars/dds/pf"

TS_IBMI_REPO_ROOT="$repo_root" \
TS_IBMI_DDS_PF_PARSER="$parser_path" \
XDG_CACHE_HOME="$temp_dir/nvim/cache" \
XDG_CONFIG_HOME="$temp_dir/nvim/config" \
XDG_DATA_HOME="$temp_dir/nvim/data" \
XDG_STATE_HOME="$temp_dir/nvim/state" \
  nvim --clean -u "$repo_root/editors/nvim/dds-pf-demo.lua" "$source_file"
