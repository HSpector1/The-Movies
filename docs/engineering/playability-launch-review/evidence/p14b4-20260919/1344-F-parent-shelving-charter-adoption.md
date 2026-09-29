# 1344-F: parent adoption of the rival-shelving charter, with amendments

[1344-B](1344-B-shelving-charter-review.md) returned REFINE with three blocking defects. The parent adopts
[1344-A](1344-A-rival-screenplay-shelving-charter.md) with the amendments below; 1344-A stays byte-frozen and this
record governs where they differ. 1344-B read only the text file of 1342-O and called it a draft. The Owner's approval
of that text is recorded in [1342-O](1342-O-owner-rulings-p14-p18.md). 1344-A cites only D-1329-1 of 1340-O as its
authority, so nothing changes.

## Amendment 1: the retry path reads shelved screenplays directly (blocking 1)

`hotDevelopment(b)` exposes only active ordinals (`hollywoodTick.ts:47`), and `storeHotDevelopment` rebuilds
`activeScriptOrdinals` only from that hot set (`:50-55`). A shelved screenplay is invisible to both. §3.4 is restated:
- the retry reads the due shelved entry's screenplay directly from `b.development.projects[ordinal]` and its cost row
  from `b.projects[ordinal]`;
- it runs the same staffing selection and the chooser search the ready loop uses;
- only on a viable package does the writer append the ordinal to `activeScriptOrdinals` (sorted), remove the shelved
  entry, and then run the existing greenlight on the now-hot screenplay;
- a non-viable or blocked retry leaves `activeScriptOrdinals` untouched.

## Amendment 2: test 3 excludes the new field from the comparison (blocking 2)

Any economic rejection writes a count, so the field is not empty on a run that never reaches the threshold. Test 3
reads: on a run in which no screenplay reaches the threshold, every business equals HEAD's business after the
`screenplayShelving` key is deleted from both, and the receipts are identical. A second case keeps the stricter form:
a run whose every evaluation is viable leaves the field at its empty state.

## Amendment 3: test 11 asserts law consequences only; film counts are measurement (blocking 3)

Per studio, a cycle takes at least the hold plus the minimum draft plus the threshold: 13 + 1 + 13 = 27 weeks
(`SCRIPT_DRAFT_WEEKS_MIN` 1, `tuning.ts:966`). Two slots can run such cycles about one week apart, so the law allows up
to four shelvings in a 52-week window. It does not guarantee two. Test 11 becomes `shelving-natural-route`, asserting
on seed `p13a-core-causal-01` only what follows from the law and the measured stall:
- at least one `screenplayShelved` receipt;
- no commission by the shelving studio within the 13 weeks after any of its shelvings;
- every shelved screenplay keeps its ScriptProject and cost row;
- per studio, at most four shelvings in any 52-week window.

"Industry films after week 140 exceed HEAD's 53" and the shelvings per studio per year leave the test. They are
measured and reported in the §7 verification, with no pin.

## Non-blocking notes adopted

- **Citations.**
  - The feasibility digest entry for screenplays is `promises.ts:410-411` (not `:406-407`).
  - The Bridge's catch-all `return []` for unlisted receipt kinds is `bridge/industry.ts:133` (not about `:136`).
  - The Save41 up-conversion writes the zero movement at `save.ts:10531` (not `:10528`).
- **The threshold's reason, restated.** 13 matches the chart's 13-week cadence. The one measured staffing-driven
  recovery (75d70e18) came about 98 weeks into the stall (week 110 to 208). A 13-week threshold does not wait for
  that. The 26-week retry covers it: a shelved screenplay is retried several times over such a span.
- **Genre promises.** The guard in §3.3 covers only a promise that names the screenplay. A genre promise never
  depended on one screenplay. Shelving changes only which candidates `paths` offers for new or substituted promises,
  and it cannot settle an open promise (1344-B traced `targetSpecificImpossibility` to `breakPromisesOnCancel` only).
- **Other active-index readers.** `industryBusyTalentIds` (`hollywood.ts:92-104`) and the capacity replay
  (`promiseCapacityOwnerReplay.ts:813-839`, `:2231-2266`) act only on drafting or rewriting screenplays. A shelved
  screenplay is always `ready`, so neither changes. The implementation review confirms this.
- **Exact keys.** `hollywoodValidation.ts:225`'s business key list gains `screenplayShelving` for era 43.

## Next

RED staging (1344-C, test-author). The genuine Save42 inputs are minted first, at the current Save42 writer, per the
mint-before-the-writer-moves rule: one natural save from seed `p13a-core-causal-01` in the stall (week 130) and one
from before it (week 100). They get sha256 provenance and are committed before any production change.
