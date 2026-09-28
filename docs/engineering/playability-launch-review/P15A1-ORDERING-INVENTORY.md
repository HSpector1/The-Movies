# P15A.1 — Release-order dependency inventory

Parent source preparation at published2e1543ff on2026-09-28, while Q25's test-only
compiler correction is reviewed. This supplements the reviewed release-seam notes;
it neither changes production nor selects an implementation. No project execution.
P14 verification remains active. Canonical P15 reconciliation7.1–7.3 atc5b52b4
requires an actual common release batch, assessed before verdicts, with self-exclusion.
Its class-C classification permits concrete charter tuning; the user's three settled
ranking/disclosure choices remain separate from these coefficients.

## Reads that a batch extraction must preserve or explicitly change

| Owner and current route | Observable dependency | Consequence for a future extraction |
|---|---|---|
| Player tick operation advancement, queue/physical admission and completions, then release collection | Actual zero-remaining set must equal the admitted commitment witness. Queue admission uses arrived week; release uses the week being advanced. | Freeze actual admitted identities once. Do not predict a batch from announcements, rerun operations, or collapse the two week conventions. |
| Player reception and subsequent standing/broadcast, before industry call | Reception uses original talent/market/start standing and pre-advance locked set bindings; results and ledger are still locals. | Keep player input snapshots and ascending-ID sim-stream draws. Moving the industry call is not by itself permission to expose the player's new result to rival decisions. |
| Industry call receives admitted state plus researchAdvance.technology | It does not receive the player's newly assembled releasedFilms/standing/cash locals. | Preserve this explicit input boundary; do not accidentally feed a partially assembled player state to staffing or forecasts. |
| Rival business loop | Sound purchase, staffing, physical plans and research precede decide, operateStage, commitment and managed advancement for each business. Evolving Hollywood/talent/technology/physical-plan objects feed later businesses. | A two-pass design must account for these cross-business reads instead of assuming independent owner preparation. |
| staff and decide availability | busyTalentIds reads all live player/rival companies, writing and active research; prior businesses have already advanced and removed their releasing production. | Deferring a verdict may be harmless to some reads, but deferring removal of an actually released company changes availability. Conversely early removal must retain all production identity authority. |
| Rival decide forecastHistoryForOwner | Director credits span all current industry films; owner segment history uses that owner's released results. Earlier businesses' same-week films have already entered h.films. | A delayed-verdict batch must preserve or explicitly specify this chronology. Credits need genuine admitted identity/genre/participants; no fictional completed result may be fabricated as a placeholder. |
| Rival decide identity allocation | persistedProductionIds walks production, project, workflow, commitment, film, run, technology, receipts and other retained roots. | Keep every released identity reserved through a split; do not permit reuse during an intermediate state. The existing redundant roots require a complete proof for any narrower carrier. |
| Rival result/run/accounting | Each owner's sorted releases resolve with startStanding captured for that owner; result updates standing and film/run arrays, appends globally sequenced receipts, then run payments, drift, payroll, overhead, facility Opex and script completion occur. | Deferring only verdicts changes receipt interleaving unless the eventual protocol addresses it. No claim of byte-preserving reordering is established here. |
| Career consequence application | Parent combines player records only when develop:true with every rival release, sorts production IDs, then applies shared growth to industry.talent. | Preserve this one application and its source talent order. No early result-dependent growth may feed same-week reception. |

Reader-specific qualification from independent review: `staff(state,h,...)` and
`decide(state,h,...)` retain the original admitted state's technology/physicalPlans;
only their explicit h/talent arguments evolve. Sound/research/physical-plan and
production-technology calls receive the evolving locals explicitly. A future split
must retain each reader's actual boundary, not assume all later-business readers
observe every evolved root.

Player reception consumes the existing sim RNG in sorted production order; rival
reception and discoverability use derived per-production streams. Neither implies
that changing decision/receipt order is safe. Old theatrical runs consume frozen
schedules: a market assessment must affect only new launch results and their newly
opened runs. Future shared assessment permutation tests must distinguish invariant
pressure from any separately specified legacy ordering of IDs and receipts.

## Open implementation work

A concrete charter must choose an internal protocol that carries actual admitted
batches and immutable input snapshots across these dependencies, without scheduler
replay, guessed releases or fabricated results. It must enumerate any deliberate
chronology change with controls and make the pressure-absent path preserve the
accepted behavior. The lawful reach metric, per-studio/genre/window clamp and
box-office factor still need exact definitions and transparent explanations.
Domain-local phase identity/precision, boundary migration and cold-start history
belong in that same slice. This inventory is not a new whole-repository phase
catalogue requirement or a new product-approval request.

## Source identities

The relevant tick sections and complete industry advancement/staff/decide owners,
complete industryCareer and releaseCareers, and named employment/identity producers
were read. These pins locate the source; they do not assert full semantic qualification
of unrelated portions of large files.

| Path | Bytes | SHA256 |
|---|---:|---|
| src/core/tick.ts | 62,182 | `cd487a1b68f1b95582895ae73a9d9fb0c1d0300a2e1a212b0d83ae6bce30dcb9` |
| src/core/hollywoodTick.ts | 30,644 | `4f5156c4cf47991936f2dd5b4a6ade9bf81609e27161fe40eb3d07d968614436` |
| src/core/industryCareer.ts | 1,433 | `088a95368557cd893a4c93d90b403a9c3debf95710fcc4d055c01726e81e2d7e` |
| src/core/employment.ts | 27,743 | `7b0ffe9795014664dfee6e6ea57500cd5f28ac0e0fbb711e00ff964bca2d5c9d` |
| src/core/productionIdentity.ts | 10,519 | `34a9ca45c58bf87f3af24c4d0717d6efd64a8cc3eae1b85b19761ae6ed023eb5` |
| src/core/releaseCareers.ts | 4,411 | `b8050c8a70b165e42ed2841bbcfd99eb27ff5986529aa94dc511e5bd196ee965` |
