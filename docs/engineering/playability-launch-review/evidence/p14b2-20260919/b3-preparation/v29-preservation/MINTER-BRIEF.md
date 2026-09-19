# Two genuine V29 preservation gates — minter drafts, UNEXECUTED

Only temporary draft files exist. No runtime/probe/typecheck/install or repository
edit occurred for this task. This is preparation during frozen B2 verification,
NOT permission to mint now, NOT B2/B3/B-F2 closeout, NOT a P2 schema decision.

Three operational source drafts in this temporary directory; intended future
temporary installation paths:

- `bridge-p14b3-mint-evaluator1.test.ts` → `tests/bridge-p14b3-mint-evaluator1.test.ts`.
- `bridge-p14b4-mint-v29.test.ts` → `tests/bridge-p14b4-mint-v29.test.ts`.
- Shared `v29-mint-support.ts` → `scripts/v29-mint-support.ts`.

The helper lives under scripts, not tests/helpers: the root engine tsconfig
includes all tests/helpers and rejects the bridge's TS-suffixed imports. Each
operational bridge-prefixed entry is properly excluded by that root config and
reaches the helper through the bridge typecheck. No tsconfig edit is required.
The B2 fixture builders import Vitest expect, so the minter deliberately runs
inside the existing Vitest environment rather than assuming they can be imported
by a standalone vite-node process. No new API is invented; only existing
BridgeSession quote/command, reducers, save writer/readers and fixture functions.

## Precise order: old evaluator first, final outgoing writer later

1. Complete qualified B2 verification/closeout, commit/push and exact remote
   publication verification. Freeze that accepted evaluator1 producer BEFORE
   any B3 evaluator2 edits. Reserve the sole heavy runtime slot.
2. Fill ONLY the small minter's four invalid acceptance/publication sentinels
   from recorded accepted TESTED source, PUBLISHED recovery, closeout path/hash.
   Set `STUDIO_MINT_V29_APPROVED_B2` to its exact published SHA and run ONLY
   `node_modules/.bin/vitest run tests/bridge-p14b3-mint-evaluator1.test.ts
   --minWorkers=1 --maxWorkers=1` under the parent's fixed-source recorder.
   Exact required writer: Save29/protocol4/projection46/schema584bdd…/rules1.
3. Verify the three old-producer artifacts, archive executed entry/helper/raw
   evidence, remove operational entry/helper from routine source discovery and
   preserve the corpus/provenance in a recoverable checkpoint. No B3 T1 missing
   fixture failure substitutes for actual minting. B3 T0 requires these bytes.
4. Execute B3 RED/implementation/full verification/qualified closeout with new
   evaluator2, preserving old roots/receipts on load. Then complete narrow B-F2
   has-discipline correction under existing D9/companion law, evaluator3, again
   preserving stored history. The old primary-role gate is a factual error, not
   a new Owner product decision. The SAME three old snapshots cover both changes;
   there is deliberately NO second post-B3/pre-B-F2 minter/corpus.
5. BEFORE P2/B4 changes the writer, gate the final nine-case minter on accepted
   B-F2 (or exact last-V29 accepted upstream), not merely B3. Fill its separate
   four sentinels; set `STUDIO_MINT_V29_APPROVED_FINAL` to the exact published
   recovery SHA; run ONLY `node_modules/.bin/vitest run
   tests/bridge-p14b4-mint-v29.test.ts --minWorkers=1 --maxWorkers=1` under the
   fixed-source recorder. Planned final writer remains Save29/protocol4/
   projection46/schema584bdd… but rules3. If authorized upstream legitimately
   changes those identities, reconcile against exact accepted evidence first;
   do not restamp fixture JSON or historical promise/receipt versions.
6. Independently verify nine final artifacts/readbacks, archive actual executed
   entry/helper/evidence and remove operational files before normal suites.
   Preserve final outgoing corpus/provenance BEFORE releasing P2/B4 writer.

Both gates require current HEAD equal exact published SHA, accepted tested source
an ancestor, and identical producing/recipe bytes. Protected paths include full
src, bridge, **ui**, generated, package/lock, **all tracked tsconfig*.json paths**,
Vitest configs and the reused B2/T4 fixture recipes; untracked producer code is
also refused. Relevant adapter/config files are hashed in provenance (UI adapter,
UI Vite/tsconfig, root engine/src/bridge tsconfigs, Vitest/package/lock files).
Gate also checks live Save/protocol/projection/schema/evaluator identity, exact
closeout hash and absent target directory. It rechecks after ALL candidates have
validated before writing. Both executed entry and shared operational helper are
hashed before construction and checked unchanged afterward; both hashes are
recorded, not merely the helper's import.meta.url. No cleanup/deletion occurs.

The generation token is a scheduling/authority guard, not an automated proof that
the product is accepted or the remote is published. Parent supplies that external
evidence before replacing sentinels. The unconfigured draft fails before fixture
generation, directory creation or byte output. Neither current bee7e22 nor any
future SHA is automatically acceptance: only recorded qualified publication can
replace the corresponding invalid gate.

## Small old-evaluator corpus: three snapshots at qualified B2, before B3

Separate new directory: `tests/fixtures/p14/genuine-v29-pre-b3-evaluator1`.
The entries below are exact planned filenames; no bytes currently exist:

1. `genuine-v29-evaluator1-current-p1.json.gz`: actual retentionFixture().submitted
   current P1; hard-pins focused root.version1 and receipt.rulesVersion1,
   REASONABLY_ACHIEVABLE, unbound/no outcome. No regenerated old-version stamp.
2. `genuine-v29-evaluator1-withdrawn-p1.json.gz`: SAME world, actual
   withdrawProposal for the focused player proposal; full promise/first-take/
   receipt roots unchanged and no current reference to that old promise. Other
   proposals remain. No manual removal from a serialized state.
3. `genuine-v29-evaluator1-role-label-refused-p1.json.gz`: real current natural
   rival writer proposal in rivalFixture().open, primary role writer plus actual
   complete acting skill profile; actual submitProposal with original legal terms
   then attachPromise P1 over the real contract interval. Produces an actual
   count-only staging root with evaluator1 IMPOSSIBLE role-label receipt, exact
   bottleneck, no binding/outcome/evidence. The prior natural history survives.
   Primary role/acting profile/original full receipt are explicit provenance.

The writer-proposal premise is UNEXECUTED and guarded: fail if no actual current
unattached rival writer offer exists, never relabel people, fabricate offers or
silently change the generation recipe. This witness records the old producer's
bug; it does not claim the writer lacks acting discipline under the actual law.
Each snapshot gets its own provenance JSON plus the shared last-written manifest.

## Final outgoing corpus: nine genuine snapshots after B-F2, before P2

Every artifact is generated from test campaigns, never an Owner save. No save
version, promise family, outcome, contract ID, receipt, digest or history is
rewritten in serialized JSON. Existing B2 retentionFixture()/rivalFixture() are
called unchanged and their exact accepted source-file hashes are recorded.

1. `empty`: actual generated V29 writer, empty promises/firstTakes.
2. `current-p1`: B2's real current unbound P1 attachments at submission.
3. `replaced-p1`: actual final-V29 quote→commit revision via the B3 route, new live ordinal,
   changed material digest; original unbound roots/receipts retained unchanged.
4. `withdrawn-p1`: actual quote→commit withdrawal; old records retained and no
   target proposal references them. The other person's current promise remains.
5. `bound-open-p1`: B2's two genuinely settled contracts/OPEN promises, exact
   issuer/person/employment/settled-event joins.
6. `kept-and-broken-p1`: B2 real first take SATISFIED A and same-week actual early
   termination BROKEN B; both exact contract joins and distinct own outcome refs.
7. `rival-current-p1`: real natural rival-authored proposal/promise before expiry.
8. `rival-shared-take-terminal-p1`: at least two different rival beneficiaries
   SATISFIED by ONE real first take, with DISTINCT own outcome receipts. Reuse
   rivalFixture().terminal and T4's bounded receipt-group search through230.
9. `refused-p2-count-only-current-draft`: real submitProposal then attachPromise
   `LEAD_OR_SIGNIFICANT_ROLE_COUNT`, predicate exactly `{count:1}`. Outgoing law
   accepts staging but returns IMPOSSIBLE/not-offered feasibility; the root is
   unbound/current/nonterminal. It is NOT an API rejection/no-root case and NOT
   an offerable P2 commitment. Old P1 roots are retained as authored.

Cases6 and8 are deliberately separate: a kept/broken pair need not share take
evidence, while case8 proves multiple SATISFIED rows can share one take but never
an outcome receipt. No BROKEN row is given fabricated qualifying evidence.

## Validation, provenance and failure behavior

For each prepared world, actual makeSave→exportSave; validateSaveV29→exportSave
byte equality; importSave→validateSaveV29→exportSave byte equality; actual
BridgeSession.fromSaveJson→makeSave→exportSave byte equality. Full promises,
firstTakes and talentMarket equality explicitly protects receipts/digests and
references. Gzip is round-tripped in memory before disk writes. Save29 is checked,
not assigned as a restamp. Provenance stores producer/recipe/minter/closeout
hashes (including both executed entry and helper), tested/published/observed SHAs,
versions, exact schema identity, seeds,
weeks, recipes/real intent IDs, focused actual promise identities and original
full feasibility receipts, both byte lengths and SHA256s.

Final output is one NEW `tests/fixtures/p14/genuine-v29-pre-p2` directory, nine gzip
files, nine provenance JSONs and MANIFEST.json written last. The small old corpus
uses its distinct pre-B3 directory and three snapshots, never overwrites it with
later evaluator output. All files use
exclusive creation; existing directory means refusal, even if empty/partial.
All scenario preparation and all byte/read checks happen before directory
creation. A disk failure can still leave a partial exclusive-created batch with
no manifest: preserve it and record the interruption; do not rerun by deleting or
overwriting evidence. Parent must explicitly resolve recovery/new batch naming.

## Unexecuted risks and bounded limits

- B3 orphan-reservation and B-F2 has-discipline corrections may alter generated
  natural chains for the final nine-case corpus. All
  existing fixture assertions remain hard guards. If shared natural evidence is
  absent by230, fail before any writes; do not extend a bound silently or forge it.
- Final replacement uses already-existing APIs but depends on B3 completion: it
  must attach exactly one new P1 and preserve abandoned history. That missing
  behavior on B2 is a gate, not a reason to bypass BridgeSession.
- Reusing a test-backed fixture requires the explicit operational Vitest run.
  Draft entry/helper imports assume the intended tests/ and scripts/ paths. Neither typecheck
  nor runtime constructibility is claimed. The 180-second one-shot timeout is a
  draft execution bound, not evidence of elapsed duration or permission to race.
- Corpus authenticity means what the accepted producer actually emits. It does
  NOT exhaust all old-reader-admitted semantic combinations or authorize future
  P2 migration policy. The separate seam below must stay distinct.

## Later migration-test seam: explicitly reader-admitted variants, NOT fixtures

Source facts (frozen V29 promise reader): every catalogue family has exact
count-only predicate shape; version and feasibilityReceipt.rulesVersion accept
arbitrary positive integral values, not only1. The reader permits correctly
backed bindings/terminal states for catalogue families the old producer never
offered. These facts were read from promises.ts validation, not runtime probed.

Future migration tests should clone a hash-verified genuine V29 envelope in
memory, label the copy `reader-admitted synthetic variant`, validate it with the
FROZEN V29 reader BEFORE migration, and never write it under a genuine-producer
filename/provenance. Finite planned variants:

- Count-only refused P2 current draft with version2/rulesVersion2, plus another
  nontrivial positive pair such as7/11. Values stay exact through migration.
- Genuine bound OPEN P1 copy with only family relabeled to count-only P2 and
  arbitrary positive versions: reader-admitted broad family/binding combination,
  explicitly NOT an old producer-emitted P2 commitment.
- Genuine terminal kept/broken/shared-take copy with count-only P2 family and
  arbitrary positive versions, retaining actual contract/first-take/outcome IDs.
  Preserve distinct outcome refs and shared evidence; old-reader validation is
  the admission guard. Do not fabricate new history or claim gameplay provenance.
- Negative controls retain V29 rejection of version0, rulesVersion0 and unknown
  extra predicate keys, plus the existing forged/missing references refusals.

Future schema/migration must discriminate by ACTUAL SHAPE or an explicitly
governed carrier, never assume old classless P2 means version1/unbound and never
reinterpret arbitrary old positive version2 as new P2 role semantics. Preserve
arbitrary historical version/rulesVersion, original receipts and digests; do not
invent historical freeze evidence, roleClass or outcomes. Exact future carrier
names/migration policy remain for the bounded B4 contract; this draft invents none.
