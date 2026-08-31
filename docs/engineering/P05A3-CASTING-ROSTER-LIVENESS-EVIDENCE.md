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

## 6. OPEN ITEMS AT THIS WRITING

- Unity compile + EditMode run (blocked on the Owner's live session).
- §16 owner-profile-copy journey (pre-fix red + post-fix full acquisition
  walk incl. save/load) — needs the rebuilt pair.
- §17 C/D/I/J/K/L matrix items on the client; §20 HID floors; §21 fresh
  hostile reviewer (20 criteria); §23 FF integration + Desktop candidate;
  §24 final report.
