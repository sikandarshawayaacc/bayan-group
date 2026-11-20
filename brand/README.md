# BAYAN GROUP — logo assets

The logo used in the site header (`src/components/Logo.tsx`), exported as vector and high-resolution raster files. The wordmark is converted to outlines — no font installation is needed to open or print these files.

## Files

### Vector (SVG) — transparent background, scalable
| File | Use |
| --- | --- |
| `svg/bayan-logo-primary.svg` | Full lockup, navy wordmark — light backgrounds |
| `svg/bayan-logo-inverse.svg` | Full lockup, white wordmark — dark backgrounds |
| `svg/bayan-mark.svg` | Icon only, navy tile |
| `svg/bayan-mark-inverse.svg` | Icon only, white tile |

### Raster (PNG)
| File | Size | Background |
| --- | --- | --- |
| `png/bayan-logo-primary-transparent.png` | 2400 × 702 | Transparent |
| `png/bayan-logo-primary-white-bg.png` | 2400 × 702 | Solid white |
| `png/bayan-logo-inverse-transparent.png` | 2400 × 702 | Transparent |
| `png/bayan-logo-inverse-navy-bg.png` | 2400 × 702 | Solid navy |
| `png/bayan-mark-transparent.png` | 1024 × 1024 | Transparent |
| `png/bayan-mark-inverse-transparent.png` | 1024 × 1024 | Transparent |

For print or signage, use the SVG. The PNGs are 2400 px wide — enough for web, decks, letterheads and most office print; request an EPS/PDF conversion if a printer insists.

## Colours

| Role | Hex |
| --- | --- |
| Navy (primary) | `#172B3A` |
| Teal | `#239A96` |
| Muted gold | `#B69A63` |
| Wordmark secondary (GROUP) | `#697781` on light, `#FFFFFF` at 70% on dark |
| White | `#FFFFFF` |

## Usage

- Keep clear space around the lockup equal to at least half the mark's height.
- Minimum sizes: full lockup 120 px wide on screen / 30 mm in print; mark 24 px / 8 mm.
- Use the inverse (white) version on navy or photography; never place the primary navy wordmark on a dark background.
- Do not stretch, recolour, add shadows, outline the wordmark, re-space the letters, or detach the wordmark from the mark's baseline relationship.

## Regenerating

Requires Python 3 with `fonttools` and `brotli`, plus the Manrope variable font:

```bash
python3 -m venv /tmp/brand-venv && /tmp/brand-venv/bin/pip install fonttools brotli
curl -sL -o /tmp/Manrope.ttf "https://github.com/google/fonts/raw/main/ofl/manrope/Manrope%5Bwght%5D.ttf"

/tmp/brand-venv/bin/python scripts/brand/generate.py /tmp/Manrope.ttf brand
scripts/brand/rasterise.sh brand     # uses headless Brave/Chrome
```

`generate.py` holds the geometry: mark 40 units, gap 12, BAYAN 19.76 units at weight 800 with 0.18em tracking, GROUP 10.35 units at weight 600 with 0.34em tracking. Those ratios match the header lockup (34 px mark, 16.8 px / 8.8 px text).
