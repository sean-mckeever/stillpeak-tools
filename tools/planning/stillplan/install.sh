#!/usr/bin/env bash
set -e

DEST="$HOME/.claude/commands"
mkdir -p "$DEST"

curl -fsSL \
  https://raw.githubusercontent.com/sean-mckeever/stillpeak-tools/main/tools/planning/stillplan/command.md \
  -o "$DEST/stillplan.md"

echo "StillPlan installed. Use /stillplan in Claude Code."
