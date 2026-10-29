# Sprint 16 results — playtest candidate, targeted polish and integration handoff (2026-10-28, 18:20 CDT; r2 addendum 19:55 CDT)

**Candidate r2 (19:55 CDT):** commit b3c179b0 (annotated tag p18-sprint16-playtest-candidate-r2-20261028, object 5197611d, pushed and remote-verified) = 468d99b8 + 91a5e723 (smoke closing-quote witness; Owner route saves exporter ui/e2e/owner-route-saves.spec.ts) + b3c179b0 (one CSS rule removed from the newspaper headline). Gameplay rules unchanged since ebfdf2ca. Draft PR #20 (https://github.com/HSpector1/The-Movies/pull/20) opened against main as a draft; not merged, auto-merge not enabled. The paragraphs below describe candidate r1 unless marked r2.

Candidate r1: HSpector1/The-Movies, branch p18-season-20261028, commit 468d99b8 (annotated tag p18-sprint16-playtest-candidate-20261028, object fba9d8c3, pushed and remote-verified). 468d99b8 = e115be4b (tag p18-sprint14-checkpoint-20261028, full gate audited CLEAN WITH NOTES) plus one e2e spec commit. Gameplay source unchanged since ebfdf2ca (Sprint 13 FIX-4). Entry, launch path, assets and save/restore behaviour: ENTRY.md. Owner-facing route and known issues: OWNER-INVITATION.md. Program close-out: PROGRAM-CLOSEOUT.md.

## Evidence (lane runs on the integration worktree, installed Google Chrome 150 via Playwright channel chrome, fixed port 5178)

| Run | HEAD | Journeys | Result |
|---|---|---|---|
| browser-r1 | e115be4b | smoke; d12-economy-journey; p17-continuation; p18-season | smoke PASS 30.2 s (new studio, legal film, greenlight, release, autopsy, export, new game, import, continue); p17 PASS 19.3 s (released original, sequel with a featured guest, lineage and meters); p18 PASS 14.7 s (commission a season from Assembly, first credited unit, Dashboard row); d12 FAIL at 20.5 s: `expect(sim-to-event).toBeEnabled()` received disabled. CHECKPOINT exit 1 from d12 only. |
| browser-r2 | e115be4b | d12 alone | FAIL reproduced (19.1 s); error-context preserved; deterministic. |
| browser-r3 | e115be4b | d12 alone, `--trace on` | FAIL reproduced (22.4 s); the trace's DOM snapshot at the failing step shows the dashboard hint "<title> is Release Ready. Commit it to release, or advance a single week deliberately to hold — the picture holds where it is, and studio costs continue until you commit." (pendingReleaseDecision gate, ui/src/screens/Dashboard.tsx). Trace: studio-scratch/sprint16-20261028/browser-r3/test-results/…/trace.zip (6.8 MB, not copied). |
| browser-r4 | 468d99b8 | d12 alone | PASS 18.4 s (finances card, release-strategy gate Pass, release-commit, sim to the newspaper, autopsy, theatrical run with Studio Revenue). |
| browser-r5 (r2) | 91a5e723 | smoke with the new closing-quote witness; owner-route-saves | smoke FAIL at the witness only, as expected: `sameLine:false`, quote line top 337.9 px against 277.8 px for the letter before it, headline “PORTRAIT OF A CONSTELLATION” OPENS TO A WARM RECEPTION (RED on the unfixed CSS). owner-route-saves 2 passed 33.3 s: p17-cameo-world.json 453,449 bytes and p18-season-world.json 2,014,848 bytes written and each imported through the Start screen. CHECKPOINT exit 1 from the expected red only. |
| browser-r6 (r2) | b3c179b0 | smoke (full journey) | PASS 45.9 s with the witness: the closing quote stays on CONSTELLATION's line (screenshots/9-newspaper-reveal-fixed-b3c179b0.png). |

Records: lane/browser-r{1,2,3,4,5,6}/{SELECTION.json, LANE-SUMMARY.txt, *-report.json}; screenshots/ (15 route captures from r2 and r4, plus the r6 fixed newspaper); owner-saves/ (the two route saves, sha256 95ed8887… and 14b6271a…).

## Defects exercised on the route

| # | Where | Observed | Disposition |
|---|---|---|---|
| 1 | Dashboard, after a film reaches Release Ready | The D-12 economy journey stopped: Sim to next event disabled. | NOT a product defect. The product disables Sim while a player decision is pending (screenplay review, casting review, production command, release commitment) and explains it in the hint; the smoke and P17 journeys already commit the picture. The spec predated the P06A release-commit affordance. FIXED in the spec only (468d99b8), red at e115be4b (r1, r2, r3), green at 468d99b8 (r4). |
| 2 | Newspaper reveal | A closing curly quotation mark strands at the start of a headline line when a long title wraps ("…CONSTELLATION / ” OPENS TO A WARM RECEPTION"). | FIXED in candidate r2 (b3c179b0), red-first. Cause: `overflow-wrap: anywhere` on `.film-chronicle-headline`; when the title's last word filled the column the rule broke before the closing quote. Measured in installed Chrome: a word joiner, `hyphens: auto` and `overflow-wrap: break-word` all leave the strand; removing the rule keeps the quote on its word and lets it hang 11 px into the 38 px padding. Safe because film titles come only from src/core/data/wordlists.ts, whose longest word is the measured 13-letter one. Witness in smoke.spec.ts (line-box read of the closing quote): red at 91a5e723 (browser-r5), green at b3c179b0 (browser-r6). No gameplay rule touched. |

Visual read of the route captures (dashboard finances, assembly budget and forecast, newspaper, P18 commission panel): no overlapping text, no missing-glyph boxes, money explained where shown (runway definition, Studio Revenue share, banked versus projected, cash required versus held with the advance rule). This is the coordinator's read of screenshots, not Owner acceptance.

## Reused evidence

Full gate full-tree-r4 at e115be4b (sprint14-qualification/QUALIFICATION.md §10): zero new assertion failures; ui unit suites 2,749 passed; named inherited failures and timing limits carried. Sprint 13 Playwright season journey at 85c09bc6 and Sprint 11 cameo journey at ecbc42c9 are superseded by browser-r1 at e115be4b.

## Known limitations shipped with the candidate

See OWNER-INVITATION.md §3 for the player-facing list and ENTRY.md §5 for the record pointers. In one line each: P18 creditor priority, licence-after-cancellation, automatic cancellation on authority loss (not implemented), refusal copy and the Assembly-only front door; P17 rival guest selection and tag list; closure-deferred arm admissibility, 60 MB saves and slow probes past week 6240, no rival recovery, post-2040 release unmeasured; natural C-08; cross-engine save portability (Node-built saves may be refused by the browser import); native Unity client BLOCKED (paired at source only); eleven inherited save/load timeouts fail alone on this host; three ui 30 s timeouts under gate load.

## Final integration recommendation

**CONDITIONAL on named items.** The branch p18-season-20261028 at 468d99b8 is a functioning, reproducible browser playtest candidate with a qualified technical lineage (P16 → P17 → P18 checkpoints, audited gates, witnesses as measurements) and no known product defect on the short route. It is not ready for an unconditional promotion because the following are Owner decisions or unmeasured, not engineering gaps the agent may close alone:

1. Owner playtest verdict on the short route (OWNER ACCEPTANCE PENDING).
2. The P18 ACCEPTANCE OPEN items (p18-sprint12/RESULTS.md, p18-sprint13/RESULTS.md), especially automatic cancellation on authority loss (contract-required, not implemented) and creditor priority of TV obligations.
3. Save51 save size and probe performance past week 6240, and whether the closure-deferred arm counts as campaign evidence (sprint14-qualification/RESULTS.md).
4. Cross-engine save portability (market-law tolerance decision).
5. The eleven inherited bridge-p12-campaign-library save/load timeouts (fail alone on this host; budget change or repair is a separate bounded slice).

Draft integration PR #20 (https://github.com/HSpector1/The-Movies/pull/20) from p18-season-20261028 into main was opened at 19:45 CDT as a DRAFT with the recommendation and records pointers in its body; it is not merged and auto-merge is not enabled, as the order requires. At the time of opening the branch was 137 commits ahead of and 8 behind main (854 files). The complete individual commit history is retained on the branch and its tags (p16-technical-checkpoint-20261027, p17-technical-checkpoint-20261028, p18-sprint12/13/14 checkpoints, p18-sprint16-playtest-candidate-20261028).

## Claims

- CANDIDATE (functional pass in real Chrome): the four journeys; the launch path; save round-trip through export/import; (r2) the smoke journey with the closing-quote witness at b3c179b0, and both Owner route saves importing through the Start screen.
- FIXED (r2, red-first): the stranded closing quotation mark in the newspaper headline.
- MEASURED: browser-r1 to r4 as tabled; full gate at e115be4b.
- OWNER ACCEPTANCE PENDING: every player-facing judgement.
- NOT DONE by design: machinima editor, movie exporter, art overhaul, native build, promotion to main.
