# Sprint 20 — independent review and dispositions (2026-10-29, 13:12 CDT)

Reviewer: one independent Opus 5.5 read-only agent, briefed on the engine commit aa4c335f (parent edb1cee4) and the Unity counterpart 622071e (parent 8290f2c), the Owner's decision E and §6 text, and the program rules. It read code only (`git show`, `shasum`, `grep`) and ran no test. Verdict: NEEDS CHANGES. Its own measurements: the two generated DTO files are byte-identical (sha256 2e6cae58…), the eight EditMode fixtures match their manifest, no projection-69 literal remains in the Unity client, attestation v2 untouched, the schema id in the generator test equals the regenerated manifest's. FIX-1 is engine 777b00bc and Unity 08e335fc (RESULTS.md).

## Findings and dispositions

| # | Class | Finding (reviewer) | Disposition |
|---|---|---|---|
| B1 | BLOCKING | Seventy assertions in 35 other Bridge test files still pin projection 69 (and one pins the old schema id); the engine suite is red at aa4c335f. | CONFIRMED by lane sprint20-r1 (bridge-tests stage). FIXED: every pin derived to 70 and the new schema id, exactly as the projection-69 bump did. |
| B2 | BLOCKING | The outgoing projection-69 identity sha256:6cdb8065… is not registered in SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS, so a durable checkpoint written by the Sprint 19 build would be stranded; the file's own rule says register it with a genuine capture in the same commit. | FIXED: registered as `projection-v69`; the genuine capture ran on a detached sparse snapshot of edb1cee4 (capture69.ts, receipt OUTGOING69-RECEIPT.json, fixture tests/fixtures/bridge/genuine-projection69-runtime) and the runtime-checkpoint test pins its hashes; the relationships test's key lists gain OUTGOING_69. |
| B3 | BLOCKING | `confirmation` is `Required.Always` in the generated DTO, so every hand-built `new StudioBridgeIntentOption` in the Unity runtime and tests serializes to a throw. | FIXED: all 40 sites set `confirmation = StudioBridgeIntentOptionConfirmationValues.None` (the runtime's quote-commit options, every test option); STATIC-UNRUN. Unity FIX-1 is 08e335fc; its text says the regenerated p11 fixtures were byte-identical, which is wrong: six files differ in embedded timing fields and the manifest's derived hashes only (RESULTS.md). |
| B4 | BLOCKING | `cancelPhysicalPlan` is published under `physicalPlanAction` and stays a one-click destructive memo button, against §6 and the commit text. | FIXED: the derivation reads the engine verb beneath the kind too (CONFIRMATION_REQUIRED_ACTIONS); `cancelResearch` (keeps every verified result) stays one gesture and is put to the Owner. |
| S1 | SHOULD FIX | No engine test pins the derivation. | FIXED: tests/astra20-intent-confirmation.test.ts (the kind table, the plan verb, the founding world's options, the schema enumeration). |
| S2 | SHOULD FIX | The arming survives a hidden, covered or no-longer-rendered memo. | FIXED: the arming also requires the option in `lastRenderedWorkflowOptions`; `HideMemoResearch` (both the hide and the cover paths) disarms. |
| S3 | SHOULD FIX | The next-action band reserves one button's height; armed, the detail and two buttons clip. | FIXED: `ArmedConfirmationExtraHeight` joins the band's measured reservation. |
| S4 | SHOULD FIX | A `required` value on the research or release special paths is dropped silently. | FIXED: the button is withheld with a visible note and an error log (fail loud). |
| S5 | SHOULD FIX | The one-command-path source scan reads only StudioBridgeClient.cs; no test covers the new code. | FIXED: the scan reads the partial too (exactly one `SubmitPlayerWorkflowIntent(` call, no `TryCreateIntentPost(`); StudioConfirmedIntentTests.cs (EditMode, reflection, STATIC-UNRUN): only a required option takes the path; arming sends nothing and binds the identity; a snapshot move, a non-rendered or withdrawn option and a hidden memo disarm; Keep sends nothing. |
| S6 | SHOULD FIX | The engine commit message claims to close the Sprint 15 ACCEPTANCE OPEN item and does not say what ran. | FIXED in the FIX-1 commit text and RESULTS.md: the contract half landed; the item stays ACCEPTANCE OPEN until compile, EditMode and PlayMode on a capable host; what ran is listed. |
| S7 | SHOULD FIX | Owner rulings needed for the one-click `takeLoan` shortcut, `commitPictureToRelease` ("Irreversible.") and `cancelResearch`. | OWNER: recorded in RESULTS.md as the Sprint 20 question with a recommendation. |
| N1 | NIT | Armed in the classic memo, the detail prints twice (the memo's own detail line and the armed one). | ACCEPTED as is: the band has no detail line of its own, and one repeated sentence beside a destructive confirm is the lesser fault. |
| N2 | NIT | Keep is disabled when actions are. | FIXED: Keep is always enabled (disarming is local). |
| N3 | NIT | The proof seam records Confirm under the plain label and never records Keep. | ACCEPTED: the seam reports what the memo OFFERED (one intent); its label text is not a contract. |
| N4 | NIT | With an empty detail, Confirm lands where the arm button was, so a double click confirms. | FIXED: Keep takes the first slot, Confirm the second. |
| N5 | NIT | Runtime-built options left `confirmation` null. | FIXED with B3. |
| N6 | NIT | `resolveDeferred` hard-codes 'none'. | FIXED: it calls `intentConfirmation(pending.kind)`. |
| N7 | NIT | The disarm note overwrites `feedback`. | FIXED: it fills an empty line only. |

## What the review did not cover

It ran nothing; the lane and the local runs are the coordinator's evidence. It could not compile or run the C# (no editor on this host), so every Unity disposition above is STATIC-UNRUN until a capable host runs EditMode and PlayMode.
