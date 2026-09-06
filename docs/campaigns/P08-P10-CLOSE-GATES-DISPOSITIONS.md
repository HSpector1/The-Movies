# P08–P10 CLOSE-GATES-01 — gate table, HID classification, requirement dispositions

**Authorization:** `OPS-P08P10-CLOSE-GATES-01` (continuing `OPS-P08P10-20260905-01`).
**Status line (this document is appended, never rewritten; the newest block wins):** see §0.

## 0. Current status

`<<STATUS — filled at the end of the run>>`

## 1. Correction of the prior readiness claim

The morning report of 2026-09-06 called the P10 person route "TECHNICAL KEEP / combined candidate
READY". Current Ops rejected that claim: the required interaction gates (world-body real click,
Locate real outcome, post-Load behaviour), the Profile contract actions, the career/result and
facility-history routes, the P09 real-input regression on the final pair, and the Owner-profile
copy migration were incomplete or unproven. That intermediate candidate
(`~/Desktop/P10-Person-Route-Candidate-af8c19c-fcfcbb8`, player `a8f4390c…`, engine `3b9e3432…`,
projection 18) and its failed/partial proof (`evidence/P10-real-input-journey`, 25/33) are
PRESERVED unchanged. Everything below is the correction.

## 2. The eight non-passing real-input steps — exact classification

Retained report `hid-20260905T223535Z` (candidate `af8c19c-fcfcbb8`), 33 steps, 8 non-passing.

| Step | Action (retained report) | Classification | Cause (from evidence) | Resolution |
|---|---|---|---|---|
| 7 | inspector card after 4 world-body clicks | `<<PENDING PROBE>>` | the four real clicks at the published AABB's upper 40 % landed on the Production/Post building (screenshots 002–005: two on the roof, one on the left UI card, one on the wall); the lot selection read "Production / Post" | see §2.1 |
| 8 | click `person-inspector-profile` | cascade of 7 (OBSERVATION: the card never stood) | — | — |
| 9 | wait `profile-open` | cascade of 7 | — | — |
| 10 | OPEN PROFILE reached the exact person | cascade of 7 | — | — |
| 11 | click `profile-back` | cascade of 7 | — | — |
| 24 | wait `located` (`m.selectionStableId === bodyId`) | **OBSERVATION / ASSERTION (driver)** | the driver read a top-level `selectionStableId`; the host publishes it inside `diag`. Screenshot 022 shows the product DID locate: Roster hidden, Miriam selected with the ring, camera inspecting, "◀ BACK TO STUDIO" offered | driver reads `diag.selectionStableId` + `diag.suspendedForLocate`, then presses the real BACK TO STUDIO and asserts the Roster REOPENS with its filter + selection — **PASS on the final pair** (`hid-20260906T081123Z` steps 26–28) |
| 25 | LOCATE selected the exact body | cascade of 24 (same assertion) | — | PASS (as above) |
| 32 | click `studio-menu-resume` after Load | **PRECONDITION (driver sequencing)** | after a Load the Studio Menu stays OPEN reporting "Studio loaded." with Resume offered (the P04A.1 menu law; screenshot 029). The driver's post-Load predicate ignored the open menu, then clicked MENU again — toggling it CLOSED — and looked for Resume | driver waits for "Studio loaded." then presses the real Resume and asserts the menu closed + world live — **PASS on the final pair** (steps 34–36) |

### 2.1 World person-body click (steps 3–7)

`<<PENDING: pick-probe classification — filled from Tools/p10-run-body-probe.sh evidence>>`

## 3. Gate table (PASS / FAIL / BLOCKED / NOT RUN — never converted across evidence classes)

`<<FILLED AT THE END OF THE RUN>>`

## 4. Requirement dispositions — the READY-extension rows (traceability matrix)

`<<FILLED AT THE END OF THE RUN>>`

## 5. Corrected Real-Builder disposition (execution order §5.4)

RETRACTED: the earlier sentence "Real-Builder obligation — satisfied in P09 (real-HID Build 30/30 …)".
That evidence proves the **REAL-INPUT BUILD FLOW** (a human-like input path commits construction).
It does not touch the **REAL BUILDER SYSTEM** (authoritative worker identity / capacity /
productivity affecting construction under approved gameplay rules), which the execution order §5.4
preserves as **P09-REQ-039 — DEPENDENCY-BLOCKED** (worker taxonomy / TypeScript capacity /
P10-compatible people authority; Owner/system decision). No Builder formula or worker taxonomy was
implemented in this stack; decorative site workers are not Builders. This broader deferred
requirement does not block technical KEEP for the narrower authorized stack.

## 6. Compatibility boundary (observed on the real engines, `scripts/p10-compat-boundary-probe.sh`)

| Engine | Checkpoint | Result |
|---|---|---|
| projection-17 (`5185e3a2…`, the P09 CORE candidate) | projection-17 (`18de162d…`) | serves; session preserved |
| projection-17 | projection-18 (`ea5d645f…`) | **refused at startup**: `checkpoint.schemaId: does not match the running TypeScript bridge schema` (fatal; nothing is served, nothing is loaded) |
| projection-17 | projection-19 (`6a2c01fe…`) | **refused at startup** (same reason) |
| projection-19 (`189326b6…`, this candidate) | projection-17 | accepted: migrated + re-projected; served schema projection-19; **fresh session id**; week preserved |
| projection-19 | projection-18 | accepted the same way |
| projection-19 | projection-19 | serves; session preserved |

Layers, distinguished: **durable save version** V18 (inside every checkpoint above, identical across
projection 18 and 19 — a save version alone never decides compatibility); **bridge protocol** 4
(unchanged); **projection/schema identity** (the checkpoint envelope's `schemaId`) — the ONE
boundary: an engine serves only its own schema and every LISTED prior identity
(`SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS`, nineteen literals), migrating prior ones forward with a
fresh session; it refuses an unknown (newer) identity outright. **Runtime-checkpoint envelope**
v1 (unchanged). **Engine/player pair**: the player refuses a mismatched contract
(`RequireProtocolCompatible`), so a player only ever pairs with an engine of its own schema. Older
candidates are NOT patched; each keeps its own compatible profile copy.
