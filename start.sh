#!/usr/bin/env bash
# Quick local launcher for EasyFeedback (macOS / Linux).
# Usage: ./start.sh   (run `chmod +x start.sh` once if needed)
set -e

# Always run from the project root (this script's directory).
cd "$(dirname "$0")"

# Node must be installed.
if ! command -v node >/dev/null 2>&1; then
  echo "Error: Node.js is not installed or not on your PATH. Install Node 20.6+ and retry."
  exit 1
fi

# Install dependencies on first run.
if [ ! -d node_modules ]; then
  echo "Installing dependencies (first run)..."
  npm install
fi

# Load the API key from .env if present; otherwise warn.
if [ -f .env ]; then
  echo "Starting EasyFeedback with .env (http://localhost:${PORT:-3000}) ..."
  exec node --env-file=.env src/server.js
else
  echo "Warning: no .env file found. Set ANTHROPIC_API_KEY in your environment,"
  echo "or copy .env.example to .env and add your key. Starting anyway..."
  echo "Starting EasyFeedback (http://localhost:${PORT:-3000}) ..."
  exec node src/server.js
fi
