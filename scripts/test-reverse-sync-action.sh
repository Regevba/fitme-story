#!/usr/bin/env bash
# scripts/test-reverse-sync-action.sh
#
# Local test wrapper for the reverse-sync GitHub Action workflow.
# Per FT2 spec docs/superpowers/specs/2026-05-11-cross-repo-state-sync-impl-design.md §6.4 + plan Task 3.3.
#
# Validates the workflow YAML can parse correctly + dry-runs the workflow
# against a synthetic push event without actually opening a real PR.
#
# Requirements:
#   - act:        brew install act
#   - actionlint: brew install actionlint  (optional but recommended)

set -euo pipefail

WORKFLOW=".github/workflows/reverse-sync-fitme-story-to-ft2.yml"

if [ ! -f "$WORKFLOW" ]; then
  echo "FAIL: workflow file not found at $WORKFLOW"
  echo "Run from the fitme-story repo root."
  exit 1
fi

# Step 1: actionlint (if installed)
if command -v actionlint >/dev/null; then
  echo "===== actionlint ====="
  actionlint "$WORKFLOW"
else
  echo "WARN: actionlint not installed; skipping. Install with: brew install actionlint"
fi

# Step 2: yaml syntax check via Python
echo ""
echo "===== YAML syntax (yaml.safe_load) ====="
python3 -c "import yaml; yaml.safe_load(open('$WORKFLOW')); print('OK')"

# Step 3: act dry-run (if installed)
if ! command -v act >/dev/null; then
  echo ""
  echo "WARN: act not installed; skipping dry-run. Install with: brew install act"
  echo "      To install: brew install act"
  echo "      Docs: https://github.com/nektos/act"
  exit 0
fi

echo ""
echo "===== act dry-run with synthetic push event ====="

# Create a synthetic push event payload
EVENT_FILE=$(mktemp)
trap "rm -f $EVENT_FILE" EXIT

cat > "$EVENT_FILE" <<'PUSH_EOF'
{
  "ref": "refs/heads/main",
  "before": "0000000000000000000000000000000000000000",
  "after": "abcdef1234567890abcdef1234567890abcdef12",
  "commits": [
    {
      "id": "abcdef1234567890abcdef1234567890abcdef12",
      "modified": [".claude/features/test-fs-native/state.json"]
    }
  ],
  "repository": {
    "name": "fitme-story",
    "full_name": "Regevba/fitme-story"
  }
}
PUSH_EOF

# Dry-run: --dryrun shows the steps without executing
act push -e "$EVENT_FILE" --workflows "$WORKFLOW" --dryrun

echo ""
echo "===== test-reverse-sync-action: PASS ====="
echo "Workflow YAML lints + dry-runs cleanly. End-to-end test deferred to Phase 4 cutover."
