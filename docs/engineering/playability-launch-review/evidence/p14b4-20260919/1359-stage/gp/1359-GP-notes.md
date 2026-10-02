# 1359-GP: notes for the G-P probe

The probe `1359-GP-probe.ts` measures P15C Wave 2's G-P gate (1359-A §9 :260-264, carrying 1353-A §9 :264-270). It
ticks each recorded seed to week 6240 once, runs 1359-A §3's adapter inline on the produced state, feeds the landed
Wave 1 law, and prints one JSON document. Nobody has run it: I wrote it read-only at HEAD e7f075ce and ran no
vitest, tsc, node or vite-node.

E = `docs/engineering/playability-launch-review/evidence/p14b4-20260919`. "r5 patch" = `E/1359-stage/1359-p15c-wave2-red-r5.patch`, cited by patch line.

## 1. Run

The tree is a `git archive` of e7f075ce with `node_modules` linked, as in 1357-X. It needs no patch. HEAD moved to
975e72a1 while I worked, but 26566be8 and 975e72a1 change docs only: `git diff --stat e7f075ce 975e72a1 -- src bridge
tests package.json` prints nothing, so either tree runs the same code. Set `PROBE_TREE_HEAD` to the tree's full HEAD.
Put the probe in `probe/` beside `tree/`, so the `../tree/` import prefix needs no edit. Node v20.20.2 goes first on
PATH.

Smoke, one seed, 20 weeks:

```
PROBE_TREE_HEAD=<tree HEAD> PROBE_WEEKS=20 PROBE_SEEDS=p13a-core-causal-01 \
  ./node_modules/.bin/vite-node ../probe/1359-GP-probe.ts > smoke.json 2> smoke.err
```

Full run:

```
PROBE_TREE_HEAD=<tree HEAD> PROBE_WEEKS=6240 PROBE_SEEDS=p13a-core-causal-01,seed-b \
  ./node_modules/.bin/vite-node ../probe/1359-GP-probe.ts > 1359-GP-output.json 2> 1359-GP-progress.txt
```

Below 6240 no official freeze exists, so the smoke builds an `endOfRun` manifest at week 20 (`mode: "smoke"`). It still
runs the adapter, the law, the F1 bridge and the check.

### Expected run time

| Run | Estimate | Basis |
|---|---:|---|
| Smoke | about 5 s | 1357-X's 20-week smoke took 4 s (`1357-stage/x/runs.meta`) |
| p13a-core-causal-01 to 6240 | at most about 92 s | 1357-X: 91.5 s. No `src` file changed between b0809602 and e7f075ce (`git diff --stat`), and G-P drops 1357-P's per-tick condition work |
| seed-b to 6240 | at most about 363 s | 1357-X: 362.5 s |
| Freeze per seed | well under 1 s (estimate) | one adapter pass and three law calls, each linear in films and career events |
| Full run, two seeds | about 7.5 to 8 minutes | sum, plus vite-node start-up |

Adding `p13a-wait-control-01` costs about 91 s more (1357-X: 91.1 s).

## 2. What the parent checks first

1. **Smoke exit code and stderr.** Expect exit 0, an `F1 BRIDGE` line, and `smoke endOfRun at week 20`.
2. **Smoke JSON.**
   - `seeds[0].adapterRefusals` is `[]` and `lawRefusal` is `null`.
   - `f1.landedLawRefusal` names `films[0] (…:historical-film:0).settledWeek`.
   - `f1.standInFilms` is 8: two authored films for each of rows 1-4 (`hollywood.ts:200`; `hollywoodValidation.ts:560`).
   - `domainTable` has ten rows.
3. **Full run exit code.** Exit 1 means at least one seed produced no manifest. stderr names it under `FAILED`, and
   the seed's `adapterRefusals` or `lawRefusal` gives the refusal by name.
4. **The route.** Each seed's `finalWeek` is 6240, `mode` is `"g-p"`, and `routeMs` is near 1357-X's times. A large gap
   means the tree or Node differs from 1357-X's.
5. **The F1 status.** At e7f075ce or 975e72a1, expect `landedLawRefusal` set and `standInFilms` 8 on both seeds. A null
   `landedLawRefusal` means the tree's law already accepts the authored null (1359-F2 F1 applied).
6. **The domain table.** Expect the seven array domains `complete` from week 0 and the three P15 siblings
   `notRecorded` with watermark 0.
7. **Then the retune check:** `retuneCheck.retune` and `retuneCheck.retuneSomeSeedReading` (choice 5 below).

## 3. Output fields and the spec lines they answer

| Field | Answers |
|---|---|
| `seeds[].holders` | "holders per archetype" (1359-A :261; 1353-A :267-268 "each archetype's holders"). For each archetype, the studio ids with `held`, `notHeld` and `notRecorded` |
| `seeds[].domainTable` | "the domain table" (1359-A :261): the adapter's §3.2 rows (:72-81) plus the law's status from the manifest's `sources` |
| `seeds[].adapterRefusals` | "adapter refusals" (1359-A :261). The list holds at most one entry, since the adapter stops at its first refusal, as the Wave 2 step would (1359-A §8 B5) |
| `seeds[].freeze` | "freeze time" (1359-A :261-262; 1353-A :268). `adapterMs` + `lawMs` = `freezeMs`, by `Date.now()` |
| `seeds[].manifestBytes` | "manifest bytes" (1359-A :262; 1353-A :268). UTF-8 length of `stableStringify(manifest)`, the bytes `exportSave` writes for it (`save.ts:6581-6584`), unstamped |
| `seeds[].manifestSha256`, `seeds[].manifestCanonical` | G-L's K3 (1359-A :265-266) compares the stamped official minus its stamp with G-P's manifest. With the canonical string, the parent can diff a K3 miss without rerunning G-P in an old tree |
| `retuneCheck` | 1359-A :262-263 and 1353-A :268-270: an evaluated archetype held by every studio in every seed, or by none in any seed, returns 1353-A §5.5 to retuning; resilient survivor is exempt while P15B is absent. stderr prints one `check` line per archetype |
| `seeds[].lawRefusal`, `seeds[].f1` | 1359-F2 F1 (:6-16): the landed law refuses the adapter's authored null `settledWeek` (`campaignLegacy.ts:351`). See choice 2 |
| `seeds[].studios` | Context for the brief's "report the facts as measured": each studio's role, entry week, catalog lens counts (1353-A §5.4 :175) and held archetypes |
| `seeds[].finalWeek`, `routeMs`, `msPerTick` | The route at 6240 (1359-A :261), comparable with 1357-X |
| `tuning` | The fifteen `LEGACY_*` values measured (1353-A §5.5 :185-198) |
| `treeHead`, `mode`, `weeks`, `boundaryWeek`, `law` | Run identity |

## 4. The adapter's charter lines

The inline `legacyFactsFromState` implements 1359-A §3 (:37-84). Probe lines refer to `1359-GP-probe.ts`.

| Adapter piece | Probe lines | 1359-A |
|---|---|---|
| Pure, no RNG; id maps for concepts and runs, no find per film | 74-75 | :39 |
| Passes facts through; the law cuts; the only week comparisons are the run-status rules | 85-86, 99 | :40 |
| Film `filmId`, `domainId` (player, live rival, authored) | 88, 101, 110 | :49 |
| `provenance`, `releaseWeek` | 90, 102, 111 | :50 |
| Genre: player from `state.concepts`, refusing a missing concept by name; rival from the film | 74, 79-81, 103, 112 | :51 |
| `criticScore`, `audienceScore` | 91, 103, 112 | :52 |
| Status and `settledWeek`: player run arithmetic, live rival `settledWeek < B`, authored settled and null | 82-86, 92, 99, 104, 113 | :53 |
| `grossSettled` only when settled; authored `totalGross` | 93, 105, 114 | :54 |
| `credits`: `[]`, authored `{talentId, role}` | 94, 106, 115 | :55 |
| Career events: both roots, two tags, seven fields | 120-124, 146-149 | :56 |
| Adoptions and technologies | 150-154 | :57 |
| Studios: entered identities, row order | 126-127, 133 | :46 |
| `closedWeek` null without the condition root | 134 | :47 |
| Standing: player `studio.standing`, rival `business.standing`, at the freeze | 129-131, 136-137 | :48 |
| Never reads rival account or runs, `directCommitment`, `studioRevenueReceived`, loans, career money or skill, player cash, ledger, in-run payments | whole adapter | :62-64 |
| Seven array domains with length watermarks | 155-163 | :72-78, :84 |
| Three absent siblings: `recordedFromWeek` null, watermark 0, no fact array | 164-168 | :79-81, :83 |
| No `awards` row | 169 | :83 |
| Ranking, condition and market row maps | not implemented: a present sibling root refuses (choice 3) | :58-60 |

The law call follows §4.2 (:115-117): `freezeLegacy(root, B, facts)` on the root worldgen seeds at the creation tick
(§5.2 :187-188), week 0 on these routes. The probe reads the state that `tick()` returns at 6240, which §4.1 (:101-106)
makes the freeze's input; HEAD has no ranking or condition step to run before it.

## 5. Open choices

1. **Seeds.** 1359-A :260-261 and 1353-A :266-267 say "the recorded seeds" and name none. 1353-A :267 points at
   `c3-active-endurance-contract.ts:12`, which pins weeks 0, 3120 and 6240 and names no seed. The names come from 1355-A :173
   (`p13a-core-causal-01` and seed-b) and 1357-A :256-257, which runs both through `p13aGeneratedStudio(seed)` and adds
   `p13a-wait-control-01` "to reach three". The default is the two named seeds. Set `PROBE_SEEDS` to add the third.
2. **The F1 bridge.** §3.1 :53 gives an authored film a null `settledWeek`. The landed law refuses it
   (`campaignLegacy.ts:351`), and 1359-F2 F1 relaxes the refusal only in Wave 2 production, which G-P precedes. When the
   law refuses exactly that film, the probe:
   - records the refusal in `f1.landedLawRefusal`;
   - runs the law on a copy whose authored films read `settledWeek` 0, and prints an `F1 BRIDGE` line on stderr;
   - reruns the copy with 6239 and stops with a named error unless both give the same canonical bytes.

   The law reads an authored film's `settledWeek` only in that check: an authored film is never a release
   (`campaignLegacy.ts:408`), and the manifest has no `settledWeek`. The adapter's facts keep the null. Any other law
   refusal becomes `lawRefusal`, with no manifest.
3. **Sibling roots.** No P15 sibling root exists at e7f075ce, so the adapter implements only §3.2's absent branch
   (:83). A state that carries `campaignLegacy`, `p15Sequence`, `powerRanking`, `corporateCondition` or `sharedMarket`
   (the r5 `P15_ROOTS` and `P15_SIBLINGS`, r5 patch :16, :103) refuses by name, at week 0 and again at the freeze. A
   sibling landing first needs the §3.1 :58-60 row maps, plus a look at the law's record-id rule (`campaignLegacy.ts:482`;
   1359-F3), which refuses one ranking record's second row.
4. **Gaps the RED r5 builders fill.** The named helper files build no facts: `tests/helpers/p15c2-legacy.ts`
   resolves `legacyFactsFromState` by name (r5 patch :178), and `p15c2-route-l.ts` builds route L. The integration
   test's expected-value builders in the same patch derive "from 1359-A §3.1-§3.2 (never from production)" (r5 patch
   :928). The probe follows them where the charter is silent:
   - a player film's `studioId` is `hollywood.playerStudioId` (r5 patch :939);
   - `baseMarketValue` is `state.market.baseMarketValue` (r5 patch :1255); §3.1 names no source;
   - Standing passes as its three channels, and studios sort by row alone (r5 patch :1226-1232).

   The probe matches the reference adapter (`1359-p15c-wave2-reference-r3.patch` :344-467) field for field on every
   branch it implements. The reference adds a `studioId` tie-break to the row sort, which unique registry rows never
   reach (`hollywood.ts:164`, `:169`).
5. **"By none in any seed".** The phrase reads two ways. `retune` takes it as "no holder in every seed", the mirror of
   "every studio in every seed". `retuneSomeSeedReading` takes it as "no holder in some seed". The JSON carries both,
   with the counts behind them, and the parent picks.
6. **What counts as evaluated.** The probe marks `resilient-survivor` `exempt` when every manifest reads the
   `corporateCondition` source `notRecorded` (P15B absent). An archetype whose outcomes are all `notRecorded` is
   `notEvaluated`, which covers `awards-dynasty`. The rest are `evaluated`. Only `evaluated` archetypes can trigger.
7. **"Every studio" includes everyone entered.** The probe filters nothing. It counts the idle player and every
   rival that entered before B, including the rivals 1357-X saw go broke and stop filming. Without P15B nothing
   marks them closed, so every `closedWeek` is null. The natural route takes no player action, and the player starts
   with no films (`worldgen.ts:705`), so the player should hold no archetype. If the run confirms that, the "every
   studio" half of the trigger cannot fire on these routes.
8. **Freeze time.** `freezeMs` covers the adapter and the one law call that returned the manifest, the work the Wave
   2 step does (§4.2 :116). It excludes the refused first law call and the inertness rerun. `Date.now()` resolves to
   1 ms. The law runs cold, once per seed, as it will in the live tick.
9. **Exit code.** The probe prints the JSON for every seed, then sets exit 1 if any seed lacks a manifest. A tick
   error or a probe fault throws and stops the run, as 1357-P does.

## 6. What it does not do

- It writes nothing to disk and reads no save, fixture or Owner file.
- It applies no stamp and writes no root: the stamp and `p15Sequence.next` belong to the Wave 2 step.
- It sets no time budget (1353-A :270; annex L.5).
