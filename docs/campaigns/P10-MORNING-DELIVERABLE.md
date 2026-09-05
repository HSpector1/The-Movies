# P08–P10 OVERNIGHT — MORNING DELIVERABLE (draft; hostile-review + final-candidate lines fill last)

STATUS: **COMBINED CANDIDATE READY — P10 PERSON ROUTE TECHNICAL KEEP FOR AUTHORIZED READY SCOPE. OWNER ACCEPTANCE PENDING.**
(Not "combined candidate sealed": the material contract-action extension is dependency-blocked, and a
real-HID P10 people journey + full career-link visual capture remain as the fullest proofs — see below.)

## WHAT THE OWNER CAN NOW DO (all read-only presentation; nothing hires, assigns, or advances time)
- Select a person on the lot → a compact inspector card ("who is this, what are they doing?") with no
  camera move on select; OPEN PROFILE → that exact person's retained Profile; LOCATE only when a body
  is genuinely on view.
- Read a full Profile: perceived discipline OVR (never Movie Quality/fit/potential), a potential BAND
  always marked a scouted estimate, proven-vs-capable, specialties, Star Power (kept distinct from
  ability, never a rank), work ethic + its one effect, the contract (terms/guarantee/termination/
  renewal, or a labelled market rate), and the recorded filmography.
- Open the governed Roster from the People strip's COMPANY header: 60 people, filter by role /
  availability / attention / contract-horizon, search name-or-specialty, sort four ways, select a
  person → OPEN PROFILE / LOCATE; filter/sort/search/selection survive Profile → Back.
- Cross from a Profile to that person's P08 studio history and back; cross from a P08 history person
  record into their Profile and back.

## P09 FINAL-PAIR REGRESSION (addendum item 4)
Re-verified on the projection-18 P10 player: 6/6 P09 scenarios, 69/69 assertions — ordinary boot →
correct bare lot, Build placement, office rising, migrated-endowed carry, reconnect (same ids),
Save/Load mid-construction. Evidence `Evidence/P09-on-P10-reverify/`.

## P10 TEST / REVIEW RESULTS
- Unity EditMode 872/872. CF-09 generated-contract seal PASS (projection 18, `6c26f13e`).
- Visual Oracle (packaged player): `p10-person-inspector` 22/22 (1440×900, 1920×1080, 1200×700);
  `p10-person-history` 9/9. Evidence `Evidence/P10-Oracle-Conv/`.
- Cross-stack hostile review: 26 raw → **15 confirmed / 11 refuted, no BLOCKERs**; 4 MAJOR + actionable MINOR/NOTE remedied; returned to the same reviewer → **5/5 RESOLVED**. Verbatim in `P10-HOSTILE-REVIEW-CORE.md`.

## MIGRATION AND REAL-PROFILE PROTECTION
- The migrated P07 endowed profile carries to projection 18 with authored art intact, people present,
  contracts/profiles correct (p09-migrated-endowed-unchanged 13/13 on the P10 player); reconnect and
  Save/Load survive. Prior schema `18de162d` (projection 17) remains supported; the P09 CORE candidate
  (projection 17) is untouched and cannot open a projection-18 save (protocol/schema gate).
- A full path-A pass on the ACCEPTED OWNER PROFILE COPY (Save/Load/reconnect/deep-links on the owner's
  own d949003e-derived copy) was NOT run: this program treats the owner's durable profile as read-only
  and has no authorized private copy of it. The migrated-endowed fixture is the representative accepted-
  profile carrier. OWNER: provide/authorize a profile copy for the full path-A pass if desired.

## IMPLEMENTED / UNPROVEN / BLOCKED / DEFERRED
- IMPLEMENTED AND PROVEN: inspector card, retained Profile (all sections), governed Roster, person↔
  history adapters, no-hidden-info law, same-name distinctness, presence-honest Locate.
- IMPLEMENTED BUT UNPROVEN (visually): the full CAREER row → exact P07 result deep link (EditMode-proven;
  needs a careerEvents-populated save to capture — the accepted fixtures release films without frozen
  career events, so only the honest partial-provenance state is oracle-captured); a real-HID P10 people
  journey (world→inspector→Profile→Roster→filter→Back→Locate→Save/Load) — the oracle proves the visible
  route, HID is the fuller §11 proof.
- DEPENDENCY-BLOCKED: material contract actions (renew/release) — no `renewContract`/`releaseContract`/
  `terminateContract` bridge command producer exists. The Profile shows the contract read-only.
- OWNER-BLOCKED: Star badge / Star threshold (not produced; Star Power shown as a value + definition).
- DEFERRED / existing authority: R2 shortage→market and R3 facility recruitment reuse the Casting
  building's existing signActor workflow.

## REAL-BUILDER OBLIGATION STATUS
P09's real-Builder obligation was satisfied in P09 (real-HID Build flow 30/30 on the P09 candidate,
d41c0d4b) and re-verified at the oracle level on the projection-18 P10 player (Build placement 12/12).

## EXACT REFS (fill final)
- TS product `af8c19c` (docs/fixtures tip `05139c1`) | Unity product `68d20c1`
- Player exe `1212fe63…` | Assembly-CSharp `1cbdf382…` | engine `3b9e3432…` (== the final committed TS engine, byte-verified) | generated contract `6c26f13e…`
- Save V18 / protocol 4 / projection 18 (schema `ea5d645f…`)

## INTERMEDIATE CANDIDATES AND COMPATIBLE SAVES
- P08 core: `~/Desktop/P08-Core-Technical-Candidate-8a23cb3-64dab80/`
- P09 core (projection 17): `~/Desktop/P09-Core-Technical-Candidate-fee206f-8f30d0e/` (player d41c0d4b, engine 5185e3a2)
- P10 person route (projection 18): `~/Desktop/P10-...` (this delivery)

## COMBINED CANDIDATE PATH + ONE VERIFIED LAUNCH COMMAND
- `~/Desktop/P10-Person-Route-Candidate-af8c19c-68d20c1/` — launch:
  `"$HOME/Desktop/P10-Person-Route-Candidate-af8c19c-68d20c1/playtest.sh" endowed`

## SHORT OWNER PLAYTEST (convenient saved entry points)
1. `playtest.sh endowed` — a full studio, 60 people. Click a person on the lot → inspector → OPEN
   PROFILE. Open the Roster from the COMPANY header (top-right strip) → filter to Craft, sort by
   contract → pick someone → OPEN PROFILE → Back (filter kept).
2. `playtest.sh firstfilm` — a released film. Open a credited person's Profile → STUDIO HISTORY →
   Back. In History's PEOPLE tab, pick a person → OPEN PROFILE.
3. `playtest.sh barelot` — the bare founding lot; confirm the P09 Build flow still opens.

## CAMPAIGN / MAIN REFS UNCHANGED
- campaign/living-lot-ts `2753e18b`, campaign/living-lot-client `c4c65db4`, main untouched (re-checked).

## OWNED PROCESSES STOPPED
- All engine/player/oracle processes are per-run and torn down by their harness traps; no lingering
  keep-awake owned by this program.
