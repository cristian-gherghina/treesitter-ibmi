#!/usr/bin/env bash
# Fetch an IBM i documentation page as plain text.
#
# Adapted from ~/repos/warabi/scripts/ibmdoc.sh. Successful responses are
# cached in this repository's untracked tmp/ibmdoc directory.
#
# Usage:
#   ./scripts/ibmdoc.sh ssw_ibm_i_75/rbam6/rbam6objnamrules.htm
#   ./scripts/ibmdoc.sh 'https://www.ibm.com/docs/en/i/7.5.0?topic=objects-object-naming-rules'

set -euo pipefail

user_agent="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"

arg="${1:?usage: ibmdoc.sh <page-id|url>}"
case "$arg" in
  http*) url="$arg" ;;
  *) url="https://www.ibm.com/docs/api/v1/content/$arg" ;;
esac

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
cache_dir="$repo_root/tmp/ibmdoc"
cache_file="$cache_dir/$(printf '%s' "$arg" | tr -c 'A-Za-z0-9._-' '_').txt"

if [ -s "$cache_file" ]; then
  cat "$cache_file"
  exit 0
fi

page="$(
  curl -sS -A "$user_agent" -L --max-time 30 "$url" |
    python3 -c "
import html
import re
import sys

text = sys.stdin.read()
text = re.sub(r'(?is)<(script|style|noscript).*?</\\1>', '', text)
text = re.sub(r'(?i)<br\\s*/?>|</p>|</div>|</li>|</tr>|</h[1-6]>|</pre>', '\\n', text)
text = re.sub(r'(?i)<li>', '  - ', text)
text = re.sub(r'(?i)<t[dh][^>]*>', '\\t', text)
text = re.sub(r'<[^>]+>', '', text)
text = html.unescape(text)
text = re.sub(r'[ \\t]+\\n', '\\n', text)
print(re.sub(r'\\n{3,}', '\\n\\n', text).strip())
"
)"

case "$page" in
  "IBM notice: The page you requested cannot be displayed"*)
    echo "ibmdoc: no such page: $url" >&2
    echo "ibmdoc: check the version directory, book directory, and .htm name" >&2
    exit 1
    ;;
esac

mkdir -p "$cache_dir"
printf '%s\n' "$page" >"$cache_file"
printf '%s\n' "$page"
