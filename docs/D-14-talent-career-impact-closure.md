# D-14 — Talent Career Impact and Star Power: Closure & Merge Record

Owner-approved closure record for **D-14 — Talent Career Impact and Star Power V1**.

- Pre-D-14 main baseline: `e8c5696`
- Approved D-14 branch: `phase-5.2-talent-career-impact-v1` (reviewed HEAD `a3080cc` + this closure commit)
- Read-only evidence branch (kept, never merged): `audit-talent-progression-star-power @ e8c5696`

## 1. Original audit finding

The read-only talent-progression audit found that **persistent craft progression already existed**
(skills / genreExperience / workHistory via `developTalent`, live in normal play) but that
**Star Power (`Talent.fame`) was initialization-only — no post-creation write anywhere**. Repeated
Lead roles, theatrical reach, audience/critic reception, and beating forecast all failed to build
Star Power. D-14 adds the missing lifecycle hook without disturbing craft development.

## 2. Phase 1 — engine + persistence (approved)

A deterministic Star Power progression resolver (`src/core/starPower.ts`), a canonical frozen
`TalentCareerEvent` record, the release-time lifecycle hook, and `SaveFileV5` with a V4→V5
migration. Calibrated to the owner §6 targets (A −0.02, B +1.37, C +4.58, D +7.13, E −2.01);
anti-farming, saturation, role ordering, and creator==generated all proven by the harness;
adversarial review CLEAN, zero findings.

## 3. Phase 2 — UI + explainability (approved)

The canonical **Career Impact** presentation (Autopsy + reload-safe FilmRecord + ReleaseResult,
superseding the old Development Summary) and the **one reusable Talent Profile** drawer opened
identically from the Studio Roster, Assemble-a-Film, and a film's participant view. Reads only
frozen events; migrated/pre-V5 films shown honestly; accessible deltas; adversarial review CLEAN,
zero findings.

## 4. Week 86 real-save validation

The owner's real `SaveFileV5` (`studio-001`, week 86) loaded cleanly through the real loader with
no warnings and validated D-14 end to end: **9 released films, 6 recurring contributors, 54 unique
`TalentCareerEvent` records** (9×6, no duplicates), persistent craft progression (team OVR +12 to
+16; a homegrown OVR-60 lead), **appropriately restrained, reach-driven Star Power progression**
(Caroline +3.04 lead > Zach +2.30 antagonist > Aaron +1.49 support > Joe +0.67 craft; 5–7 zero
events each on commercially-invisible films → **no fame farming**), role visibility behaving as
designed, **no duplicated progression**, Autopsy/Profile agreement, and truthful save/reload.

## 5. Approved Star Power semantics

`Talent.fame` (0..100, player label "Star Power") = commercial recognition / audience familiarity /
drawing power. NOT acting skill, genre skill, prestige, critical respect, profit, salary, or film
quality. A talent may have high craft + low Star Power (or the reverse).

## 6. Exact lifecycle hook

Applied once per participant **at FilmResult creation** (release), inside the `develop`-gated block,
**engaged-only** (requires the frozen `prod.participants`). Deterministic (no new RNG). Inputs are
only realized reach, role visibility, audience response, forecast comparison, and current fame
(diminishing returns) — never profit/cash/marketing-$/salary/authored flag/standing/critic-as-primary.

- **D-14 does not alter the completed film that causes a fame change** — the film's opening/legs/total
  were resolved (step 3) from pre-tick fame; the update is applied to the post-development talent.
- **Future films read the updated Star Power** through the existing consumers (`starDraw`, opening
  reach, `knownLeadTrackRecord`) — no second fame bonus is added.

## 7. Canonical career-event ownership

`GameState.careerEvents` is the single append-only frozen ledger. Autopsy (film-centric) and Talent
Profile (talent-centric) both render from it; **the UI never calculates or mutates progression** — no
fame update, event add, resolver rerun, or state write on mount/route/repeat-open (adversarial CLEAN).

## 8. SaveFileV5 migration behavior

New games save `SaveFileV5`; V4 stays frozen + readable. `convertV4ToV5`/`migrateToV5` preserve fame
and all talent state exactly, seed an **empty** ledger, invent no history, and are deterministic +
idempotent. **Older V4 films receive no fabricated career history** — they show an honest "not
recorded" message, and the profile shows "history begins with SaveFileV5."

## 9. Reusable Talent Profile & Autopsy Career Impact

Exactly one `TalentProfileDrawer` (App-level, `openProfileId`) opened from all three origins; focus
trapped, Escape closes, focus returns to the opener; shows visible values only (never hidden
ceilings/potential/seeds). The Autopsy **Career Impact** section (after the team explanation, before
Advanced Analysis) shows every participant incl. zero-delta ("No change"), OVR + Star Power
before→after rendered independently, translated reasons, and an expandable exact-detail table.

## 10. Deterministic & M0A acceptance (precise wording)

Governed **M0A simulation behavior and the legacy outcome corpus remain byte-identical** (two-same-seed
determinism; `replay.test.ts` green), and no existing film/reception/economy/standing result changes.
**SaveFile serialization intentionally advances to `SaveFileV5`** (adds an empty career ledger + version
bump 4→5) — the same additive kind of change D-12 made with `theatricalRuns`. No Star Power progression
occurs in the governed M0A configuration. Mechanics are not altered to manufacture literal
cross-version save-byte identity.

## 11. Owner merge ruling

Approve D-14 mechanics without recalibration; approve the D-14 UI without bounded correction; preserve
the exact Star Power equation + constants, SaveFileV5 + V4→V5 migration, the canonical
`TalentCareerEvent` ledger, and the reusable Talent Profile + canonical Career Impact. Keep the talent
audit branch read-only. Merge D-14 into main.

## 12. Retained non-goals (unchanged)

Aging / age decline / retirement / inactivity decay; awards; critical Prestige as a separate field;
Momentum as a separate field; rival careers; outside offers; fame-driven contract renegotiation;
relationships; typecasting; autonomous behavior; named-character lot presence; loans/debt; new
facilities. Visible-failure Star Power loss remains part of the release outcome only.

## 13. Separate economy & Studio Run Recap findings (NOT D-14 defects)

The Week 86 audit surfaced separate economy/explainability findings that **do not block D-14 and are
not D-14 defects**: repeated modest Drama films were commercially loss-making due to discoverability
variance and commitments set above the affordable-reach ceiling; the UI's fixed-cost Runway reads
reassuring while a normal film is unaffordable; there is no run-level recap. These belong to a separate
**Studio Run Recap** milestone (design specified in the audit, read-only, needs no new core persistence)
and a separate owner economy decision. **The Studio Run Recap is a separate next milestone, not part of
this merge.**
