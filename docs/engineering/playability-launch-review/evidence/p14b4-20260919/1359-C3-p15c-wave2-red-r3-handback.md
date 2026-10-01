# 1359-C3 handback: P15C Wave 2 RED r3

**Status: staged, not run.** I ran no vitest, tsc, node or tsx. r3 makes the two fixes of [1359-D2](1359-D2-p15c-wave2-red-r2-confirmation.md) and one of its notes. Each change has its own commit in T (`studio-scratch/1359-red/tree`).

| Change | What r3 does | Commit |
|---|---|---|
| D2 fix 1: B6 | `legacy-ticks-after-freeze` logs `...routeL().ms`. r2's rename skipped this call because it followed a spread (`...route()`). I grepped every file in the RED patch and the sibling file for the removed names (`route`, `at`, the r1 constants, helpers and imports). Every other hit is a comment, a string, a parameter or a property. | 4d05b4a |
| D2 fix 2: F1 refusal | The campaign side now matches the full rule text from campaignLegacy.ts:351: `films[0] (CAMPAIGN).settledWeek must be a whole week once settled`. I chose the exact text over `releaseWeek: 0`. It names the rule F2 keeps for every other film, so any refusal for another reason fails the leaf, whatever the film's other fields. A week-0 film would only work while no other `.settledWeek` rule fires on it. The reference raises the same text, so the leaf passes at GREEN. | 25a5897 |
| D2 note: Wave R counts | The header says seven guards share the campaign and calls the 1353-C3 six "the six original guards". The "six roots" wording stays, since the seventh guard covers concepts. | 389d4b2 |

**Not changed.**
- The reference: 1355-F5 item 1 binds the phase lookup when the productions land. `reference/1359-reference-r2.patch` applies on r3 as it stands. Branch `ref-1359-r3` (b6c3395) stacks it on r3.
- The sibling patch: unchanged, and it applies on r3. `sibling-1359` is now at 30dd8f6.
- The producer: every capture comes from the founded branch, so it already has an industry.

**Counts.** The same 44 rows as r2: 37 leaves plus 7 Wave R guards, with 35 RED, 9 controls and 3 fixture-pending. Only two rows changed: the F1 leaf and B6 cite D2.

**Checks.** In a scratch index, the RED r3 applies on base ad4aaa8, the sibling patch and the reference r2 apply on top of it, and `main` (389d4b2) equals base plus the patch.

| File | sha256 |
|---|---|
| `1359-p15c-wave2-red-r3.patch` | 6a4eee26bd75eccfe71eece470ba9b1f97339aa3bbf2a62d4f166f00cf0dd41b |
| `1359-p15c-wave2-red-r3-classification.json` | ee83678bd306c6bf17eca95861a8cf2dda4299a2c21ae69d26ba8dec00d9f636 |
