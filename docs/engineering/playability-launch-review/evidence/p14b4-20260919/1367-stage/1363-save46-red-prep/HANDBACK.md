# Combined Save46 migration RED preparation

Scratch-only preparation against published Save45 `2eaa697effc38538c37da28b486786ce267a2284`. No execution, Node, typecheck, live source/index mutation, fixture payload access or nested agents. This is partial concrete coverage, not passing evidence or complete B+C approval.

Full predecessor: `2eaa697effc38538c37da28b486786ce267a2284`. Authority is adopted 1363-A §5, 1363-F, 1363-A2 and 1367-H. Read with `S/1363-save46-prep/IMPLEMENTATION-MAP.md`, Part B handback and the Part C handback. Save46 belongs only to combined B+C. Part A has no save step. Parent remains sole production writer.

## Artifacts and local contracts

- `save46-migration-red.patch` adds only `tests/p14d2-save46-migration.test.ts`.
- `save45-predecessor-producer.patch` adds only `scripts/captures/1363-save45-predecessor.ts` and its dedicated config. This is separately installed before the pre46 mint, never imported by the tests.
- `SHA256.json` binds these scratch files and inspected authority/source hashes. No capture bytes or actual source-generation result exists yet.

Proposed existing-module exports match the Part C names: `validateSaveV46`, `convertV45ToV46`, `convertV46ToV45`; this package additionally requires `migrateToV46`. Missing APIs are explicit prerequisites, not intended behavioral REDs. All callbacks use namespace lookup rather than importing a nonexistent module.

The parent explicitly accepted this new local diagnostic contract during preparation: validation precedes downgrade inspection; list **all** present recovery authorities once, in the fixed order `costCutting.since, facilityDemolitionRefund, facilityDisposed`, omitting absent authorities. Converter and every lower migration use `migrateToV45: cannot downgrade or discard recovery authority: <list>`. Frozen builders use `makeSaveVn: cannot downgrade or discard recovery authority: <list>`. Inspect recovery before discarding it or invoking a still-older refusal. Empty recovery preserves the existing older-law outcome, including existing P15 or Hollywood refusals. These are test/implementation authoring decisions accepted by the parent, not invented Owner text.

## Genuine predecessor prerequisite and exact mint plan

No inspected capture is presently hash-bound for this package's exact old-state preservation and multi-period test. Do not replace it with a live46 downgrade relabeled as an old capture. The bounded new producer creates genuine public-writer Save45 at weeks 0 and 53 using existing `p13aGeneratedStudio('p13a-core-causal-01')` and exactly 53 ordinary `tick(state, {develop:true})` calls. It reads no fixture input and changes no state fields. The helper's existing generated-world initialization is part of the declared route.

Named output, fixed before mint: `/Users/zacheryspector/studio-scratch/1363-save45-predecessor-capture-01` containing only:

- `p13a-week-0.save45.json.gz`
- `p13a-week-53.save45.json.gz`
- `MANIFEST.json`
- `RESULT.json`

The parent must install and commit the producer/config on a clean published Save45 tree before executing it. The generating HEAD will be that actual accepted commit, **not** falsely `2eaa697e` after adding the producer. Its `src` tree must exactly equal published `2eaa697effc38538c37da28b486786ce267a2284:src`; both identities are recorded. This rejects a Part A or B/C gameplay edit, even if the version remains 45. Independently record the full generating SHA, `src` tree ID, producer/config hashes and relevant verification before launch. The producer checks tracked named paths, full bounded source cleanliness, absence of untracked consumed source, unchanged index/source and hashes before/after. It uses the established bounded recorder roots and excludes automatic reading under `tests/fixtures/`, `ui/e2e/` and `ui/public/`; it does not embed a binary diff in results. Docs-only dirt does not become a gameplay change.

After the parent-controlled typecheck and accepted heavy-lane/disk gates, the exact command shape is:

```sh
P1363_SAVE45_GENERATING_HEAD=<accepted-full-generating-head> \
P1363_SAVE45_SRC_TREE=<independently-recorded-src-tree> \
P1363_SAVE45_PRODUCER_SHA256=<reviewed-installed-producer-sha256> \
P1363_SAVE45_CONFIG_SHA256=<reviewed-installed-config-sha256> \
P1363_SAVE45_OUTPUT=/Users/zacheryspector/studio-scratch/1363-save45-predecessor-capture-01 \
./node_modules/.bin/vite-node --config scripts/captures/1363-save45-predecessor.config.ts --script scripts/captures/1363-save45-predecessor.ts
```

Placeholders are deliberate: no generation HEAD, archive/hash or mint is invented. Run from the accepted repository top level. Existing outputs, including dangling symlinks, refuse. No overwrite or cleanup is allowed. The parent owns the external watchdog; the producer enforces a five-minute elapsed bound at its explicit boundaries. A single stuck synchronous tick still needs the outer process limit.

Each capture uses actual `makeSave`, `validateSaveV45`, export/import and public45 validation again; the writer must preserve its input. The week-53 route must genuinely contain a multi-period rival account. If that specific premise is absent, the producer writes `ABSENT`, exits 2 and writes no save payload or manifest. An execution, schema, source or validation failure is `ERROR`, exit 1, never absence or a target RED. Success is `MINTED`, exit 0. Partial filesystem-write errors remain errors; the reserved directory is retained for inspection and cannot be reused.

After a successful mint, independently hash the actual manifest and both gzip files, record them with the generating HEAD and source tree in the parent handoff/evidence, and provide the consumer environment below. Do not trust a self-consistent manifest as the sole provenance pin. The manifest separately records serialized raw-envelope SHA/bytes, gzip SHA/bytes, state SHA, source identity, producer/config hashes, declared route, runtime dependency versions by file hash and elapsed time. No fixture publication or repository fixture path is authorized by this preparation; the consumer reads exactly the named external output files.

```text
P1363_SAVE45_CAPTURE_ROOT=/Users/zacheryspector/studio-scratch/1363-save45-predecessor-capture-01
P1363_SAVE45_MANIFEST_SHA256=<independently-recorded-manifest-sha256>
P1363_SAVE45_GENERATING_HEAD=<accepted-generating-head>
P1363_SAVE45_SRC_TREE=<accepted-src-tree>
P1363_SAVE45_ZERO_SHA256=<independently-recorded-week-0-gzip-sha256>
P1363_SAVE45_HISTORY_SHA256=<independently-recorded-week-53-gzip-sha256>
```

Missing capture/environment, missing Save46 APIs and unmet valid premises must be reported separately from intended REDs. Consumer command after installation is `./node_modules/.bin/vitest run tests/p14d2-save46-migration.test.ts --maxWorkers=1 --minWorkers=1` under the existing parent single heavy lane. Typecheck belongs to that lane too; none was run here.

## Concrete additional coverage

| Contract | Authored evidence and limits |
|---|---|
| Genuine old preservation | Public45 first admits both hash-bound genuine captures. Exact inverse comparison permits only new null `costCutting` and zero `facilityDemolitionRefund` on every period; all envelope/state facts, IDs, receipts, cash, employment, RNG, P15 roots and array order remain equal. The history capture requires more than one actual finance period. Test-only key removal is an equality oracle and is never submitted to a reader or producer. |
| Up migration | Direct 45→46, `migrateToV46` and `migrateToLive` agree. Both migration entries are idempotent on46; actual 46→45 restores the exact predecessor. Input bytes remain unchanged; reference-inequality checks for the business, account, period array, period, movement map and receipt array verify detachment without inventing any monetary fact. |
| Validate before projection | Envelope-seed mismatch is first characterized by the applicable public validator. Up/down converters must return that same validation refusal, even when the current save also carries since. Invalid input bytes remain unchanged. This explicitly checks that authority reporting cannot mask invalid input. |
| Every lower migration | All existing public `migrateToV4` through `migrateToV45` compare null/zero46 behavior with their actual admitted45 predecessor behavior. Equal existing refusals count only as preservation of prior law, not successful downgrades or independent coverage of the older guard. A separately admitted since-only genesis control requires the exact new recovery refusal at every entry. |
| Every frozen builder | All `makeSaveV1` through `makeSaveV18` preserve their actual predecessor outcome for empty recovery, and name since rather than silently projecting it or failing on an unrelated old field. These builders are not claimed to accept authoritative Hollywood. |
| Selected old public boundaries | Public45/44/43/42/41 first receive their own valid baseline produced by actual migration from genuine45 genesis. Separate added cost-cutting and zero-refund-key mutants must fail the old Hollywood exact-key owner, with no broad tolerance enabled by their presence. These are clearly synthetic old-reader mutants, not genuine historical saves. The leaf does not claim standalone receipt-era coverage or every earlier public boundary. |
| Disposal downward attribution | A real eligible paid bare laboratory must be found on an idle, proposal-free rival in the genuine week-53 capture after null/zero migration. Only since is synthetically set to the observed week, with full46 validation first. The actual Part C producer supplies cash/refund/tombstone/removal. Full46 validation then precedes every exact aggregate converter/lower-entry/frozen-builder refusal. A missing eligible route fails as `UNMET VALID PREMISE`; no cash, body, plan, receipt, proposal, production or history is repaired. |

Valid disposal authority necessarily contains its refund movement and tombstone. The aggregate leaf verifies that neither name is masked by since; it **does not claim** independent valid refund-only or tombstone-only witnesses. No invalid refund-without-receipt finance mutant is used to test lawful downgrade. A lawful post-disposal since exit would add a distinct no-since aggregate control, but a genuine retained-team greenlight/future loan producer is not yet established here. Clearing since by hand is not substituted for that missing route.

## Proof integration and remaining gaps

Do not duplicate existing C S5/S6 or Part B direct proof. The current C patch `96ce467b85e4dc2c9e5aee477f6f578dab30763280b8513831849ad030841594` owns the admitted cutting and actual disposed-state direct `validatedLiveProfessionContext` calls, with input immutability; its other leaf owns empty generated-live46 down/up. This package adds genuine predecessor migration, not another empty live roundtrip. Run C S6 directly alongside these tests, never count a caught tick refusal as proof.

Implementation review still must inspect every explicit era edge in `IMPLEMENTATION-MAP.md`: public46 enables both eras, old public wrappers disable both, and direct profession proof strips only cost-cutting while retaining the actual absent body, paid plan, receipt and refund under `{rivalCostCutting:false,rivalFacilityDisposal:true}`. The existing direct proof leaf checks behavior and immutability; it does not introspect every internal flag. A permissive old public reader is prohibited even when the trusted proof legitimately enables disposal.

Still unfulfilled: real execution/control availability; independently reviewed installed producer and measured predecessor mint; valid no-since disposal route; standalone new-receipt old-reader attribution; earlier public19–40 explicit recovery rejection baselines; mixed internal-era plumbing review/measurement; the C handback's remaining disposal premises; and original-era V27 public `admitRivalPlans` compatibility from the reviewed historical tests. No claims of natural cost-cutting entry, old finance invention, survival, or full B/C readiness follow from these tests. Parent may request a bounded follow-up after actual observations; do not silently expand the route or weaken control validation.
