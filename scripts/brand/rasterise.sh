#!/usr/bin/env bash
# Rasterises brand/svg/*.svg to high-resolution PNGs using headless Chrome/Brave.
# Usage: scripts/brand/rasterise.sh [brand-dir] [browser-binary]
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
BRAND="${1:-$ROOT/brand}"
BROWSER="${2:-/Applications/Brave Browser.app/Contents/MacOS/Brave Browser}"
[ -x "$BROWSER" ] || BROWSER="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

read -r W H < "$BRAND/meta/size.txt"
# 2400px wide for lockups, 1024px for the mark.
LH=$(python3 -c "print(round(2400*$H/$W))")

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

shot() { # svg-file out-file width height background(optional hex or transparent)
  local svg="$1" out="$2" w="$3" h="$4" bg="${5:-transparent}"
  local body="background:transparent"
  [ "$bg" != "transparent" ] && body="background:$bg"
  {
    echo '<!doctype html><html><head><meta charset="utf-8"><style>'
    echo "html,body{margin:0;padding:0;$body}svg{display:block;width:${w}px;height:${h}px}"
    echo '</style></head><body>'
    cat "$svg"
    echo '</body></html>'
  } > "$tmp/page.html"

  "$BROWSER" --headless=new --disable-gpu --hide-scrollbars --no-first-run \
    --force-device-scale-factor=1 --default-background-color=00000000 \
    --window-size="$w,$h" --screenshot="$out" "file://$tmp/page.html" >/dev/null 2>&1
}

mkdir -p "$BRAND/png"

shot "$BRAND/svg/bayan-logo-primary.svg"  "$BRAND/png/bayan-logo-primary-transparent.png" 2400 "$LH"
shot "$BRAND/svg/bayan-logo-primary.svg"  "$BRAND/png/bayan-logo-primary-white-bg.png"   2400 "$LH" "#FFFFFF"
shot "$BRAND/svg/bayan-logo-inverse.svg"  "$BRAND/png/bayan-logo-inverse-transparent.png" 2400 "$LH"
shot "$BRAND/svg/bayan-logo-inverse.svg"  "$BRAND/png/bayan-logo-inverse-navy-bg.png"     2400 "$LH" "#172B3A"
shot "$BRAND/svg/bayan-mark.svg"          "$BRAND/png/bayan-mark-transparent.png"         1024 1024
shot "$BRAND/svg/bayan-mark-inverse.svg"  "$BRAND/png/bayan-mark-inverse-transparent.png" 1024 1024

sips -g pixelWidth -g pixelHeight -g hasAlpha "$BRAND/png/"*.png | sed 's#.*/png/#png/#'
