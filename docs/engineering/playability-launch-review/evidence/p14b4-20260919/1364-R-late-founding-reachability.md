# 1364-R: late-founding reachability check (Owner item 8)

- **Ordered by.** The Owner, 2026-10-02, `E/1362-O-owner-response-20261002.md` item 8 (lines 201-205), routed by the
  parent at 1362-O:239-246. E is `docs/engineering/playability-launch-review/evidence/p14b4-20260919`.
- **Issue checked.** 1356-X F-2, restated in 1356-F5:25-41 and widened in 1356-F4:36-45.
- **Tree.** Repo `/Users/zacheryspector/The-Movies-headless-program`, branch `wip/headless-program-20260916-ts`,
  HEAD `c6ad14f1c9a6ef106ff8b224623f1ff3c3a390c2`. Every `file:line` below is at that HEAD.
- **Method.** I read source in `src/core`, `ui/src` and `bridge`, plus `README.md`, `BRIDGE-README.md` and the
  `package.json` scripts. I ran no node, vitest, tsc, npm, npx, tsx or vite-node, and started no UI. Git use was
  `rev-parse`, `log --oneline` and `ls-files`. I read nothing under `tests/fixtures` and touched no Owner save.

## Verdict

**Not exposed.** No supported entry path at HEAD reaches a public founding after week 0, so no supported path can
trigger failure 1 or failure 2. The limit lives in what the browser renders and what the bridge publishes. The engine
itself does not enforce it. Both invalid-state rules stand unchanged, and 1356-X F-2 stays open. This is the Owner's
"not exposed" branch: the record states the limit and calls nothing fixed.

## 1. The supported entry paths

| Path | Entry | Why it counts as supported |
|---|---|---|
| Native launch: Unity over the bridge | `npm run play`, `npm run studio` (`package.json` scripts); engine side `bridge/runtime/worker-entry.ts:29-32`, `bridge/runtime/runtime-coordinator.ts:299-313`, `bridge/session.ts` | README.md:36-44 names it "the native owner launch"; BRIDGE-README.md:14-27 documents it as the play path. |
| Bridge-only diagnostics | `npm run bridge` (`bridge/server.ts`) | BRIDGE-README.md:53-62 documents it. It serves the same `BridgeSession`, so it is assessed with the bridge. |
| Browser client | `npm run dev`, `build`, `preview`; `ui/src/App.tsx` | README.md:28-34 presents it as the way to run the game in a browser ("Three.js reference/debug surface"); PLAYTEST.md:49, 84 and 183 walk a player through new game and import. |
| Save loading inside each | Browser: StartScreen import, Saves import, autosave restore. Bridge: `POST /load`, the campaign library, startup recovery of the profile file | These are the load routes of the two paths above. |

The Unity client is not in this repo; only generated DTOs are (`generated/unity/StudioBridgeDtos.Generated.cs`). Its
whole action surface is the bridge's: it may submit only an emitted `intentId` (BRIDGE-README.md:3-6 and 124-127;
`bridge/session.ts:1590-1603`).

**Not counted.** The core module API (`src/core/index.ts:1084` exports `beginFounding`, beside `tick` and
`applyActions`), the `src/harness` scripts and the tests. No README, BRIDGE-README section or `package.json` script
offers them as a way to play. They are the engine library and its analysis and test callers. They do reach a late
founding directly, and that is where 1356-X (the case (a) leaf at week 26) and H8 (week 209, per 1356-F5:32-34) met it.

## 2. Each path

### 2.1 New game, on every path

- `newGame(seed, options)` is `beginFounding(generateWorld(seed, options))` (`ui/src/engine/adapter.ts:608-610`).
  `generateWorld` starts the market at tick 0 (`src/core/worldgen.ts:676`) with `founding: null` (`:744`), so
  `beginFounding` always takes the fresh origin (`src/core/employment.ts:569`).
- The browser calls it from the start screen (`ui/src/screens/StartScreen.tsx:38`).
- The bridge calls it through `BridgeSession.createRuntime` (`bridge/session.ts:1382-1390`): for an empty profile
  (`bridge/runtime/worker-entry.ts:32`, `bridge/runtime/runtime-coordinator.ts:308`), for the campaign operation
  `newGame` (`bridge/runtime/campaign-library.ts:225`), and for `discard` when no named record is active
  (`campaign-library.ts:221`). The bridge bootstrap state also signs and founds at week 0
  (`bridge/session.ts:310-350`).
- The only new-game setting is the founding regime, endowed or bare-lot (`bridge/server.ts:175-177`). The supervisor
  takes `--profile-root`, `--unity-project`, `--unity-app`, `--unity-executable` and `--max-engine-restarts`
  (`bridge/supervisor/config.ts`). None sets a start week.
- Outside the core API, the harness and the tests, `newGame` is the only caller of `beginFounding` in `src`, `ui/src`
  and `bridge`. The browser has no "found a studio later" or headless-start option: the start screen offers a seeded
  new studio and "Continue from a save" (`StartScreen.tsx:31-49`).

**Result.** No supported path opens a founding draft after week 0.

### 2.2 Browser client

- **Advancing with the draft open: not exposed.**
  - App routes every open-draft state to `FoundingScreen`: on first mount (`ui/src/App.tsx:917-923`), in `startGame`
    (`:1741`) and after a Saves load (`:4851-4853`).
  - `FoundingScreen` receives `onChange`, `onCreate` and `onFounded` and nothing else (`App.tsx:4516-4539`;
    `ui/src/screens/FoundingScreen.tsx:73-83`). Its controls sign (`FoundingScreen.tsx:105-113`) and found
    (`:114-125`). The Talent Creator it opens returns to it (`App.tsx:2630-2631`, `:4810-4819`).
  - Advance and Sim to Next Event live on the Dashboard (`App.tsx:4553-4554`) and the Lot (`App.tsx:4907-4923`).
    App reaches those screens only through `operatingStudioHome`, after founding (`App.tsx:4534-4538`) or after a load
    whose state has `founding === null`.
  - The living loop commits an advance only while the Lot is on screen (`App.tsx:2887-2889`, `:2910`). The one global
    key listener unlocks audio (`App.tsx:1403`). The Settings dialog holds sound and motion only (`App.tsx:4178-4187`).
- **Failure 1:** not reachable.
- **Failure 2:** signing and `foundManagedStudioAction` run only at week 0 under the fresh origin, where
  `src/core/hollywoodValidation.ts:568` exempts the draft's `player-contract` rows. That is not a late founding.

### 2.3 Bridge (Unity client)

- **Advancing with the draft open: not exposed.**
  - While `state.founding !== null`, `resolveStudioIntents` returns the founding intents alone
    (`bridge/session.ts:706-709`). `resolveFounding` emits `signFoundingContract` offers and, once coverage is met,
    `foundStudio` (`session.ts:548-659`). The snapshot publishes the same list (`session.ts:1546-1549`).
  - Every `advanceWeek` publication sits after that return (`session.ts:1007-1068`). `advanceOutcome`
    (`session.ts:387-389`) is the bridge's only call to `advanceWeek`, and no other bridge code calls `tick`.
  - The laboratory, plan, office and production-setup families join regardless of the draft
    (`session.ts:1187-1189`). Each applies `applyActions` or `applyOfficeAction` (`session.ts:1140`, `:1151`, `:1167`,
    `:1183`; `bridge/office.ts:69-75`), and no engine action ticks: `src/core/actions.ts` never calls `tick`, and
    `src/core/index.ts` is the tick module's only importer in `src/core`.
  - `executeCommand` accepts only an emitted `intentId` or a digest-bound quote (`session.ts:1590-1603`). The routes
    are GET `/health`, `/session`, `/snapshot`, `/campaigns`, `/contract` and POST `/industry`, `/campaigns`,
    `/command`, `/quote`, `/save`, `/load` (`bridge/server.ts:134-137`). Only a `/command` carrying an emitted
    `advanceWeek` intent moves time.
  - BRIDGE-README.md:205-208 says the same: a fresh runtime starts in the Week 0 draft and offers only founding
    choices until `START A STUDIO`.
- **`bridge/finance.ts:34` and `:44`.** These lines set `chargedNextAdvance` to 0 while a draft is open. They mirror
  the tick's own rule, which skips payroll, overhead and facility costs during a draft (`src/core/tick.ts:956-958`,
  `:971`, `:987`). The projection rides every snapshot (`session.ts:1539`; `bridge/snapshot-build-context.ts:144`),
  including the Week 0 draft, whose signings already hold contracts. It publishes no control and advances nothing.
  1356-X F-2's inference from these lines does not hold.
- **Failure 1:** not reachable. **Failure 2:** reachable only at week 0 under the fresh origin, which is exempt.

### 2.4 Save loading

- **Browser: the loaders accept a late open draft.**
  - `importSaveJson` runs `importSave`, which is `validateSave`, then `migrateToLive`
    (`ui/src/engine/adapter.ts:3790-3800`; `src/core/save.ts:6600-6608`). The StartScreen, the Saves screen and the
    autosave restore all use it (`StartScreen.tsx:41-49`; `ui/src/screens/Saves.tsx:82-89`;
    `ui/src/engine/session.ts:67-78`).
  - No validator rule refuses `founding !== null` past week 0. The founding checks in `save.ts` cover shape
    (`:2144-2148`) and managed operations (`:2821`). 1356-X measured such a state validating at weeks 26 to 33.
  - App sends the loaded state to `FoundingScreen`, which offers sign and found. A late-draft save would therefore
    expose failure 2 in the browser. Failure 1 stays out of reach, because that screen has no advance.
- **Where such a save could come from.**
  - No supported writer at HEAD produces one (2.1 to 2.3). The producers at HEAD are the core API's test and harness
    callers.
  - A pre-V19 save holding an open draft past week 0 would migrate into exactly this state: `convertV18ToV19`
    initializes Hollywood with the migration origin at the save's own week (`save.ts:8070-8072`;
    `src/core/hollywood.ts:158-185`). Whether any earlier build ever wrote such a save is undetermined by reading
    HEAD; this check searched no history. Legacy V2 imports carry no draft (`save.ts:6871-6878`).
- **Bridge: no route accepts external save bytes.**
  - `POST /load` re-imports the session's own captured slot (`session.ts:2082-2101`). Campaign `load` hydrates a
    library record (`campaign-library.ts:236-240`). Records come from `newGame`, `saveAs` or startup recovery
    (`campaign-library.ts:61-83`, `:224-235`). By 2.1 and 2.3, no bridge-written slot or record holds a late draft.
  - Two inputs remain: the profile file `bridge-runtime-v1.json` (`worker-entry.ts:31`) edited outside the product,
    and a legacy checkpoint from an earlier bridge build. The library loader validates both but has no rule against
    a late draft (`campaign-library.ts:37-43`, `:88-139`). Neither is a supported import.

## 3. The precise reachability limit

1. **Opening.** `newGame` is the only player-path opener of a founding draft, and it runs at tick 0
   (`adapter.ts:608-610`; `worldgen.ts:676`; `employment.ts:569`).
2. **Advancing.** The browser renders no advance control while a draft is open (`App.tsx:917-923`, `:1741`,
   `:4516-4539`, `:4851-4853`). The bridge withholds `advanceWeek` while `state.founding !== null`
   (`session.ts:706-709`).
3. **No engine invariant backs 1 or 2.**
   - `tick` (`tick.ts:194-223`) and `advanceWeek` (`adapter.ts:2483-2501`) accept an open draft.
   - `beginFounding` accepts any week and takes the migration origin past week 0 (`employment.ts:568-570`).
   - `applyFoundStudio` checks only that a draft is open and the minimums are met (`src/core/actions.ts:1201-1210`).
   - A draft signing adds the bonus to `founding.spentBonus` and writes no ledger row (`actions.ts:2560-2579`).
     In a live industry the same signing becomes a `player-contract` row (`src/core/industryEmployment.ts:29`).
   - The importer accepts a late open draft until one of the two rules refuses it.

**What would expose it.**
- A bridge change that emits `advanceWeek`, or any time-advancing intent, while a draft is open: inside
  `resolveFounding`, ahead of the return at `session.ts:708-709`, or in a family joined at `session.ts:1187-1189`.
  Both failures would follow. Failure 1 arrives once a rival locks a production method. Failure 2 arrives for any
  signing after week 0 that `foundStudio` then closes; week-0 signings stay exempt under the fresh origin.
- A browser change that puts Advance or Sim on `FoundingScreen`, runs the living loop there, or routes an open-draft
  state to the Lot or the Dashboard.
- Any new caller of `beginFounding` on a state past week 0: a "found a studio later", headless-start or
  spectate-then-found option, or a bridge command or campaign operation that opens a draft in a running world.
- A supported import of outside saves into the bridge, or a migration that opens a draft. The browser already routes a
  loaded late draft to the founding screen (2.4).

## 4. The underlying issue stays open

`src/core/technology.ts:897` and `src/core/hollywoodValidation.ts:568-569` are unchanged at HEAD. A state that ticks
with a late draft open after a rival locks a method, or that signs and founds late, still fails validation and cannot
save. The core API still reaches both states, as 1356-X and 1356-F4 showed. This check changed no code. It records a
reachability limit and fixes nothing.

## 5. Limits of this check

- It read HEAD only. It ran nothing, so every claim rests on reading, not on execution.
- It did not search git history, so it cannot say whether an earlier build wrote a late-draft save.
- The Unity client source is outside this repo. The client's reach is bounded by the bridge's emitted intents.
- "No engine action ticks" rests on reading `src/core/actions.ts` and on `src/core/index.ts` being the tick module's
  only importer in `src/core`.

## Parent classification (2026-10-02)

This applies the Owner's item 8 ruling ([1362-O](1362-O-owner-response-20261002.md), "The second response").

**Classification.** No supported writer or player action exposes a public founding after week 0 at c6ad14f1.
- **The limit** is the one stated above:
  - `newGame` opens a draft only at week 0;
  - the browser routes every open draft to the founding screen, which has no advance handler;
  - while a draft is open, the bridge emits only the founding choices.
- **Neither failure** can be triggered by play on a supported path.

**One exposure depends on its input.**
- **The path.** The browser's save import accepts a save that already holds an open draft past week 0 and routes it to
  the founding screen. That exposes failure 2, signing late, and not failure 1, since that screen offers no advance.
- **Where such a save could come from.** No supported writer at HEAD produces one. A pre-V19 save that held an open
  draft would migrate into one (`src/core/save.ts:8070-8072`).
- **Not checked:** whether any older build wrote such a save. The Owner barred a new research campaign.

**Not fixed.** The two rules that make these states unsavable are unchanged: `src/core/technology.ts:897` and
`src/core/hollywoodValidation.ts:568-569`. The invalid-state issue stays open.

**For the Owner.** One question: does the import exposure count as "reachable", which would call for the bounded
charter covering both failures, or does it stay a recorded limit?
