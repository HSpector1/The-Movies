# P05A.1 — Real-profile Queue Greenlight rejection: root cause, fix, proof

**Checkpoint:** Owner playtest REJECTION of P05A (technical foundation KEEP).
The blocking failure: in the Owner's actual durable campaign, QUEUE GREENLIGHT
produced `rejected:ENGINE_REJECTED` on every press (commandIds `38b07997…`,
`3714d404…`, `720c781c…`) while the review showed capacity as the only —
queueable — blocker, and the client printed a generic refusal sentence.

**Branches:** `wip/p05a1-real-profile-queue-greenlight-ts` from campaign tip
`d5733de…`; `wip/p05a1-real-profile-queue-greenlight-client` from `dc300dd…`.
Never the campaign branches directly.

## §3 preservation (before any process was closed)

Preserved under the session evidence root (`p05a1-owner-failure.qJMZvn/`):
the live launch directory (copied while running AND after the clean shutdown),
two byte-copies of the real profile's `bridge-runtime/` (sha `0e1e1057…` —
identical to the post-shutdown checkpoint, i.e. EXACTLY the revision-2 state
all three rejections were evaluated against), the full engine/unity/supervisor
logs, and a README recording honestly what could NOT be captured live: the
Owner closed the game (clean exit 0) between window enumeration and screen
capture, so the in-memory draft and the on-screen review were reconstructed —
deterministically — against the copied profile. No capability or secret
appears in any preserved log. The real profile was never written or deleted.

## §4 exact root cause

Replayed on the copied profile with the sealed engine (same session id
`d1a145e0…`, revision 2, week 5, digest `1d139f96…`):

**The package was UNAFFORDABLE — the engine's D-12 solvency gate refused it,
with the exact sentence in the reject envelope's `message` every time:**

```
applyActions: greenlight rejected — Insufficient cash — this 5317286
commitment would leave cash at -490885. New commitments require cash to stay
at or above zero (unavoidable weekly payroll and overhead may still run it
negative). (D-12 solvency gate)
```

Owner state: cash $4,826,401; the only distinct legal fill of the three actor
pools (Vasquez $214,234 / Marchetti $0 / Calloway $233,051) + craft Cortland
$839,697 = fees $1,286,982; negative menu $2,685,427/0.75× · $3,580,570/1× ·
$4,475,712/1.25×; marketing $449,734/$830,278/$1,280,012. Seven of the nine
budget pairs exceed cash; only 0.75× with the two smaller marketing tiers fit
— and those quote ACCEPTED with `queues=true` and the no-commitment queueNote.
The queue front door itself was never broken (hypothesis D refuted); the
capacity-only affordable package queues exactly one row committing nothing.
Full sanitized diagnostic record: `DIAGNOSTIC-RECORD.md` beside the evidence
(includes every rejection family reproduced verbatim, and the honest
ambiguity note — the exact budgets the Owner pressed are unrecoverable; every
possible draft on that state either queues or was refused with an exact
sentence the client hid).

## The two client defects (the engine was correct throughout)

1. **Pre-quote truth (hypothesis B confirmed):** the Greenlight decision never
   computed draft affordability, so QUEUE GREENLIGHT stood enabled behind a
   "capacity is full — queue it" story for a draft the engine must refuse.
2. **Response truth:** all three reject envelopes carried the exact D-12
   sentence in `message`; `HandleGreenlightQuoteRejected` rendered the generic
   `rejection.blocker + remedy` pair instead.

## The fix (Unity client; zero engine changes — engine law recorded: queue
admission requires PRESENT affordability, per the D-12 gate ahead of the
queue decision; deferral was not invented)

- `DecideGreenlight()` — the ONE decision — gains `SelectedTalentUnavailable`
  ("<Name> is no longer available for <Role>." + "Replace <Role>."),
  `Unaffordable` (exact total/cash/shortfall from published wire numbers —
  the same arithmetic the engine's quote publishes — with, as remedy, the
  LEAST-DISRUPTIVE correction: the affordable published budget pair that
  keeps the most of the current ambition, i.e. the largest affordable total;
  hostile-review F6 corrected this document's earlier "smallest pair"
  wording), `QuoteRejected` (the engine's sentence VERBATIM; never re-asked
  until the draft changes — and, hostile-review F3, the refusal SURVIVES
  closing and reopening the review panel: the readiness strip reads
  GREENLIGHT REFUSED with the exact sentence until the draft is edited;
  never labelled QUEUE GREENLIGHT), and names a retained budget amount that
  left the published menu as invalidated rather than empty.
- `MaintainGreenlightQuote` and `CommitGreenlightQuote` consume the same
  decision (`MayQuote`/`MayCommit`): an illegal or refused draft never
  reaches the wire.
- All three reject handlers (greenlight quote, greenlight commit, screen
  test) surface `rejected.message` verbatim for ENGINE_REJECTED; the
  stale/session envelope categories keep their structured copy and re-arm
  law (§7H preserved).
- The host binds envelope treasury cash beside every casting rebind
  (`BindTreasury` seam; unknown cash proves nothing and blocks nothing).
- One TS hygiene fix found by the floor: the F4 commit left a provably-dead
  `holder === 'withheld'` re-check past its own early return —
  `tsc --noEmit` fails on it, meaning the sealed "typecheck clean" claim did
  not cover the final F4 commit. Removed (no behavior change); the sealed
  evidence record is corrected by this note.

## §7 regression tests

- **TS (`tests/bridge-p05a1-owner-greenlight.test.ts`, fixture = the Owner's
  canonical revision-2 save, digest pinned):** capacity-only affordable
  package quotes accepted + queues + commits exactly one
  `greenlightScriptProject` queue row with cash/talent/workflows untouched
  (A); D-12 verbatim (C/G); duplicate-slot verbatim (E); non-candidate
  verbatim (B); unpublished-budget verbatim (D); stale/session keep their own
  codes (H). 7/7.
- **Unity (`StudioCastingGreenlightP05A1Tests`):** Unaffordable names
  total/cash/shortfall + never asks (kill-verified: mutation M2 died to it);
  affordable still quotes; unknown cash never blocks locally;
  SelectedTalentUnavailable names person+role+remedy + never asks;
  invalidated budget named + never asks (M3 died to it); ENGINE_REJECTED
  shows the exact sentence, never the generic pair, disabled and never
  QUEUE GREENLIGHT (M1 died to it); refused draft never re-asked until
  edited; stale keeps structured copy + re-arm. 8/8; EditMode 657/657.
- **Packaged (§7F, `-castingJourneyOwnerRepro` on the COPIED profile):** the
  before-fix reproduction is the Owner's own live session (three preserved
  ENGINE_REJECTED rows at the sealed binary) plus the wire replay; the
  after-fix journey walks the exact route — five exact people, the 1×
  negative the gate refused — and requires OVER BUDGET with the exact figures
  BEFORE any wire ask, review refused, then the 0.75× correction quoting,
  QUEUEING, committing one row, cash byte-identical.

## Hostile review round 1 — REJECT (F1–F7), all corrected at root

The fresh hostile reviewer REJECTED the first-cut range and every finding was
genuine:

- **F1 (blocker)**: the claimed "EditMode 657/657" did NOT cover the final
  journey-runner commit — the run predated it, and that commit broke two
  pre-existing P04A pin tests (the six-variant-flag gate literal, and the
  no-hard-coded-talent-id law that the owner-repro's exact-identity seats
  table lawfully collides with). Corrected by EXTENDING both pins: the
  variant-gate law now counts `OwnerReproFlag` and its dispatch case; the
  hard-coded-id law now permits EXACTLY ONE occurrence — the owner-repro
  antagonist seat literal — and still bans every other hard-coded id.
- **F2 (blocker)**: the new TS suite itself broke the third typecheck
  project (`typecheck:bridge`, nullable board access) under a "typecheck
  clean" headline — the same claim-class this checkpoint exists to correct.
  Fixed (null-guard); ALL THREE typecheck scripts verified green.
- **F3 (high)**: the QuoteRejected truth previously lived only inside the
  open review — closing the panel re-advertised a refused draft as
  ready/queueable. The refused state is now decided ABOVE the review-open
  split, survives close/reopen (reopening never re-asks), and the strip
  carries the exact sentence until the draft changes.
- **F4 (medium)**: the MayQuote/MayCommit gates were shipped without a test
  that reaches them (the reviewer's mutations deleting them SURVIVED). Two
  new tests make each load-bearing: a dirty-flag re-arm plus a same-revision
  cash collapse must not quote; a held fresh quote plus a same-revision cash
  collapse must not commit.
- **F5 (medium)**: the affordability boundary was unpinned. New test:
  cash == total is LEGAL (cash-after zero, matching the engine's D-12
  strictly-below-zero law) and cash == total − 1 refuses with the exact
  "$1 shortfall".
- **F6 (low)**: this document's "smallest pair" remedy wording contradicted
  the shipped (correct) largest-affordable-total behavior — fixed above.
- **F7 (low, recorded)**: in the legacy `!economyEngaged` open-pool regime
  the engine's D-1 debit includes salaries the client's fee sum does not.
  The regime is unreachable in a founded studio and the divergence can only
  UNDER-block (never refuses a legal package); recorded as a known bounded
  divergence, not fixed, to keep this checkpoint in scope.

## Floors at the corrected P05A.1 pair

- TS full suite 354 files / 4865 passed / 5 skipped; ALL THREE typecheck
  projects (`typecheck` root + ui, `typecheck:bridge`) clean;
  exact-consumer contract verify PASS (blob `253f0102…` identical both
  sides).
- Unity EditMode: RECORDED 661/661 at `4c74967` (the reviewer re-measured it
  independently), then **663/663 at `00a5f7e`** after the round-2 F8/F9
  corrections — both full-floor runs executed AFTER the last code change
  they cover. Mutations M1/M2/M3 killed (round 1); the reviewer's MUT-A/B/D
  killed; MUT-C/E/F killed by the F4/F5 guards (reviewer re-verified);
  reviewer's MUT-G/H/I killed (F3 both halves + the narrowed id pin).
## Hostile review round 2 — REJECT (F8–F10), corrected

Round 2 confirmed every round-1 fix (six mutations re-run, all killed) and
found: **F9 (blocker)** — the F3 latch held a refusal across authoritative
revision changes, refusing a now-legal package on a stale sentence forever;
**F8 (medium)** — the commit-reject leg selected exact copy but never
latched, falling back to READY TO QUEUE and re-asking the refused draft;
**F10 (doc)** — packaged floors recorded at a superseded binary, one F6
wording leftover, and an "expected" verb in a floors section. Corrections
(Unity `00a5f7e`): the refusal is latched WITH the revision the authority
spoke it at — the decision falls through once the world moves, and the
maintain tick releases the latch for EXACTLY one fresh ask (re-refusal
re-latches with the current sentence); the commit leg latches identically
(same law, same release); two new moving-revision tests pin both. This
section and the floors above are the F10 correction.

## FINAL packaged floors — exe `e04d9fb41221439a6e499a2da76beb085207f04cd4edb37acdd0b1777858de93` (TS `0a50ac9` / Unity `00a5f7e`)

- Owner-repro journey PASS (CastingJourney runs of 2026-08-31T09:38Z-);
  P04 casting direct PASS; P05 4M PASS; P05 4H complete failures=0 first
  try. The remedy line in the pixels names the least-disruptive correction
  (the affordable pair keeping the most ambition — the F6-corrected
  description).

## SUPERSEDED packaged sweeps (retained)

- exe `0a2234b6…` (Unity `71f30c3` / TS `5021759`) — superseded by the
  round-1 corrections; and before it the interim runs listed below:
  - **Owner-repro (§7F)**: PASS — board reached at the exact failure state
    (revision 2, digest `1d139f96…`, cash 4,826,401, 0/2 slots); the Owner's
    exact five + 1× negative read OVER BUDGET with
    "$5,317,286 — cash is $4,826,401, a $490,885 shortfall" and the
    least-disruptive affordable pair as remedy, review REFUSED, no wire ask (pixels:
    `owner-repro-unaffordable.png`); 0.75× queued — receipt "Greenlight
    queued — no production, budget, slot, or talent commitment exists until
    admission", revision 3, cash byte-identical (`owner-repro-queued.png`).
  - **P04 casting direct journey**: PASS (fresh founding world).
  - **P05 4M machine journey**: PASS.
  - **P05 4H HID journey**: complete, failures=0 — after TWO failed runs
    whose cause was the HARNESS, proven by the fix: the tycoon camera
    edge-scrolls with the OS cursor, and a prior run's last click had parked
    the cursor at the screen edge, so the app panned itself to the lot clamp
    during boot and the world click landed under the memo card. New harness
    law (cursor-park before boot + world-click bounds-settle guard) in
    `Tools/p05-run-hid-journey.sh` / `p05-proof-journey.mjs`; the failed runs
    are retained beside the pass with SUPERSEDED notes. This also completes
    the causal picture for the sealed sweep's one 4H flake (parallel load +
    cursor position, both now outlawed).
