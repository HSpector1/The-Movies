# P05A.3 — Casting Roster Liveness + Post-Founding Actor Acquisition — Evidence

**Order:** Owner playtest rejection — The Bitter Migration demands three distinct
Actors; the casting board showed only two legal Actors across all three acting
pools, no route to hire a third was discoverable anywhere, and the package
still presented as quietly completable. Full order §1–24; binding laws: never
weaken three-distinct-actors, no one-actor-multiple-roles, no auto-create or
silent hire, expose the EXISTING engine route if hidden (§8), no P06.

**Branches:** TS `wip/p05a3-casting-roster-liveness-ts` (base `9361542`),
Unity `wip/p05a3-casting-roster-liveness-client` (base `31d3800`).

---

## 1. WHAT THE OWNER HIT (verbatim reproduction)

Owner profile durable checkpoint, week 8, revision 10, cash $147,893
(fixture: `tests/fixtures/p05a3-owner-profile-rev10.save.json`, digest
`a3550efd3fe8f929…`). The Bitter Migration is Ready. Exactly **two distinct
available Actors** exist across the lead/antagonist/support pools. Three
distinct Actors are mandatory (correct law — untouched). Eight Actors are
busy on running productions; none of them, and no route to anyone new, was
visible in the client.

## 2. ROOT CAUSES (three, all proven by failing-first tests)

### RC-1 — The core's own shortage sentence was DROPPED on the casting wire
`scriptReadModel` computes the exact cross-pool shortage — *"Actors (2 of 3
available)"* plus the remedy *"Sign suitable talent, wait for current
assignments to finish, or wait for the freelancer market to rotate."* —
as a `package-staffing` blocker. `castingPackageReadModel` (CPRM) contained a
deliberate `.filter((b) => b.kind !== 'package-staffing')`: the one sentence
naming the wall never reached the wire, and `knownGatesClear` computed **true**
for a mathematically unstaffable package.

### RC-2 — The hiring route exists in the engine and was unreachable
`signContract` is fully legal post-founding (`applySignContract`,
`actions.ts` operating branch: hiring-market gate D-11.14 + D-12 solvency
gate). The bridge exposed **zero** post-founding hiring intents —
`AVAILABLE_INTENT_KINDS` contained none, no draft kind, no quote kind, no
market view. Per order §8 the fix EXPOSES this existing route (quote seam
draft kind `signActor` → quote kind `signContract`); no parallel hiring
system was built.

### RC-3 — Busy Actors were omitted entirely; no return week anywhere
CPRM's pool filter dropped busy same-role actors without evidence, so the
Owner could not see WHO was coming back WHEN. The engine knows the exact
return week (production `remainingTicks`; writing `dueWeek`) — it was joined
onto no casting surface.

### Why 4,800 green tests never caught it (§18 audit)
`richFoundedStudio` — the base fixture of essentially every downstream suite —
signs **≥ 6 Actors** (`Math.max(depth.actor ?? 0, 6, FOUNDING_MINIMUMS.actor)`),
double the player's legal minimum of 3. The bridge founding flow additionally
offers an optional **reserve Actor** wave (`resolveFounding`,
`bridge/session.ts` — `reserveWave`) which the automated two-picture proof
deliberately signs. No suite ever ran a studio at the real 3-Actor player
floor. **P05 lesson: proof-convenience roster depth in the base fixture
structurally masked the real player path.** Remedy: `minimalFoundedStudio`
(exact minimums, no reserve) + `tests/p05a3-minimal-founding-liveness.test.ts`.

## 3. THE FIX — TS (engine wire, v13)

| Commit | Content |
|---|---|
| `aa5f385` | CPRM stops dropping `package-staffing`; blocker reaches the wire with counts; `knownGatesClear=false`, `willQueue=false`, attention `blocked` for unstaffable packages (red test first on the Owner fixture) |
| `591e22d` | Core liveness: busy same-role actors stay as unavailable pool rows; `returnWeek(state, talentId)` (production wrap week / writing dueWeek / null); `hiringMarketView` (D-11.6 offer economics per candidate, wire order = `hiringMarketIds`); `freelancerMarketRefreshWeek` (13-week rotation boundary) |
| `6bd5165` | Bridge v13: candidate `returnWeek`; board `hiringCandidates` + `freelancerMarketRefreshWeek`; draft kind `signActor` (`signTalentId`/`signTermWeeks`); quote kind `signContract` (totalImmediate = signing bonus, cashBefore/cashAfter/affordable per D-12); `AVAILABLE_INTENT_KINDS += signContract`; outgoing v12 identity appended to the checkpoint map (schema-bump law); regenerated contract/DTOs/fixtures |
| `d1bd7d9` | §17 sign-path proof on the real deadlock fixture (see §5) |
| `2ca837e` | §18 no-reserve founding fixture + liveness proof |
| (pins) | v13 pin fallout closed deliberately: schema/generator/checkpoint/bridge identity pins; the old busy-untested-exclusion pool test overturned by §12 with citation |

**Law kept:** the casting wire's P04A hidden-truth ban (no burn/runway keys on
CASTING) — my draft `signRunwayAfter*` fields were **removed** rather than the
test weakened; the sign quote speaks cash and obligation figures only, and the
treasury projection remains the runway authority.

## 4. THE FIX — Unity (client)

`bafad64` — all surfaces render/click the ONE pure decision:

- **`StudioCastingShortageContracts.Decide` (§14)** — 12 states
  (EnoughActors, OneActorShort, MultipleActorsShort, FreelancerAvailable,
  HiringCandidateAvailable, BusyActorWillReturn, MarketRefreshAvailable,
  UnaffordableToHire, NoImmediateRemedy, RequestInFlight, OfferStale,
  OfferRejected), precedence-laddered, computed from the closed v13 wire +
  the workspace's sign-offer lifecycle. Authority sentences pass through
  verbatim; a primary control is either enabled or entirely absent.
- **CASTING SHORTAGE banner (§9)** — sticky, above the readiness strip,
  `casting-shortage-*` names, with **[FIND AN ACTOR]** (`casting-find-actor`).
- **TALENT MARKET — ACTORS (§11/§13)** — full-panel layer (the
  GreenlightReviewOpen precedent): wire-order hiring candidates, FREE AGENT /
  HIRING CANDIDATE badges, published offer buttons per term, rotation-week
  copy from `freelancerMarketRefreshWeek`.
- **REVIEW OFFER → SIGN ACTOR (§10)** — the existing casting quote seam
  (`RequestCastingQuote` with a `signActor` draft; tracked commit via
  `CommitSignActorQuote`); every figure is the quote's own; ENGINE_REJECTED
  verbatim with the P05A.1 revision-scoped latch; stale commits render
  OFFER CHANGED and re-ask on click.
- **Busy rows (§12)** — `casting-row-return-{id}`: "Returns Week N" from the
  authoritative `returnWeek`; withheld (null) says nothing.
- **Context preservation (§15)** — market/offer are reversible layers on
  `StudioCastingWorkspaceContext` (`TalentMarketOpen`, `ReviewOfferTalentId`,
  `ReviewOfferTermWeeks`); Esc/Back peel exactly one layer; an accepted
  signing closes both layers onto the untouched casting context.

## 5. TEST EVIDENCE (TS — all run, all green)

- `tests/bridge-p05a3-roster-liveness.test.ts` — **9 tests** on the Owner's
  real deadlock fixture:
  - deadlock pinned (2 distinct available; digest match);
  - staffing blocker with exact counts + remedy on the wire;
  - hiring market alive: 8 candidates in exact `hiringMarketIds` order, full
    D-11.6 arithmetic (weekly = round(annual/52); guaranteed = weekly × term;
    total = bonus + guaranteed), Gloria Underwood 1-year offer pinned
    ($6,040/wk, $314,080 guaranteed, $56,536 bonus);
  - rotation week 13 published;
  - busy returnWeek pins (t-act-15 → 13, t-act-19 → 16);
  - **§17-A/H**: sign quote exact figures → commit → third Actor joins the
    pools, staffing blocker gone, exactly ONE new contract (same-surname
    isolation vs Claude Underwood);
  - **§17-E**: Vera Cortland's 1-year bonus ($180,203) exceeds the Owner's
    real cash ($147,893) — natural unaffordable case; ENGINE_REJECTED with
    the D-12 sentence at quote time, zero mutation;
  - **§17-F**: an unrelated accepted sign kills a live offer
    (INTENT_NOT_AVAILABLE); the same draft re-quotes fresh;
  - refusals: non-signable, unknown id, off-menu term — plain language, no
    mutation.
- `tests/p05a3-minimal-founding-liveness.test.ts` — **3 tests** (§18): exact
  minimums legal; first scarcity wall is a NAMED blocker with counts + busy
  returnWeek; `signContract` removes it.
- Full TS floor: **355 files / 4,875 passed, 5 skipped** after the v13 bump;
  typecheck ×3 clean.
- Unity EditMode: `StudioCastingShortageP05A3Tests` (15 tests) — authored;
  run pending (the Owner's live game session holds the machine's heavy-
  process slot; batch runs start the moment it ends).

## 6. THE SECOND HALF — what the drives found and fixed

### F-A: the client's hand-authored kind gate rejected the valid sign quote
The first full 4H acquisition drive stranded on "could not be asked right
now". Probe-captured truth: the ENGINE ACCEPTED Gloria Underwood's sign quote
(every field present, exact figures) — and the client dropped it.
`StudioBridgeProtocol.cs` — `StudioCastingQuoteSnapshot.NormalizeAndValidate`
— recognized only `startAuditions`/`greenlightPicture`; the valid
`signContract` response threw and LATCHED A PROTOCOL MISMATCH, silencing the
whole quote channel. **Law extended: the enum-append law applies to
hand-authored kind gates, not just generated enums.** New protocol test
parses the exact probe-captured wire shape. (Unity `08ba867`.)

### F-B: the one-shot dispatch had no retry
The casting-quote channel legitimately returns null inside its single-flight/
poll windows. `MaintainSignQuote` (host Update cadence, the P05A.1 maintain
pattern) re-asks while the offer layer is open with no held quote, no ask in
flight, and no standing engine refusal — the refusal latch releases for
exactly one fresh ask when the revision moves.

### F-C: the machine journeys adapted to the visible-busy-row world
Three stand-in-behaves-like-a-human adaptations, no law weakened
(Unity `4cba979`): wait out the maintain tick's auto-quote before
OpenGreenlightReview (the decision rightly refuses review mid-ask; the UI
button is disabled in the same window); re-pick a budget the week advance
honestly drifted off the published menu (the aged-quote law under proof
untouched); slate/draft picks filter `candidate.available` (pools now carry
busy rows by §12 law, and the engine rightly refuses slating busy people).
The 4H transition retry loop records probe-quiet attempts (`d6b42af`).

### Fixture law: migration re-mints session ids
The P05 oracle checkpoints (v12) failed the machine journey's named-session
pin at the v13 engine; regenerated from their generator at projection-13,
same scenarios, same named sessions (TS `29786d6`).

## 7. §16/§20 — THE JOURNEYS

**RED (pre-fix), old sealed pair** (v12 engine rebuilt from `9361542` in a
scratch worktree + the P05A.2 sealed exe `7e418c05…`):
`Evidence/P05A3-Journey-Red/hid-20260901T070031Z` — complete, 0 failures.
The Owner's real profile copy, casting open on The Bitter Migration: NO
shortage element anywhere, NO hiring route anywhere, and the readiness strip
says *"0 OF 5 ROLES FILLED | Choose a Director. Also missing: Choose a Lead,
Choose a Antagonist, Choose a Support…"* — the client instructs the Owner to
choose actors that cannot exist. That is the failure, photographed.

**ACQUISITION (post-fix), seal binary:**
`Evidence/P05A3-Journey/hid-20260901T073949Z` — complete, 0 failures. Real
HID on the Owner-profile copy (migrated v12→v13 at boot, digest preserved
`a3550efd…`): CASTING SHORTAGE banner with the engine sentence verbatim →
FIND AN ACTOR → TALENT MARKET — ACTORS (rotation Week 13 copy) → Vera
Cortland's offer REFUSED with the full D-12 sentence ("this 180203 commitment
would leave cash at -32310…") → back → wheel-scroll → Gloria Underwood
REVIEW OFFER ($6,040/wk · $56,536 bonus · treasury after $91,357) → SIGN
ACTOR → receipt "Signed Gloria Underwood — 1 year." → back on the exact
casting context; the banner honestly downgrades to FREELANCERS COVER THIS
PICTURE.

**PERSISTENCE:** a fresh engine on that journey's own durable checkpoint
(revision 1): three distinct available Actors, staffing blocker gone, Gloria
out of the market and in the pools —
`Evidence/P05A3-Journey/hid-20260901T073949Z/persistence-verdict.json`
pass=true.

## 8. FLOORS AT THE SEAL BINARY `c8f935105a611b10…` (Unity client, final)

| Floor | Verdict |
|---|---|
| EditMode | **698/698** |
| TS suite + typecheck ×3 | **356 files / 4,878 passed, 5 skipped** |
| Casting journeys ×7 (Direct/Tests/Stale/Memoless/WriterCredit + seeded OwnerRepro/OwnerTests) | all **complete** |
| 4M machine journey (s5, migrated) | **complete** |
| Visual oracle ×6 scenarios | all **exit 0** |
| 4H HID production journey | **complete, failures=0** |
| P05A.3 acquisition HID journey | **complete, failures=0** |
| P05A.3 red journey (old pair) | **complete, failures=0** |
| Persistence probe | **pass** |
