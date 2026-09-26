# 940 — read-only C.3 input inventory producer

2026-09-26. Prepared at published `9afae8874486fbb20dc5d373526698aacbec2114`,
Save37. **Not executed.** Parent owns planned run941 after freeze/review. Only this
document and `940-c3-input-probe.ts` are authorized;938 is already frozen.

Frozen producer SHA256 (read-only file hash, not execution):
`db107bf0df20f5b1f96180db1d19d68dca44726d8651518a4b272de56062b03d`.

The probe reads exactly two immutable sources and their historical manifests:

- `tests/fixtures/p14/genuine-v35-c2b-corpus/genuine-v35-c2b-rival-incumbent-cohorts.json.gz`,
  Save35 at week2600, originally produced at68783a8a. It retains actual cohort
  entrants, rival employment, first takes, credits and retirement records.
- `tests/fixtures/p14/genuine-projection51-runtime-c2rm/genuine-v37-scientist-week670.json.gz`,
  Save37 at week670, originally produced at48a76a87 by872. Its Scientist is a
  non-catalogue control; the inventory examines this world's actors separately.

The producer independently pins both historical compressed/raw identities from
those manifests, verifies them against disk and manifest entries, imports through
the actual dispatcher, calls `migrateToLive`, then validates through
`validateSaveV37`. It performs no tick, gameplay action, manual state edit, fixture
write, output-file write, or test-helper/Vitest import. The explicit V35→37 lift is
the only permitted transformation, and the source input must remain unchanged.

For each world it reports population/actor/lifecycle counts and all exact actor
candidates with materialized age<75 and P10 directing or writing capability at
the existing minimum60. These filters are an inventory request, **not a selected
C.3 eligibility rule**. Current, announced, finishing and retired actors are
distinguished. Target discipline facts come directly from `careerIdentity`,
`expectedPotentialTier` and `expectedPotentialRange`: perceived OVR, capable,
proven, capable-but-unproven, recorded work-history count and public potential.
No hidden ceiling is printed or used as a future eligibility threshold.

Career inputs are independently counted from retained authoritative rows:

- Actual actor first-take and lead receipts, distinct production ids, and repeated
  director–lead pairs (two or more actual takes is a factual repeat count, not a
  proposed transition threshold).
- Role-credit count and distinct released-film count as separate units, with
  authored-start history separated from captured campaign films and career events.
- Shared writer credits joined to released films on which the subject has an
  actual acting role. Exact film/writer/provenance/date examples distinguish
  authored history from campaign history; matching first-take ids are reported
  separately. A first-take receipt has no writer id, so the probe never guesses one
  or claims that writer credits minted a relationship/mentorship event.
- Actual current/recorded employer identities and cohort entry week, without
  private rival salary or account data. The manifest's cohort actor focus is
  always reported separately even if it fails the capability/age inventory filter.

At most128 full candidate rows per world are allowed; exceeding that bound fails
loudly rather than silently hiding candidates. Example lists/pairs/contexts cap
at8 and publish exact omitted counts. Whole-input aggregate counts are not sampled.
Zero candidates is a valid inventory finding, not a failed C.3 implementation or
permission to tune thresholds after observing a desired result.

The producer records own SHA256, source HEAD, pre/post consumed-source diff hashes,
untracked-source check, input/manifest hashes, validated-state hash, Node/platform
and architecture. It requires the exact published source and initially empty
consumed-source patch, refuses any source/input/producer drift, and compares the
validated state before/after all reads. Docs are excluded from consumed source,
with the producer's own bytes checked separately. Parent's recorder remains the
complete execution/source-stability record.

Run from the existing repository root only after parent release:

```sh
node_modules/.bin/vite-node docs/engineering/playability-launch-review/evidence/p14b4-20260919/940-c3-input-probe.ts
```

Nothing in this producer predicts a future C.3 decision, receipt, count, hash or
timing. It does not mint outgoing Save37 T0 artifacts;937 and a separate producer
must select and generate any additional natural positive fixtures afterward.
No execution result is claimed by this preparation document.
