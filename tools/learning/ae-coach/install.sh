#!/usr/bin/env bash
set -e

INSTALL_DIR="$HOME/.ae-coach/cli"
BIN_DIR="$HOME/.local/bin"
REPO_URL="https://github.com/sean-mckeever/stillpeak-tools"
TOOL_SUBDIR="tools/learning/ae-coach"

# Check for bun
if ! command -v bun &> /dev/null; then
  echo "ae-coach requires bun. Install it first:"
  echo "  curl -fsSL https://bun.sh/install | bash"
  exit 1
fi

echo "Installing ae-coach..."

# Sparse clone just the ae-coach subtree
if [ -d "$INSTALL_DIR/.git" ]; then
  git -C "$INSTALL_DIR" pull --quiet
else
  mkdir -p "$(dirname "$INSTALL_DIR")"
  git clone --quiet --filter=blob:none --sparse "$REPO_URL" "$INSTALL_DIR"
  git -C "$INSTALL_DIR" sparse-checkout set "$TOOL_SUBDIR"
fi

TOOL_DIR="$INSTALL_DIR/$TOOL_SUBDIR"

# Install dependencies
bun install --cwd "$TOOL_DIR" --silent

# Link the binary
mkdir -p "$BIN_DIR"
ln -sf "$TOOL_DIR/bin/ae-coach" "$BIN_DIR/ae-coach"

# Ensure ~/.local/bin is in PATH
if [[ ":$PATH:" != *":$BIN_DIR:"* ]]; then
  SHELL_RC="$HOME/.zshrc"
  [ -f "$HOME/.bashrc" ] && SHELL_RC="$HOME/.bashrc"
  echo "export PATH=\"\$HOME/.local/bin:\$PATH\"" >> "$SHELL_RC"
  export PATH="$BIN_DIR:$PATH"
fi

echo ""
ae-coach init
