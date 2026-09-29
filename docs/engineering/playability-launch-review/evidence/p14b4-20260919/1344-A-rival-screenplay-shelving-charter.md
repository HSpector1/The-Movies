# 1344-A: rival screenplay shelving charter (D-1329-1)

The Owner chose option B of [1329-A](1329-A-c8-natural-chain-finding.md) on 2026-09-29 ([1340-O](1340-O-owner-rulings-20260929.md)):
"charter and implement bounded screenplay shelving." This record is that charter. The parent decides implementation
details and the named provisional tuning; the Owner's text decides everything else.

## 1. The measured stall (1329-A)

On seed `p13a-core-causal-01`, from about week 110, rival r01 holds two `ready` screenplays, a seatable director,
three actors and craft, and cash far above its reserve. Every week `decide` (`src/core/hollywoodTick.ts:200`) calls
`chooseIndustryPackage`, and all 54 packages of each screenplay fail the viability gate
(`src/core/hollywoodPolicy.ts:67`, `score<=holdOperatingMargin`). The cash gate (`:57`) never binds. With two ready
screenplays, `activeScriptOrdinals.length>=2` (`hollywoodTick.ts:254`) blocks every commission. All four rivals stop
filming by week 140 and never film again through week 520.

## 2. Source facts the law must respect

Parent reading, with a read-only reader map of `src`, `bridge` and `ui/src`:
- **Cadence.** `TUNING.HOLLYWOOD_DECISION_WEEKS` is 1 (`src/core/tuning.ts:29`). `decide` evaluates the ready
  screenplays only while the studio has no production (`hollywoodTick.ts:211`). A greenlit screenplay stays active
  until it is `produced` (`storeHotDevelopment`, `:50-55`). So a retry greenlight needs a free slot.
- **Gates before a package exists.**
  - Staffing: no seatable director, three actors and craft means no chooser call (`:223`).
  - Cash: candidates over `cashAvailable` are skipped (`hollywoodPolicy.ts:57`).
  - Viability: `:67`.
  - Facilities: no facility gate precedes the chooser. `addManagedProductionWorkflow` (`hollywoodTick.ts:240`) throws
    `QueueableCapacityRefusal` when no development-casting slot is free (`operations.ts:627-637`). With a capacity of 2
    (`hollywood.ts:147`), at most two active screenplays and one production, that throw is unreachable today.
  - `chooseIndustryPackage` returns only the best package or `null`, so today a caller cannot tell a cash refusal from
    a viability refusal.
- **The "not produced means active" assumption.**
  - Validation: `hollywoodValidation.ts:341`, `activeScriptOrdinals.includes(ordinal)===(p.status!=='produced')`.
  - Chart output: `hollywoodTick.ts:412`, `development.projects.length-activeScriptOrdinals.length`. Validation at
    `hollywoodValidation.ts:552-557` requires output to equal the released films.
  - Promise feasibility counts every non-produced screenplay as an existing picture: `unproducedScripts`,
    `promises.ts:274-283`, and its digest at `:406-407`.
  - Opportunity paths give a ready screenplay a live path: `opportunityPromises.ts:130-172`.
  - Rival promise authoring offers `SPECIFIC_PROJECT` on the two oldest non-produced screenplays:
    `talentMarket.ts:1465`.
- **Receipts.**
  - Kinds are a closed union (`hollywoodTypes.ts:108-124`).
  - The validator keeps an exact kind-to-keys map (`hollywoodValidation.ts:443-448`) and groups by key (`:506`).
  - `productionIdentity.ts:99-111` switches exhaustively on the kind.
  - The frozen down-projection is at `save.ts:8765`.
  - The Bridge drops unlisted kinds (`bridge/industry.ts` about `:136`).
- **Save precedent.** Save41 added rival termination with a flag threaded down the frozen chain to
  `validateHollywood` (`hollywoodValidation.ts:69-72`). Its up-conversion adds a zero movement, and its
  down-conversion refuses real termination (`save.ts:10528`, `:10537-10551`). The Save42 projection pattern cannot
  carry shelving, because the frozen chain's `:341` would reject a shelved screenplay.

## 3. The law (`rival-shelving/v1`)

**3.1 Outcomes of one decision opportunity.** For each active `ready` screenplay that `decide` evaluates in a week (the
existing loop, unchanged in order):
- **greenlit:** a viable package exists; the existing greenlight runs;
- **staffingBlocked:** no seatable director, three actors and craft;
- **cashBlocked:** at least one candidate was skipped by the cash gate and no candidate was viable;
- **economicRejection:** staffing is complete, the cash gate skipped no candidate, and every candidate failed the
  viability gate.

Only `economicRejection` increments the screenplay's consecutive-rejection count. `staffingBlocked` and `cashBlocked`
leave it unchanged. A week in which `decide` does not evaluate the screenplay (a production is running, or the loop
broke after a greenlight) leaves it unchanged. The chooser gains a pure search that also reports the numbers of
affordable, unaffordable and viable candidates. `chooseIndustryPackage` keeps its signature and result and wraps the
search.

**3.2 Shelving.** When the count reaches `HOLLYWOOD_SHELVE_AFTER_REJECTIONS`, the screenplay is shelved in the same
decision:
- its ordinal leaves `activeScriptOrdinals`, which frees the slot;
- it keeps status `ready`, its ScriptProject, its `RivalProjectCosts` row and all history;
- no money moves, and nothing is refunded;
- one receipt `screenplayShelved {scriptProjectId, conceptId, rejections}` is appended;
- the studio's commission hold starts: no commission before `week + HOLLYWOOD_SHELVE_COMMISSION_HOLD_WEEKS`.

**3.3 Obligations.** Shelving waits while an open promise (`outcome === null`) issued by this studio names the
screenplay (`projectOpportunity.scriptProjectId`). This mirrors the termination guard at `hollywoodTick.ts:187`. The
count stays at the threshold, and shelving happens at the first economic rejection after the promise settles. Its
existing owner settles it under the existing law. Shelving changes no promise, receipt, trust or consequence owner.

**3.4 Retry.** A shelved screenplay is not treated as impossible. In a decision where the studio has no production,
no greenlight happened this week and a slot is free, the studio retries its oldest shelved screenplay whose
`retryWeek <= week`. It retries at most one per decision.
- **Viable:** the ordinal re-enters `activeScriptOrdinals` and the existing greenlight runs. The shelved entry is
  removed, and `filmAnnounced` records the greenlight.
- **Economic rejection:** `retryWeek` becomes `week + HOLLYWOOD_SHELVED_RETRY_WEEKS`. The screenplay stays shelved.
  It does not re-enter the slot, so it cannot be shelved twice.
- **Staffing or cash blocked:** nothing changes, and the retry is attempted again at the next decision.

**3.5 Loop bounds.**
- The commission hold prevents an immediate recommission after a shelving.
- A retry re-enters the slot only together with a greenlight, so a shelve-and-recommission cycle of one screenplay is
  impossible.
- The shortest cycle per new screenplay is the hold, plus its draft time, plus the threshold weeks.

**3.6 Readers that change so that "shelved" stays true everywhere.** Each change is the identity when nothing is
shelved:
- chart output counts `status === 'produced'` screenplays;
- `unproducedScripts` and its digest exclude shelved screenplays, and the digest includes the shelved set;
- `opportunityPromises` `paths` returns `impossiblePath(id, 'the named script project is shelved')` for a shelved
  screenplay, for both project and genre predicates;
- `authorRivalPromise` excludes shelved screenplays from its project candidates.

The player's script development is untouched: no automatic shelving for the player.

**3.7 Not in v1.**
- No Bridge publication of shelving and no `PROJECTION_VERSION` change. Publishing a shelved-screenplay activity,
  with copy that does not call the screenplay impossible, is later scope.
- No player shelving action.
- No change to commission law: a rival still commissions its best package, as today (`hollywoodTick.ts:276`).

## 4. Persistence (Save43)

- `RivalBusiness` gains `screenplayShelving: { version: 1; rejections: {ordinal, count}[]; shelved: {ordinal, week,
  retryWeek}[]; commissionHoldUntilWeek: number }`, both lists sorted by ordinal.
- Validation for an era-43 save:
  - a rejection entry names an active `ready` ordinal, with count in `[1, HOLLYWOOD_SHELVE_AFTER_REJECTIONS]`;
  - a shelved entry names a `ready`, non-active, non-produced ordinal with exactly one matching `screenplayShelved`
    receipt at `week`, and `retryWeek > week`;
  - line 341 becomes "not produced ⇔ active XOR shelved";
  - the receipt is keyed per `scriptProjectId`, so there is at most one per screenplay.
- The frozen chain gets a threaded `rivalShelving` flag (the Save41 pattern). `productionIdentity`'s switch and the
  pre-V27 down-projection handle the new kind.
- `convertV42ToV43` adds the empty state (`[]`, `[]`, `0`) to every business, and the law applies from the next
  tick. `convertV43ToV42` accepts only the empty state. It refuses any rejection, shelved entry, hold or shelving
  receipt, because each is real state.
- `LIVE_SAVE_VERSION` becomes 43. The live-version sweep (literals, sentinels, frozen builders and harness, exact id
  rosters, size bounds) is measured first and done by test-author as its own step, as in 1320.

## 5. Named provisional tuning

| Constant | Value | Reason |
|---|---:|---|
| `HOLLYWOOD_SHELVE_AFTER_REJECTIONS` | 13 | One quarter of weekly decisions, the chart's 13-week cadence. Long enough for a staffing change to make a package viable; 75d70e18's restart came from such a change. |
| `HOLLYWOOD_SHELVE_COMMISSION_HOLD_WEEKS` | 13 | After a shelving, one quarter passes before the next commission. |
| `HOLLYWOOD_SHELVED_RETRY_WEEKS` | 26 | Half a year between retries of one shelved screenplay. |

The three constants are hypotheses under the Owner's delegation. The verification in §7 reports how they behave, and
changing them is a tuning amendment with its own record.

## 6. Tests (RED first, test-author)

1. `shelving-stalled-route`: a rival whose every package fails viability, with staff and cash available, shelves after
   exactly 13 evaluated weeks. The slot frees; the screenplay stays `ready` with its cost row; the receipt appears; no
   money moves; no promise changes.
2. `shelving-blocked-weeks-hold`: staffing-blocked and cash-blocked weeks leave the count unchanged. A mixed sequence
   shelves only after 13 economic rejections.
3. `shelving-viable-control`: a viable package greenlights exactly as at HEAD and never counts. On a run where no
   screenplay reaches the threshold, state equals HEAD's state with `screenplayShelving` stripped.
4. `shelving-commission-hold`: no commission in the 13 weeks after a shelving; a commission is possible after them.
5. `shelving-retry`:
   - no retry before `retryWeek`;
   - a viable retry re-enters the slot and greenlights, removing the shelved entry;
   - an unviable retry advances `retryWeek` and stays shelved;
   - there is no retry without a free slot.
6. `shelving-promise-guard`: an open `SPECIFIC_PROJECT` promise naming the screenplay defers shelving. After it
   settles under the existing law, shelving proceeds.
7. `shelving-feasibility-readers`: a shelved screenplay is not counted by `unproducedScripts`, gets an impossible
   path, and is not offered by `authorRivalPromise`.
8. `shelving-chart-output`: chart output equals released films with shelved screenplays present, and validation
   passes.
9. `save-v43-shelving`:
   - V42 migrates to the empty state;
   - a save and load in the middle of a count continues byte-identically;
   - validation rejects each inconsistent state (shelved and active, shelved and produced, count over the threshold,
     missing receipt, duplicate receipt);
   - down-conversion refuses real shelving.
10. `shelving-player-symmetry`: the player's development is never shelved automatically.
11. `shelving-natural-route` (long): on seed `p13a-core-causal-01`, every rival that held two unviable screenplays
    shelves and later commissions again. Industry films after week 140 exceed HEAD's 53. No studio shelves more than
    two screenplays in any 52 weeks.

## 7. Verification

- **Measured stalled route (parent, after GREEN):** the 1329 probes re-run on the candidate for 520 weeks:
  - rival cash, films, `firstTakes`, shelvings and retries per studio;
  - the first week each rival films again after shelving.
- **Controls:**
  - test 3's HEAD-equality run;
  - player-only saves;
  - no refunds or ledger movement at shelving (the rival ledger reconciles);
  - determinism across two runs.
- **The 42 C8 rows (21 natural searches) and the UNRESOLVED ledger and seating rows:** re-run on the candidate and
  attributed on their own evidence. No test is changed to restore an old result, and no hiring outcome is forced.
  Rows that still fail stay open with their cause.
- **Recorded gates:** core and UI, attributed against 1338 and 1343.

## 8. Order

1. Independent review of this charter (1344-B) and parent adoption.
2. Measurement of the Save43 sweep (1344-M).
3. RED staging (test-author, 1344-C), then the recorded RED run on unchanged production.
4. Production by sim-core (one writer). The chooser search, law, receipt, validation, save and reader changes come
   first; the version sweep follows as its own step.
5. GREEN, implementation review, the §7 verification, the recorded gates, attribution, review and closure.
