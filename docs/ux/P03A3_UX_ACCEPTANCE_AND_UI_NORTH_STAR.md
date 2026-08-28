# Project: Studio - P03A.3 UX Acceptance & UI North Star

**Status:** Draft for Owner review - **not yet an implementation prompt**  
**Purpose:** Define exactly what must change before the current Development slice is accepted, while giving Claude/Fable a precise visual and interaction north star for the UI architecture that begins with P04A.  
**Current candidate baseline:** TypeScript `d4ed07d` / Unity `bae3c4e`  
**Owner reference image:** *The Movies* (2005) studio-lot screenshot supplied by the Owner.

---

## 1. Executive decision

Project: Studio is no longer failing because the simulation is hidden behind a static 3D scene. P03A/P03A.1/P03A.2 successfully made Development physically legible: the writer walks to Development, can be located, has an authoritative world label, the Development building shows its state, and the right-side Production Rail can track the screenplay.

The remaining pre-acceptance problem is **interaction quality and legibility**:

1. `Locate Writer` traps the player in a close inspection state with no reliable recovery to the normal management camera.
2. Camera traversal at management scale feels too slow.
3. Player-facing text, buttons, cards, and time controls are materially too small at the Owner's fullscreen play resolution.
4. The UI technically communicates the right information, but it still looks and feels like proof-era white cards rather than a professional tycoon command layer.
5. A new player without prior knowledge would still struggle to understand the complete filmmaking journey. Development may be accepted once its own loop is readable and recoverable; Casting is deliberately still a fallback until P04A.

**Immediate acceptance rule:** fix camera recovery, camera responsiveness, and minimum legibility without redesigning the simulation or starting Casting.

**Longer-term UI rule:** use the original *The Movies* information architecture as inspiration - the lot stays visually dominant while compact edge rails summarize people, productions, time, money, standing, and build tools. Deeper detail appears only when deliberately opened.

---

## 2. What the Owner's reference screenshot gets right

The target image is not a request to pixel-copy a 2005 UI. It is a reference for **information architecture and game feel**.

### 2.1 The lot remains the largest thing on screen

The central studio is continuously visible. Buildings, paths, landscaping, vehicles, employees, and film activity remain readable while management information sits at the screen edges.

**Project: Studio translation:** the studio world must remain the primary visual surface. Large workspaces are allowed when the decision complexity earns them, but the default state should be the lot - not a permanent full-screen dashboard.

### 2.2 The top strip is an executive heartbeat

The reference keeps date/time progression and cash/status visible without needing a management screen.

**Project: Studio target:**

- left/top: current date or week in clear readable type;
- center: Pause / 1x / 2x / 4x with large hit targets and obvious active state;
- right/top: cash, recurring financial pulse, and later comparative studio standing/rank where authoritative.

This should be readable at a glance without leaning toward the monitor.

### 2.3 The left edge tracks important people

The original keeps principal characters in peripheral vision through portraits and compact status/ranking information.

**Project: Studio future translation:** a compact People/Stars rail may eventually show important managed creative people, using authoritative identity and only a few useful signals such as:

- portrait;
- name;
- profession;
- current assignment/availability;
- later legitimate market/ranking status;
- one meaningful attention state.

Do **not** recreate the original's food/drink/boredom babysitting as persistent chores.

### 2.4 The right edge tracks the movie pipeline

The reference visibly distinguishes scripts, movies being filmed, completed films, and films earning money. This lets the player answer: **"What is my studio doing?"** without opening a separate dashboard.

**Project: Studio translation:** the Production Rail should mature into a compact lifecycle tracker:

`Development -> Casting -> Shooting -> Post -> Release Ready -> In Theaters`

Each row should show only enough information to identify the project, phase, time/attention state, and whether player action is required.

### 2.5 Small information affordances lead to deeper detail

The reference film card includes an information icon. That is good progressive disclosure: persistent status stays compact; detail is one deliberate click away.

**Project: Studio translation:** project/person/building summary surfaces should support a predictable `Open details` / information affordance. Do not dump every metric into the persistent rail.

### 2.6 Build tools keep ownership of the lot physical

The reference exposes paths/landscaping/building tools while the lot remains visible. The studio is something the player physically shapes.

**Project: Studio translation:** Package 09's Founding Flip/build system eventually needs to make construction, paths, landscaping, sets, and expansion feel like direct studio ownership. P03A.3 does not implement that work, but no UI decision here should obstruct it.

---

## 3. Current Owner findings - binding acceptance evidence

The current candidate has already earned several KEEP rulings:

- HUD state is functionally correct, though visually plain.
- The studio can be founded.
- A screenplay can be commissioned through the Development building.
- The writer visibly walks to Development.
- The Writer can be selected and the player understands who they are, what they are doing, and which screenplay they are writing.
- `Locate Writer` finds and frames the correct authoritative person.
- Development exposes authoritative screenplay state.
- The Production Rail helps track progress and can be clicked.
- The memo no longer owns the advance-week command while the Living Time HUD is available.
- Accept vs Final Rewrite is a meaningful decision.

The current candidate also has three **material defects**:

### BLOCKER A - Camera trap after Locate

After `Locate Writer`, the Owner is stuck in the close camera. Normal zoom-out does not recover management view.

This is a direct interaction dead end. A navigation affordance that moves the camera must always have a deterministic inverse.

### BLOCKER B - Camera traversal is too slow

Moving through the studio at management scale feels sluggish. That makes every world-first interaction more expensive and encourages the player to stay in UI panels instead of navigating the lot.

### BLOCKER C - UI is materially too small

At fullscreen, the white cards, labels, buttons, and time controls are visibly tiny. The Owner reports that the interface is difficult to follow and that a new player would struggle to make a film without already understanding the game.

This is not cosmetic polish. It is a legibility/accessibility failure.

---

# PART I - REQUIRED BEFORE CURRENT DEVELOPMENT ACCEPTANCE

## 4. Camera recovery contract - must fix now

### 4.1 Required behavior

Any explicit camera action - `Locate Writer`, double-click Focus, building inspection, later project Locate - must preserve a recoverable origin.

A successful sequence must be:

`Management camera -> explicit Locate/Focus -> close inspection -> Back/Esc -> exact previous management context`

The restored context should include, where applicable:

- camera position;
- camera orientation;
- management zoom/distance;
- camera mode;
- selected stable ID;
- prior workspace/card state;
- prior world-vs-workspace origin.

### 4.2 Non-negotiable player exits

At least one obvious explicit exit must always exist. Recommended behavior:

- `Esc` / Back returns to the captured origin;
- a visible `Back to Studio` or Back control appears while in inspection;
- mouse-wheel zoom-out must not remain permanently disabled after Locate;
- normal camera pan/orbit/zoom resumes after leaving inspection.

`Home` may remain a separate global reset, but it is **not** a substitute for Back. Back restores context; Home intentionally goes to a canonical overview.

### 4.3 Do not solve this with hacks

Do not:

- teleport the camera to a fixed default whenever Back is pressed;
- clear selection just to escape inspection;
- create a special Writer-only exit path;
- add another camera controller;
- make snapshot refresh move the camera;
- infer camera mode from screen position.

### 4.4 Suggested implementation shape

The exact repository names may differ, but the architecture should resemble:

```csharp
public readonly struct StudioNavigationOrigin
{
    public readonly CameraMode Mode;
    public readonly Vector3 Position;
    public readonly Quaternion Rotation;
    public readonly float ZoomOrDistance;
    public readonly string SelectedStableId;
    public readonly string WorkspaceRoute;
}

public sealed class StudioPresentationNavigation
{
    private readonly Stack<StudioNavigationOrigin> origins = new();

    public void Locate(string stableId, bool focus)
    {
        origins.Push(CaptureCurrentOrigin());
        StudioLocateAction.Locate(stableId, focus);
    }

    public bool Back()
    {
        if (origins.Count == 0) return false;
        Restore(origins.Pop());
        return true;
    }
}
```

P04A's accepted architecture already needs a reusable origin/Back orchestration seam. If a minimal version can be safely established now, prefer that over another feature-specific Writer fix. Do not build the whole P04 UI Toolkit host in this checkpoint.

### 4.5 Acceptance proof

At minimum prove:

1. management overview -> Locate Writer -> Writer framed;
2. Back/Esc -> exact prior management camera restored;
3. normal mouse-wheel zoom works afterward;
4. pan/orbit works afterward;
5. repeated Locate -> Back cycles do not drift camera state;
6. switching Writer -> Building -> Back behaves predictably;
7. no automatic camera move occurs from simulation refresh.

---

## 5. Camera responsiveness - must fix now

### 5.1 Product goal

Management navigation should feel fast enough that clicking buildings and people is cheaper than staying in menus.

The current camera movement is perceived as too slow. This undermines world-first design even when world interactions exist.

### 5.2 Recommended behavior

Camera pan speed should scale with view height / zoom so that screen-space traversal feels approximately consistent:

- close view: slower, precise movement;
- management view: substantially faster traversal;
- far overview: fastest traversal;
- modifier key may optionally accelerate further if an existing input law supports it.

A useful mathematical pattern is:

```csharp
float t = Mathf.InverseLerp(minHeight, maxHeight, currentHeight);
float speed = Mathf.Lerp(closePanSpeed, overviewPanSpeed, t);
position += worldDirection * speed * Time.unscaledDeltaTime;
```

If the camera uses distance rather than height, use the same principle with camera distance.

### 5.3 Best-practice constraints

- Use unscaled time for camera movement so pausing the simulation never makes navigation unusable.
- Keep movement frame-rate independent.
- Do not tie camera speed to simulation 1x/2x/4x.
- Avoid fixed world-units-per-second that feel fast at close zoom but glacial at overview scale.
- Preserve existing Cinemachine orchestration; do not replace the camera stack.

### 5.4 Acceptance proof

The Owner should be able to cross a representative portion of the studio in roughly a few seconds at management zoom without frantic dragging, while close inspection remains controllable.

The exact tuning is an Owner feel decision, not a hidden simulation constant.

---

## 6. Legacy UI legibility floor - must fix now

### 6.1 Product goal

Every player-facing control needed to complete Development must be comfortably readable and clickable at the Owner's actual fullscreen resolution.

The current UI fails because proof-era fixed dimensions become microscopic on a large/fullscreen display.

### 6.2 Immediate legacy scope

Do **not** redesign all IMGUI before P04A. Apply a centralized minimum legibility floor to the currently exposed legacy surfaces, especially:

- top date/time/cash HUD;
- Pause / 1x / 2x / 4x controls;
- left memo informational text and Save/Load;
- Development building card;
- Commission screenplay workspace;
- Review/Rewrite workspace;
- Development Production Rail;
- selection receipt / Back control where player-facing.

### 6.3 Recommended minimum metrics

These are **starting acceptance floors to validate visually**, not permanent art-bible constants:

- normal body text: approximately 16-18 logical px minimum;
- secondary/meta text: approximately 14-16 logical px minimum;
- section heading: approximately 20-24 logical px;
- workspace title: approximately 28-34 logical px;
- primary CTA label: approximately 17-20 logical px;
- minimum button/control height: 40-44 logical px;
- comfortable primary button height: 44-52 logical px;
- compact pointer/click target: at least ~40x40 logical px;
- default text line-height: roughly 1.25-1.4x font size;
- important numeric/status values should visually outrank descriptive prose.

Do not ship a "fit everything" mode that solves overflow by shrinking type below the legibility floor.

### 6.4 Scaling law

Legacy IMGUI should use one centralized scale/metrics source rather than each card inventing its own constants.

Possible shape:

```csharp
public static class StudioLegacyUiMetrics
{
    public const float ReferenceWidth = 1720f;
    public const float ReferenceHeight = 1045f;

    public static float ScaleFor(int width, int height)
    {
        float sx = width / ReferenceWidth;
        float sy = height / ReferenceHeight;
        // Never make large displays *smaller* than the reference UI.
        return Mathf.Clamp(Mathf.Min(sx, sy), 1.0f, 1.45f);
    }
}
```

If using `GUI.matrix` as a temporary legacy technique, centralize it and verify pointer coordinates/hit testing in every proof. A safer approach is often to calculate logical dimensions/fonts from one scale and keep GUI coordinates explicit.

### 6.5 Fullscreen / high-DPI rule

Do not assume pixel count equals physical readability. Test the actual Owner fullscreen setup. UI scaling should be based on the game's supported logical resolution policy, with DPI/OS scaling considered where available.

### 6.6 Layout rule

When more room is required:

1. grow the card within a bounded safe area;
2. reflow columns/rows;
3. use one contained scroll region for content that genuinely needs it;
4. hide/defer low-priority explanatory detail;
5. **never** solve by making all text smaller.

### 6.7 Acceptance proof

Capture native screenshots at:

- Owner's actual fullscreen resolution;
- 1720x1045;
- 1440x900;
- 1280x800 or the currently supported narrow proof size.

At each size, verify at 100% image scale:

- no tiny unreadable labels;
- no clipped CTA text;
- no overlapping cards;
- no text drawn over buttons;
- controls remain clickable;
- the central lot remains visible enough to preserve world context.

---

## 7. New-player legibility inside Development - must be good enough now

P03A does not need to teach all of filmmaking, but a player should be able to complete Development without external instructions.

### 7.1 Development should answer four questions in hierarchy

**What is this place?**  
Development - screenplays are commissioned, written, and reviewed here.

**What is happening?**  
`Drafting - Echoes of Undertow`

**Who is doing it?**  
`Writer - Sidney Marchetti`

**What can/should I do now?**  
One clear primary action, or one clear wait/clock state.

### 7.2 Reduce prose competition

The current cards often present many similarly weighted lines. Use stronger hierarchy:

- Title / phase = largest;
- next required action = visually distinct;
- writer/time/capacity = secondary factual rows;
- explanatory prose = quieter;
- blockers = concise and specific;
- only one primary CTA should visually dominate.

### 7.3 Time language

Where Living Time is the owner, copy should say what the player needs to do in terms of the real control:

Better:

> `Draft due in 1 week - run the studio clock.`

than:

> `advance the week`

if "advance the week" is no longer a visible gameplay verb.

This is a copy alignment fix, not simulation law.

---

# PART II - UI NORTH STAR FOR P04A AND BEYOND

## 8. The persistent screen architecture

The target is not "no UI." The target is **world-first + peripheral command information**.

A mature default lot view should roughly follow this composition:

```text
+-----------------------------------------------------------------------+
| DATE / ERA        PAUSE 1x 2x 4x            CASH / BURN / STANDING   |
|                                                                       |
| PEOPLE         [                 STUDIO LOT                 ] PROJECTS |
| RAIL           [                                            ] RAIL     |
|                [                                            ]          |
|                [                                            ]          |
|                [                                            ]          |
|                                                                       |
| BUILD / LOT TOOLS                                      contextual UI  |
+-----------------------------------------------------------------------+
```

The exact positions may change for modern ergonomics, but the doctrine is:

- central world dominates;
- persistent summaries live on edges;
- large workspaces appear only when opened;
- open workspace should usually yield/suppress rails that compete for space;
- context returns exactly on Back.

---

## 9. Top HUD target

### Required permanent/near-permanent information

- date / week / era;
- Pause / 1x / 2x / 4x;
- cash;
- concise recurring financial pulse once Package 11 truth repair is implemented;
- later Studio Standing / comparative rank only when authoritative.

### Visual best practices

- larger numbers than labels;
- icons may support but never replace text/status where ambiguity matters;
- active speed state must be unmistakable;
- hit targets comfortably usable with mouse and controller;
- avoid tiny buttons embedded in a long white strip;
- visually group date, time, and finance into distinct zones.

### P04A architecture

The accepted Unity audit recommends UI Toolkit as the standard for new major retained workspaces and centralized Input System contexts. The top HUD may remain legacy initially, but new UI decisions should use the same typography/token system so migration is straightforward.

---

## 10. Production Rail target

The current Development rail is **functionally correct V1**, but the Owner correctly describes it as "not as fun or sexy as the actual Movies" and somewhat like another white box.

### 10.1 What must remain

- TypeScript-authored lifecycle truth;
- exact project identity;
- compact persistent summary;
- click/select and explicit Locate behavior;
- no material commit from the rail;
- yields when a deep card/workspace is open;
- never calculates gameplay state.

### 10.2 What should change visually over time

Move from text-card rows toward **recognizable project tokens/cards**:

- lifecycle icon or visual identity for Development / Casting / Shooting / Post / Release;
- film/script title as the dominant text;
- small phase/status line;
- progress/time only where authoritative;
- attention marker only when player action is actually required;
- optional small information/details affordance;
- subtle thumbnail/poster/still later when authoritative assets exist;
- compact color accents are allowed, but never color-only semantics.

### 10.3 Example mature row

```text
[script icon]  ECHOES OF UNDERTOW
               Writing - 1 wk
               Sidney Marchetti
                              [i] [Locate]
```

Later:

```text
[camera icon]  MIDNIGHT HARBOR
               Shooting - Stage 2
               2 wks remaining
                              [i] [Locate]
```

Later:

```text
[$ icon]       THE LAST LAUGH
               In Theaters
               $1.8M studio revenue received
                              [i]
```

The rail tells the story of the studio; it does not become the studio.

---

## 11. People/Stars Rail target - later, not a P03A.3 requirement

Use the original screenshot's left edge as inspiration for peripheral character awareness, but modernize the data.

Potential row:

```text
[portrait] Sidney Marchetti
           Writer - Drafting
           Comedy specialist
```

Later, when real market rankings exist:

```text
[portrait] Ramon Ashley
           Actor - #7 Industry
           Shooting Midnight Harbor
```

Do not add fake rankings before the broader market/rival authority exists.

Do not recreate persistent human-needs chores.

---

## 12. Contextual information / `i` affordance

A small details affordance is useful when the default surface must remain compact.

Recommended law:

- click the world object/card = select/open the normal context;
- explicit `i` / Details = deeper retained workspace/profile;
- explicit Locate = camera move;
- Back = restore exact origin;
- no single click should both select, move camera, and commit gameplay.

This creates one interaction grammar across buildings, people, films, and projects.

---

## 13. White-card visual language - what must end

The current white cards were effective proof infrastructure but should not become the final product identity.

### Problems

- too much opaque white area;
- weak hierarchy;
- tiny typography;
- generic system-button styling;
- little differentiation between project state, informational prose, and primary action;
- multiple large rectangles compete with the lot;
- rails feel like mini spreadsheets rather than movie-studio artifacts.

### Direction

P04A should establish the first production UI Toolkit visual language with:

- typography scale/tokens;
- spacing tokens;
- readable buttons;
- retained responsive workspace host;
- controlled surfaces with more visual hierarchy and less blank white mass;
- restrained era-aware accents without hard-coding 1948;
- lifecycle icons;
- portrait/project imagery where useful;
- clear selected/hover/focus states;
- controller focus;
- one scroll owner;
- responsive wide/mid/narrow layouts.

Do **not** turn the UI into decorative Hollywood chrome at the expense of readability.

---

## 14. UI Toolkit best-practice starting point for P04A

This section is architectural guidance, not a demand to implement UI Toolkit during P03A.3.

Recommended `PanelSettings` policy to evaluate:

```text
Scale Mode: Scale With Screen Size
Reference Resolution: 1920 x 1080
Screen Match Mode: Match Width Or Height
Match: approximately 0.5
```

The exact values must be validated against the Owner's fullscreen monitor and supported resolutions.

Recommended shared USS tokens (illustrative):

```css
:root {
    --ps-font-body: 18px;
    --ps-font-meta: 15px;
    --ps-font-section: 22px;
    --ps-font-title: 32px;
    --ps-control-min-height: 44px;
    --ps-space-1: 6px;
    --ps-space-2: 10px;
    --ps-space-3: 16px;
    --ps-space-4: 24px;
}
```

Use semantic classes (`primary-action`, `attention`, `blocked`, `selected`, `meta`) instead of hard-coded color/style decisions inside each controller.

---

## 15. Input/focus best practices for P04A

The accepted architecture audit found the Input System installed but current runtime code still polls devices directly.

P04A should establish centralized contexts:

- `Global` - pause, Back, global shortcuts;
- `World` - selection;
- `Camera` - pan/orbit/zoom;
- `UI` - navigation, submit, cancel, tabs, scrolling;
- `Debug` - development-only actions.

When a retained workspace is active:

- UI owns navigation/submit/cancel;
- world click-through is blocked;
- camera movement is either explicitly allowed or suppressed by context, never by random screen-rectangle checks;
- controller default focus is deterministic;
- Back restores origin.

---

## 16. Performance and world-visibility rules

UI improvements must not sabotage the living lot.

- Do not pause or hide the entire world simply because a management workspace opens unless the gameplay law requires pause.
- Avoid huge transparent overdraw surfaces when not needed.
- Persistent rails should be lightweight and bounded.
- Reuse authoritative projections rather than querying/recalculating every frame.
- Do not add Update-loop gameplay calculations in UI components.
- Portrait/still capture remains a presentation concern and should not block this acceptance pass.

---

# PART III - CLAUDE/FABLE ENGINEERING GUIDANCE

## 17. Likely current code seams to inspect first

Before changing anything, Fable should inspect and map current exact implementations for:

- `StudioLocateAction`
- `StudioCameraDirector`
- `TycoonCameraController`
- `StudioSelectionManager`
- `StudioCameraInput`
- `StudioDevelopmentCardHud`
- `StudioDevelopmentPresentation`
- `StudioProductionRailHud`
- `StudioLivingTimeHud`
- `StudioBridgeClient`
- existing inspection Back affordance / camera mode transitions
- relevant EditMode tests and Development proof runner

The goal is to **extend the existing camera/nav stack**, not add a parallel one.

---

## 18. Recommended implementation order for the pre-acceptance remedy

### Wave A - Reproduce and instrument the camera trap

Prove exactly why zoom-out is disabled after `Locate Writer`:

- inspection camera mode remains active?
- camera-input context disabled?
- Cinemachine priority never restored?
- selection manager holds inspection?
- pointer/UI capture suppresses scroll?

Do not guess. Add a focused test/instrument if needed.

### Wave B - Add reversible navigation

Implement/correct the smallest shared origin/Back seam. Reuse existing camera director/selection/Locate code.

### Wave C - Tune management camera responsiveness

Adjust scale-aware pan/traversal without changing close inspection feel.

### Wave D - Centralize legacy UI metrics

Create one small legacy sizing/scale helper and apply it only to currently required player-facing surfaces. Do not hand-tune every card independently.

### Wave E - Readability/hierarchy pass

Increase sizes, hit targets, spacing, and priority hierarchy. Keep logic and lifecycle untouched.

### Wave F - Proof and hostile review

Test actual fullscreen plus existing proof resolutions. The hostile reviewer should explicitly reject microscopic text, trapped camera states, or world-navigation regressions.

---

## 19. Do-not-rebuild / do-not-scope-creep list

Before current Development acceptance, do **not**:

- implement P04A Casting;
- migrate Development to UI Toolkit;
- rewrite the TypeScript screenplay lifecycle;
- alter Accept/Final Rewrite law;
- change Development authority;
- rebuild Production Rail into a cross-domain system;
- build People/Stars rail;
- add rankings;
- add Addressables;
- change URP/render pipeline;
- add DOTS;
- build a movie recorder;
- migrate every IMGUI surface;
- redesign the lot;
- implement Package 09 construction/path editing;
- create new simulation math in Unity.

This is a **navigation + legibility acceptance repair**.

---

## 20. Definition of done - before P03A.x can receive final Owner acceptance

All of the following should be true:

### Camera

- [ ] Locate Writer works.
- [ ] Back/Esc returns to the exact prior management context.
- [ ] Normal zoom-out works after Locate.
- [ ] Pan/orbit/zoom are restored after inspection.
- [ ] Repeated Locate/Back does not trap or drift.
- [ ] Management pan speed feels materially faster and appropriate to zoom level.

### Legibility

- [ ] Top HUD is comfortably readable at fullscreen.
- [ ] Pause/1x/2x/4x controls are comfortably clickable.
- [ ] Development card text is comfortably readable.
- [ ] Commission/Review CTA buttons are comfortably clickable/readable.
- [ ] Production Rail text is readable without leaning toward the screen.
- [ ] UI does not solve overflow by shrinking below the minimum floor.
- [ ] Existing 1720x1045 / 1440x900 / 1280x800 proofs remain usable.

### Development journey

- [ ] Commission remains world-owned.
- [ ] Writer walk/presence remains visible.
- [ ] Writer inspector remains authoritative.
- [ ] Development state remains readable.
- [ ] Living Time remains the time owner.
- [ ] Review remains world-discoverable.
- [ ] Accept/Final Rewrite remains intact.
- [ ] Ready-to-Package clearly says Casting is next.
- [ ] No Casting implementation is added.

### Architecture

- [ ] No parallel camera system.
- [ ] No new simulation authority in Unity.
- [ ] No broad UI migration.
- [ ] P03A sealed navmesh behavior remains untouched.
- [ ] All relevant regressions green.

### Owner acceptance question

The final human test is:

> **Can I comfortably read the game, move around the lot, inspect/locate someone, get back out, and complete Development without fighting the camera or squinting?**

If the answer is no, the slice is not accepted regardless of automated proof.

---

# PART IV - WHAT "GOOD" SHOULD FEEL LIKE

## 21. The target experience

The player starts from the lot and can understand the studio at a glance:

- the top strip tells them **when**, **how fast**, and **how much money**;
- the world tells them **where work is happening**;
- people visibly perform their authoritative jobs;
- the left side eventually keeps important people present in peripheral awareness;
- the right side keeps the film slate/pipeline present in peripheral awareness;
- building/path/lot tools eventually let the player physically shape the studio;
- a compact status/icon leads to deeper detail rather than dumping all information at once;
- the player can always go **into** detail and reliably come **back** to the exact studio context.

The player should not feel like they are operating two white forms floating over a decorative studio.

The player should feel:

> **"I run this place. The UI helps me understand it."**

not:

> **"I run the UI. The studio happens behind it."**

---

## 22. Acceptance versus long-term ambition

### Required before accepting the current Development slice

- camera recovery;
- faster management navigation;
- legacy UI minimum legibility;
- no regression of world-owned Development.

### Begins with P04A

- production UI Toolkit visual language;
- controller/focus input architecture;
- reusable origin/Back/Locate orchestration;
- professional retained Casting workspace;
- improved card/rail hierarchy.

### Later packages

- cross-domain Production Rail;
- People/Stars rail;
- real talent/studio rankings;
- build/path/landscape ownership;
- film info/details surfaces;
- rival ecosystem;
- finance workspace;
- era-aware presentation;
- full 1920->2040 studio evolution.

Claude/Fable must not confuse the screenshot north star with the immediate checkpoint scope.

---

## 23. Final instruction to the future implementer

**Preserve what P03A solved. Fix the two things now preventing the player from enjoying it: navigation recovery and legibility.**

Use the original *The Movies* screenshot as the information-architecture destination, not as a request to recreate its pixels. The correct modern successor keeps the studio world dominant, keeps the state of people and productions readable at the edges, gives every camera move a way back, and uses deep panels only for decisions that actually need them.

