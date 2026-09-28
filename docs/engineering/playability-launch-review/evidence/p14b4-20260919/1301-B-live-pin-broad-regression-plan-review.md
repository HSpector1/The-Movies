# 1301-B — independent live-pin and broad regression plan review

Independent contract-auditor review (read-only tools: Read, Glob, Grep) of the frozen draft now stored as
[1301-A](1301-A-live-pin-broad-regression-plan.md), persisted verbatim by the parent.

REFINE

**Q1 — Maintenance-before-broad-run justification (GN), masking risk**
MET WITH EVIDENCE: `src/core/save.ts:6538` (`LIVE_SAVE_VERSION = 40`) and `bridge/schema/bridge-schema.ts:281` (`PROJECTION_VERSION = 55`) are source-declared `as const` literals, independently confirmed. Correcting test literals to match them is mechanical and source-proven, not a guess, matching the 1299-A precedent's reasoning. The plan correctly preserves the broad run as final authority ("Lesson GN still holds"), verified against `docs/LESSONS-LEARNED.md:3776-3782` ("the full recorded run is the authority... Attribute every new failure by probe... before changing any expectation"). Because GN is honored structurally, an incomplete maintenance sweep cannot *hide* a defect — the broad run will still surface it.
PARTIAL: the plan's narrative that the 56 non-excluded sites "would each fail at that assertion and mask the rest of its leaf" overstates uniformity. `tests/p14c3-save-v38.test.ts:19` (`expect(saved.saveVersion,...).toBe(38)`, where `saved = makeSave(world)` at line 18) fails *before* reaching the inventoried `LIVE_SAVE_VERSION` pin at line 20, because `makeSave` unconditionally writes `saveVersion: 40` (`src/core/save.ts:6542-6543`). This assertion is already red on published HEAD, is a derived-class site (rule 2 applies: it's produced by the current writer in-test), and is absent from the 57-row inventory.

**Q2 — Spot-check and missed pin forms**
MET WITH EVIDENCE: 12 spot-checked rows (bridge-operations-events.test.ts:333; bridge-owner-ux-projection20-migration.test.ts:65; bridge-owner-ux-projection21-schema.test.ts:18; bridge-p13b-r07-setup.test.ts:320,322; bridge-p14b4-runtime47-compatibility.test.ts:182-183; bridge-p14b8-waiver-surface.test.ts:776,778; bridge-p14a2-market.test.ts:232; bridge-schema.test.ts:340; p14b5-save-v31.test.ts:196; p14c3-save-v38.test.ts:20) all match file:line:constant:pinned:live exactly as recorded.
MISSING: the grep pattern misses at least three additional pin forms, all demonstrated with concrete adjacent hits:
- `.toContain('projection-53')` — 5 sites, each sandwiched between two caught rows in the same block: `bridge-p13b-r07-setup.test.ts:321`, `bridge-p13b-s5-adoption.test.ts:251`, `bridge-p13b-s6-cancellation.test.ts:271`, `bridge-p13b-s7-disclosure.test.ts:271`, `bridge-p13b-s8-rivals.test.ts:224`.
- `$id` string/template literal — `bridge-schema.test.ts:84` (`'urn:...:projection-54'`), `bridge-owner-ux-projection21-schema.test.ts:19` (same form), `bridge-p14b8-waiver-surface.test.ts:777` (template literal, between two caught lines 776/778).
- `toMatchObject({ projectionVersion: 54 })` object-literal — `bridge-schema.test.ts:81`.
- `.toThrow(/expected literal 54/)` — `bridge-schema.test.ts:341`; historically maintained in lockstep every prior bump (confirmed via `docs/engineering/playability-launch-review/evidence/p14b4-20260919/1197-p3-neighbor-maintenance.patch` and `700-T2-sweep-report.md`, which repeatedly bump this exact regex alongside the direct pins).
None of these 9 sites is in the 57-row inventory, though every containing file already has an inventoried row for a neighboring line. The plan's stated "second, derived class" (~114 hits) only describes `saveVersion` literals and `sha256:` schema-id pins — it never mentions these projection-version string/regex forms, so they aren't even flagged for later classification.

**Q3 — Rule precision**
PARTIAL: Rules 1-4 give no instruction for the `$id`/`.toContain`/`.toThrow(regex)`/`toMatchObject` forms found above — a gap, since these are as source-provable as the three named direct forms when they assert current schema metadata. Rule 2/3 also don't disambiguate `p14c3-save-v38.test.ts:19`, where a literal titled around a historical checkpoint ("C.3 A01/A02 exact Save38 opening") is nonetheless produced by calling the live writer in-test.

**Q4 — Collection**
MET WITH EVIDENCE: `vitest.workspace.ts:20,30` confirms `tests/**/*.test.ts` (417 files, verified by glob) for `core` and `ui/**/*.test.{ts,tsx}` (204 files, verified) for `ui`; 417-6=411 is arithmetically correct. Re-grepped the six 1296-A exclusion fixture basenames against current `tests/` and found only the same six files plus one MANIFEST.json (not a test) — no new Owner/p20/p06 consumer exists at current HEAD.
PARTIAL: passing 411 explicit paths as Vitest positional arguments relies on substring-match semantics (1296-A itself: "A test-name -t filter alone cannot protect..."); the plan states no post-run check that exactly 411 files were selected (neither more via accidental substring inclusion nor fewer). 1296-A's own alternative, "explicit file exclusion globs" for the six files, avoids this class of risk entirely and is not adopted.

**Q5 — Guards**
MET WITH EVIDENCE: `run-bounded-source-guards.py` merely records whatever `CAP` is passed (line 5, 59); using `-1` as a disclosed "no cap, not a measured counter" label is consistent with prior `cap0` usage. Omitting a manual fixture companion matches 1296-B's design (fixtures under `tests/fixtures/`, `ui/e2e/`, `ui/public/` are automatically excluded from hashing, not from execution). Disclosed operational effects (dist/studio build, temp PNG/scenery output) match 1296-A's own caveat about `bridge-supervisor.test.ts`.

**Q6 — Predictions and closure**
MET WITH EVIDENCE: the four predictions are specific and falsifiable; the closure section explicitly bars rerun/filter/timeout/weakening, matching GJ (`LESSONS-LEARNED.md:3743`) and GM (`:3768`).

**Required amendments (before staging 1301-C)**
1. Extend the direct-pin inventory with the 9 named sites above (and rerun the same class of grep for `.toContain('projection-`, `.toBe(\`urn:`, `.toThrow(/expected literal`, `toMatchObject({...projectionVersion:`), classifying each as current-metadata (correct) or historical (leave, cite reason).
2. Add explicit rule coverage for these forms rather than leaving them in the unscoped "derived" bucket.
3. Resolve `p14c3-save-v38.test.ts:19` explicitly: state whether the leaf now describes "current writer output" or "frozen Save38 shape," and correct or exclude accordingly, not just its line 20.
4. Add a post-collection assertion that vitest's reported selected-file count equals exactly 411 for 1302, or replace the 411-path allowlist with `--exclude` globs for the six files.

**Could not verify**
Did not execute vitest, npm scripts, or the guard scripts. Did not read `run-bounded-source-c2.mjs`, `1119-B`, `1202-A`, `1299-B/F`, or `1296-D` bodies. Did not exhaustively enumerate every possible live-version pin form beyond the targeted patterns searched (my searches, while evidenced, are not proven exhaustive). Did not recount the full 57-row/37-file tally claim. Did not verify `tests/bridge-supervisor.test.ts` build/spawn behavior directly (relied on 1296-A's prior finding). Could not confirm the exact 411-path list content, since the plan supplies only a placeholder.
