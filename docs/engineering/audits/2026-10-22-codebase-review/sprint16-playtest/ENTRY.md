# Sprint 16 entry — playtest candidate, targeted polish and integration handoff (2026-10-28, 18:05 CDT)

Governing order: p16-sprint5/OWNER-ASSIGNMENT.txt, SPRINT 16 (lines 168–178). Predecessors: Sprint 14 closed (tag p18-sprint14-checkpoint-20261028 at e115be4b); Sprint 15 closed with native BLOCKED (p16-sprint15/RESULTS.md). Qualified available platform: the browser client (React/Vite) in the engine repository; the Unity client is paired at source level only and cannot be built on this host. Coordinator: Claude Fable 5.1.

## 1. Candidate

- Repository HSpector1/The-Movies, branch p18-season-20261028, commit e115be4ba55cde244520fd0babc68b961e4eb17a (annotated tag p18-sprint14-checkpoint-20261028, object bff5de79), pushed. Ancestry: a5a66c27 (P16 technical checkpoint) → ecbc42c9 (P17) → 31fdb366 (P18 Sprint 12) → 0774e16e (Sprint 13) → e115be4b (Sprint 14, tests-only on top of 0774e16e). Gameplay source last changed at ebfdf2ca (Sprint 13 FIX-4, ui/src/lot/StudioLotScreen.tsx).
- Verification state at this commit: full gate full-tree-r4 audited CLEAN WITH NOTES, zero new assertion failures (sprint14-qualification/QUALIFICATION.md §10); inherited failures and timing limits named there. Node v20.20.2.
- Working tree for the candidate: studio-scratch/p17-continuation-20261027-wt (sparse: docs evidence excluded; ui/ and art/ materialized and verified 0 skip-worktree before every run).

## 2. Launch path (local, reproducible)

From a checkout of e115be4b with dependencies installed (the integration worktree shares the records checkout's node_modules by symlink):

```
export PATH=/usr/local/bin:$PATH      # node v20.20.2
npm run build                          # vite build --config ui/vite.config.ts → ui/dist (13.2 MB at this commit; the gate's build stage ran it in 24 s)
npm run preview                        # vite preview --config ui/vite.config.ts; open the printed localhost URL in Chrome
```

`npm run dev` (Vite dev server, default port 5173) is the development alternative. Playwright journeys use ui/playwright.config.ts: Vite on fixed port 5178, `workers: 1`, project `chromium` with `channel: 'chrome'` (installed Google Chrome 150.0.7871.125; no Playwright browser download exists for macOS 12), viewport 1280×900.

## 3. Assets

Only files tracked in the repository at e115be4b are served: ui/public (audio, favicons, lot, spike3d) and art/hollywood captures referenced by the lot screen. No original-game material and no private saves are part of the candidate; the P13A review-library saves and the long-route fixtures stay in the repository's evidence paths and are not distributed with the playtest.

## 4. Save and restore behaviour (as implemented)

- Autosave of the active session to browser localStorage on every state change, driven by ui/src/engine/session.ts; the shell probes storage reachability at first boot (ui/src/shell/persistence.ts) and shows a persistent, non-silent notice when an autosave fails (PF1-M3). On first mount the active session is restored (D-12 session recovery).
- Explicit export/import of a save as JSON through the Start screen (`exportSaveJson` / `importSaveJson`, ui/src/engine/adapter.ts); the smoke journey exercises export → new game → import → continue. Saves written by the Node runtime may be refused by the browser import (shared-market factor reconciliation; cross-engine portability is an open Owner decision, sprint14-qualification/INVENTORY.md §3).
- Save51 is the current era; historical saves migrate on import where a migration exists (inherited version-pin failures listed in QUALIFICATION.md §8); the UI import ceiling is 8 MiB (SAVE-11).

## 5. Known limitations carried into the candidate (pointers; nothing here is accepted)

- ACCEPTANCE OPEN lists: p18-sprint12/RESULTS.md and p18-sprint13/RESULTS.md (P18: creditor priority of TV obligations in P15 closure; licence after cancellation; automatic cancellation on authority loss not implemented; refusal copy; front door is the standalone Assembly only; settle amount), the P17 tag list (rival guest selection and others), sprint14-qualification/RESULTS.md (closure-deferred arm admissibility; Save51 save size and probe performance at 6240+; no rival recovery; post-2040 release unmeasured), natural C-08, cross-engine save portability, native/Unity BLOCKED (p16-sprint15/RESULTS.md).
- Timing: three ui 30 s timeouts under gate load (lot cash-stop, Studio Home topbar and building focus) pass alone near their budgets; eleven bridge-p12-campaign-library save/load timeouts fail alone on this host.
- Browser-only reach: featured appearances unlock at week 1872 and a browser campaign cannot reach it inside any budget, so the P17 and P18 journeys start from headless fixtures imported through the Start screen (ui/e2e/p17-continuation.spec.ts, p18-season.spec.ts).

## 6. Short route for the Owner (draft; final version in RESULTS.md after the browser run)

1. Start a studio: Start screen → New game → founding draft → Studio Home.
2. Make and release a film: Assembly (concept, shape, promise, writer, director, three cast, budgets) → greenlight → "Sim to next event" through shooting to the release newspaper → the theatrical run in theaters → autopsy.
3. Money and blocked work: the Dashboard Finances card (runway), Release Strategy (break-even, solvency gate on greenlight), a refused action's reason text.
4. Save and reload: export the save, start a new game, import it, continue one week.
5. P16/P17/P18 routes: the imported P17 fixture (sequel with a featured guest, lineage) and the imported P18 fixture (commission a season, first credited unit, cancel/settle previews).

## 7. Evidence plan

- browser-r1 (studio-scratch/sprint16-20261028/browser-r1, launched 18:02:14 CDT in the lane on e115be4b): the four real-browser journeys smoke, d12-economy-journey, p17-continuation, p18-season in installed Chrome; JSON reports per spec. Reused evidence: the unit/ui gate (full-tree-r4), the Sprint 13 Playwright season journey at 85c09bc6 and the Sprint 11 cameo journey at ecbc42c9 (both earlier commits; browser-r1 re-measures them at e115be4b).
- Defects found on the route are fixed RED-first with focused reruns of the invalidated files only; no machinima editor, exporter or art overhaul; no merge to main; a draft integration PR may be prepared, never merged.
- Owner acceptance is human and stays OWNER ACCEPTANCE PENDING; the final integration recommendation is written in RESULTS.md.
