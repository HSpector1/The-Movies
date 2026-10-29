#!/bin/bash
# Archive one directory to the private GitHub release HSpector1/mac-archive archive-2026-10-29 as gzip tar parts, verify
# the uploaded sizes, append a manifest entry, then remove the directory. Usage: archive-scratch.sh <dir> <tag> <work>
set -u
DIR="$1"; TAG="$2"; WORK="$3"; REPO=HSpector1/mac-archive
NAME="studio-scratch-1029-$(basename "$DIR")"
[ -d "$DIR" ] || { echo "SKIP no dir $DIR"; exit 0; }
case "$DIR" in /Users/zacheryspector/studio-scratch/*) ;; *) echo "REFUSE outside studio-scratch: $DIR"; exit 2;; esac
mkdir -p "$WORK"
BYTES=$(du -sk "$DIR" | cut -f1); FILES=$(find "$DIR" -type f -not -path "*/node_modules/*" | wc -l | tr -d ' '); NEWEST=$(find "$DIR" -type f -not -path "*/node_modules/*" -exec stat -f '%Sm' -t '%Y-%m-%d %H:%M' {} + 2>/dev/null | sort | tail -1)
( cd "$(dirname "$DIR")" && nice -n 19 tar --exclude='node_modules' -czf - "$(basename "$DIR")" ) | nice -n 19 split -b 1900m - "$WORK/$NAME.tar.gz.part-" || { echo "FAIL tar $DIR"; exit 3; }
PARTS=$(ls "$WORK/$NAME.tar.gz.part-"* | sort); WHOLE=$(cat $PARTS | shasum -a 256 | cut -c1-64)
gh release view "$TAG" -R "$REPO" >/dev/null 2>&1 || gh release create "$TAG" -R "$REPO" --title "$TAG" --notes "# Mac archive, release $TAG

Studio (The Movies) scratch directories moved off the Mac on the Owner's 2026-10-29 instruction. Each entry lists its gzip tar parts with SHA-256 digests and the restore command. node_modules directories were excluded (reinstallable)." >/dev/null || { echo "FAIL release create"; exit 4; }
for p in $PARTS; do gh release upload "$TAG" "$p" -R "$REPO" --clobber >/dev/null || { echo "FAIL upload $p"; exit 5; }; done
ENTRY="## $DIR

- Moved $(date '+%Y-%m-%d %H:%M:%S %Z'): $((BYTES))K on disk, $FILES files (node_modules excluded), newest file $NEWEST
- Archive: $NAME.tar.gz in $(echo "$PARTS" | wc -w | tr -d ' ') part(s), whole-stream SHA-256 $WHOLE
"
for p in $PARTS; do ENTRY="$ENTRY- $(basename "$p"): $(stat -f %z "$p") bytes, SHA-256 $(shasum -a 256 "$p" | cut -c1-64)
"; done
ENTRY="$ENTRY- Restore: gh release download $TAG --repo $REPO --pattern '$NAME.tar.gz.part-*' --dir RESTORE_DIR, then cat RESTORE_DIR/$NAME.tar.gz.part-* | tar -xz -C $(dirname "$DIR")
"
# verify every asset landed with its size
for p in $PARTS; do want=$(stat -f %z "$p"); got=$(gh release view "$TAG" -R "$REPO" --json assets -q ".assets[] | select(.name==\"$(basename "$p")\") | .size"); [ "$want" = "$got" ] || { echo "FAIL size mismatch $(basename "$p") local $want remote $got"; exit 6; }; done
BODY=$(gh release view "$TAG" -R "$REPO" --json body -q .body); printf '%s\n\n%s' "$BODY" "$ENTRY" > "$WORK/notes.md"; gh release edit "$TAG" -R "$REPO" --notes-file "$WORK/notes.md" >/dev/null || { echo "FAIL notes"; exit 7; }
rm -f $PARTS
rm -rf "$DIR" && echo "ARCHIVED+REMOVED $DIR ($NAME, $WHOLE)"
