#!/usr/bin/env python3
"""
Generates the BAYAN GROUP logo lockups as vector SVGs with the wordmark converted to paths.

Requires: pip install fonttools brotli, and Manrope[wght].ttf (Google Fonts).
Run:  python3 scripts/brand/generate.py /path/to/Manrope.ttf brand
"""
import sys
from pathlib import Path

from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

NAVY = "#172B3A"
TEAL = "#239A96"
GOLD = "#B69A63"
MUTED = "#697781"
WHITE = "#FFFFFF"

MARK = 40.0
GAP = 12.0
BAYAN_SIZE = 19.76
BAYAN_TRACK = 0.18
GROUP_SIZE = 10.35
GROUP_TRACK = 0.34


def word_path(font_path: str, weight: int, text: str, size: float, tracking_em: float):
    font = TTFont(font_path)
    if "fvar" in font:
        font = instantiateVariableFont(font, {"wght": weight})
    upem = font["head"].unitsPerEm
    scale = size / upem
    glyphs = font.getGlyphSet()
    cmap = font.getBestCmap()
    pen = SVGPathPen(glyphs)
    x = 0.0
    bounds = BoundsPen(glyphs)

    for i, ch in enumerate(text):
        name = cmap.get(ord(ch))
        if not name:
            continue
        glyphs[name].draw(TransformPen(pen, (scale, 0, 0, -scale, x, 0)))
        glyphs[name].draw(TransformPen(bounds, (scale, 0, 0, -scale, x, 0)))
        x += font["hmtx"][name][0] * scale
        if i < len(text) - 1:
            x += tracking_em * size

    return pen.getCommands(), x, bounds.bounds


def mark_svg(light: bool) -> str:
    tile = WHITE if light else NAVY
    on_tile = NAVY if light else WHITE
    return f"""<rect x="1" y="1" width="38" height="38" rx="7" fill="{tile}"/>
  <path d="M20 7.5 32.5 20 20 32.5 7.5 20Z" fill="none" stroke="{on_tile}" stroke-width="1.4" opacity="0.5"/>
  <path d="M20 13 27 20 20 27 13 20Z" fill="{TEAL}"/>
  <path d="M20 17.2 22.8 20 20 22.8 17.2 20Z" fill="{on_tile}"/>
  <path d="M20 7.5v5.5M20 27v5.5" stroke="{GOLD}" stroke-width="1.6" stroke-linecap="round"/>"""


def lockup(font_path: str, light: bool) -> tuple[str, float, float]:
    bayan, bayan_w, bayan_b = word_path(font_path, 800, "BAYAN", BAYAN_SIZE, BAYAN_TRACK)
    group, group_w, group_b = word_path(font_path, 600, "GROUP", GROUP_SIZE, GROUP_TRACK)
    text_x = MARK + GAP + 2
    width = text_x + max(bayan_w, group_w) + 2
    height = MARK

    # Stack the two words on their ink, then centre the block against the mark.
    word_gap = 4.0 * MARK / 34.0  # matches the 4px gap used in the site header
    group_offset = (bayan_b[3] - group_b[1]) + word_gap
    block_top = bayan_b[1]
    block_bottom = group_offset + group_b[3]
    shift = (MARK - (block_top + block_bottom)) / 2
    bayan_baseline = shift
    group_baseline = shift + group_offset

    bayan_color = WHITE if light else NAVY
    group_color = WHITE if light else MUTED
    group_opacity = ' fill-opacity="0.7"' if light else ""

    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width:g} {height:g}" role="img" aria-label="BAYAN GROUP">
  <title>BAYAN GROUP</title>
  <g>
  {mark_svg(light)}
  </g>
  <g transform="translate({text_x:g} {bayan_baseline:g})">
    <path d="{bayan}" fill="{bayan_color}"/>
  </g>
  <g transform="translate({text_x:g} {group_baseline:g})">
    <path d="{group}" fill="{group_color}"{group_opacity}/>
  </g>
</svg>
"""
    return svg, width, height


def mark_only(light: bool, size: float = 40.0) -> str:
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="{size:g}" height="{size:g}" role="img" aria-label="BAYAN GROUP mark">
  <title>BAYAN GROUP</title>
  <g>
  {mark_svg(light)}
  </g>
</svg>
"""


def main() -> None:
    font_path = sys.argv[1]
    out = Path(sys.argv[2] if len(sys.argv) > 2 else "brand")
    (out / "svg").mkdir(parents=True, exist_ok=True)
    (out / "png").mkdir(parents=True, exist_ok=True)
    (out / "meta").mkdir(parents=True, exist_ok=True)

    primary, w, h = lockup(font_path, light=False)
    inverse, _, _ = lockup(font_path, light=True)

    (out / "svg" / "bayan-logo-primary.svg").write_text(primary)
    (out / "svg" / "bayan-logo-inverse.svg").write_text(inverse)
    (out / "svg" / "bayan-mark.svg").write_text(mark_only(False))
    (out / "svg" / "bayan-mark-inverse.svg").write_text(mark_only(True))

    (out / "meta" / "size.txt").write_text(f"{w:.4f} {h:.4f}\n")
    print(f"wrote SVGs, lockup {w:.2f} x {h:.2f} units")


if __name__ == "__main__":
    main()
