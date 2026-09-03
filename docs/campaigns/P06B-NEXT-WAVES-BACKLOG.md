# P06B — W3–W9 Next-Checkpoint Backlog (documentation-only, §32-B)

The P06B seal delivered the highest-value surfaces (W0 tokens · W1 executive HUD · W2 movie rail =
primary) fully proven. Waves W3–W9 were deliberately deferred to keep the seal focused and to avoid a
broad reskin (§21/#30). This is the evidence-backed, ready-to-execute backlog for a follow-on
checkpoint. **Do not implement here — the P06B binary is sealed (§32).** Each item cites the audit/
reference-delta evidence, the exact file(s), the authoritative data field(s), and the regression trap.

## W3 — People/Talent (§14)
- **Compact persistent Talent entry point.** Today talent is reachable via the `world-selectable-casting`
  ("Casting / Talent") building + the preserved casting-shortage→Find route. Add a small persistent
  "PEOPLE / TALENT" affordance (an IMGUI HUD chip owned by the world location, or a restrained
  expandable list). File: a new small HUD beside `StudioLivingTimeHud`/`StudioProductionRailHud`, or a
  left-edge rail. Data: `snapshot.people.people[]` (categories STUDIO-CONTRACTED / FREELANCER / HIRING
  CANDIDATE / BUSY / UNAVAILABLE, assignment, availability/returnWeek). **Traps:** never show a hiring
  candidate as available-now; withhold ETA when `returnWeek` null; a full roster rail is "reserved for
  a later package" — keep it compact.
- **Casting workspace latch + identity fixes (pre-existing P04/P05, hostile-relevant):**
  `StudioCastingWorkspace.cs:2038` (`casting-slate-start`) and `:2199` (`casting-review-continue`) still
  carry raw `client.ActionsEnabled` — re-gate **per frame**, don't remove the term, don't copy the latch
  into new code (§16). Remove any `projects[0]`/FirstOrDefault binding in the casting inspector route
  (key by exact projectId — L-03). Disabled Greenlight must name the **blocking** term (L-05). Guard:
  the D-16/D-17 accessibility suite (176 tests) + casting-domain tests must stay green.

## W4 — Building cards (§15)
- **Converge the selection double-surface.** The UITK entry card (`StudioProductionEntryCard.cs`) + the
  IMGUI "LOT SELECTION" receipt (`StudioHud.cs`) both describe a selection (a coherent dark pair today).
  Give them one grammar: what / happening / exact subject / action-required / one primary action / what
  next; blocker receipt **adjacent** to its control (never detached, never a dash for an absent fact —
  say "No production assigned"). **Trap:** a visible enabled control must act or state a reason, never
  silently return (L-04).
- **Post building world cues** idle/waiting/active/ready/committed (text+shape) —
  `StudioPostBuildingPresentation.cs` + `StudioPostWorldContracts.cs`, from the post-family
  `operationalState` + release board. **P07 trap:** no Theater cue before an actual next-week release;
  show Director + craft, never a headcount derived from bodies.

## W5 — Workspace convergence (§16)
- Converge header/Back/CTA hierarchy/scroll/focus across Development, Casting, Talent Market,
  Production, Post/Release workspaces (UITK, `Presentation/UI/`, hosted by `StudioWorkspaceHost`).
  **Forward action must outrank Back** (the memo's commit vs secondary buttons in
  `StudioBridgeClient.OnGUI` are equal-weight today — hostile #14 borderline). Apply `.focus-visible`
  (declared + tested but currently never applied). One decision function owns headline/label/enabled/
  refusal (don't repeat the ActionsEnabled latch class).
- **F3 (optional):** cede the release commit from the workflow memo to a Production/Post world retained
  workspace (`StudioProductionWorkspace.cs` + `StudioReleaseContracts.cs`), making it element-mapped and
  world-owned — this also makes the §25 HID robustly aimable by name (today the commit is an IMGUI memo
  button located by screenshot).

## W6 — Lot life (§17)
- Already strong (unchanged). Incremental: make more accepted authoritative work visible (writer at
  Development, Camera Tests, Rehearsal/Load-In/Shooting/Wrap nameplates) from existing truth — **no new
  simulation**. Named bodies bind exact IDs; no decorative body may masquerade as named talent (#22);
  blocked never looks active (#20); two-stage isolation needs a per-stage presenter (the `stage-a`
  compile-time singleton in `StudioStagePresentationRegistry.cs` is a prerequisite — larger work).

## W7 — Guidance without white-card dependence (§18)
- The left memo is still a large text panel. Once world/card/workspace truth is complete (W4/W5),
  reduce the memo to reinforce/teach/summarize rather than being the primary truth holder. **Trap:** the
  memo is load-bearing (commit dispatch + first-film journey) + heavily guard-tested
  (`StudioBridgePlayerWorkflowTests`) — trim only after the other surfaces carry the truth, and keep the
  guarded source markers.

## W8 — Economic/time clarity (§19)
- Visibility-only (no retune — D-17B macro residuals OPEN). The HUD already shows cash +
  `treasury.netWeeklyCash` direction. Optionally add `weeklyBurn`/`runwayWeeks` ("∞" when
  `runwayInfinite`) where it helps at low cash; the mis-scoped cash-warning defect must NOT be silently
  fixed — any warning touched must be scoped to its exact picture or labeled studio-wide.

## W9 — Accessibility / input / responsive (§20)
- Apply + verify `.focus-visible` keyboard ring (declared, never applied); confirm Esc peels one layer
  and System Menu owns the top layer; verify at 1280×800 / 1440×900 / 1720×1045 / fullscreen. The 1280
  HUD is now present (W1); audit the rest for clip/hide. **Never** shrink type below the legibility floor
  to fit.

## Global constraints (unchanged)
Engine-authority hard line (UI/world projection over existing authority only); rail is active-lifecycle
only (no P07); do not bake date/era progression into the HUD; do not roll back shipped surfaces; open
Owner decisions (audience-taste, genre 6-vs-5, time model, concurrency cap, F2 ruling) stay Owner calls.
