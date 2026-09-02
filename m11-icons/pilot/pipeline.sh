#!/bin/bash
# M11 icon pilot — slice a 4x4 NBP sheet into 16 keyed PNGs + traced SVGs.
# Usage: ./pipeline.sh [sheet.png] [fuzz%]
#
# Keying note: NBP does not emit pure #FFFFFF (probe corner measured srgb(239,239,242)),
# and a global `-transparent white` would also punch holes through the white letters
# *inside* the badges. So we flood-fill from all four cell corners instead: only the
# connected background region is cleared, enclosed white counters survive.
set -euo pipefail

MAGICK=/opt/homebrew/bin/magick
VTRACER="$HOME/.cargo/bin/vtracer"
DIR="$(cd "$(dirname "$0")" && pwd)"
SHEET="${1:-$DIR/sheet.png}"
FUZZ="${2:-14}"

NAMES=(typescript javascript json markdown css html python rust go docker git dotenv yaml folder folder-open file)

RAW="$DIR/raw"; PNG="$DIR/png"; SVG="$DIR/svg"; CHK="$DIR/check"
rm -rf "$RAW" "$PNG" "$SVG" "$CHK"; mkdir -p "$RAW" "$PNG" "$SVG" "$CHK"

echo "== sheet =="
$MAGICK identify "$SHEET"
echo "   corners: TL=$($MAGICK "$SHEET" -format '%[pixel:p{4,4}]' info:) TR=$($MAGICK "$SHEET" -format '%[pixel:p{w-5,4}]' info:)"

echo "== slice 4x4 =="
$MAGICK "$SHEET" -crop 4x4@ +repage +adjoin "$RAW/cell-%02d.png"
CW=$($MAGICK identify -format '%w' "$RAW/cell-00.png")
CH=$($MAGICK identify -format '%h' "$RAW/cell-00.png")
echo "   cell size: ${CW}x${CH}  (fuzz ${FUZZ}%)"

echo "== key background -> alpha (4-corner floodfill), trim, square, 512px =="
X1=$((CW-1)); Y1=$((CH-1))
for i in "${!NAMES[@]}"; do
  n=$(printf "%02d" "$i")
  name="${NAMES[$i]}"
  $MAGICK "$RAW/cell-$n.png" -alpha set -fuzz "${FUZZ}%" -fill none \
    -draw "alpha 0,0 floodfill"     -draw "alpha $X1,0 floodfill" \
    -draw "alpha 0,$Y1 floodfill"   -draw "alpha $X1,$Y1 floodfill" \
    -trim +repage \
    -background none -gravity center -resize 448x448 -extent 512x512 \
    "$PNG/icon-$name.png"
  printf "   %-12s alpha-mean=%s\n" "$name" \
    "$($MAGICK "$PNG/icon-$name.png" -alpha extract -format '%[fx:mean]' info:)"
done

echo "== quantize -> vectorize (vtracer, color/spline) =="
# NBP output is NOT flat: a "flat" TS badge measured 10871 unique colors, and tracing that
# raw gives 207 paths / 108KB. Posterising to $KCOL colours first collapses the phantom
# gradient bands, cutting that to ~13 paths / ~23KB.
KCOL="${KCOL:-5}"
mkdir -p "$CHK/quant"
for name in "${NAMES[@]}"; do
  $MAGICK "$PNG/icon-$name.png" -alpha on -colors "$KCOL" +dither "$CHK/quant/$name.png"
  if $VTRACER -i "$CHK/quant/$name.png" -o "$SVG/icon-$name.svg" \
      --colormode color --mode spline --filter_speckle 8 --color_precision 8 \
      --path_precision 2 --corner_threshold 60 >/dev/null 2>&1; then
    printf "   %-12s raw_colors=%-6s svg=%6s bytes  %3s paths\n" "$name" \
      "$($MAGICK "$PNG/icon-$name.png" -format '%k' info:)" \
      "$(wc -c < "$SVG/icon-$name.svg" | tr -d ' ')" \
      "$(grep -o '<path' "$SVG/icon-$name.svg" | wc -l | tr -d ' ')"
  else
    printf "   %-12s FAILED\n" "$name"
  fi
done

echo "== legibility contact sheets =="
# true 16px downscale, then 8x nearest-neighbour blow-up so the real pixel grid is visible.
# Built with -append/+append rather than `montage`, which needs a configured font.
build_grid() {  # $1=prefix $2=out
  local row=() r=0
  for i in "${!NAMES[@]}"; do
    row+=("$CHK/$1-${NAMES[$i]}.png")
    if [ $(( (i+1) % 4 )) -eq 0 ]; then
      $MAGICK "${row[@]}" +append -background "#121314" "$CHK/row-$1-$r.png"; row=(); r=$((r+1))
    fi
  done
  $MAGICK "$CHK/row-$1-"*.png -append -background "#121314" -bordercolor "#121314" -border 12 "$2"
}
for name in "${NAMES[@]}"; do
  $MAGICK "$PNG/icon-$name.png" -resize 16x16 -background "#121314" -alpha remove -alpha off \
    -filter point -resize 800% -bordercolor "#121314" -border 8 "$CHK/px16-$name.png"
  $MAGICK "$PNG/icon-$name.png" -resize 64x64 -background "#121314" -alpha remove -alpha off \
    -bordercolor "#121314" -border 8 "$CHK/px64-$name.png"
done
build_grid px16 "$DIR/contact-16px.png"
build_grid px64 "$DIR/contact-64px.png"

echo "done."
