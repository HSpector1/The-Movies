# Test corrections queued after the fixed-source full run

Source `ee91913` remains frozen while core/bridge run. These are diagnoses and
prescriptions, not executed fixes or GREEN claims. Native independent test-author
reviewed both; parent confirmed the relevant source. No frozen validator changes.

1. Root typecheck TS2339 at `tests/p14b1-promises.test.ts:561`: the new digest
   assertion reads the full native receipt through an older partial test adapter.
   Replace only `promisesOf(attached).filter(...)` at line 545 with
   `attached.promises.filter(...)`. `promisesOf` returns that exact array after a
   cast, so values/assertions/runtime semantics stay identical. Do not weaken
   the digest assertion or broaden the intentionally partial synthetic fixtures.
2. Full core run reports `facility-move-demolish.test.ts` → C1-M3a (F) →
   `keeps the refund row out of every historical save format (law 19)` failing:
   expected the V13 demolition-refund refusal, received V11 unknown-field refusal.
   This test builds a deliberate V11 forgery from the live exporter and strips
   forward roots through V28, but not V29's `firstTakes`/`promises` (introduced by
   `8bb5738`; not an inherited A3-baseline signature). After its `talentMarket`
   deletion, assert both new roots equal `[]`, then delete just those two roots.
   This proves no promise/filming history is discarded and allows the intended
   refund guard to be reached. Keep both existing refusal assertions unchanged.
3. `tests/p13b-s6-save-v26.test.ts:135`, positive cancelled-adoption round-trip:
   `s6ForgeLive` calls `migrateToV29` but stamps its envelope V28. Use
   `save.LIVE_SAVE_VERSION` for this live-engine helper and update its comment to
   V29. The old V26 forge, genuine V25 bytes, migration assertions and historical
   refusal tests stay unchanged. `6948e31` updated the migrator/result pin but
   missed this envelope; this is not an inherited A3-baseline failure.
4. `tests/p08a-w0-studio-history.test.ts:455`, P08A H8 pre-boundary history row:
   moving the shared recording boundary to 10,000 now invalidates real first-take
   receipts too, so V29 correctly refuses those before reaching studio history.
   Set the forged boundary to the earliest existing history-row week plus one;
   first assert all real first takes are at/after that boundary and promises are
   empty. Keep the `/recording boundary/` assertion and all other corruption cases.
   This isolates the intended history defect without dropping real take evidence,
   relaxing validation or accepting an unrelated error. Its positive fixture
   guards must actually pass; the read-only diagnosis has not executed them yet.
5. `tests/p06a-w1-release-authority.test.ts:436`, committed save round-trip and
   downgrade refusal: the test already builds/asserts/reloads live V29, but its
   refusal regex still names V28. Require `/cannot downgrade SaveFileV29/`.
   The existing V29→V15 refusal in `save.ts:7423` is correct. Preserve byte
   equality, commitment count, the downgrade refusal, and the adjacent genuine
   V15 migration test. Rename the misleading "V16 save" title to "live save";
   V16 is this feature's origin, not the envelope this fixture builds.
6. Two observed failures in `tests/p13b-r07-save-v25.test.ts` share
   `asV25Envelope`: it strips V26 leaves and V28 `talentMarket` but retains V29
   roots. Assert `firstTakes` and `promises` are empty before removing those roots
   from this reconstruction. Preserve the nonempty workflow, V25 envelope and
   all downgrade assertions, plus the separate pinned genuine V24 fixtures.
   Correct the first test's provenance title: it supplies reconstructed V25 to
   `migrateToV25`, so it validates an existing nonempty workflow, not genuine
   nonempty V24→V25 migration. This pre-existing evidence limit remains explicit;
   removing the new roots must not claim to supply that missing historical proof.
7. Initially source-predicted, now observed in the full core log (line 1472):
   `tests/p13b-s3-save-v23.test.ts:103–105` feeds live V29 to three older migration
   entries but expects V28 in each exact downgrade refusal. Change all three
   regexes to V29, retain the refusals, and correct the adjacent live writer title
   from 26 to 29. Preserve genuine V20–V23 migration fixtures/assertions.

After BOTH suites complete: read the full diagnostics, apply these independent
test-side prescriptions, rerun both typechecks plus the affected tests, and record
exact before/after source. The full production-source pass remains attributable
to `ee91913`; the test-side corrections need separate GREEN evidence and a clear
qualified final-source identity. Any additional/new failure still requires its
own cause analysis; this note does not pre-classify forthcoming results.
