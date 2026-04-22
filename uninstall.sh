#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Cyber Gym OS — Uninstaller
# ─────────────────────────────────────────────────────────────────────────────
set -e
INSTALL_DIR="$HOME/.local/share/cyber-gym"
SERVICE_NAME="cyber-gym"

echo ""
echo "  This will remove Cyber Gym OS from your system."
echo "  Your workout data lives in $INSTALL_DIR/data and will be deleted."
echo ""
read -rp "  Are you sure? [y/N]: " CONFIRM
echo ""
[[ "${CONFIRM,,}" != "y" ]] && echo "  Cancelled." && exit 0

# Stop and remove service
systemctl --user stop    "$SERVICE_NAME" 2>/dev/null || true
systemctl --user disable "$SERVICE_NAME" 2>/dev/null || true
rm -f "$HOME/.config/systemd/user/$SERVICE_NAME.service"
systemctl --user daemon-reload 2>/dev/null || true

# Remove app files
rm -rf "$INSTALL_DIR"

# Remove shortcuts
rm -f "$HOME/.local/share/applications/cyber-gym.desktop"
rm -f "$HOME/Desktop/cyber-gym.desktop"

echo "  Cyber Gym OS has been removed."
echo ""
