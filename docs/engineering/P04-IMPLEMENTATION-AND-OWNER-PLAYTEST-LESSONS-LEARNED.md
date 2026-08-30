# Project: Studio — P04 Implementation and Owner-Playtest Lessons Learned

**Status: FINAL — OWNER-ACCEPTED P04 CLOSEOUT**

| Accepted authority | |
|---|---|
| TypeScript `campaign/living-lot-ts` | `71521efed5dd113a3911c85410d0729eab13918f` |
| Unity `campaign/living-lot-client` | `5076af43fcd6a279f26e15a46a8389689b69db74` |
| Player executable | `abfd667044854c746d2f9381760325783805335bd641ae2cee4c94ddb5d20260` |
| Engine bundle | `e485a54a17054ae6f146039195fd4fab82b80f471f72cd57c3b291c3caf3c069` |
| schema / protocol / projection | `sha256:01f15efc8fc33fd810b051242857385ca23b5e1c775b357db1bfe5a70e907e1e` / 4 / 11 |

Owner verdict recorded 2026-08-30 09:08Z. This document is the durable
engineering guide for P05 and every later package. It is not a victory memo and
not a blame document. Where the record is silent, it says so; where two records
disagree, both are shown.

---

## 1. Executive summary

P04 shipped **five** times. The first four were technically complete and
genuinely wrong.

P04A, P04A REOPEN, P04A.1 and P04A.2 each reached the same state: machine-green,
hostile-reviewed to ACCEPT, sealed, pushed, reported as a KEEP candidate with
"Owner acceptance still pending". Each was then put in front of the Owner, who
played the game normally and found defects the entire automated floor had not.
P04A.3 is the **first Owner acceptance in the arc**.

The single most important finding is not any individual bug. It is the shape they
share:

> Every Owner-found defect lived in the gap between *"the authority is correct"*
> and *"a person can actually do the thing"*. Every automated proof was on the
> authority's side of that gap.

Four mechanisms produced that gap. All four are now fixed and enforceable:

1. **The proofs ran on worlds that could not exhibit the bug.** P04A REOPEN was
   the Owner's *launch command* failing on his real durable profile. P04A.3 was
   `board.projects[0]` — invisible unless a world has two ready screenplays. The
   floor used synthetic fixtures throughout.
2. **The proofs entered by routes the Owner did not have to use.** Every casting
   journey reached Casting through the Production Rail — the exact prerequisite
   the Owner objected to — because nothing published the geometry needed to click
   a building.
3. **The proofs asserted state, not legibility.** `enabled == false` is true both
   when a control is correctly disabled and when it is disabled beside a sentence
   describing something else.
4. **The same root cause recurred because the fix was applied to an instance, not
   a pattern.** `client.ActionsEnabled` folding in `!requestInFlight` killed *Save
   Game* in P04A.1 and *Confirm Greenlight* in P04A.2/.3 — twice, in controls
   built by the same people who had just fixed it elsewhere. §6.6 and **L-15**.

A fifth mechanism nearly repeated inside P04A.3 itself: a "safe-looking" fix can
be strictly worse than the bug (§6.4, **L-14**), and the hostile reviewer caught
this checkpoint **reintroducing the Owner's own complaint inside the fix for it**.

---

## 2. Final accepted authority

The pair in the header is the Owner-accepted P04 starting authority. At the
moment of acceptance: local equals remote on both campaign branches, both tracked
worktrees clean, no pending P04 implementation changes, and the build manifest
records exactly this pair with `dirty: false` on both repositories — so the
accepted commits and the tested bytes are the same artefact.

P04A.3 introduced **no** schema or projection change. Protocol 4 / projection 11
are unchanged from the P04A.1 seal, which is why CF-08 and CF-09 (§15) are
undisturbed and correctly timed for the next checkpoint.

---

## 3. Timeline from P04A through P04A.3

Five checkpoints. Each is a full cycle: implement → prove → hostile review → seal
→ Owner plays → rejected. Only the last breaks the pattern.

### P04A — the casting surface exists

Delivered Casting / Camera Tests / Package / Greenlight, the first production UI
Toolkit workspace (`LIVING-LOT.md:2519`). TS `11022e0`, Unity `d0c42d7`.

**Hostile review: three rounds** (`:2549-2555`) — REJECT with four blockers, then
all four remedied with one NEW blocker found, then FINAL ACCEPT. The record notes
"no reviewer-shopping; the original reviewer's transcript expired between rounds".

Ruling `:2580`: "**KEEP CANDIDATE** … **Do not mark Owner-accepted** …
**STOPPED — before P05, awaiting the Owner's playtest verdict.**"

**One disclosure from this seal is the most load-bearing sentence in the arc.**
Non-blocker #8 described the Casting content as *"scrollable; scroll affordance is
subtle at some sizes"* (`:2566`). It was retracted at `:2626-2628`:

> "**It was not scrollable. That mis-description is why the defect survived the
> seal.**"

### P04A REOPEN — the Owner's launch command failed on his own profile

2026-08-27. `LIVING-LOT.md:2585`: "**The documented Owner launch command failed on
the real durable profile** (`~/Library/Application Support/Project Studio`): the
engine exited pre-readiness with `checkpoint.schemaId: does not match the running
TypeScript bridge schema`. **The Owner did nothing wrong.**"

The profile carried a projection-v4 identity four generations older than the
single carry-forward slot. The self-criticism at `:2587` is the lesson:

> "the original seal's non-blocker #16 documented this exact fail-closed
> signature but **mis-scoped it to LT harness fixtures rather than durable player
> profiles** — that mis-scoping is the root of this reopen."

Fixed in `0386d34` by turning the single slot into a closed enumerated map of
every historical protocol-4 identity a durable checkpoint can carry. Fresh
hostile review: **ACCEPT, no blockers**. Re-sealed; Owner acceptance still pending.

*Record disagreement:* `:2597` gives the TS re-seal as `fd93811`; that SHA is not
in branch history, where the commit is `b870a71`. The ledger's own "(amended
in-place post-commit)" is the only disclosure. **Treat `fd93811` as superseded.**

### P04A.1 — owner-input remedy

The Owner played `d0c42d7` and reported **four verbatim failures**
(`P04A1-OWNER-INPUT-REMEDY-RESUME.md:187-191` — the full form; other copies
truncate #4):

1. *"I don't know how to select my cast."*
2. *"It is not letting me hit save or anything at Casting."*
3. *"It was not super clear I needed to go to Casting because the film was done."*
4. *"I do not know how to exit out of my game. The top left is not showing
   minimize, exit out, or anything."*

His own session, recovered at `:197-205`, is a two-line story: two accepted
commands, then 3 minutes 21 seconds with **zero commands**, then a `load` refused
`NO_SAVE`, then `SIGHUP` — the terminal closed. The ledger's gloss (`:2616`): "**A
player who could not act, then could not leave.**"

Root causes (`:2618-2637`):

* **The Casting body had no usable scroll range at all** — measured
  `viewportH 1023 == contentH 1023, vRange 0..0, verticalScroller display=None`.
  Two composing causes: a themeless `PanelSettings` denying `ScrollView` its box
  model, and a bare `VisualElement { flex-shrink: 0 }` **type** selector that also
  pinned the ScrollView's own containers. Choose/Replace/Remove were
  **unreachable, not merely unclear**.
* **Save Game could swallow a click.** `ActionsEnabled` folds in
  `!requestInFlight`; the client polls about once a second, so "the control was
  dead for a slice of most seconds as a pure transport artifact — **the Owner's
  complaint reproduced inside the control built to answer it**" (`:2629-2632`).
  Fixed **for Save/Load only**, by arming on click and dispatching on the first
  idle frame. **This is the same defect that later killed Confirm Greenlight**
  (§6.6).
* **The role rail could scroll fully away** — `NOW CASTING · <ROLE>` pinned
  outside the scrolling region.
* **There was no way out** — a global Studio Menu owning Resume / Save / Load /
  Quit.

Proving the remedy exposed that **several claims had never actually been
asserted** (`:2639-2668`). Two matter permanently:

> "**Journey B could pass while the thing under test failed.** A missed
> `rail-locate-casting` click recorded its fallback with no `ok` field, and
> `record()` defaults `ok` to true."

> "**`NOW CASTING · <ROLE>` was never asserted anywhere**, despite role
> visibility being one of the four verbatim failures."

Also: the casting-journey runner "**was never bytes-bound**", stamping provenance
from a live `git rev-parse HEAD` — the checkout, not the bytes under test — and a
two-hole destructure under `node -e` that would have overwritten the packaged
binary with JSON on every casting run.

Hostile review: **REJECT, then ACCEPT.** The reject (B1) was that the CF-06
secret-scan allowlist was tested against the whole line, so "**100% of the lines
in the one file CF-06 was filed about were skipped**" — "the guard meant to
discharge exactly this was itself too weak".

Gates: EditMode 493/493, harness 61/61, A+B at four viewports. Sealed, pushed.
Ruling `:2786-2791`: KEEP CANDIDATE, "**nothing here is Owner-accepted**".

*Retracted:* the brief's earlier "EditMode 492/492, harness 26/26" and its "NOT
ready to run" conclusion "were true when written and are not current"
(`P04A1-HOSTILE-REVIEW-BRIEF.md:11-16`).

### P04A.2 — the Writer credit, cast clarity, and Living Time

The Owner rejected P04A.1 with three failures. **The record contains no verbatim
Owner quote for P04A.2** — only the lead's restatement
(`LIVING-LOT.md:2822-2829`) and one quoted fragment in a tool header. That silence
is itself worth recording.

1. **Writer deadlock** — a finished screenplay could not be greenlit while its own
   credited Writer drafted the next one, and no legal action could free them. "One
   set — `busyTalentIds` — was doing three jobs."
2. **Actor-role clarity** — a candidate already selected for one role appeared
   under every other role with no visible assignment label.
3. **Time/decision deadlock** — the clock would not advance; `StudioLivingTime`
   re-implemented the stop ladder client-side and re-latched every frame.

Fixed by splitting one conflated set into three —
`creditedWriterIds ≠ activeProductionCompanyTalentIds ≠ activeWritingAssignmentIds`
— adding `SELECTED FOR <ROLE>` / `CAST AS <ROLE>`, and making Living Time read the
authority's published `advanceWeek`.

Three further defects "**only packaged proof could find**" (`:2858-2866`): 4,659
TypeScript tests, 547 EditMode tests and three adversarial review rounds all
passed over a false discard warning on the receipt's own [Close]; a
`STALE_REVISION` quote-refusal latch **made reachable by the very clock fix that
closed the original deadlock**; and an armed Move prompt self-destructing on a
hidden timer.

The A+B gate was classified **harness defect, not product**: `ownerinput.swift`
posted its key-up with the modifier mask still asserted, leaving Command latched,
so "**every synthetic click after a Command+Q journey was a Command+click**". The
sentence to remember (`:2936`):

> "**The classifier asserted a delivery it had never verified.**"

Ranges: TS `9b196f79..f71369e8` (8 commits); Unity `629090c0..3ed7510a` (18
commits — of which **only 5 touch product**; 13 are proof or documentation).
Hostile review: **ACCEPT, 20/20 axes**. Sealed, pushed, KEEP CANDIDATE.

### P04A.3 — real-campaign greenlight and Casting Office entry

The Owner's two failures, in their longest attested form
(`Tools/p04a3-proof-journey.mjs:8-17`; the ledger truncates both):

1. *"Clicking the Casting Office does not independently provide a working route
   into Casting; I had to click right-side project cards in a particular order."*
2. *"All five required people were selected and were different. Greenlight was
   still disabled. The UI did not make the exact reason understandable."*

Reproduced against a **byte copy of the Owner's own durable profile**. Root causes
in §6. Hostile review: **REJECT**, ten findings, all acted on, floor re-sealed.

Owner verdict: **ACCEPTED — KEEP.**

---

## 4. What worked well

* **The packaged HID proof harness.** Real `CGEventPost` input on real pixels of
  the packaged player, the element map supplying geometry only, every
  authoritative claim read off the recording proxy. Nothing in P04A.3 could have
  been diagnosed without it.
* **CF-02 evidence-to-bytes binding.** Fail-closed at launch and re-asserted at
  drive time. It refused a stale manifest three times during P04A.3 and was right
  every time.
* **CF-06 capability redaction**, after its own REJECT hardened it.
* **The hostile-review discipline.** One fresh reviewer, no reviewer-shopping,
  verdict stands or is remedied at root cause. It produced a REJECT at P04A,
  P04A.1 and P04A.3, and each was correct.
* **Owner rulings recorded as product law.** The P04A.2 writer-credit split
  survived P04A.3 unchanged and made the §8 correction a narrowing, not a redesign.
* **Ruthless self-correction in the ledger.** Non-blocker #8, non-blocker #16, the
  "strictly stronger" claim, the LT replay claim and the three-arm experiment were
  all retracted in writing rather than quietly dropped. §15 lists them.
* **Small commits carrying their reasoning.** This document was reconstructible
  almost entirely from commit subjects, bodies and the ledger.

---

## 5. Owner-discovered failures

Every one of these passed the full automated floor of its own checkpoint.

| # | Checkpoint | Owner's own words / observed defect | Why no machine assertion caught it |
|---|---|---|---|
| 0 | P04A REOPEN | The documented **Owner launch command failed on the real durable profile**; engine exited pre-readiness on a schema-identity mismatch | Fixture profiles were current-generation; a prior non-blocker mis-scoped the signature to harness fixtures |
| 1 | P04A | *"I don't know how to select my cast."* — Choose/Replace/Remove **unreachable**, `vRange 0..0` | No test measured scroll range; the seal's own note claimed it was "scrollable" |
| 2 | P04A | *"It is not letting me hit save or anything at Casting."* | `ActionsEnabled` dead for a slice of most seconds; no packaged menu journey existed |
| 3 | P04A | *"It was not super clear I needed to go to Casting because the film was done."* | Legibility, not state |
| 4 | P04A | *"I do not know how to exit out of my game. The top left is not showing minimize, exit out, or anything."* | No packaged quit journey existed |
| 5 | P04A.1 | Writer deadlock — a credited Writer blocked Greenlight of their own finished screenplay | Fixture had no one-writer/two-screenplay world |
| 6 | P04A.1 | Actor-role clarity — a chosen candidate appeared unlabelled under every other role | `NOW CASTING · <ROLE>` was never asserted anywhere |
| 7 | P04A.1 | Time/decision deadlock | Client re-implemented the stop ladder and re-latched every frame |
| 8 | P04A.2 | **Greenlight stayed disabled** with five distinct people selected, and *"the UI did not make the exact reason understandable"* | Fixture never reached the state; nothing tied a *disabled* control to *the reason shown* |
| 9 | P04A.2 | **The Casting Office did not independently route into Casting**; the rail had to be used first | Every proof entered via the rail; nothing could click a building |

---

## 6. Root causes

### 6.1 The Casting Office bound `board.projects[0]`

`StudioCastingInspectorCard.Evaluate` bound
`board.projects.FirstOrDefault(candidate => candidate != null)` — the first entry
by **array position**. The Owner's profile carried three ready screenplays, so the
building could only ever open screenplay one. The rail could not help:
`StudioLocateAction.Locate("casting")` merely re-selects the same building.
Screenplays two and three were unreachable from the world entirely.

Underneath: `HandleOpenClicked` could `return` silently from a permanently-enabled
button, and a board entry with an empty `projectId` satisfied the non-null test
and rendered an enabled control wired to `""`.

### 6.2 The readiness headline described the wrong thing

`RenderReadiness` printed `"{filled} OF 5 ROLES FILLED"` whenever any gap existed.
A complete cast with no budgets read **"5 OF 5 ROLES FILLED" beside a dead
button** — the player was told the thing that was fine and not the thing that was
missing.

### 6.3 The client never consulted the authority

`packageReadiness` arrived on the wire, was rendered as prose, and gated nothing.
A package the engine would refuse still offered a live control; a package blocked
*only* by capacity — legal, and queues — had nothing saying so.

### 6.4 `Confirm Greenlight` could latch disabled forever — and the obvious fix was worse

Its enabled state is
`decision.MayCommit && client.ActionsEnabled && GreenlightCommitArmed`, applied
**only inside `RenderGreenlightReview`**, which runs on events and not per frame.
`client.ActionsEnabled` is false for the duration of every snapshot poll. A render
landing inside a poll set the button disabled and nothing re-enabled it.

Measured: over 80 samples the gate's own terms read
`decision=true/actions=true/armed=true/quote=fresh` while the control reported
disabled.

**Removing `ActionsEnabled` produced something worse** — a control that looked
live and silently refused, three presses at 3456×2234 with no command on the wire,
because the *host's dispatch* requires the same term. Recorded so it is not
retried. The correct fix keeps the term and applies the gate **every frame**.

### 6.5 The Writer credit was enforced in three places, relaxed in one

`writerBlockers(..., 'package')`, `applyGreenlight`'s D-11.12/D-11.10 set, and
`applyGreenlightScriptProject`'s own `isContracted(writerId)` throw all encoded
the same law. Relaxing only the projection would have been **strictly worse than
the deadlock it replaced**: the board would have offered a greenlight the engine
then refused, with no warning anywhere. All three had to move together.

### 6.6 The deepest cause: an instance was fixed, not a pattern

`client.ActionsEnabled` folding in `!requestInFlight` produced **the same
player-visible defect twice**:

* **P04A.1** — *"It is not letting me hit save or anything at Casting."* Root
  cause: the control was "dead for a slice of most seconds as a pure transport
  artifact". Fixed **for Save/Load only**.
* **P04A.2/.3** — Confirm Greenlight latched disabled. Same term, same transport
  artifact, a different control, built after the first fix.

Two more controls still carry it today (§15). The remedy in **L-15** is to treat a
root cause as a class and sweep every site, not to patch the reported instance.

The same shape appears in the proof layer: `record()` defaulting `ok` to true let
"Journey B pass while the thing under test failed" in P04A.1, and the identical
default was flagged again by the P04A.3 hostile reviewer.

### 6.7 What was *not* the cause

Both hypotheses offered at the start of P04A.3 were refuted by the Owner's own
state: Development & Casting was at **1 of 2 slots free**, and the credited writer
was **contracted to week 104**. The authority published
`{"blockers":[],"knownGatesClear":true}`, and driving that exact state headlessly
**accepts** a complete greenlight. The product was legal throughout; only the
client would not dispatch.

---

## 7. Why automated proof missed them

Six distinct reasons. None is "we forgot to write a test".

1. **The fixture could not express the bug.** `FirstOrDefault` is *correct* on a
   one-element list; only an accumulated campaign had two. Likewise P04A REOPEN:
   only a real, aged profile carried a four-generations-old schema identity.
2. **The proof used a route the bug did not live on.** Every casting journey began
   with `rail-locate-casting` — the very prerequisite complained about. The
   failing path had never been executed, because the element map published only UI
   rects. The older harness worked around this with hand-calibrated
   `PROOF_WORLD_CLICKS_JSON` screen points, which hides the gap rather than
   closing it.
3. **Assertions were on state, not legibility.** Nothing compared *the reason
   shown* to *the reason that applied*.
4. **The decisive term was never published.** The latch was invisible until
   `clientActionsEnabled`, `commitArmed` and `decisionMayCommit` were emitted
   separately.
5. **Some assertions could not fail.** `record()` defaulted `ok` to true, so a
   missed click passed. Two P04A.3 fee guards ran on a fixture where the asserted
   set was empty, so `[].not.toContain(writerId)` was vacuous.
6. **A disclosure was asserted rather than verified.** P04A non-blocker #8 said
   the content was "scrollable". It was not. The seal's own words carried the
   defect past review — "**that mis-description is why the defect survived the
   seal**".

---

## 8. Engineering lessons

* **One decision owns one control.** `DecideGreenlight()` is now the single source
  for headline, detail, both button labels, both enabled states and diagnostics.
* **Terms outside the decision still need sentences.** Two of the three terms in
  the commit gate live outside it; until `CommitGateReason` existed they produced
  a dead control explained by the thing that was fine.
* **Any enabled-state term that varies faster than render events must be
  re-evaluated per frame**, or it will latch.
* **Distinguish "not yet asked" from "went stale".** `QuoteStale` stood in for
  both and told a dead connection to *"review the package again"* forever.
* **A cache signature must cover everything the cached thing renders.**
* **Rebuilding UI every frame is not neutral.** An element created this frame has
  no resolved layout: live for a human, unaimable for a proof, simultaneously.
* **When relaxing a rule, enumerate every layer that enforces it** (§6.5).
* **When fixing a root cause, sweep every site that shares it** (§6.6).

---

## 9. UX and world-first lessons

* **The world anchor is the primary route.** Building → local card → primary
  action must work with no prior interaction anywhere else. Rails, memos and cards
  are shortcuts; if any is a *prerequisite*, the world route is broken.
* **Never guess on the player's behalf.** With several legitimate targets, present
  them keyed by exact identity and wait. Binding by array position is a guess
  wearing a default's clothing.
* **A disabled control must name the blocking reason, not the satisfied one.**
* **Name the next single action, and still list the rest.**
* **Legal-but-waiting is a first-class state.** A capacity-blocked greenlight
  queues; it must stay actionable and must promise, in words, that nothing is
  committed before admission.
* **Empty states are content.**
* **Reachability is not clarity.** Several of the Owner's complaints read as
  clarity problems and were in fact *impossibility* — unreachable controls, a dead
  button, no exit. Diagnose reachability before rewriting copy.

---

## 10. Proof, evidence, and hostile-review lessons

* **Evidence must bind to bytes *and* to a clean tree.** CF-02 bound the
  executable hash; P04A.3 added a dirty-worktree refusal.
* **Unity builds are not byte-reproducible.** A comment-only change altered
  `Assembly-CSharp`. Any change under `Assets/` means rebuild **and** re-run the
  proof matrix.
* **A proof helper that defaults to pass is a proof that does not exist.**
  `record()`'s `ok`-defaults-true let a missed click pass in P04A.1 and was
  flagged again in P04A.3.
* **Keep failed evidence.** Five P04A.3 journey runs failed before one passed;
  each failure was a real defect. All are retained.
* **A green glob is not a green floor.** Name the sealing runs explicitly.
* **Run the headless gates *and keep the artefact*.** 854 lines of new EditMode
  tests existed with nothing on disk showing they had compiled.
* **Mutation-check every new guard.** Revert the fix; the test must fail.
* **A non-blocker is a claim and must be verified like one** (§7.6).
* **The reviewer's job is to reject.** The P04A.3 reviewer caught the implementing
  lead reintroducing the Owner's own complaint inside the fix for it.

---

## 11. Agent/delegation lessons

* **One owner per working directory.** Two subagents and the lead edited one
  checkout concurrently; one agent observed commits it had not made and reported,
  reasonably, an unexplained third party.
* **Delegate bounded repairs; keep product-law decisions.** The narrow TypeScript
  correction delegated cleanly; the decision that the *engine* gate had to move
  with the projection was correctly retained by the lead.
* **An agent's honest report can be right as observation and wrong as inference.**
* **Give agents the failure modes, not just the task.** The reviewer was handed
  the charter's reject list and the known tooling hazards, and used both.
* **A source-review agent earns its cost on chronology.** This document's first
  draft omitted P04A REOPEN entirely and missed the `ActionsEnabled` recurrence;
  an evidence sweep found both.

---

## 12. Environment and portability lessons

* `grep`/`ugrep` **silently returns nothing** on some files here, especially with
  non-ASCII patterns (em-dashes, `·`). Verify with `node -e`.
* Backticks inside a double-quoted `node -e` string are shell command
  substitution. Use a script file.
* Unity EditMode must **not** be passed `-quit`; it exits before tests run.
* The automation entry point is `Studio.Editor.Automation.StudioAutomation.BuildMacOS`.
* `timeout(1)` does not exist on macOS; zsh does not word-split unquoted
  parameters.
* The supervisor requires the profile root to be mode `0700`. That is CF-06
  working, not a defect.
* Element rects in the map are `screenRect`, not `rect`; `findChooseMatching`
  hands its predicate a **talentId string**, not a row object.
* The lot and the first authoritative snapshot arrive **seconds** after the
  process exists; the element map republishes every 15 frames.
* **A binding authority document lived outside version control.** The P04A UX
  north star was cited as `~/Downloads/P03A3_UX_ACCEPTANCE_AND_UI_NORTH_STAR.md`
  (`LIVING-LOT.md:2525`) — no commit, no SHA, unreviewable — and a later package
  records both a failed `docs/ux/…` resolution and a **misquotation of its
  control-height rule (40–44px, not ≥44px)**. See **L-17**.
* **An unchecked-out branch is not a non-existent branch.** CF-08/CF-09 are filed
  on `codex/current-forward-codebase-static-audit-01`, which no worktree has.

---

## 13. Permanent rules for P05 and later

| ID | Incident | Root cause | Why prior proof missed it | Permanent rule | Enforcement seam | P05 implication |
|---|---|---|---|---|---|---|
| **L-01** | P04A, REOPEN, .1 and .2 each sealed, hostile-accepted and pushed, then failed in normal play | Technical completion treated as done | No proof models "a person can do this" | **No player-facing package closes until the Owner completes its representative journey.** Technical KEEP ≠ acceptance | Charter carries an explicit Owner-journey gate; closeout says "KEEP CANDIDATE — Owner acceptance pending" until the Owner rules | P05 charter names its Owner journey **before** implementation |
| **L-02** | REOPEN: Owner's launch command failed on his real profile. P04A.3: office bound `projects[0]` | Synthetic fixtures could not express real state | One ready screenplay; current-generation schema identity | **Prove against (a) deterministic synthetic fixtures, (b) one migration/compatibility fixture, and (c) one private byte-copy of the Owner's real profile. Never mutate the real profile.** | `PROOF_RUNTIME_SEED=<bridge-runtime-v1.json>` copies a real checkpoint into a private mktemp runtime | P05 matrix includes an Owner-profile-copy run per journey |
| **L-03** | Casting Office required the Production Rail first | World anchor depended on context another surface established | Every journey entered via the rail | **World anchor → local card → primary action must work independently. Rails may be shortcuts, never hidden prerequisites.** | `world-selectable-<stableId>` rects (element-map gated); the P04A.3 journey never clicks the rail and records that | Every P05 world surface ships a rail-free journey |
| **L-04** | `HandleOpenClicked` returned silently from an enabled button | Guard clause behind a permanently-enabled control | Nothing asserted a visible enabled control produces an effect | **A visible, enabled action must either act or state a reason. It may never silently `return`.** | EditMode presses the handler in every reachable state and asserts the effect or a non-empty notice | P05 UI review checklist item per control |
| **L-05** | "5 OF 5 ROLES FILLED" beside a dead Greenlight | Headline counted roles while a budget blocked | `enabled == false` is true for right and wrong reasons alike | **A disabled control's adjacent sentence must name the blocking term, never a satisfied one.** | One decision owns headline + detail + enabled state; tests assert the *pair* and assert the ready-sentence is absent when disabled | P05 controls derive copy and enablement from one function |
| **L-06** | Confirm Greenlight latched disabled | Gate applied only on render events; `ActionsEnabled` false during every poll | Event-driven render never sampled against a per-frame term | **Any enabled-state term varying faster than render events is re-applied per frame.** | `RefreshGreenlightCommitGate` from the host `Update`; diagnostics publish each term | P05 reviews every `SetEnabled` for term/refresh-rate mismatch |
| **L-07** | Relaxing `writerBlockers` alone would have been worse than the deadlock | One law enforced in three layers | Layers tested separately, never as an agreeing pair | **When relaxing a gate, enumerate every enforcing layer and move them together; regression asserts BOTH projection and command.** | `p04a3-greenlight-law.test.ts` asserts the read model publishes no blocker **and** the engine accepts | P05 contract changes list every enforcing layer in the charter |
| **L-08** | The latch was undiagnosable from outside | Diagnostics published outcomes, not terms | A dead control and a refusing decision looked identical | **Publish the TERMS of a decision, not only its verdict — never player-facing.** | Element-map `diag` block, inert without `-studioUiElementMap`; no capability, no hidden simulation truth | P05 surfaces ship a diagnostics block with their gate's terms |
| **L-09** | Vacuous fee assertions; `record()` defaulting `ok` to true | A predicate that cannot fail | A passing test proves nothing about it | **Every new guard is mutation-checked, and no proof helper may default to pass.** | Revert-the-fix step recorded in the checkpoint report; `record()` calls pass explicit `ok` | P05 new-guard checklist item |
| **L-10** | Evidence bound to a superseded binary | Rebuilds outpaced proof runs | Manifest bound bytes but not tree cleanliness | **Evidence binds to exact bytes AND a clean worktree; any `Assets/` change means rebuild + re-run the matrix.** | CF-02 launch/drive-time binding plus the journey's dirty-worktree refusal | P05 proofs inherit both gates |
| **L-11** | 854 lines of tests with no retained run artefact | Gates ran in a scratch directory | Nothing on disk showed they compiled | **A gate with no retained artefact is a gate taken on trust.** | `Evidence/S/HeadlessGates-*` per checkpoint | P05 seal requires retained headless-gate artefacts |
| **L-12** | An agent reported the lead's own commits as an unknown third party | Two agents plus the lead in one checkout | Coordination gap, not a proof gap | **One owner per working directory; concurrent agents get separate worktrees or disjoint file sets.** | Stated in the delegation brief; agents told which paths they own | P05 delegation assigns paths explicitly |
| **L-13** | 4 of 10 runs under an evidence glob were `pass:false` | Superseded attempts beside sealing runs | A glob is not a floor | **Name the sealing runs explicitly; retain failures separately and disclose them.** | Checkpoint report lists sealing evidence directories by name | P05 report names its sealing set |
| **L-14** | Removing `ActionsEnabled` produced a silently-refusing control | The host's dispatch required the term the UI dropped | The "obvious" fix was never measured before adoption | **A fix that removes a gate term must be measured against the dispatch path that consumes it, before it is kept.** | Journey records presses-needed and the gate's terms; >1 press fails the run | P05 treats "remove the check" as a hypothesis needing evidence |
| **L-15** | `ActionsEnabled` killed *Save Game* in P04A.1 and *Confirm Greenlight* in P04A.2/.3; `record()`'s pass-default recurred likewise | The reported instance was fixed; the class was not swept | Nothing searched for sibling sites after a root cause was found | **A root cause is a class. On fixing one, enumerate and record every site sharing the mechanism; fix or explicitly disclose each.** | Checkpoint report carries a "sibling sites" list — §15 carries this arc's | P05 root-cause fixes ship a sibling-site sweep |
| **L-16** | Non-blocker #8 said "scrollable"; it was not. Non-blocker #16 mis-scoped a fail-closed signature | A seal disclosure was asserted, not verified | Reviewers read the disclosure as evidence | **Every non-blocker disclosure names the measurement that establishes it, or is marked unverified.** | Disclosures cite a measurement, a test, or an evidence path | P05 seal disclosures carry their evidence inline |
| **L-17** | The binding UX authority was a file in `~/Downloads` with no SHA; a later package misquoted its control-height rule | Authority outside version control | Nothing could diff or pin it | **A document is not binding authority unless it is committed and citable by SHA.** | Charters cite `path@SHA`; an uncommitted authority is a blocker, not a citation | P05 charter cites every authority by committed path and SHA |

---

## 14. Required P05 entry checklist

1. **`P05A-STATIC-CONTRACT-GATE-01` complete** — CF-08 and CF-09 only (§15).
2. **Changed-path-only readiness/recon r2 refresh**, against the accepted P04A.3
   pair and the post-contract-gate SHAs.
3. **Final P05 implementation charter reconciliation**, including the Visual
   Direction Package.
4. **Explicit Owner authorization to begin implementation.**
5. The charter names, up front: its **Owner journey** (L-01); its **three fixture
   classes** including an Owner-profile copy (L-02); a **rail-free world route**
   per new world surface (L-03); the **enforcing layers** of any contract law it
   touches (L-07); and every **authority document by committed path and SHA**
   (L-17).

---

## 15. Deferred issues and correct timing

**Open, and now due — the next authorized checkpoint.** Both are filed *P2 /
High, "B. FIX BEFORE P05 STARTS"* in
`docs/engineering/CODEX-CURRENT-FORWARD-CODEBASE-STATIC-AUDIT-01.md` on branch
`codex/current-forward-codebase-static-audit-01` @ `ee522834…`. **That branch is
not checked out in any worktree**, which is why a search of the checked-out trees
finds nothing.

* **CF-08 — union-to-C# generation silently selects the first object member.** A
  valid new union member can pass TypeScript schema checks while silently
  disappearing or receiving the wrong C# type. Unity currently works around it by
  serializing casting through a standalone request. Recommended: fail closed on
  incompatible same-named properties across members.
* **CF-09 — default contract verification does not bind the real Unity consumer.**
  CI can be green while the consumed Unity DTO is stale. A **proof-gap** finding,
  not current drift — all three copies were identical when audited
  (`SHA-256 97dd666d…`). Recommended: a contract manifest plus a two-repository
  check with a pinned Unity root.

Both say to land after the P04 seal and before P05 adds contract surface. P04A.3
introduced no schema or projection change, so both are undisturbed.

**Sibling sites of a fixed root cause (L-15), open:**

* `casting-slate-start` (`StudioCastingWorkspace.cs:2038`) and
  `casting-review-continue` (`:2199`) still carry the same `client.ActionsEnabled`
  term in their enabled state. Same mechanism as §6.4 and §6.6. Exercised green by
  the clarity journey, so not currently blocking.

**Open, disclosed, not this arc's subject:**

* The P04A.2 **writer-CREDIT vs cross-picture SEAT exclusivity** hazard
  (`productionCompany.ts` / `adapter.ts`). Declared "first item for the next
  checkpoint" at P04A.2 and **it was not** — still open at P04A.3 by explicit
  disclosure. A standing example of L-15.
* `castingPackageReadModel` filters `package-staffing` off the wire and replaces
  it with per-pool blockers computed by a **different predicate**; deliberately
  left, because forcing the coarse one back risks a false refusal.
* `CommitGreenlightQuote` refuses on a null live revision while the enable gate
  treats null as fresh. Unreachable in the packaged player; it now explains itself.
* CF-03/04/05, CF-07, CF-10..CF-14 remain as the audit filed them; only CF-01,
  CF-02 and CF-06 were addressed in the P04 arc.

**Ledger hygiene, open:**

* `LIVING-LOT.md:2919-2920` still asserts the hardened `expect workspace open` is
  "**Strictly stronger**". That claim was **retracted** 200 lines later at
  `:3131-3134` as false for the p04a2 driver — stronger on causality, weaker on
  timing. The false version stands unmarked. **Both are shown here; the retraction
  governs.**
* `LIVING-LOT.md:2959` still carries the literal placeholder
  `<!-- FILLED FROM THE LEASE STRESS RESULTS -->`; the numbers appear at
  `:3021-3024` but the placeholder was never removed.
* P04A.3 has **no** resume/handoff/hostile-brief document analogous to `P04A1-*`
  or `P04A2-RESUME.md`. Its record is the ledger, the commit messages, the code
  comments and this document.

**Retracted claims across the arc — the full list**, so no future reader mistakes
a superseded statement for law:

| Retracted claim | Stood at | Retracted at |
|---|---|---|
| "scrollable; scroll affordance is subtle at some sizes" | `LIVING-LOT.md:2566` | `:2626-2628` — "It was not scrollable" |
| Non-blocker #16 scoped to LT fixtures, not durable profiles | `:2574` | `:2587` — "that mis-scoping is the root of this reopen" |
| `memorysetup-<43>` was an allowlist bleed | hostile round 1 | `:2696-2700` |
| `P04A2-RESUME.md` "NOT READY", gates bound to `d27200a2` | prior revisions | `:3127-3130`; rewrite at `P04A2-RESUME.md:74-81` |
| "strictly stronger" | `:2919-2920` (**still standing**) | `:3131-3134` |
| "both LT arms proved the replay equality" | earlier account | `:3053-3060` — "They do not" |
| `ad3a02d` unpushed; lockf fix against a standing Owner call | hostile findings | `:3143-3146` — withdrawn on evidence |
| Three-arm A+B as "same binary, only the named variable differing" | `:2922` | `P04A2-RESUME.md:59-65` |
| Writer-CREDIT/SEAT hazard as "first item for the next checkpoint" | `:2993` | `:3349-3351` — "still open" |
| P04A.1 "EditMode 492/492, harness 26/26", "NOT ready to run" | brief, as written | `P04A1-HOSTILE-REVIEW-BRIEF.md:11-16` — live figures 493/493, 61/61 |
| P04A REOPEN TS re-seal `fd93811` | `:2597` | not in branch history; superseded by `b870a71` |
| The fullscreen "stale element map" hypothesis | `P04A1-OWNER-INPUT-REMEDY-RESUME.md:564-580` | `:521-534` — a 66px menu-bar scale error |

---

## 16. Things future agents must not repeat

* Do **not** report a checkpoint as done because the floor is green. Say "KEEP
  CANDIDATE — Owner acceptance pending" and mean it.
* Do **not** prove a player-facing route by the path convenient for the harness.
* Do **not** assert only `enabled == false`. Assert the state *and* the sentence
  beside it.
* Do **not** write a non-blocker you have not measured. "Scrollable" cost a whole
  checkpoint.
* Do **not** fix the reported instance and stop. Sweep the class (L-15).
* Do **not** delete failed evidence, inflate sleeps, or weaken an assertion to
  reach green.
* Do **not** claim a change is "strictly stronger" without checking both
  directions. That exact overclaim was made and retracted.
* Do **not** remove a gate term because it is inconvenient; measure it against the
  code that consumes it first (L-14).
* Do **not** cite an uncommitted file as binding authority (L-17).
* Do **not** run multiple agents in one working directory.
* Do **not** conclude "absent" from a single `grep` here, and do not treat an
  unchecked-out branch as non-existent.

---

## 17. Final P04 closeout ruling

**P04A.3 is ACCEPTED — KEEP. P04 is CLOSED.**

Accepted authority:

* TypeScript — `71521efed5dd113a3911c85410d0729eab13918f`
* Unity — `5076af43fcd6a279f26e15a46a8389689b69db74`

No further P04 product changes. P04 research is not reopened. P05 implementation
has not started and does not start until the four items in §14 are complete and
the Owner authorizes it.

The honest summary of this arc, for whoever reads it next: **the automated floor
was never wrong, and it was never sufficient.** Every proof that passed was
telling the truth about the authority. The Owner kept finding the part no proof
was pointed at — five times. The permanent rules in §13 exist to point the proofs
there first.
