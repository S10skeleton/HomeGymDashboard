#!/usr/bin/env bash
set -e
cd "$(dirname "$(readlink -f "$0")")"

if ! command -v node >/dev/null 2>&1; then
  echo
  echo "  Node.js is not installed."
  echo "  Install with: sudo apt install nodejs npm"
  echo "  Or follow https://github.com/nodesource/distributions for a newer version."
  echo
  read -rp "Press Enter to close..."
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "First run - installing dependencies. This may take a minute..."
  npm install
fi

if [ ! -d dist ]; then
  echo "Building frontend..."
  npm run build
fi

echo
echo "  CYBER GYM OS running at http://localhost:3000"
echo "  Close this window to shut down the server."
echo

(sleep 2 && xdg-open http://localhost:3000 >/dev/null 2>&1) &
exec node server/index.js
