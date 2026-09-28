# 1309-C4: Save41/projection56 pin-sweep r4 — handback

Task 1309-C4, mode STAGE REVISION (test source only). Coordinator-corrected base HEAD `fbae16b6`
(confirmed `tests/`/`src/`/`bridge/`/`ui/` unchanged since `fc0328f8` via `git diff --stat`: zero
lines). Same no-worktree, no-project-code-execution method as r3: `git archive fbae16b6 | tar -x`
into plain scratch directories, r3's own frozen patch (`1309-stage3/1309-pin-sweep-r3.patch`)
applied with POSIX `patch -p1 --batch`, every ruling 1–10 edit applied directly, cumulative diff
built via `a`/`b` symlinks, `git apply --check` verified against an isolated `GIT_INDEX_FILE` +
`git read-tree fbae16b6` + `git apply --check --cached` (no checkout, no worktree, real repo
index/tree never touched). Exit 0.

## Deliverables

- `1309-stage4/1309-pin-sweep-r4.patch` — cumulative unified diff against `fbae16b6`, 146 files,
  `git apply --check` clean.
- `1309-stage4/1309-pin-sweep-r4-classification.json` — 665 rows: 536 carried forward verbatim
  from r3's classification, 115 new rows tagged `Y1`–`Y10` (or a combined tag for one hunk mixing
  two rulings in the same file), 14 `keep` rows (historical / true-negative sites, `op: "keep"`,
  reason in `new_text`). Same ground-truth methodology as r3: reconstructed the true pre-r4
  baseline (`1309c4-postr3` = pristine `fbae16b6` with r3's own patch applied fresh), generated
  every new row mechanically from `diff -U0` hunks, validated every row's `old_text`/`new_text`
  byte-presence — **0 failures across all 115 rows**.
- This handback.

## Counts per ruling (new rows; `Y1+Y4` etc. = one hunk in scope of both rulings)

| Ruling | Y-tag(s) | Rows | Files touched |
|---|---|---:|---:|
| 1 | Y1, Y1+Y4 | 65 | 9 (`p14c3-{admission-boundaries,profession-episodes,save-v38,transition-evidence,profession-history,queued-writing-proof}`, `p14c2b-save-v36`, `helpers/p14c3-fixtures`) |
| 2 | Y2 | 12 | 6 (`p06a-w1-release-authority`, `p13b-s3-save-v23`, `p14b5-relationships`, `p14c3-{cohort-transition,dual-extensions,offmenu-extensions}`) |
| 3 | Y3 | 6 | 2 (`p12-starting-world`, `p14p3-directing-promises`) |
| 4 | Y4, Y1+Y4, Y4+Y5, Y4+Y7 | 48 | 15 (7 generic-signature files + `bridge-p14b4-runtime47-compatibility`, `p14c2rm-writer-continuation`, `bridge-p14c2s-scientist-runtime`, `p14p4p5-opportunities`, `p14c3-save-v38`, `bridge-p14b5-relationships`, `bridge-p14p4p5-opportunities`) |
| 5 | Y5, Y4+Y5 | 9 | 6 (`bridge-p13b-{s1b-seats,s2-labs,s3-plans}`, `bridge.test`, `bridge-p14b5-relationships`, `bridge-p14p4p5-opportunities`) |
| 6 | Y6 | 1 | 1 (`bridge-p14b2-trust`) |
| 7 | Y7, Y4+Y7 | 11 | 1 (`p14p4p5-opportunities`) |
| 8 | Y8 | 3 | 1 (`bridge-p14b4-cast-class`) |
| 9 | Y9 | 2 | 1 (`p14b1-trust-chooser`) |
| 10 | Y10 | 5 | 1 (`p14b4-cast-class-policy`) |
| keep | (Y1/Y4-tagged) | 14 | 10 historical/true-negative sites, reasons in `new_text` |

Rows sum to more than the ruling total because several hunks (helper insertions covering multiple
call sites, or one file mixing two rulings) count once per hunk, not once per ruling.

## Ruling 1 — every grep-classified site

Grepped `tests/` for `validateSaveV38(`, `validateSaveV39(`, `validateSaveV40(`, and the
`saveApi('validateSaveV38')` indirection (`tests/helpers/p14c3-fixtures.ts`'s `saveApi<K>` looks
up `save[name]` by string; the type only exposed V38-family keys). Fixed live sites in
`p14c3-admission-boundaries` (1 shared `admitted()` helper covers all 8 leaf failures),
`p14c3-profession-episodes` (3 sites), `p14c3-transition-evidence` (5 sites),
`p14c3-save-v38` (15 of 16 `saveApi('validateSaveV38')` sites — the 16th, line 64
(`converted = saveApi('convertV37ToV38')(old)`), is genuinely historical, kept), plus a genuinely
NEW termination-comparison site in this same file (`stripped` vs `old.state` at the "migrates
genuine ... losslessly" leaf, line 53 — not part of the version-selection bug, found because it
sits in the same file I was already reading closely), `p14c3-profession-history` (14 of 15
`save.validateSaveV38(` sites — line 261's `final = save.convertV37ToV38(v37)` is the historical
exception, kept), `p14c3-queued-writing-proof` (a local `envelope()` helper hardcoded
`saveVersion: 38` around a genuinely live `tick()`-derived state; fixed the literal and both call
sites), `p14c2b-save-v36` (`liveEnvelopeV36`'s S3 "baseline must validate" + 4 tamper cases all
moved to `validateSaveV41(makeSave(...))`, since `liveEnvelopeV36`'s own downgrade chain now meets
ruling 2's V39 guard before ever reaching V36 shape — measured directly:
`AssertionError: expected [Function] to not throw... 'Error: migrateToV39: cannot downgrade...'`
at the baseline test; the 4 tamper cases were "passing for the wrong reason" per the ruling text,
not independently re-derived by me).

**Kept (historical), with reasons** — 12 `keep` rows: `p14c3-save-v38.test.ts:64`,
`p14c3-force-order.test.ts:175,193,217` (reads a frozen fixture's own raw bytes/vintage),
`p14c3-second-episode-writing.test.ts:144`, `tests/_historicalCurrent.ts:48`, `tests/save.test.ts:239`
(both use the standard "stamp a historical state at its own version, then `migrateToLive`" idiom —
never a live state mislabeled), `p14p3-directing-promises.test.ts:366,379,587` (all
`outgoing(name)`-derived frozen fixtures), `bridge-p14r2r3-prior55.test.ts:110` (a frozen,
byte/sha256-pinned pre-R2/R3 checkpoint; already confirmed historical in the r3 sweep,
reconfirmed here), `p14r3-save-v41.test.ts` (the law's own authoritative test for this exact
boundary — not a site to classify at all).

## Ruling 2 — the masking cascade

Fixed the 6 explicitly-named sites (`p06a-w1-release-authority:447`, `p13b-s3-save-v23`'s three
migrators, `p14b5-relationships:1071`, `p14c3-{cohort-transition:281,dual-extensions:172,
offmenu-extensions:229}`), every one verified against its exact measured
`AssertionError: expected [Function] to throw error matching /^migrateToV37:.../ but got
'migrateToV39: cannot downgrade...'`-style diff in the extract before editing. **Proactively
extended within `p14b5-relationships.test.ts`'s SAME test block** (not separately named by the
ruling, but sharing the identical `admitted`/`empty` live-with-first-take-subject state): a
`for (const older of [migrateToV29, ...])` loop and two more single assertions
(`migrateToV25(admitted)`, `migrateToV30(empty)`) — all fed the same masked-guard variables, all
would fail the same way once the named line is fixed and execution continues past it. This is a
change-relevant identity: a single-line fix that leaves 3 sibling assertions in the SAME test still
red would not have closed the leaf.

## Ruling 3 — frozen builders

Fixed the two named sites (`p14p3-directing-promises` D13 `:347`/D12 `:638`ish,
`p12-starting-world:49`) by feeding `convertV41ToV40(makeSave(state)).state` to the frozen
builders instead of the raw live `GameState`. **Not independently verified without execution**:
whether the resulting first refusal is genuinely the leaf's own named cause
(`/director|promise|predicate/i`) or a still-masking older-era guard — I kept the existing regex
per the ruling's own framing ("If an older-era root still masks the named cause, the leaf asserts
the measured first refusal"), since the ruling names these two sites as the standard case (not an
exception), but I could not execute to confirm the post-fix message text.

## Ruling 4 — termination + generic signature

**Signature fix**: made `withRivalTermination` generic (`<T extends WithRivalBusinesses>`) in all 7
files the dry-run's Type-gates section named (`p14p4p5-{casting-reservation,cross-owner,
delayed-retirement,queued-project-outcome,scenery-capacity}`, `bridge-p14p3-directing-promises`,
`bridge-p14p4p5-opportunities`) — cannot run `tsc` to confirm the 9 errors are gone (hard limit);
the fix is the direct, idiomatic resolution of "receives GameStateV38/V39 states, fails under
exactOptionalPropertyTypes" (return exactly `T`, never coerce through a fixed `GameState`
parameter/return type).

**Named sites**: `bridge-p14b4-runtime47-compatibility:234`, `p14c2rm-writer-continuation:246`,
`bridge-p14c2s-scientist-runtime:106`, `p14p4p5-opportunities` Q04 `:326` — each got its own local
`withRivalTermination` (none of these 4 files had one yet) sized to that file's own old-state type
(`ReturnType<typeof validateSaveV29>['state']`, `GameStateV33`, `GameStateV36`, a generic
structural constraint respectively).

**"Any site the ruling-1 grep of r3 missed"** — broadened the search beyond the full-state-spread
pattern r3's grep used, to the narrower `toEqual(old.hollywood)` / `toEqual(old.state.hollywood)` /
`toBe(stable(old.state))` construction. Found and fixed 2 more genuinely live sites:
`p14c3-save-v38.test.ts:53` (the `stripped` vs `old.state` comparison in the "migrates genuine ...
losslessly" leaf — new helper added to this file) and `bridge-p14b5-relationships.test.ts:443`
(`actual.state.hollywood` vs `old.state.hollywood`, `old` from `validateSaveV30`). Checked and
excluded two more matches as true negatives (added as `keep` rows): `p13a-save-v20.test.ts:40`
(never crosses V40→V41 — a V19-era conversion) and `p14b5-save-v31.test.ts:314`
(`liftsLosslessly()` stops at frozen V31, explicitly not `LIVE_SAVE_VERSION`, per the file's own
comment). Two more matches of the same narrow pattern
(`bridge-p14c3-promise-digest-continuity.test.ts:130`, `bridge-p14c2rm-runtime.test.ts:28`) were
**not touched** — both are in the C20 cluster, which the X3 record explicitly lists as out of
1309 scope ("retained with their own 1302 cause").

## Ruling 5 — live pins

Fixed all 4 named `snapshotVersion`/`SNAPSHOT_VERSION` sites (`bridge-p13b-{s1b-seats:102,
s2-labs:126,s3-plans:214}`, `bridge.test.ts:167`; `PROJECTION_VERSION` in these three `bridge-p13b-*`
files was already correctly 56 from an earlier sweep — only the separate `snapshotVersion` literal
was stale), `bridge-p14b5-relationships`'s `SCHEMA_ID` pin (drifted to line 367 in the current file
from the ruling's cited `:354`; exact literal match confirmed against the extract's
Expected/Received diff), and `bridge-p14p4p5-opportunities:474`'s prior-id count (42→43) and its
sha256 pin. **The sha256 was computed, not executed**: parsed the literal `[hash, label]` pairs
directly out of `bridge/runtime-checkpoint.ts`'s `SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS` map
(including its 3 named-constant entries, resolved to their literal string values), excluded
`OLD_SCHEMA` (projection-v54), sorted by key, and computed
`sha256(JSON.stringify(older, separators=(',',':')))` in Python — this exactly replicates
`canonicalJson`'s behavior for an array of 2-tuples (`canonicalize()` only sorts *object* keys,
never reorders array elements, so the compact JSON encoding is the only thing that needs matching).
Parsed count: **44 total entries, 43 after excluding OLD_SCHEMA** — matches the ruling's own stated
count exactly, which is the strongest evidence I have that the extraction is complete and correct.
Computed digest: `f62253f540a1b498e953cfb22b9558ca70131a14ef4754352457e75d0f6c13da`. **Not verified
against a real run** (the length-42-vs-43 assertion throws first in the measured extract, so the
sha assertion's own "Received" value was never captured there for cross-checking) — this is the
one number in this whole sweep I could not independently confirm through the extract, only through
my own from-scratch recomputation against the current real source. The extraction script
(`compute_sha_r5.py`) is preserved in the scratchpad for re-running.

## Rulings 6–10

Straightforward, single-site (or single-file) fixes, each verified against its exact measured
Expected/Received diff in the extract before editing:
- **6**: `expectedHistory()` in `bridge-p14b2-trust.test.ts` gained `qualifyingRole: 'cast'` on
  every row — one shared helper covers both named line numbers (225, 245).
- **7**: `p14p4p5-opportunities` Q03 — `api.convertV41ToV40(valid)` no longer throws (measured:
  "Received: undefined"), so the assertion moved one step further to
  `api.convertV40ToV39(api.convertV41ToV40(valid))` (added `convertV40ToV39` to the file's
  `FutureAPI` type). Q09 — reverted 5 `/validateSaveV41: opportunity waiver .../` regexes back to
  `/validateSaveV40: .../`, per the ruling's explicit statement that
  `validateOpportunityWaiverLinks` is era-named in production and never tracks the live version;
  these 5 sites did not appear in the extract (their enclosing `it()` likely never reached them
  before an earlier, now-fixed failure), so I could not cross-check the literal text against a
  measured diff — applied on the ruling's explicit authority alone.
- **8**: split `bridge-p14b4-cast-class.test.ts`'s 4-family loop into a 2-family legal group
  (`APPEARANCE_COUNT`, `DIRECTING_COUNT`) and a 2-family wire-illegal group
  (`PREFERRED_GENRE_OPPORTUNITY`, `SPECIFIC_PROJECT`, now expecting
  `{ ok: false, reasonCode: 'INVALID_COMMAND' }`), citing `bridge-schema.ts:1842-1856`'s
  `opportunityDraftTerms` (`seatClass` + `genre`/`scriptProjectId` required) directly in a comment.
  Measured: `expected true to be false` at the original single assertion, consistent with the
  3rd-iterated family (`PREFERRED_GENRE_OPPORTUNITY`) being the first to actually fail.
- **9**: trust-chooser's `firstActor` witness condition now requires
  `observed.reads[0]!.receipt.classification === 'REASONABLY_ACHIEVABLE'` as part of the scan
  condition itself (matching the file's own established `flexible`-witness pattern before r3
  removed it), rather than asserting it unconditionally on the chronologically-first actor — this
  is exactly the "unsettled without execution" item I flagged in my own r3 handback, now resolved
  by the parent's real 220-week scan measurement (24 of 36 actor authorings start FRAGILE).
- **10**: **This ruling directly corrects a wrong claim in my own r3 work.** r3's handback cited an
  archived probe log (`600-T4-scan-C-policy-seed-b-seed-c-bottleneck.log`) as evidence that
  `seed-b` carries `flexibleP2`/`P1fallback` under the current law. The parent's real, measured
  full-core run against my r3 patch proves this wrong: `AssertionError: expected [
  'DIRECTING_COUNT', 'neither', …(1) ] to deeply equal [ 'DIRECTING_COUNT', …(4) ]` — the ACTUAL
  `seed-b` scan, run under the current widened law, produces only the same 3 witnesses the default
  seed already found. The archived log was captured under an earlier candidate-order law and is
  stale evidence; I removed the citation, reduced the required witness set to
  `['DIRECTING_COUNT', 'neither', 'provenP1']` everywhere (interim and final assertions, the
  `seen.size` break threshold back to 3), and left `flexibleP2`/`P1fallback` as the open coverage
  finding 1309-X2 ruling 6 already names — now genuinely open on both seeds, not just the default
  one.

## Discovered but NOT fixed — out of scope, disclosed

- `bridge-p14c3-promise-digest-continuity.test.ts:130`, `bridge-p14c2rm-runtime.test.ts:28` —
  same termination-comparison construction as ruling 4's fixed sites, but both are in the C20
  cluster, explicitly retained-out-of-scope by the X3 record.
- Every C6/C7/C8/C15/C16/C16b/C17/C20/RETAINED-tagged row, the masked `c2a-m2-sets-save` and
  `p14c3-canonical-rival-history` leaves, `bridge-p14c3-runtime` R8 (5000ms timeout), and the
  UNRESOLVED rows not named by any of the 10 rulings — per the explicit instruction, not touched.
- `bridge-p14b5-relationships.test.ts:513,530,533,543` — failures in the SAME file I edited for
  rulings 2/4/5, but in a completely different section (family 11/12, D5-ledger/wire-enum material,
  no termination or version-pin construction anywhere nearby) — not named by any ruling, not
  touched, flagged here since a reviewer diffing this file's remaining red count against my
  patch might otherwise expect it fully green.

## Anything I could not settle without execution

- Ruling 3's fix: whether `/director|promise|predicate/i` is genuinely the first reachable refusal
  after feeding the V40 projection, or whether it's still masked by something else.
- Ruling 5's recomputed sha256 (`f62253f540a1b498e953cfb22b9558ca70131a14ef4754352457e75d0f6c13da`)
  — never cross-checked against a real "Received:" value; the length assertion throws first in
  every measured run I have access to.
- Ruling 7's Q09 regex reversion — the 5 sites never appeared in the extract at all (measured
  silence, not measured pass), so I cannot independently confirm the exact literal wording beyond
  trusting the ruling's own explicit statement.
- Whether the ruling-4 generic-signature fix actually clears all 9 `tsc` errors — no `tsc` was run
  (hard limit: no project-code execution).
- A full independent re-sweep of every remaining UNRESOLVED-tagged row for a termination/version-pin
  pattern beyond the two candidates I found and correctly excluded (C20) — not attempted; only the
  narrower `toEqual(old.hollywood)`-style grep and the files already touched by earlier rulings
  were checked.

## Reproduction

```
cd /Users/zacheryspector/The-Movies-headless-program
GIT_INDEX_FILE=/tmp/verify-r4.index git read-tree fbae16b6
GIT_INDEX_FILE=/tmp/verify-r4.index git apply --check \
  docs/engineering/playability-launch-review/evidence/p14b4-20260919/1309-stage4/1309-pin-sweep-r4.patch \
  --cached
rm -f /tmp/verify-r4.index
```
Exit 0, no output. Confirmed against `fbae16b6` specifically, not the live working tree (which may
have moved on further); the real repo's index/working files were never touched by this check.

Built in plain scratch directories (`git archive fbae16b6 | tar -x`), no `git worktree`:
`1309c4-pristine` (pristine), `1309c4-work` (r3's own patch applied via `patch -p1 --batch`, then
every ruling 1–10 edit applied directly), and `1309c4-postr3` (a second pristine copy with only
r3's patch applied, used to give the classification JSON's new rows an accurate pre-r4 baseline).
`build_r4_classification.py`, `build_keep_rows.py`, `finalize_r4.py`, `compute_sha_r5.py` and their
intermediates are preserved in this session's scratchpad.
