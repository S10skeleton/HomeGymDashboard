#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Cyber Gym OS — Installer
# Installs to ~/.local/share/cyber-gym, creates desktop icon + app menu entry,
# and sets up an optional systemd user service so it starts at login.
# ─────────────────────────────────────────────────────────────────────────────
set -e

APP_NAME="Cyber Gym OS"
INSTALL_DIR="$HOME/.local/share/cyber-gym"
SERVICE_NAME="cyber-gym"
PORT=3000

# ── Colours ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; CYAN='\033[0;36m'
YELLOW='\033[1;33m'; BOLD='\033[1m'; NC='\033[0m'

info()    { echo -e "  ${CYAN}→${NC}  $*"; }
success() { echo -e "  ${GREEN}✓${NC}  $*"; }
warn()    { echo -e "  ${YELLOW}!${NC}  $*"; }
error()   { echo -e "  ${RED}✗${NC}  $*"; }
header()  { echo -e "\n${BOLD}$*${NC}"; }

# ── Source directory (where this script lives) ────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "$(readlink -f "$0")")" && pwd)"

header "━━━  $APP_NAME Installer  ━━━"
echo ""
info "Source : $SCRIPT_DIR"
info "Install: $INSTALL_DIR"
echo ""

# ── 1. Check Node.js ──────────────────────────────────────────────────────────
header "Checking Node.js..."
if command -v node >/dev/null 2>&1; then
  NODE_VER=$(node --version)
  success "Node.js $NODE_VER found"
else
  warn "Node.js not found. Attempting to install via NodeSource (requires curl + sudo)..."
  if ! command -v curl >/dev/null 2>&1; then
    error "curl not found. Install it with: sudo apt install curl"
    exit 1
  fi
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
  success "Node.js $(node --version) installed"
fi

# Warn if version is old
NODE_MAJOR=$(node --version | sed 's/v\([0-9]*\).*/\1/')
if [ "$NODE_MAJOR" -lt 18 ]; then
  error "Node.js 18+ required. You have $(node --version)."
  echo "     Update from https://nodejs.org or via NodeSource."
  exit 1
fi

# ── 2. Copy app files ─────────────────────────────────────────────────────────
header "Installing app files..."
mkdir -p "$INSTALL_DIR"

# Sync files, excluding things that shouldn't travel
rsync -a --delete \
  --exclude='.env' \
  --exclude='node_modules/' \
  --exclude='dist/' \
  --exclude='data/' \
  --exclude='.git/' \
  "$SCRIPT_DIR/" "$INSTALL_DIR/" 2>/dev/null || {
  # rsync not available — fall back to cp
  cp -r "$SCRIPT_DIR/." "$INSTALL_DIR/"
  rm -rf "$INSTALL_DIR/.env" "$INSTALL_DIR/node_modules" \
         "$INSTALL_DIR/dist" "$INSTALL_DIR/data" "$INSTALL_DIR/.git" 2>/dev/null || true
}

success "App files copied"

# ── 3. Anthropic API key ──────────────────────────────────────────────────────
header "Anthropic API Key..."
ENV_FILE="$INSTALL_DIR/.env"

if [ -f "$ENV_FILE" ] && grep -q "ANTHROPIC_API_KEY=sk-" "$ENV_FILE" 2>/dev/null; then
  success "API key already configured (kept existing .env)"
else
  echo ""
  echo "  The AI Coach requires an Anthropic API key."
  echo "  Get one free at: https://console.anthropic.com"
  echo "  (You can press Enter to skip and add it later by editing $ENV_FILE)"
  echo ""
  read -rp "  Paste your API key (sk-ant-...): " API_KEY
  echo ""
  if [ -n "$API_KEY" ]; then
    printf 'ANTHROPIC_API_KEY=%s\nPORT=%s\nHOST=0.0.0.0\n' "$API_KEY" "$PORT" > "$ENV_FILE"
    success "API key saved"
  else
    printf 'ANTHROPIC_API_KEY=\nPORT=%s\nHOST=0.0.0.0\n' "$PORT" > "$ENV_FILE"
    warn "Skipped — edit $ENV_FILE to add your key later"
  fi
fi

# ── 4. Install npm dependencies ───────────────────────────────────────────────
# Full install (including devDependencies) — vite lives there and is
# required by `npm run build` below.
header "Installing dependencies..."
cd "$INSTALL_DIR"
npm install --prefer-offline 2>&1 | tail -3
success "Dependencies installed"

# ── 5. Build frontend ─────────────────────────────────────────────────────────
header "Building frontend..."
npm run build 2>&1 | tail -5
success "Frontend built"

# ── 6. Make launcher executable ───────────────────────────────────────────────
chmod +x "$INSTALL_DIR/forge.sh" 2>/dev/null || true

# ── 7. Desktop icon + app menu entry ─────────────────────────────────────────
header "Creating desktop shortcuts..."
ICON_PATH="$INSTALL_DIR/public/CyberGym-icon.png"
[ -f "$ICON_PATH" ] || ICON_PATH="utilities-terminal"

DESKTOP_ENTRY="[Desktop Entry]
Version=1.0
Type=Application
Name=Cyber Gym OS
Comment=Home gym workout dashboard
Exec=bash -c 'cd \"$INSTALL_DIR\" && ./forge.sh'
Icon=$ICON_PATH
Terminal=false
StartupNotify=true
Categories=Utility;Sports;
Keywords=gym;workout;fitness;tracker;"

APP_MENU="$HOME/.local/share/applications/cyber-gym.desktop"
mkdir -p "$(dirname "$APP_MENU")"
printf '%s\n' "$DESKTOP_ENTRY" > "$APP_MENU"
chmod +x "$APP_MENU"
success "App menu entry created"

DESKTOP="$HOME/Desktop/cyber-gym.desktop"
if [ -d "$HOME/Desktop" ]; then
  printf '%s\n' "$DESKTOP_ENTRY" > "$DESKTOP"
  chmod +x "$DESKTOP"
  gio set "$DESKTOP" metadata::trusted true 2>/dev/null || true
  success "Desktop icon created"
fi

# ── 8. Systemd auto-start (optional) ─────────────────────────────────────────
header "Auto-start at login..."
echo ""
read -rp "  Start Cyber Gym automatically when you log in? [y/N]: " AUTO_START
echo ""

SYSTEMD_DIR="$HOME/.config/systemd/user"
SERVICE_FILE="$SYSTEMD_DIR/$SERVICE_NAME.service"

if [[ "${AUTO_START,,}" == "y" ]]; then
  mkdir -p "$SYSTEMD_DIR"
  cat > "$SERVICE_FILE" << SERVICE
[Unit]
Description=Cyber Gym OS — home gym dashboard
After=network.target

[Service]
Type=simple
WorkingDirectory=$INSTALL_DIR
ExecStart=$(which node) server/index.js
Restart=on-failure
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=default.target
SERVICE

  systemctl --user daemon-reload
  systemctl --user enable "$SERVICE_NAME"
  systemctl --user start  "$SERVICE_NAME"
  success "Service installed and started (auto-starts at login)"
  info "Manage with: systemctl --user {start|stop|restart|status} $SERVICE_NAME"
else
  # Remove service if it was previously installed
  if [ -f "$SERVICE_FILE" ]; then
    systemctl --user stop    "$SERVICE_NAME" 2>/dev/null || true
    systemctl --user disable "$SERVICE_NAME" 2>/dev/null || true
    rm -f "$SERVICE_FILE"
    systemctl --user daemon-reload 2>/dev/null || true
  fi
  info "Skipped — launch manually via desktop icon or: $INSTALL_DIR/forge.sh"
fi

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${GREEN}━━━  Installation complete!  ━━━${NC}"
echo ""
echo "  App installed to: $INSTALL_DIR"
echo "  Running on:       http://localhost:$PORT"
echo ""
echo "  To launch:  double-click the desktop icon"
echo "             or run: $INSTALL_DIR/forge.sh"
echo ""
if [ -z "$API_KEY" ]; then
  echo -e "  ${YELLOW}Remember to add your Anthropic API key to:${NC}"
  echo "  $ENV_FILE"
  echo ""
fi
