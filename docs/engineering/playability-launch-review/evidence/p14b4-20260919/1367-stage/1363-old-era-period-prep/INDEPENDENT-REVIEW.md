# Independent review: V27 period-boundary test proposal

Reviewer: `/root/recovery_charter`, 2026-10-04. **PROCEED as a bounded test proposal, conditional on its explicit capture and route prerequisites.** No blocking static defect found. This is not a completed capture producer, measured RED, passing valid control or readiness to land the production fix.

## Fixed identity

| Artifact | SHA256 |
|---|---|
| `old-era-period-red.patch` | `20a0893996b4d557bcd0538da39777e2985fae1bc7ea1fb450ce94e5035b3209` |
| `tests/p13b-s8-old-era-period.test.ts` | `9a3322ba97897feea8f08e2dc8856d874a9fa2e5e1dbbc23f448a2e1570f596a` |
| `HANDBACK.md` | `1a4fdb91a39c6d00c72f8cc65a6c1fa184fe9668851b300a629d2b4ae6eb0b85` |

Verified all authored hashes, all four named live source/test hashes against published `2eaa697effc38538c37da28b486786ce267a2284`, and exact full additive patch reconstruction. No fixture contents were opened. The historical generating identity is a proposed authority for a future producer, not a capture independently reproduced by this review.

## Controls and target

The week309 control uses only the named existing V26 input and exact raw hash. It first validates public26, actually migrates to27, validates public27, and independently checks that every period has the exact literal 14-key V27 roster with no cutting field. The casts only bridge the explicit historical producer signature; they do not replace admission or claim a live Save46 state. It then calls actual historical admission and requires real paid started laboratory plans, one corresponding commitment receipt per plan, exact charge-derived cash debit and input immutability. Whole public27 admission and export/import follow; these codecs validate the historical envelope without silently upgrading it.

The week312 control additionally requires a previous-year last period for every actually charged owner, one new period at312, unchanged earlier periods, opening equal to old cash, closing equal to resulting cash, exactly the plan debits in `researchCapacity`, and all other movements zero. The period key assertion independently requires all 14 historical kinds and explicitly excludes both Save41 termination and Save46 demolition refund. Noncharged owners must remain equal. No period, cash, clock, quote, receipt or plan is manufactured to satisfy the premise.

The intended RED is the new-period key roster: the uncorrected current constructor would append the later kinds on an otherwise admitted historical plan charge. This assertion occurs before final public27 validation, so the wrong-key failure is not automatically hidden behind an old-reader refusal. Positive paid-plan/cadence/period assertions must establish the premise first. Their failures are control/prerequisite failures, never intended period REDs. Run the RED on the explicit historical-admission layer with the uncorrected period constructor, not an incoherent shape-only build whose old readers already fail.

The exact debit oracle sums the actual committed plan costs, and equality with approved quotes plus full save validation supplies their independent owner checks. This test targets era/period/accounting continuity, not a new independently calculated laboratory price or quote law. The same-period leaf does not isolate the new forbidden-money-kind guard or live defaults; those remain integration checks.

## Capture provenance and limits

The second leaf requires a new absolute capture root and independently pinned manifest, producer, archived-source digest and gzip hashes. It binds the manifest to historical head `ce6945d58257f70c1b222a8c00e06038db73f6e4`, V26, input309, exactly three ticks, output312, the named raw input hash and fixed capture basename. It verifies compressed/raw output hashes and admits the resulting public26 envelope before migration. A self-authored matching manifest alone does not supply independent provenance; the required environment pins must come from reviewed generation evidence.

The handback proposes an unchanged archived-source three-tick route and exclusive scratch output `S/1363-old-era-period-capture-01`; it does not contain a runnable producer or establish the resulting state. No capture search, extra ticks, cash repair or fake V27 research generation is authorized by this review. A future producer needs its own source/archive/identity and exclusive-output review, genuine validation at each boundary and preserved failure report. Whether actual old ticks leave the required previous-year period and affordable plan remains unmeasured. Missing payload/pins and absent affordability are prerequisites, not waivers or coverage.

The original V26 direct-admission smoke stays a smoke; this additive file does not claim that its result is a valid V26 save. Explicit historical-mode updates to existing callers remain a separately reviewed integration responsibility. No fixture replacement, old assertion weakening or historical failure deletion is included.

No runtime, Node, tests, typecheck, fixture payload read, active recorded-log inspection, source/index edit or new agent. Only lightweight hash/diff and source inspection. This report is the only test-folder write.
