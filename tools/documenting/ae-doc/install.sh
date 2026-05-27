#!/usr/bin/env bash
set -e

DEST="$HOME/.claude/commands"
mkdir -p "$DEST"

curl -fsSL \
  https://raw.githubusercontent.com/sean-mckeever/stillpeak-tools/main/tools/documenting/ae-doc/command.md \
  -o "$DEST/ae-doc.md"

echo "ae-doc installed. Use /ae-doc <path-to-model.sql> in Claude Code."
