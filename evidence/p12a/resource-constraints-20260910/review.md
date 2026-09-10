# PRF-007 controlled resource intervention — independent source proof

Operation: OPS-P12A-LIVING-HOLLYWOOD-20260910-05.
Reviewer: recovered_product_evidence, read-only toward both worktrees. This is a bounded correctness probe, not a product critique, native proof, or new critique round.

No previously executed equivalent of all three PRF-007 interventions was found in the named P12 tests, P12 evidence, or surviving engineering reports. `tests/p12-lifecycle.test.ts` exercises lifecycle causality and corruption, but does not contain these three controlled withdrawal/restoration branches.

## Result

All four arms completed through absolute week 26. Each was independently repeated from a fresh same-seed world; the full trace and final state matched exactly between repetitions. All four final states passed the unchanged strict `makeSave` and `exportSave` authorities. Every arm preserved player RNG, six unique film credits and six career events, exact employer-at-gate joins, a single costed announcement and release receipt, and reconciled project and signing costs.

| Arm | Actual gate and intervention | Restoration | Observed first film |
| --- | --- | --- | --- |
| Control | Normal tick progression, seed `r05-prf007` | None | Announced week 3, released week 11; original director; critics 55.78556636938961 |
| Cash | At week 3, before greenlight, place the entire $25,247,282 available balance under a synthetic external hold | Return exactly that held amount at week 8, once; net fixture cash delta zero | No funded announcement or release during hold; announced week 8, released week 16; later marketing and box office differ |
| Required director | At week 3, before greenlight, synthetically expire and withdraw the original director from the available people pool | Original person returns to the free-agent pool at fixed week 8, with no free contract or forced substitution | Normal staffing law hires `t-dir-00` at week 3 and pays $86,457 signing; the replacement has the actual director credit. Release week remains 11, but critic score changes to 56.68761334114303 and box office changes. The removed person is not impossibly credited |
| Capacity | At week 5, after the film is funded but before rehearsal acquisition, temporarily reduce its soundstage's available capacity from 1 to 0, retaining facility identity and operating charges | Restore its original slot at week 10 | Film holds at remainingTicks 7 with `facility-capacity / soundstage / rehearsal` blocker. Funded announcement stays week 3; release moves from week 11 to week 16 |

There is no arm with both the unchanged baseline release date and unchanged result. The director arm demonstrates lawful paid replacement rather than a delay; removing a person does not imply that a studio with another affordable qualified director must wait.

## Reproduction and binding

Run `node /tmp/p12a-prf007-u7qxj9fd/run.mjs` to bundle the current local core and execute the recipe. Reproduction uses the source present at that later invocation; retain the original binding when quoting this completed run.

The completed result is `report.json`; the exact harness is `probe-source.ts`; the executed bundle is `probe-bundle.mjs`; `source-before.json` and `source-after.json` bind all 73 core TypeScript files. `bundle-inputs.json` records actual esbuild inputs. No bridge server, engine process, Unity, or native input runner was launched. The probe uses `initializeHollywood(generateWorld(seed), 'fresh')` and ordinary `tick(state, {develop:true})` calls after the explicitly identified fixture changes.

TS HEAD: `6827293985a1375e8cefed745fbc4227a01aeb53`.
Core before/after manifest SHA256: `7ecc9233290fec7282dcbfa7ef5a77074b420d8091d88d607c90cfeb9aa9bf88` (unchanged).
Probe source SHA256: `891cc4ebb469c4f4c4721bf43297d99a4e2c8985439deefaedc17a537d342f7d`.
Executed bundle SHA256: `c8ceec2592266dfaca9a1b9ca38e1aae5b74c343b2f3993b64c8c54de55ba836`.
Report SHA256: `79a1410595db6d27a30fa4a7b7cea3b25228d129997b8d1567d81f4e0659b5c8`.

## Exact limitations

The withdrawal controls are synthetic counterfactual fixture edits, not saved-game transactions or production features. Intermediate withdrawn states correctly fail existing strict save validation: cash is temporarily unreconciled; the absent canonical person is missing; zero soundstage capacity is invalid saved configuration. No validator was weakened. Restored final states pass the original strict authorities.

The talent fixture shortens only the controlled original employment interval to week 3, invokes the existing expiry producer, and temporarily removes the original person. It does not authorize a three-week employment product, rival firing, or a new labor law. The actual replacement, contract, signing debit, funded package, release, credit and career events are produced by normal core code. Restoring the original person's market availability at week 8 does not force the studio to discard the paid replacement already making the film.

Cash is withheld before its funding gate; already-paid production expenditure is not erased. Capacity is withdrawn before acquisition, not after a valid reservation. This probe does not assert behavior for arbitrary corruption of an in-flight locked production company or an already-held resource.

The first local probe attempt incorrectly expected blocker kind `capacity`; current shared authority actually returns `facility-capacity`. That harness assertion failed before the capacity result was certified. The original failed attempt remains in `attempt-01-report.json`, `attempt-01-probe-source.ts`, and `attempt-01-probe-bundle.mjs`. Only the temporary harness assertion was corrected; no production source changed. The completed second run is the result above.

This evidence supports the specified source-level anti-facade intervention check. It does not establish native Gate A/B completion, large-world endurance, named campaign persistence, or Owner acceptance.
