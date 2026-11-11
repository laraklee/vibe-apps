#!/usr/bin/env bash
# Security scan for the HTML apps.
#
#   npm run scan                 scan everything
#   bash scripts/scan.sh FILE    scan one file or folder
#   --strict                     also fail on warnings (used by the Claude hook)
#
# Three checks:
#   1. gitleaks        secrets such as API keys
#   2. check-html.js   AI calls, tracking, outside hosts, network calls, personal info
#   3. check-personal.sh   personal details (this repo is public)

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

echo "== 3. Personal info (check-personal.sh)"
PI_FILES=()
for t in "${TARGETS[@]}"; do
  # "." means every tracked file; a folder means every tracked file inside it.
  if [ "$t" = "." ]; then PI_FILES=(); break
  elif [ -d "$t" ]; then while IFS= read -r f; do PI_FILES+=("$f"); done < <(git ls-files "$t")
  else PI_FILES+=("$t"); fi
done
if [ ${#PI_FILES[@]} -eq 0 ]; then bash scripts/check-personal.sh || status=1
else bash scripts/check-personal.sh "${PI_FILES[@]}" || status=1; fi

if [ $status -eq 0 ]; then echo "== PASS"; else echo "== ISSUES FOUND (see above)"; fi
exit $status
