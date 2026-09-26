# 975 — Stage A type-attribution and historical-control preservation

Parent973 closed74PASS/fixedSource:true on `c000479d` plus patch
`f68162a2f6db85d8969990b7991f769714c1d24e37be429b4b6593023e17bedd`.
Parent972 core typecheck passed. Parent974 root/UI command closed child2/fixedSource;
root TypeScript reported21 test diagnostics and UI did not run. This record
attributes maintenance to those diagnostics. It is not a subsequent test/type pass.
No command, generator or gameplay was executed by the test author.

## Diagnostic disposition

| 974 path/sites | Cause | Bounded change |
| --- | --- | --- |
| helpers/p14c2b-fixtures:63 | `c2bLiveFixture` stopped at36 but promises a current state | Actual `migrateToLive` over the frozen validated35 input; historical36 envelope helper uses guarded38→37→36 instead of stamping current authority36. |
| helpers/p14c2c-fixtures:29 | Current writer output was fed to strict37 | Current38 validator for the existing save/load helper. |
| helpers/p14c2rm-fixtures:23,62 | Current round trip used37; genuine37 Scientist loader promised current state | Validate current round trip as38; retain genuine37 hash/strict validation, then actual `migrateToLive`. |
| helpers/p14c4-fixtures:67,70 | LiveSaveFile now38; the historical35 projection started at37 | Current38 validation and explicit guarded38→37→36→35. Semantic post-tick projection limitation is addressed by the historical producer below, not by stripping fields. |
| p14b1-first-take:301 | A current receipt round trip was typed by37 | Current38 reader; identical receipt comparison and actual gameplay remain. |
| p14b1-t4-regressions:168 | Current carrier was loaded through37 | All same-file current-envelope controls use38, keeping their historical promise receipt contents and exact round-trip assertions. No historical envelope fixture changes. |
| p14b3-reservations:96 | Current round trip was loaded through37 | Current38 reader; reservation/history/digest assertions remain. |
| p14b4-material-evidence-core:145,291,361,406,436 | Live-only carrier stopped at36 | Explicit existing31→32→33→34→35→36→37→38 chain and current38 carrier/reader. Independent frozen31 carrier, fixtures, staged assertions and strict31 reader remain unchanged. |
| p14b5-save-v31:179 | Current writer received the explicit lift only through37 | Append actual37→38 conversion to the established chain. Frozen30/31 conversion/downgrade checks remain. |
| p14c2a-save-and-settlement:321,330 | G5's disclosed synthetic37 input was labelled current; its reload stopped at37 | Explicit `GameStateV37`, strict37 validation, actual live migration before tick; current38 reload. No root injection, clock change or new synthetic fact. |
| p14c2rm-writer-continuation:233 | Historical downgrade was passed a38 envelope | Explicit38→37→36 chain; live validation cases use actual current38 and current envelope stamp. Historical36 control still requires a historical witness, below. |
| p14c3-save-v38:89,247 | Local mutation view intersected new readonly production arrays with mutable local arrays | Helper `State38` replaces careerLifecycle via `Omit` instead of intersecting it. This changes only the local test view; runtime bytes, assertions and production types stay intact. |
| p14c4-save-v35:279 | Live continuation round trip stopped at37 | Current38 reader for the live mid-year replay. Historical35 assertions retain their own reader and require the controls below. |

Exactly13 consumed files changed in this maintenance handback: five helpers
`p14c2b`, `p14c2c`, `p14c2rm`, `p14c3`, `p14c4`; and eight tests
`p14b1-first-take`, `p14b1-t4-regressions`, `p14b3-reservations`,
`p14b4-material-evidence-core`, `p14b5-save-v31`, `p14c2a-save-and-settlement`,
`p14c2rm-writer-continuation`, `p14c4-save-v35`.
The owned `p14c3-save-v38` body and `p14c3-transitions` body are unchanged from973.
No timeout, compiler option, skip, assertion removal or cast granting missing38
authority was introduced.

Frozen maintenance-path `git diff --no-ext-diff --binary` SHA256:
`b98b1263456a9ba73a53db8e575303909262bc19786e7770fa78f3f4c79df9bd`.
This is the cumulative patch over those13 paths, including the already-new C.3
helper, not an isolated delta from973. Parent recorder owns final whole-source
identity. All consumed source was explicitly frozen before producer handback.

## Historical behavior must stay exercised

Two preexisting helpers previously projected newly ticked current worlds to older
envelopes. Save38 makes real entrants, evaluations and finality authoritative, so
that projection must now refuse. Removing six fields or relabelling a new save as
old would bypass the exact law being tested and is forbidden.

The historical C4 tests need actual old cohort receipt states at156,312 and2652.
The historical880-B strict36 test needs an actually commissioned-before-E writer
control and a genuine finishing37 state. Newly created38 people cannot supply those
old-boundary states by legal downgrade. The test author reported these limits
before changing any historical expected cause. Parent verified927 had all C4 save28,
C2b save14 and writer64 cases passing and authorized a bounded new reproduction from
read-only Git objects for the outgoing qualified source. No reset, clone, worktree
replacement or production rollback is involved.

The first maintenance handback leaves these historical assertions intact pending
the actual new artifacts. They must be wired to the reproduced historical controls
after a successful mint and source-release signal; no new passing result is claimed
from type repair alone. Live880-B tests continue using actual38 public gameplay.
Current-version literal expectations outside the21 diagnostic sites are also not
silently refreshed by this type-only attribution; any remaining current pins require
the parent's bounded behavioral attribution before qualification.

## Frozen 975-A producer

File: `975-A-c3-historical-controls-producer.ts`.
Initial draft SHA256: `f71ef63f7f3fd60c4f4246b0af4d14b5e5d519694a941f23d285dff54b294270`.
This draft was not executed. Parent identified that tsx is absent; the corrected
invocation uses installed vite-node2.1.9 and the revised producer uses its explicit
`/@fs/` absolute-module path for archived TypeScript imports. Final hash is recorded
in the handback below.
Parent alone may execute:

```sh
node_modules/.bin/vite-node --script docs/engineering/playability-launch-review/evidence/p14b4-20260919/975-A-c3-historical-controls-producer.ts --archive-root ARCHIVED_REPOSITORY_ROOT --write
```

Without `--write`, it prepares and asserts but creates no files. The archive root is
parameterized and must differ from the mutable worktree. Before importing archived
core modules, it checks every archived `src` file against that path's actual Git blob
at `c000479d6e888d3a02f5c2ff534f5dfcbb32af3f`. It repeats source/archive/producer/input
identity checks around the run. Type-only imports describe frozen37; all executed
game/save APIs come from the pinned archive. There are no Vitest imports or test
helper dependencies.

Read-only loader assessment used installed `vite-node/dist/cli.mjs`: `--script`
executes only the first file and preserves following producer arguments. Its
`client.mjs` maps transformed dynamic imports to the dependency request owner;
`utils.mjs` recognizes `/@fs/` as a real absolute file; `server.mjs` transforms
ordinary non-library `.ts` rather than sending it to native Node20. The producer
therefore does not rely on Node's unsupported native TypeScript import, change
module configuration or require an install. This is source inspection, not an
executed loader qualification; parent will record any actual invocation failure.

| Immutable V34 input | Gzip SHA256 | Actual archived continuation |
| --- | --- | --- |
| genuine-v34-c4-cohort-week.json.gz | `b18eee654b57ae7040c6cddfb878f3e358ee735c757adf481fe88ffa97a91b02` |104→156, expected receipt weeks[156]|
| genuine-v34-c4-all-statuses.json.gz | `d042e74ab468afe8a43754378caf2301050436679ad8a394c0b5a7da055e21ca` |227→312, expected receipt weeks[260,312]|
| genuine-v34-c4-deep-deficit.json.gz | `314b8152c0e108f51b0abb3885b7ec06dee520f29deef3bdb0845ed514c1ab5a` |2600→2652, actual32-actor receipt|

Each input also verifies the original manifest raw hash, strict34 reader and exact
old export. Each continuation uses the real archived default tick and its real
37→36→35 converters. Writer reproduction uses the exact old `finishingWriter`
scenario: generated studio/funding bootstrap, public age70 writer creation,208-week
contract, actual week201 proposal/208 renewal, natural announcement260/E312, real
screenplay commission311 and finishing312. The original disclosed30m cash bootstrap
is retained and logged; no age, clock, skills, employment or task receipt is forged.

The501-tick upper bound is exact:52+85+52 C4 ticks and312 writer ticks. Each phase
is bounded at201 ticks. All premises and round trips must pass before any output
directory or file is created. An existing directory is refused, never cleaned.

Exact new output directory: `tests/fixtures/p14/genuine-pre38-validation-controls`.
Exactly four gzip payloads plus `MANIFEST.json`:

- `reproduced-v35-c4-cohort-week-week156.json.gz`
- `reproduced-v35-c4-all-statuses-week312.json.gz`
- `reproduced-v35-c4-deep-deficit-week2652.json.gz`
- `reproduced-v37-writer-commissioned311-finishing312.json.gz`

The first three are actual Save35 envelopes. The fourth is explicitly a
`historical-writer-pair/v1` bundle containing separate canonical Save37 strings for
commissioned311 and finishing312, plus writerId/dueWeek. Keeping both snapshots
preserves the positive frozen36 active-contract control and the causal frozen36
`not contracted` refusal without adding a fifth gzip or reconstructing the past
from the finishing state. Manifest records both internal save hashes.

Manifest states the actual new generation time and that these are newly reproduced
controls under archived outgoing code, not captures made at the old date and not
current38 gameplay. No output hash is guessed; the parent's run records measured
hashes and refuses source drift. No producer execution or fixture write occurred
during this authoring handback.

Final pre-execution producer SHA256 after the loader-only correction:
`5de47c19d3c665e79590126c3c7155d517ef65fc3285a69a751a539cc355e161`.
No scenario, expectation, phase bound or output contract changed. Consumed test and
helper files remain frozen at the maintenance handback above. Parent additionally
reserved a later independent accepted-state test slice for retained dated production
obligations: active player/rival, permanent writer exclusion and lawful later work;
those tests have not yet been authored or executed.


## Post978 final maintenance and historical rewiring

Parent978 closed successfully at2026-09-26T20:21:57.923Z after15.515s, child0,
`fixedExistingSource:true`, exactly five declared outputs and all501 public ticks.
The original975-A producer remains immutable. Its actual historical controls now
supply the C4 receipt tests at156/312/2652 and both old writer311/312 snapshots.
Every new helper pins the producer/source and verifies compressed/raw hashes and
strict historical readers. No current38 state is stripped to manufacture old
validation authority. The direct old37→36 writer positive and `not contracted`
negative are separate from the new38 downgrade refusal, preserving causal coverage.

The parent extended ownership to current C2b version pins: only the two live37
expectations and their names changed to38; frozen36 controls remain. Authorized
B5/C2a/C4 current pins likewise name38. The core955 history assertions now prove
exact genuine37 bytes through the actual guarded38→37 converter while asserting
current38 scaffolding and keeping every exact old fact comparison. Bridge955's
current52 runtime assertion remains pending Stage D projection53, with no bridge
source edits in this maintenance.

Eight independent retained-obligation controls were added to Stage A; detailed
premises, discriminators and finite normal-tick bounds are in
`979-c3-stage-a-final-test-handback.md`. No test, typecheck, simulation or producer
execution was performed by this author. The next parent gate must determine
whether every new actual-work premise is accepted before crediting its negatives.

Final frozen17-path cumulative test/helper diff SHA256:
`eae93e1b64e19d275cf1290fa69cab8a6cb9c929da1ca4dc759f62b5a9d42a2b`.
This supersedes the earlier13-path maintenance handback for current execution;
the earlier identity and failures remain preserved above.979 records all17 file
hashes. Parent alone owns the whole-source recorder and subsequent qualification.
