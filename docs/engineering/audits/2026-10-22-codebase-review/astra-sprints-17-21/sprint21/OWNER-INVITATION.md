# Owner playtest invitation — integrated candidate 6c82214f (2026-10-29, 20:21 CDT; refreshes the Sprint 16 invitation once; first issued for 9f6103f3 at 17:44 CDT)

Howard: the Sprint 16 route still holds (sprint16-playtest/OWNER-INVITATION.md, sections 1 to 5), now on the candidate that carries Sprints 17 to 21. Your verdict is yours; nothing here is accepted on your behalf. The coordinator's evidence says the routes below work in your installed Chrome; it does not say the game is good.

## 1. Launch

From a checkout of HSpector1/The-Movies at branch p18-season-20261028, commit 6c82214f, tag p18-sprint21-candidate-20261029 (after the Sprint 20 checkpoint 2e51d30c the branch only merges main's records and one comment, then fixes one test pin; the game is the same), with node v20.20.2 on the PATH and dependencies installed:

```
npm run build
npm run preview
```

Open the printed localhost address in Google Chrome. The studio autosaves to this browser's storage; a banner tells you if it cannot.

## 2. What changed since the Sprint 16 route

1. **Rights desk** (Sprint 18, your decisions B and C). From the Dashboard open the Rights desk. Pick the property your live season runs on and propose its sale: before anything binds, the desk shows the week the sale would close, the season it cancels, the refund due and the charge due, as the engine will write them. Confirm, then advance a week and compare the season row with what was disclosed. Also request a disclosure about a rival and read the refusal text when something is not allowed; the sentence should say why in plain words.
2. **Season deadline copy** (decision C). A season that fails at its final boundary now says what could not be delivered where the record knows it.
3. **Portable saves** (Sprint 19, decision D). Export a save from Chrome, import it into a Node run (or the reverse); it must load without a market reconciliation refusal. Owner-saves exported for you earlier (sprint16-playtest/owner-saves/) still import; your private saves are never copied into any record.
4. **Rival recovery** (Sprint 17, decision A). A rival that entered cost-cutting now examines a restart every 26 weeks and comes back only when a complete plan is affordable. On the measured natural worlds no rival restarts, so you will probably not see one; it is there for worlds that reach it.
5. **Destructive confirmations** (Sprint 20, decision E). This is a contract change for the Unity client (none on this Mac), so the browser shows nothing new; the browser already asks twice on the season cancel.

## 3. Known limits you will meet (not accepted, not hidden)

- The items listed in the Sprint 16 invitation, section 3, still hold except where section 2 above says otherwise.
- The native Unity client is paired at source level only (CF09 seal PASS) and has never been compiled or run here; its two-step confirm is unrun.
- The full gate on this candidate shows 104 core and 3 ui failing cases: 95 and 2 are the inherited pre-program baseline, 6 are untracked fixtures, 3 are timing rows that pass alone or sit at a budget, and the one new assertion was a stale test pin, fixed (sprint21/RESULTS.md, slice 3). No new behaviour defect.
- Firefox and WebKit are not available on this machine; only installed Chrome was exercised.

## 4. What we need from you

A KEEP, REVISE or REJECT on the route as a playable loop; the moments where the Rights desk disclosure or a refusal confused you; anything that rendered wrongly. Missing feedback does not block independent repairs; it does block acceptance and any promotion to main, which stays your separate decision.
