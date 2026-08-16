# Tycoon Conversion Shift — Operational Laws (distilled from LESSONS-LEARNED)

Compact briefing for every production agent this shift. Citations: `LL <entry> (line)` in
`docs/LESSONS-LEARNED.md`. Read the cited entry before deviating.

1. Engine owns law; the world emits intent and renders fresh truth. Placement, travel,
   queueing, occupancy are projections of GameState. `LL DB (2478)`, `LL C (62)`.
2. Animation may acknowledge a command, never complete one. No route timer, arrival,
   tween, or update() tick advances tasks/work/queues. `LL BN (1934)`.
3. Never present a synchronous Engine batch as witnessed time. `LL EW (3224)`.
4. One renderer-delivery owner; latest-truth construction from a React ref; deliver only
   on identity change. `LL DF (2551)`, `LL EO (3111)`, `LL FD (3315)`.
5. Renderer failure ≠ illegal action. Never gate legality on renderer readiness.
   `LL DL (2668)`, `LL FU (3546)`.
6. One shared snapshot-only strict selector for Phaser AND React; malformed truth paints
   and navigates nothing, together. `LL DZ (2876)`, `LL DU (2795)`.
7. Over-canvas UI contains native input (pointerdown/mousedown/touchstart); scene
   handlers accept only events whose native target is the game canvas. `LL DD (2516)`.
8. Modal inertness ≠ renderer teardown: use `StudioLotView.setInputSuspended()`
   (`ui/src/lot/StudioLotView.ts:371`) + DOM containment; clear held keys/drag latches on
   transitions. `LL DS (2756)`.
9. Gesture ownership = input family + rendered identity + latest authority; latch at
   pointerdown; consume once; fresh AT detail=0 click allowed. `LL DK/DV/EB/EH/FH/FI`.
10. Grid hit geometry is production law: hotspots pairwise disjoint, anchors inside their
    polygons, canvas intent and semantic navigation route to the same owner; validate the
    complete spatial record before creating zones. `LL CR (2324)`, `LL EF (2974)`.
11. An affordance is not accepted until live depth+zoom prove it visible (check at
    management scale AND max zoom; occlusion at depth is a known failure). `LL DI (2603)`.
12. Never invent physical world from a semantic destination; unauthored facilities get an
    honest semantic fallback. `LL BQ (1969)`, `LL EY (3246)`.
13. Construction intent fails closed against a latest visual witness; world intent → App
    owner → parameter-free action against latest GameState → fresh read model. `LL DH`.
14. Lot provenance = exact GameState object + exact Screen object + opaque presentation
    token — compare all three. `LL GC (3649)`, `LL EA (2890)`.
15. Retained workflows: commit → autosave → close; cancel byte-neutral; receipts explain,
    never veto. `LL FW/FX/GD/FU`.
16. Mutable drafts (placement previews!) need value + monotonic revision authority.
    `LL GG (3699)`, `LL EL (3086)`.
17. Hostile-input guards: closed-shape, exact-own-key (Reflect.ownKeys incl. symbols);
    present-but-malformed ≠ absent; never `if (!value) legacyFallback()`. `LL EQ/FM/FL`.
18. V12/V13 saves: positive projection (enumerate owned roots, no clone-then-delete);
    strict current version, permissive historical repair. `LL BY (2072)`, `LL BP (1956)`.
19. Copy the historical-boundary guard pattern verbatim for new roots (see
    `save.ts:351–378` construction rejection at pre-V11; `migrateToV11` downgrade refusal
    `save.ts:4240–4253`). `LL CO (2290)`, `LL CS (2336)`.
20. New IDs reserve against the longest-lived identity authority (productions, ledger,
    careers, tasks, reservations, canceled traces). Temporal claims need an immutable
    event witness, not an editable timestamp. `LL CL/BX/CM`.
21. Schema validity ≠ domain legality; collect complete raw sets at the read-model
    boundary and omit expanded projections atomically on failure. `LL FJ (3398)`.
22. Capacity/occupancy is ONE union at every boundary (production + script + casting +
    any new placement/assignment) consumed by actions, invariants, tick, read models.
    `LL CC (2126)`, `LL BZ (2082)`.
23. Determinism: zero Math.random (hygiene test scans literal string in src/ and tests/);
    fixed-order iteration; derived RNG streams keyed by domain; presentation consumes
    zero RNG; assert byte-identical state/save after rejection/repaint. HANDOFF §11–12.
24. Chromium e2e: `ui/playwright.config.ts` — port 5178, workers 1, no retries, viewport
    1280×900, `current-break-audit.spec.ts` ignored; webServer env sets
    `VITE_STUDIO_LOT_OVERVIEW`/`VITE_OPERATION_HOLLYWOOD` to BLANK (shipped default);
    fixtures built by calling adapter actions in-spec with a named seed, injected via
    `page.addInitScript` into `localStorage['project-studio.active-session.v4']`; never
    hand-edit cash/roster in fixtures. `LL EU (3192)`, `LL DO (2703)`, `LL DQ (2735)`.
25. Structural pins: always name the fixture; compare across independent fresh windows over
    byte-identical saves; absolute FPS only behind `PROJECT_STUDIO_PERFORMANCE_EVIDENCE=1`.
    `LL DY/GF/ES/FO/CZ`. **The 30/13, 34/15, 42/19 and 54/25 plate tuples quoted here are
    PRE-M1.5 history** — `eebbefd` put roster presence in `studioLotSnapshot`, which both
    worlds consume, so every unclaimed contracted employee now adds 1 actor / 2 objects to
    the plate as well (decoded bytes and draw calls unchanged). Current live values live with
    their specs and are tabulated in the M1 quarantine note in `ui/playwright.config.ts`
    (plate: 42/19, 46/21, 62/29, 63/30, 64/30 at 11,096,896 bytes / 1 draw; grid managed-idle
    Week 0: 172/14/8,545,720/4). The frozen 30/13/11,096,896/1 in
    `ui/e2e/audition-planning-current-break-audit.spec.ts:144–242` is a `testIgnore`d
    historical audit and is not re-measured.
26. Accessibility: repeated identical live-region strings need a new keyed DOM child; one
    polite region mounted throughout; inert boundary includes every background sibling +
    renderer input; capture modal opener synchronously inside the open callback; pending
    focus owner consumed once on deep-return; initial modal focus = visible actionable
    ≥44px control in the real scroll owner. Verify 960×540, 1280×720, 480×270/DSF2,
    effective 200%, grayscale, forced colors with real pointer hits + screenshot review.
    `LL DJ/GE/FV/DX/DW/CJ/GH/ET/GA/FP`.
27. Known refutations — do not re-attempt: (a) Soundstage 12 adjacent-plate world cell
    KILLED at art preflight (hard postcard seam under pan) — do not butt new plates
    against the Stage 7 painting (`docs/WORLD-FIRST-SOUNDSTAGE-12-WORLD-PRESENCE-V1-NO-GO.md`);
    (b) `district-manifest` authored source diverges from accepted runtime — consumption-
    only freeze, NEVER re-run the exporter (`LL DN 2683`); (c) repeated autonomous
    procedural-art premium iteration ruled a dead end (`LL AJ/AK/AS`) — procedural work
    this shift serves tycoon readability, not premium-art claims; (d) stale balance
    certifications — re-run gates at HEAD. 
28. Process: regenerate every reported number from a command; build via `npm run build`
    (repo path contains a space — bare vite with abs path breaks); diff-verify docs-only
    commits with `git diff --name-only`; never weaken/delete a failing test to go green;
    never fill a contract gap with a guess; never rewrite audited systems (RNG, save,
    reception, forecast) without a failing test or explicit instruction. `LL E/G/H/AH/J`.

Planning notes: travel/occupancy/queue/workload/pathfinding are greenfield (every prior
closure asserts they never changed) but bound by laws 2–3. Current save = V11
(`save.ts:218`, `makeSave` → V11 at `save.ts:3516`); browser session key =
`project-studio.active-session.v4`.
