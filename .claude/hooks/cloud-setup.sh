#!/usr/bin/env bash
# SessionStart hook: install dependencies in Claude Code cloud sessions only.
# Local sessions exit immediately. stdout is added to Claude's context, so keep it to one line.
[ "$CLAUDE_CODE_REMOTE" = "true" ] || exit 0
cd "$CLAUDE_PROJECT_DIR" || exit 0
if [ -d node_modules ]; then
  echo "cloud-setup: node_modules present, skipped install"
  exit 0
fi
if npm ci --no-audit --no-fund --loglevel=error >&2; then
  echo "cloud-setup: npm ci done"
else
  echo "cloud-setup: npm ci FAILED, run it manually before tests"
fi
