#!/usr/bin/env bash
# One-time installer for the Ubuntu desktop launcher.
# Creates a clickable icon on the Desktop and an entry in the Applications menu,
# both with absolute paths baked in so the shortcut works regardless of where
# it is later moved or clicked from.
set -e

DIR="$(cd "$(dirname "$(readlink -f "$0")")" && pwd)"
DESKTOP_FILE="$HOME/Desktop/cyber-gym.desktop"
APP_FILE="$HOME/.local/share/applications/cyber-gym.desktop"

chmod +x "$DIR/forge.sh"
mkdir -p "$HOME/.local/share/applications"

if [ -f "$DIR/public/CyberGym-icon.png" ]; then
  ICON_LINE="Icon=$DIR/public/CyberGym-icon.png"
elif [ -f "$DIR/icon.png" ]; then
  ICON_LINE="Icon=$DIR/icon.png"
else
  ICON_LINE="Icon=utilities-terminal"
fi

ENTRY="[Desktop Entry]
Version=1.0
Type=Application
Name=Cyber Gym OS
Comment=Home gym dashboard
Exec=gnome-terminal --title=\"CYBER GYM OS\" -- bash -c \"cd '$DIR' && ./forge.sh; exec bash\"
$ICON_LINE
Terminal=false
Categories=Utility;"

mkdir -p "$(dirname "$DESKTOP_FILE")"
printf '%s\n' "$ENTRY" > "$APP_FILE"
chmod +x "$APP_FILE"
printf '%s\n' "$ENTRY" > "$DESKTOP_FILE"
chmod +x "$DESKTOP_FILE"

gio set "$DESKTOP_FILE" metadata::trusted true 2>/dev/null || true

echo
echo "  Installed launcher:"
echo "    Applications menu: $APP_FILE"
echo "    Desktop icon:      $DESKTOP_FILE"
echo
echo "  Icon source: ${ICON_LINE#Icon=}"
echo "  To change, replace public/CyberGym-icon.png and re-run this script."
echo
echo "  If the desktop icon shows as a text file on first click, right-click it"
echo "  and choose 'Allow Launching' (GNOME asks once, then remembers)."
echo
