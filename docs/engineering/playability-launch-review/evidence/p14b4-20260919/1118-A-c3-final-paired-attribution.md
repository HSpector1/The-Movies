# 1118-A — C.3 final paired-gate attribution

Status: all six paired records are closed; this report is frozen. Parent owns the
sole execution lane and production; this report's author reads closed evidence
and owns no test/source change during these gates. The final full core/UI runs,
types and generated checks remain separate pending gates. No outcome is forecast.

## Candidate and exact selections

The reviewed 1093, 1096 and 1110 layers were actually applied in that order by
1115's guarded helper, then passed its final-byte verification. The published
candidate for all six records is `d8552a0b7caa9a02da17320a203a923134e093b8`.
All six records below report identical start/end HEAD, empty consumed-source
diff (`e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`),
no untracked consumed input, `fixedSource: true`, no process signal or recorder
error. This does not merge child exit status with source-integrity status.

All displayed UTC times are on 2026-09-27.

Exact argv authority is `1115-application-01.argv.json`, 711,176 bytes,
SHA256 `992946fb791f02cddc47acd07448e724b6b5a7b3d1c75a076e5b3ea0588f7297`.
The five original 1103 groups and additional 1110 affected leaf retain their
full exact names, arguments, timeouts and selections. The focused selector's
reported skipped cases are unselected by that command, not new source skips.
No overlapping group counts are added into a synthetic suite total.

| Record | Actual scope | UTC start–end | Recorder wall time | Child | Actual observed cases |
| --- | --- | --- | ---: | ---: | --- |
| 1089 | B5 maintained natural-chain leaf | 08:07:50.543–08:08:01.157 | 10.614 s | 0 | 1 PASS, 14 filtered/unselected |
| 1090 | Cash frozen-builder laundering leaf | 08:08:23.740–08:08:27.990 | 4.250 s | 0 | 1 PASS, 9 filtered/unselected |
| 1091 | Exact 1048 metadata group | 08:08:54.928–08:09:55.902 | 60.974 s | 0 | 43 PASS across 30 files, 371 filtered/unselected |
| 1092 | Exact 1049 seven-file runtime group | 08:10:40.348–08:13:20.901 | 160.553 s | 0 | 111 PASS across seven whole files; no skipped cases |
| 1093 | Exact 1051 process-restart file | 08:14:15.836–08:15:36.530 | 80.694 s | 0 | 10 PASS across the whole file; no skipped cases |
| 1094 | Exact 1053 remaining 61-file group | 08:16:36.835–08:24:10.412 | 453.577 s | 1 | 944 PASS, 23 FAIL, two existing TODO; 58 passing / three failing files |

## Closed focused comparisons

**1089 — B5 causal pins.** The exact `bridge-p14b5-relationships.test.ts`
family-12 natural-chain leaf passed. This is the selected regression required by
1110 after valid 1062 receipt/employment/first-take measurement and independently
reviewed 1105-E/F causality. It executes the maintained three pins together with
the original settlement digest, all terminal/RNG/D5 and remaining leaf checks;
it does not merely repeat the independent diagnostic producer. Its original
1053 failure and full historical pin values remain preserved. The invalid
counterfactual trajectory supplies causal evidence only, never gameplay proof.
Within this one selected identity, the old failure is absent and the explicit
PASS supplies execution support. There are no new, retained or changed failure
blocks in this selected run. Fourteen other leaves were not executed here.

**1090 — historical cash substrate.** The exact `cash-ledger-checkpoint-v11.test.ts`
leaf `prevents every frozen builder from laundering an invalid checkpoint`
passed after 1086/1093's real admitted old-11 substrate correction. The original
1052 `talent.research` current-admission first cause is preserved; it no longer
masks the actual frozen cash guard in this execution. The selected leaf retains
its old-domain refusal, admitted positive controls and input-byte purity checks.
Within this one identity, the prior failure is absent with explicit PASS support;
no new, retained or changed failure block appears. Nine file peers were filtered
out. This is not a new all-102-scaffold execution, and the earlier 101 passes are
not relabelled as results of this focused command.

**1091 — current metadata.** The recorded argv array is exactly equal to
1048's nested command array, including its frozen selector and artifact guards.
Actual scope is the same 30 files / 43 selected leaves / 371 unselected leaves.
1048 contained 41 unique detailed FAIL identities and two passes; 1091 contains
no failure blocks and 43 passes. The matched sets are therefore exactly:

| Set, restricted to the unchanged 1048 selection | Count | Exact membership |
| --- | ---: | --- |
| NEW | 0 | empty |
| VANISHED-IN-EXECUTED-SCOPE | 41 | every detailed FAIL identity in the pinned 1048 raw log |
| RETAINED-IDENTICAL primary diagnostic | 0 | empty |
| CHANGED primary diagnostic | 0 | empty |

All 41 prior failed identities were selected by the same command and now have
execution support in the complete selected PASS result. This includes the actual
current schema/projection/save/prior-roster maintenance and declaration/header
pins; it does not recalculate an expected pin from test output. The independent
1047 double-render measurement remains the declaration-body authority. Both
previously passing shape controls remain within the 43 actual passes. The
historical 1048 log and all its full diagnostics stay unchanged; the 371 filtered
leaves have no result from this command.

**1092 — seven whole runtime files.** Its complete argv array exactly equals
1049's. The old run contained 62 unique detailed FAIL identities and 49 passes;
1092 ran all 111 cases in the same seven files and passed them, with no skipped
cases or failure blocks. Matched failure sets are NEW 0,
VANISHED-IN-EXECUTED-SCOPE 62 (exactly every detailed FAIL identity in the pinned
1049 raw log), RETAINED-IDENTICAL 0 and CHANGED 0. The explicit whole-file PASS
supplies execution support for all 62 formerly masked leaves and retains the
49 earlier passes within this actual run.

1080-A's first-cause partition remains historical: 52 current Save pins, four
projection pins, two ordered-anchor expectations, one whole-checkpoint equality,
one saved-slot equality, one canonical-version diagnostic and one prior roster.
The observed PASS reaches the maintained independent slot/anchor and governed
prior52 migration/reset assertions, including their preserved historical input
controls. It does not relabel old journal bytes, erase the known outgoing parity
defect, or infer any result for `bridge-p14c3-runtime.test.ts` R8: that file is
outside this seven-file selection. Both old R8 Vitest timeouts and its separate
standalone in-memory semantic result remain as recorded. This wall time is an
execution measurement, not a latency or performance qualification.

**1093 — whole process-restart file.** Its argv exactly matches 1051. The
actual ten cases passed with no skips or failure blocks. The single old FAIL
identity was `core :: tests/bridge-process-restart.test.ts > restores one durable
logical bridge session and exact HTTP replay after SIGKILL`; 1051 first stopped
on the current Save38 versus expected37 pin at line797. The maintained version
expectation now allows that same case to reach its remaining assertions. Matched
sets are NEW 0, VANISHED-IN-EXECUTED-SCOPE 1 (that exact identity),
RETAINED-IDENTICAL 0 and CHANGED 0. The other nine cases remain among the ten
actual passes, not inferred from disappearance. This is the source's actual
process-restart/HTTP test and does not substitute for the separate R8 coordinator
case or establish native behavior or a general latency claim.

**1094 — exact remaining 61-file comparison.** The recorded argv exactly equals
1053's complete 1084 selection. The new completed result is 944 PASS / 23 FAIL /
two existing TODO across 969 cases in 61 files. The unchanged original was
701 PASS / 266 FAIL / two TODO in the same selection. Counts were reconciled
against detailed headers, not used as a substitute for diagnostic equality.

Independent data-only parsing found 266 original identities in 225 printed
blocks (14 blocks shared by consecutive FAIL headers), and 23 current identities
in 15 printed blocks (three shared-header blocks). Every one of the 266 parsed
original complete primary bodies and hashes exactly matches 1088-A. There are
no duplicate identities, unmatched detailed failure headers or omitted shared
identities in this comparison.

| Exact paired set | Count | Measured membership |
| --- | ---: | --- |
| NEW | 0 | empty |
| VANISHED-IN-EXECUTED-SCOPE | 243 | exactly the full 1088-A `NEW` identity set |
| RETAINED-IDENTICAL primary diagnostic | 23 | exactly the full 1088-A `RETAINED_IDENTICAL_DIAGNOSTIC` set |
| CHANGED primary diagnostic | 0 | empty |

The 243 formerly new first causes are all absent with actual execution support,
including the separately causally corrected B5 natural-chain leaf. Their original
partition remains preserved: 92 frozen37 readers, 78 current Save pins, eight
projection pins, two registry counts, 25 ordered-anchor oracles, 14 unsupported
version sentinels, 19 historical-substrate seams, two semantic-loss guards, one
Scientist old-envelope control, one strict30-to-current B5 projection, and one
B5 gameplay pin. These are leaves/shared-helper first causes, not 243 separate
production defects. Nothing in that partition is relabelled as an original pass.

The remaining 23 failures are exactly B5 poaching (one), natural rival cast
outcomes (nine), and rival seating (13). All 23 complete primary diagnostics and
all 23 first printed frames equal 1053 exactly; the inherited 927 join is the
same independently preserved 1088 set. Twenty-two complete post-header tails
also match literally after outer trim. The remaining B5 tail changes only its
downstream caller line, `tests/bridge-p14b5-relationships.test.ts:538:46` to
`:540:46`; the primary error and first helper frame `:198:48` stay exact.
That explicit source-line shift is retained rather than normalized away or
misreported as identical complete stacks. The four full primary diagnostics,
printed frames and all 23 exact identities appear below.

The two TODOs remain source TODOs; no timeout, retry, skip, new selection or
assertion change was made during attribution. This closed group does not run the
canonical098 or C.3 R8 files and does not resolve those distinct known limits.
It supplies no new or changed first cause requiring a source correction in this
61-file comparison; it is not a passing full suite or final C.3 qualification.

For reproducible set identity, SHA256 of UTF-8 `JSON.stringify(sortedIds)`
(JavaScript string sort, full project/file/suite/leaf IDs) is
`5e98e6f8ea4a5b751c809b9462124733e78d960f676d8fb2eb83e93424427bcb` for the vanished 243 and
`adf64dc8bc808f407e504f960492d1ba3f5ae253697fad788806f63d7f2b1772` for the retained 23. These are measured
comparison identities, not test expectations.

| Closed raw artifact | Bytes | SHA256 |
| --- | ---: | --- |
| `1089-c3-maintained-b5-leaf.txt` | 1,225 | `27691920de7fff485b796b1614fa958ce9e4700507acc3a4343ecade3aef2da8` |
| `1090-c3-maintained-cash-leaf.txt` | 960 | `7c8dca5cefee71134763171653d33694bc6ba3d9aed5dc0873bd2c31d6718a63` |
| `1091-c3-maintained-metadata.txt` | 19,007 | `ab14c0ae124061d4415ed7c4f7801784538adcb3674e02a7cb17b127f42517f7` |
| `1048-c3-current-metadata-first.txt` (original comparison) | 1,827,045 | `e327443c86e8d40e31f9671231215387f8ccbe8d4a53ff299a60a7c1f8edec3f` |
| `1092-c3-maintained-runtime.txt` | 17,989 | `29899c362de4da7a91f758b80b4d733f33e227f5818ae8d807b8377765711145` |
| `1049-c3-current-runtime-first.txt` (original comparison) | 10,316,559 | `5cc4bcae23b49e7da8252680ddb33a4e8ed9e1095f6619bb69e01a0f3b023725` |
| `1093-c3-maintained-process-restart.txt` | 1,681 | `3f980a6b4e7990defbb9770e7203cd9862116ecf834a888bd5198123def00ba2` |
| `1051-c3-process-restart-first.txt` (original comparison) | 4,960 | `9fa79ff8e39c7677ccdc886aa7df01f9be6745e04af3c77bb4109be4ae4808fa` |
| `1094-c3-maintained-remaining.txt` | 149,780 | `9ba742b1368769bb30c6560cbdd8610e43425d8b4ddb942a301c03e07fbf5dc1` |
| `1053-c3-remaining-boundaries-first.txt` | 13,159,523 | `21014d712acfb78fe268fa765a7178d113d234aa35d37cc76e1fdee15e0d1258` |
| `1088-A-c3-remaining-boundaries-attribution.json` | 39,673,403 | `1685a8f3205a5ad4f661392120c40792e71b33c951068817df1d1114d0f2e8ba` |

## Attribution method and preserved limits

1113-A supplies exact scope-qualified references, not predicted current results.
The matched full core authority remains 927's measured 4,377 PASS / 58 FAIL /
11 TODO across 4,446 cases; 936 is composite follow-up evidence. Full UI baseline
713 remains its actual 2,655 PASS / 30 FAIL / 5 skipped plus separate unhandled
error, with 673/713-X/719 documenting instability. Neither aggregate becomes a
C.3 regression allowance without exact identity and diagnostic comparison.

For actual failure-bearing closed records, join complete project/file/suite/leaf
identities, including Unicode and parameterization. Consecutive FAIL headers
sharing one diagnostic must each receive that complete block. Preserve raw logs,
large expected/received diffs, and unhandled/process errors. Reconcile all parsed
identities against the actual Vitest totals; reject duplicates or unmatched
headers rather than silently dropping them.

For compatibility with prior 865/1088 comparisons, the diagnostic identity hashes
the complete primary body up to, but excluding, the first printed stack/source
frame, with only outer and line-trailing whitespace normalized. Retain the first
printed frame separately and retain the full block in the raw artifact. A
primary-body match therefore does not claim identical stack traces or execution
paths. If no frame is printed, record that absence and retain the entire primary
block to its separator. Never invent a frame, normalize numeric values or broadly
strip temporary paths; any exact previously accepted exception must be named.

Report NEW, VANISHED-IN-EXECUTED-SCOPE, RETAINED-IDENTICAL and CHANGED-primary sets
per exact selection. A repaired guard exposing another assertion is a changed
first cause, not a previously qualified test. Absence from a filtered command is
not PASS; an actual vanished timeout does not establish a timing fix. Later C.3
failures (canonical098 L1/L2, R8 and B2 helper controls) join their own closed
references separately from 927. The canonical Writer no-hire gap, both original
R8 Vitest timeouts versus standalone in-memory semantics, and inherited failures
remain open unless actual new evidence supports a narrower disposition.

This report does not rerun tests, change source, increase timeouts, add skips or
supply a final C.3 qualification. All paired rows now cite actual closed records;
final full gates remain separate.

## Exact retained diagnostic groups and identities

Every identity below is preserved exactly as printed, including Vitest’s
parameter-display ellipses. No expanded title is invented. The groups share
complete primary bodies; the raw logs retain every complete stack and excerpt.

### Group 1: 1 retained identity

SHA256 `897726ee72b1bcc23f62eb1cbfed19fbcecc39b710a1aaeded7f076300da71d5`. First printed frame in both runs:

```text
❯ Module.poachingFixture tests/helpers/p14b2-fixtures.ts:198:48
```

Complete primary diagnostic in both runs:

```text
AssertionError: expected 208 to be 52 // Object.is equality

- Expected
+ Received

- 52
+ 208
```

Exact identities:

- `core :: tests/bridge-p14b5-relationships.test.ts > family 12 — the R-D5 natural-chain LEDGER (measured; the frozen controls MUST NOT move at T2; after T2 every settlement is checked against the D5 receipt facts) > the MOST EXPOSED shared fixture, poachingFixture (p14b2-fixtures.ts :145-211; consumers bridge-p14b2-trust, p14b2-fixture-preconditions): the week-208 reasons pin and endedWeek 208 hold, and under D1 no survivor holds a shared-take counterpart`

### Group 2: 9 retained identities

SHA256 `9925f2fb02a01b203367a97bdb17f50bfb13b3da2a3fd71e51364a303cbb20a1`. First printed frame in both runs:

```text
❯ rivalWorlds tests/p14b4-cast-class-outcomes.test.ts:247:9
```

Complete primary diagnostic in both runs:

```text
Error: UNEXECUTED natural rival prerequisites absent by350: actual bound OPEN roots in each cast slot AND genuine tagged eligible take required; no synthetic substitute
```

Exact identities:

- `core :: tests/p14b4-cast-class-outcomes.test.ts > P14B4 genuine submit/settle/take routes, no synthetic commitments > RIVAL: a genuinely naturally authored tagged commitment binds and qualifies through the real scheduled owner transition`
- `core :: tests/p14b4-cast-class-outcomes.test.ts > P14B4 labeled outcome-owner probes on real bound roots and actual casts > 'rival' 'lead' with actual 'lead' seat: qualification=true`
- `core :: tests/p14b4-cast-class-outcomes.test.ts > P14B4 labeled outcome-owner probes on real bound roots and actual casts > 'rival' 'lead' with actual 'antagonist' seat: qualification=false`
- `core :: tests/p14b4-cast-class-outcomes.test.ts > P14B4 labeled outcome-owner probes on real bound roots and actual casts > 'rival' 'lead' with actual 'support' seat: qualification=false`
- `core :: tests/p14b4-cast-class-outcomes.test.ts > P14B4 labeled outcome-owner probes on real bound roots and actual casts > 'rival' 'leadOrAntagonist' with actual 'lead' seat: qualification=true`
- `core :: tests/p14b4-cast-class-outcomes.test.ts > P14B4 labeled outcome-owner probes on real bound roots and actual casts > 'rival' 'leadOrAntagonist' with actual 'antagonist' seat: qualification=true`
- `core :: tests/p14b4-cast-class-outcomes.test.ts > P14B4 labeled outcome-owner probes on real bound roots and actual casts > 'rival' 'leadOrAntagonist' with actual 'support' seat: qualification=false`
- `core :: tests/p14b4-cast-class-outcomes.test.ts > P14B4 labeled outcome-owner probes on real bound roots and actual casts > rival support qualifies for P1 and shape-legacy count-only P2, not tagged P2`
- `core :: tests/p14b4-cast-class-outcomes.test.ts > P14B4 labeled outcome-owner probes on real bound roots and actual casts > rival half-open window counts start, excludes before-start and excludes due`

### Group 3: 12 retained identities

SHA256 `6657eee1d3516dbf53a1b3fbd63e911f3352f91737d8bf493d0ef16e739fc4af`. First printed frame in both runs:

```text
❯ witness tests/p14b4-rival-seating-preference.test.ts:343:10
```

Complete primary diagnostic in both runs:

```text
AssertionError: UNEXECUTED natural premise: no rival film decision on 'seed-b' within 350 ticks holds >= 2 pool members whose seating matters; never a synthesized state
```

Exact identities:

- `core :: tests/p14b4-rival-seating-preference.test.ts > P14B4 final seating preference — the natural witness (seed-b w211 studio-bc14baf6-r01, record 618 O-T4-1) > search table: the first seed-b decision whose seating matters holds two tagged leadOrAntagonist beneficiaries and one P1 beneficiary in a three-actor pool`
- `core :: tests/p14b4-rival-seating-preference.test.ts > P14B4 final seating preference — the natural witness (seed-b w211 studio-bc14baf6-r01, record 618 O-T4-1) > RED: the real seating serves the maximal DISTINCT-beneficiary count (plan :215-218), the picture is viable and affordable (:223-225), and the real first take then satisfies all three through advancePromisesWeek/qualifyingTakes`
- `core :: tests/p14b4-rival-seating-preference.test.ts > P14B4 final seating preference — the natural witness (seed-b w211 studio-bc14baf6-r01, record 618 O-T4-1) > CONFLICT: the ordinary economic score prefers a two-beneficiary permutation; benefit count wins over score (:216-217) and the real take proves it`
- `core :: tests/p14b4-rival-seating-preference.test.ts > P14B4 final seating preference — the natural witness (seed-b w211 studio-bc14baf6-r01, record 618 O-T4-1) > TIE FALLBACK (labeled reception-input variant): two reception-identical tagged beneficiaries tie on score; the first strict-greater winner in the inherited BILLINGS order is seated — inherited tie behaviour, not fairness (:218-221)`
- `core :: tests/p14b4-rival-seating-preference.test.ts > P14B4 final seating preference — membership (plan :210-213) and masks (:213-215) > another issuer's promise never counts: r02's offers to r01's three actors are present at w202 and at the witness and never enter r01's member set; re-authored r02 offers make the negative discriminating`
- `core :: tests/p14b4-rival-seating-preference.test.ts > P14B4 final seating preference — membership (plan :210-213) and masks (:213-215) > a met promise never counts (r01 chain, RED today only through the witness defect): after the witness take the SATISFIED roots leave r01's member set at its next real decision`
- `core :: tests/p14b4-rival-seating-preference.test.ts > P14B4 final seating preference — membership (plan :210-213) and masks (:213-215) > a promise whose window excludes the prospective take never counts — 'window starts after every plausible t…'`
- `core :: tests/p14b4-rival-seating-preference.test.ts > P14B4 final seating preference — membership (plan :210-213) and masks (:213-215) > a promise whose window excludes the prospective take never counts — 'window ends before any take can land …'`
- `core :: tests/p14b4-rival-seating-preference.test.ts > P14B4 final seating preference — membership (plan :210-213) and masks (:213-215) > mask derivation through the shared reader — 'tagged lead stays exact: r01-2 counts…'`
- `core :: tests/p14b4-rival-seating-preference.test.ts > P14B4 final seating preference — membership (plan :210-213) and masks (:213-215) > mask derivation through the shared reader — 'legacy count-only LEAD_OR_SIGNIFICANT…'`
- `core :: tests/p14b4-rival-seating-preference.test.ts > P14B4 final seating preference — membership (plan :210-213) and masks (:213-215) > mask derivation through the shared reader — 'APPEARANCE_COUNT is generic cast'`
- `core :: tests/p14b4-rival-seating-preference.test.ts > P14B4 final seating preference — the initial cast seam (plan :225-232) > promised non-primary-actor beneficiaries (the witness rival's writer, director and craft, each bound OPEN P1) are never seated: one person cannot double, and the sole holder of a role is a capacity constraint, not a forged package`

### Group 4: 1 retained identity

SHA256 `e8c076c464696333edd1196fa2f0b8c5e07ac0c1d95f2a251593c60eca28a52e`. First printed frame in both runs:

```text
❯ tests/p14b4-rival-seating-preference.test.ts:690:12
```

Complete primary diagnostic in both runs:

```text
AssertionError: The expression evaluated to a falsy value:

  expect(first.cast).toEqual({ lead: WITNESS.a2, antagonist: WITNESS.a4, support: WITNESS.a3 })
```

Exact identities:

- `core :: tests/p14b4-rival-seating-preference.test.ts > P14B4 final seating preference — membership (plan :210-213) and masks (:213-215) > a met promise never counts (control, r02 chain): after r02's w211 picture satisfies its three P1 roots at w216, its next real decision has no member and takes the ordinary pick`

