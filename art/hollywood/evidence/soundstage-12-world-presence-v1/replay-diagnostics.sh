#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
REPO_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/../../../.." && pwd)
FFMPEG_BIN=${FFMPEG_BIN:-/opt/homebrew/bin/ffmpeg}
OUT_DIR="$REPO_ROOT/out/soundstage12-preflight/replay"
STAGE7="$REPO_ROOT/art/hollywood/source/moonshot-studio-chronicle-concept.png"
CANDIDATE_A="$SCRIPT_DIR/candidate-a-rejected.png"
CANDIDATE="$SCRIPT_DIR/candidate-b-rejected.png"

mkdir -p "$OUT_DIR/overlap" "$OUT_DIR/join-audit"

"$FFMPEG_BIN" -hide_banner -loglevel error -y \
  -i "$STAGE7" -i "$CANDIDATE_A" \
  -filter_complex 'hstack=inputs=2' -frames:v 1 \
  "$OUT_DIR/base-candidate-side-by-side.png"

"$FFMPEG_BIN" -hide_banner -loglevel error -y \
  -i "$STAGE7" -i "$CANDIDATE" \
  -filter_complex 'hstack=inputs=2' -frames:v 1 \
  "$OUT_DIR/butt-side-by-side.png"

for x in 1400 1450 1500 1540; do
  width=$((x + 1586))
  "$FFMPEG_BIN" -hide_banner -loglevel error -y \
    -i "$STAGE7" -i "$CANDIDATE" \
    -filter_complex "color=c=#101010:s=${width}x992[bg];[bg][0:v]overlay=0:0[tmp];[tmp][1:v]overlay=${x}:0" \
    -frames:v 1 "$OUT_DIR/overlap/b-over-stage7-x${x}.png"
  "$FFMPEG_BIN" -hide_banner -loglevel error -y \
    -i "$STAGE7" -i "$CANDIDATE" \
    -filter_complex "color=c=#101010:s=${width}x992[bg];[bg][1:v]overlay=${x}:0[tmp];[tmp][0:v]overlay=0:0" \
    -frames:v 1 "$OUT_DIR/overlap/stage7-over-b-x${x}.png"
done

"$FFMPEG_BIN" -hide_banner -loglevel error -y \
  -i "$OUT_DIR/overlap/b-over-stage7-x1400.png" \
  -i "$OUT_DIR/overlap/b-over-stage7-x1450.png" \
  -i "$OUT_DIR/overlap/b-over-stage7-x1500.png" \
  -i "$OUT_DIR/overlap/b-over-stage7-x1540.png" \
  -filter_complex '[0:v]scale=1493:467[a];[1:v]scale=1518:467[b];[2:v]scale=1543:467[c];[3:v]scale=1563:467[d];[a]pad=1563:467:0:0:black[ap];[b]pad=1563:467:0:0:black[bp];[c]pad=1563:467:0:0:black[cp];[ap][bp][cp][d]vstack=inputs=4' \
  -frames:v 1 "$OUT_DIR/overlap/b-over-contact-sheet.png"

"$FFMPEG_BIN" -hide_banner -loglevel error -y \
  -i "$CANDIDATE" \
  -vf 'drawgrid=width=100:height=100:thickness=2:color=white@0.35' \
  -frames:v 1 "$OUT_DIR/candidate-b-grid.png"

"$FFMPEG_BIN" -hide_banner -loglevel error -y \
  -i "$STAGE7" -i "$CANDIDATE" \
  -filter_complex '[0:v]crop=360:992:1226:0[left];[1:v]crop=360:992:0:0[right];[left][right]hstack=inputs=2[out]' \
  -map '[out]' "$OUT_DIR/join-audit/butt-seam-720.png"

"$FFMPEG_BIN" -hide_banner -loglevel error -y \
  -i "$STAGE7" -i "$CANDIDATE" \
  -filter_complex '[0:v]crop=180:700:1406:120[left];[1:v]crop=180:700:0:120[right];[left][right]hstack=inputs=2,scale=720:1400:flags=neighbor[out]' \
  -map '[out]' "$OUT_DIR/join-audit/butt-seam-zoom.png"

for candidate_x in 120 200 280 360 440 520; do
  "$FFMPEG_BIN" -hide_banner -loglevel error -y \
    -i "$STAGE7" -i "$CANDIDATE" \
    -filter_complex "[0:v]crop=300:992:1200:0[l];[1:v]crop=420:992:${candidate_x}:0[r];[l][r]hstack=inputs=2[o]" \
    -map '[o]' "$OUT_DIR/join-audit/seam-bx${candidate_x}.png"
done

"$FFMPEG_BIN" -hide_banner -loglevel error -y \
  -i "$OUT_DIR/join-audit/seam-bx120.png" \
  -i "$OUT_DIR/join-audit/seam-bx200.png" \
  -i "$OUT_DIR/join-audit/seam-bx280.png" \
  -i "$OUT_DIR/join-audit/seam-bx360.png" \
  -i "$OUT_DIR/join-audit/seam-bx440.png" \
  -i "$OUT_DIR/join-audit/seam-bx520.png" \
  -filter_complex '[0:v]scale=360:496[a];[1:v]scale=360:496[b];[2:v]scale=360:496[c];[3:v]scale=360:496[d];[4:v]scale=360:496[e];[5:v]scale=360:496[f];[a][b][c]hstack=inputs=3[top];[d][e][f]hstack=inputs=3[bot];[top][bot]vstack=inputs=2[out]' \
  -map '[out]' "$OUT_DIR/join-audit/seam-candidates-montage.png"

"$FFMPEG_BIN" -hide_banner -loglevel error -y \
  -i "$STAGE7" -i "$CANDIDATE" \
  -filter_complex "[0:v]pad=2672:992:0:0:black[base];[1:v]format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='if(gte(X,500-0.15*Y),255,0)'[cell];[base][cell]overlay=1086:0:format=auto[out]" \
  -map '[out]' "$OUT_DIR/join-audit/masked-diagonal-origin1086.png"

"$FFMPEG_BIN" -hide_banner -loglevel error -y \
  -i "$OUT_DIR/join-audit/masked-diagonal-origin1086.png" \
  -vf 'crop=720:900:1000:40,scale=960:1200:flags=lanczos' \
  "$OUT_DIR/join-audit/masked-diagonal-seam-close.png"

shasum -a 256 "$OUT_DIR"/*.png "$OUT_DIR"/overlap/*.png "$OUT_DIR"/join-audit/*.png \
  > "$OUT_DIR/sha256.txt"
