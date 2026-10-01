#!/usr/bin/env bash
# 1344-s7 control (a): test 3's HEAD-equality run, on the candidate tree, with no test change. NOT RUN by the author.
#
# Test 3 is `shelving-viable-control` (1344-A §6.3, as amended by 1344-F Amendment 2 and 1344-F3 ruling 4), the
# describe block at tests/p14d1-rival-shelving.test.ts:552 (line numbers at 9fc79624). Its two leaves:
#   :553  Ticks p13aGeneratedStudio('p13a-core-causal-01') 93 times on the candidate. Loads the genuine Save42 week-93
#         input minted at e62c944f, the last Save42 writer (tests/fixtures/p14/genuine-v42-pre-shelving-week93/,
#         gzip and decoded sha256 pinned by manifestPin93 and pinnedRaw93), through importSave and convertV42ToV43.
#         Deletes screenplayShelving from every rival business on both sides and compares the whole GameState (not
#         the save envelope) as recursively key-sorted JSON, byte for byte. Then compares hollywood.receipts with
#         toEqual. Premises from the candidate's own receipts: no screenplayShelved receipt through week 93, and one
#         within the next 16 ticks (the week is never asserted).
#   :626  Ticks 5 weeks from genesis. Some rival greenlights and never holds a ready screenplay un-greenlit (asserted
#         premise); that rival's screenplayShelving equals the empty state {version 1, [], [], 0}.
# History: 1344-C staged it as genesis-to-week-100 against the week-100 mint; 1344-C3 correction 4 (ruling 1344-F3 4)
# moved it to week 93, because the candidate's first shelving is r01 script-0006 at week 93, and to the key-sorted
# comparison; 1344-X6 traced the toEqual failure to live -0 values, which JSON writes as 0. The second leaf narrows
# Amendment 2's "a run whose every evaluation is viable" to one rival over 5 weeks (1344-C handback note 4; leaf comment).
# "HEAD" in this control is the e62c944f mint, not a live run. RUNBOOK.md step 6 adds the per-tick form of the same
# comparison against the ff803032 source (the old tree) for every seed the kit runs (compare.py, firstDifferentTick).
#
# Expected: exit=0 and "2 passed" in the vitest summary. Writes only $OUT/control-a.log.
set -uo pipefail
K=/Users/zacheryspector/studio-scratch/1344-s7
T=$K/tree
OUT=$K/out
LOG=$OUT/control-a.log
[ -d "$T/src" ] || { echo "a-test3: no candidate tree at $T (RUNBOOK step 1)" >&2; exit 2; }
[ -e "$LOG" ] && { echo "a-test3: refusing to overwrite $LOG" >&2; exit 2; }
mkdir -p "$OUT"
(cd "$T" && node_modules/.bin/vitest run --project core --no-cache tests/p14d1-rival-shelving.test.ts -t "shelving-viable-control") > "$LOG" 2>&1
echo "exit=$?" >> "$LOG"
tail -8 "$LOG"
