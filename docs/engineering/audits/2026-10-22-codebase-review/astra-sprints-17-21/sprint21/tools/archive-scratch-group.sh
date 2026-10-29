#!/bin/bash
# Archive a GROUP of studio-scratch entries (names listed one per line in LIST) to the private GitHub release
# HSpector1/mac-archive TAG as gzip tar parts, verify every uploaded size, append a manifest entry, then remove
# exactly the archived entries. Usage: archive-scratch-group.sh <group-name> <list-file> <tag> <work-dir>
# Owner order 2026-10-29 13:25 CDT: back up on GitHub and remove local files created for this game.
set -u
GROUP="$1"; LIST="$2"; TAG="$3"; WORK="$4"; REPO=HSpector1/mac-archive; ROOT=/Users/zacheryspector/studio-scratch
NAME="studio-scratch-1029-$GROUP"
KEEP='^(p17-continuation-20261027-wt|sprint15-consumer-20261028-wt|p16-retained-writing-20261026-wt|astra-20261029|p16-c03-sprint1-20261025|1370-astra-takeover-20261012|1370-c0-stage41-heavy-lane-recovery-proposal-r8|HEAVY-LANE-LOCK)$'
[ -s "$LIST" ] || { echo "REFUSE empty list"; exit 2; }
mkdir -p "$WORK"
: > "$WORK/$GROUP.members"
while IFS= read -r n; do
  [ -n "$n" ] || continue
  case "$n" in */*|.|..|'') echo "REFUSE bad name: $n"; exit 2;; esac
  echo "$n" | /usr/bin/grep -Eq "$KEEP" && { echo "REFUSE keep-set member in list: $n"; exit 2; }
  [ -e "$ROOT/$n" ] || { echo "SKIP missing $n"; continue; }
  echo "$n" >> "$WORK/$GROUP.members"
done < "$LIST"
COUNT=$(wc -l < "$WORK/$GROUP.members" | tr -d ' '); [ "$COUNT" -gt 0 ] || { echo "nothing to archive"; exit 0; }
BYTES=$(cd "$ROOT" && xargs -I{} du -sk -- {} < "$WORK/$GROUP.members" | awk '{s+=$1} END {print s}')
( cd "$ROOT" && nice -n 19 tar --exclude='node_modules' -czf - -T "$WORK/$GROUP.members" ) | nice -n 19 split -b 1900m - "$WORK/$NAME.tar.gz.part-" || { echo "FAIL tar"; exit 3; }
PARTS=$(ls "$WORK/$NAME.tar.gz.part-"* | sort); WHOLE=$(cat $PARTS | shasum -a 256 | cut -c1-64)
# restore check: the stream must list exactly as many top-level members as archived
LISTED=$(cat $PARTS | tar -tzf - | awk -F/ '{print $1}' | sort -u | wc -l | tr -d ' ')
[ "$LISTED" = "$(sort -u "$WORK/$GROUP.members" | wc -l | tr -d ' ')" ] || { echo "FAIL member count $LISTED vs $COUNT"; exit 3; }
gh release view "$TAG" -R "$REPO" >/dev/null 2>&1 || gh release create "$TAG" -R "$REPO" --title "$TAG" --notes "# Mac archive, release $TAG

Studio (The Movies) scratch directories moved off the Mac on the Owner's 2026-10-29 instruction. Each entry lists its gzip tar parts with SHA-256 digests, the member list and the restore command. node_modules directories were excluded (reinstallable)." >/dev/null || { echo "FAIL release create"; exit 4; }
for p in $PARTS; do gh release upload "$TAG" "$p" -R "$REPO" --clobber >/dev/null || { echo "FAIL upload $p"; exit 5; }; done
gh release upload "$TAG" "$WORK/$GROUP.members" -R "$REPO" --clobber >/dev/null || { echo "FAIL upload members"; exit 5; }
for p in $PARTS; do want=$(stat -f %z "$p"); got=$(gh release view "$TAG" -R "$REPO" --json assets -q ".assets[] | select(.name==\"$(basename "$p")\") | .size"); [ "$want" = "$got" ] || { echo "FAIL size mismatch $(basename "$p") local $want remote $got"; exit 6; }; done
ENTRY="## $NAME ($COUNT entries of $ROOT)

- Moved $(date '+%Y-%m-%d %H:%M:%S %Z'): ${BYTES}K on disk; member list $GROUP.members (asset); first members: $(head -5 "$WORK/$GROUP.members" | tr '\n' ' ')
- Archive: $NAME.tar.gz in $(echo "$PARTS" | wc -w | tr -d ' ') part(s), whole-stream SHA-256 $WHOLE
"
for p in $PARTS; do ENTRY="$ENTRY- $(basename "$p"): $(stat -f %z "$p") bytes, SHA-256 $(shasum -a 256 "$p" | cut -c1-64)
"; done
ENTRY="$ENTRY- Restore: gh release download $TAG --repo $REPO --pattern '$NAME.tar.gz.part-*' --dir RESTORE_DIR, then cat RESTORE_DIR/$NAME.tar.gz.part-* | tar -xz -C $ROOT
"
BODY=$(gh release view "$TAG" -R "$REPO" --json body -q .body); printf '%s\n\n%s' "$BODY" "$ENTRY" > "$WORK/notes.md"; gh release edit "$TAG" -R "$REPO" --notes-file "$WORK/notes.md" >/dev/null || { echo "FAIL notes"; exit 7; }
rm -f $PARTS
( cd "$ROOT" && while IFS= read -r n; do rm -rf -- "./$n"; done < "$WORK/$GROUP.members" )
echo "ARCHIVED+REMOVED $NAME: $COUNT entries, ${BYTES}K, sha $WHOLE"
