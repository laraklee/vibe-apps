#!/usr/bin/env bash
# Security scan for the HTML apps.
#
#   npm run scan                 scan everything
#   bash scripts/scan.sh FILE    scan one file or folder
#   --strict                     also fail on warnings (used by the Claude hook)
#
# Two checks:
#   1. gitleaks        secrets such as API keys
#   2. check-html.js   AI calls, tracking, outside hosts, network calls, personal info

cd "$(dirname "$0")/.." || exit 1
STRICT=""
if [ "$1" = "--strict" ]; then STRICT="--strict"; shift; fi
TARGETS=("$@")
[ ${#TARGETS[@]} -eq 0 ] && TARGETS=(".")

status=0

echo "== 1. Secret scan (gitleaks)"
if command -v gitleaks >/dev/null 2>&1; then
  for t in "${TARGETS[@]}"; do
    gitleaks dir "$t" --config .gitleaks.toml --redact --no-banner --log-level error -v || status=1
  done
else
  echo "   gitleaks is not installed, so secrets were NOT checked. See SETUP.md."
  status=1
fi

echo "== 2. HTML app check (check-html.js)"
# With no file named, check only the apps (not this repo's own scripts).
if [ $# -eq 0 ]; then HTML_TARGETS=("apps"); else HTML_TARGETS=("${TARGETS[@]}"); fi
node scripts/check-html.js $STRICT "${HTML_TARGETS[@]}" || status=1

if [ $status -eq 0 ]; then echo "== PASS"; else echo "== ISSUES FOUND (see above)"; fi
exit $status
