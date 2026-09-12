# Adversarial Verification — LENS: Authority & Direction Consistency
## Target: out/phase2/finale-endless.md (Section 11: 2040 Finale + Endless Sandbox)

**Verdict: VERIFIED_WITH_CAVEATS**

Method: re-pulled every authority citation the analysis relies on directly from
`authority/P15-PACKAGE.md`, `authority/P15-BUILDER-ANNEX.md`, `authority/P13-P15-OWNER-RULINGS.md`,
`authority/P13-P15-LONG-RANGE-ROADMAP.md`, and `accepted-592e926/{bridge/runtime/campaign-library.ts,
bridge/schema/bridge-schema.ts, docs/c2-planning/00A-OWNER-RULING-TIME-MODEL-2026-08-18.md}`; cross-read
the phase1-verify `_DIGEST.md` entries for `comp-finale` and `orig-ending` (the two evidence files this
task names) to see whether the analysis actually absorbed the corrections it claims to have absorbed;
and cross-read three sibling phase-2 analyses (`player-failure.md`, `rival-failure.md`,
`boundaries-corrections.md`) that independently touch the same Owner-direction-E supersession question,
to test whether the analysis's reading is idiosyncratic or a shared, defensible one.

---

## Problems found

### 1. (MEDIUM-HIGH) Overstates what Owner Direction E actually settles in P15-PACKAGE §12.3/§16 — converts a still-pending design *recommendation* into declared "law"

**Where:** §4.8, the paragraph beginning "One necessary correction to a P15-PACKAGE §16 clause..."

**The claim:** the analysis says §16's *entire* "PRELIMINARY RECOMMENDATION: apply the same...
predicates... to player and rivals... neither gets a secret pre-terminal rescue" sentence "is CONFIRMED
as still correct, while the row's framing as merely 'preliminary' is SUPERSEDED BY OWNER DIRECTION E —
it should be read as **settled symmetry-of-guards law, not an open recommendation**."

**Why this is wrong (verified against the actual package text):** §12.3 (the section this same clause
is duplicated from, verbatim: authority/P15-PACKAGE.md:460-465) contains **two textually distinct
claims** that the analysis collapses into one:

1. A tagged **`PROJECT AUTHORITY VERIFIED`** fact: "P12 permits rival failure while protecting the
   player campaign from mandatory hard-bankruptcy game-over." This is the one and only clause Direction
   E actually names and revises ("revises the earlier protected-continuity ruling"). Calling this
   SUPERSEDED is correct.
2. An **un-tagged, explicitly hedged "recommendation"**: "the same warning/distress/recovery/dormancy
   predicates and equivalent typed remedy capability families... for player and rivals; only
   presentation and selection mechanism may differ." The package brackets this with "**Only an
   Owner-approved policy may activate these states**" (authority/P15-PACKAGE.md:463) — i.e. this half
   was never ratified law in the first place, and none of Owner Directions A–K (the DIRECTION block in
   the task's own PREAMBLE) mentions predicate symmetry, remedy-family parity, "no secret rescue," or
   decision-UX richness at all. Direction E is entirely silent on it.

Declaring that this second, still-hedged clause "should be read as... not an open recommendation" is
exactly the pattern `P13-P15-OWNER-RULINGS.md` §6 (Open-decision discipline) forbids: *"A later design
report may present options, consequences, dependencies, and recommendations, but it may not silently
convert an open choice into package law."* Direction E settles *whether* the player can ultimately fail;
it says nothing about *whether the failure ladder must be predicate-symmetric with rivals*, which
remains, in the package's own words, a recommendation awaiting an Owner-approved policy.

**Consequence for §6 (Remaining Owner decisions):** because the analysis treats predicate symmetry as
already settled, it never lists "whether the exact remedy/predicate structure must be fully symmetric
between player and rival, or may differ beyond presentation/selection mechanism" as a remaining
decision — but per §12.3/§16 it plainly still is one. This is a second-order effect of the same error:
an open choice quietly disappears from the open-choice list because the text treats it as already
closed.

**Is this idiosyncratic, or shared?** Two sibling analyses (`player-failure.md` §2, `boundaries-corrections.md`
row 1 of the corrections table) touch the identical §12.3/§16 supersession question and are visibly more
careful: `player-failure.md` frames its adoption of the symmetric ladder under its own "Adopts/Rejects/Owns"
heading (an analyst choice it is recommending, not a claim the Owner already ruled), and
`boundaries-corrections.md` writes "the *pre-terminal* symmetry principle and remedy-family law... **survive
unchanged** — only the terminal boundary reverses" (survives = was never contested, not = now settled
law). Neither sibling goes as far as finale-endless.md's explicit "not an open recommendation." The
practical design conclusion (keep building on symmetric predicates) is one this report shares with its
siblings and is reasonable to keep working from — the defect is specifically the stronger, unhedged
"settled law" framing and the resulting silent drop from the open-decisions list.

**Corrected statement:** Direction E settles only that the player studio can ultimately fail and go
bankrupt (revising the `PROJECT AUTHORITY VERIFIED` no-mandatory-hard-bankruptcy fact), with meaningful
warning and recovery first. The adjacent §12.3/§16 "same predicates, no secret rescue" text remains an
unratified, uncontested *design recommendation* — nothing in Directions A–K approves or revises it, and
the package's own "Only an Owner-approved policy may activate these states" guard still applies to it.
Label the §16 row **QUALIFIED**, not "settled... not an open recommendation," and restore "confirm the
exact player/rival remedy-predicate symmetry (beyond presentation/selection mechanism)" to the §6
remaining-Owner-decisions list.

---

### 2. (LOW) Two off-by-a-few-lines citations against `bridge/runtime/campaign-library.ts` (verified directly against the accepted-592e926 file)

- §4.9 cites `campaign-library.ts:17` for `CampaignRecord={id, label, revision, checkpointJson}`. The
  actual type alias is on **line 18**; line 17 is `CAMPAIGN_LIBRARY_MAX_RECORDS=32`. Substance (the
  shape has no status/frozen field) is correct.
- §4.3 cites `campaign-library.ts:44-48` for the `dateLabel`/`campaignDate` projection. The `summary()`
  function opens at line 44, but the actual `dateLabel:date.label` field is written at **line 51**
  (lines 44-48 are the function's cache-check and JSON-parse preamble). Substance (the projection
  exists and can carry a mode label cheaply) is correct.

Neither error changes any conclusion; both are the same class of trivial locator slip the phase1-verify
digest repeatedly caught and dispositioned as "substance stands" elsewhere in this project. Flagging per
the task's own "cite file:line" discipline.

---

### 3. (LOW, internal-consistency, not authority) §4.4 table cross-reference

The "P12/P15B rival entry, distress, and (per §4.6) failure" row cites §4.6, which is actually the
era/technology policy section; post-2040 rival failure/consolidation is argued in §4.8. Cosmetic
mis-cite of the report's own internal section numbering, not an authority-doc problem.

---

## Everything checked and found accurate (strong points)

- **§22 numeric bounds** ("maximum-16-domain manifest... at most eight archetypes, at most twelve
  qualifying and twelve contrary fact references per archetype, at most twelve lens summaries") — quoted
  correctly verbatim against `authority/P15-PACKAGE.md:781-784`.
- **§23 "Endless Mode: Owner chooses after finale prototype; no default"** — quoted correctly
  (`P15-PACKAGE.md:807`), and correctly labeled SUPERSEDED BY OWNER DIRECTION K.
- **`P13-P15-OWNER-RULINGS.md` §4** "Post-2040 Endless Mode remains undecided. P15 may not silently
  create or authorize it." (line 143) — quoted correctly, correctly labeled SUPERSEDED BY K.
- **Roadmap §21** "No P13–P15 document assumes option 3" (line 737) — quoted correctly, correctly
  labeled SUPERSEDED BY K while its own checklist is correctly kept CONFIRMED.
- **Annex C.5 finale state table** (`P15-BUILDER-ANNEX.md:146-154`) faithfully paraphrased (abbreviated
  node names, same transitions, correctly appends "archive-browsable / ended / Endless transition"
  verbatim from the table's own terminal row).
- **Annex D.5 `CorporateConditionEvent`** and **D.6 `LegacyFinaleSnapshot`/`usedEvidenceIds`/
  `SourceDomainOrderingManifestEntry`** — all fields and the "only stable IDs actually cited... never
  every history ID" language match `P15-BUILDER-ANNEX.md:256-333` exactly.
- **Annex M.4 persistent banner**, **M.6 opening hierarchy** (7-item list) and its anti-score sentence
  ("No 'overall 92,' letter grade, world rank, winner, GOAT meter, or meta-power reward") — verified
  verbatim against `P15-BUILDER-ANNEX.md:934-975`.
- **Accessibility quotes** — "Reduced motion removes rank/graph flourishes and finale camera movement"
  (`P15-PACKAGE.md:744`) and "reduced motion removes graph tween/rank movement/finale flourish"
  (`P15-BUILDER-ANNEX.md:1007`) — both confirmed verbatim at the cited lines.
- **Annex O typed errors** (`historyNotRecorded`, `rankingNotAvailable`, `legacyEvidenceIncomplete`,
  `finaleModeUndecided`) — all four confirmed present with matching headline text at
  `P15-BUILDER-ANNEX.md:1014-1030`.
- **`docs/c2-planning/00A-OWNER-RULING-TIME-MODEL-2026-08-18.md:33-34`** "Historical progression may
  transition into plausible alternate-future progression" — confirmed at the exact cited line (33), and
  correctly framed as *permitted, not required* — matching the source's own permissive "may."
- **`bridge/schema/bridge-schema.ts:2304`** `CAMPAIGN_OPERATIONS` including `'saveAs'`, and
  **`campaign-library.ts:181`** "Save As must preserve the original record" — both confirmed verbatim at
  the cited lines.
- **Package/direction handling of the P14 romance domain**: the analysis correctly treats "Famous
  collaborations/romances" as a domain that "does not exist" and must render a typed `legacyEvidenceIncomplete`
  notice rather than a placeholder — consistent with `P13-P15-OWNER-RULINGS.md:96` ("...romance,
  addiction, daily needs, and family systems" listed among items requiring "a later explicit decision")
  and with the task's own framing that P14 romance is parked. No premature assumption of approval.
- **Digest corrections actually absorbed, not just cited**: the analysis's Prima "gets, well, nothing"
  page citation (p.80/PDF 81) matches the digest's correction exactly (comp-finale completeness-overclaim,
  "the PDF shows printed p.80 (PDF p.81)"), and its softened 1999–2005-tail claim ("not literally 'nothing
  new'... but no new authored content arrived") matches the digest's correction to the original
  overstated claim almost word-for-word. The OpenTTD title-ladder anti-pattern citation to `comp-finale.md`
  §5 is a distinct, independently-sourced claim from that file (not the different OpenTTD claim the digest
  corrected in `comp-ranking.md`), so no digest correction was owed here and none was skipped.
- **No settled direction is reopened.** Nowhere does the report re-litigate the archetype model, the
  Power Ranking formula, the market-window curve, or the loan/distress math — it repeatedly and correctly
  defers those to sibling P15 sub-packages, exactly as the task instructed.
- **No player-only exemption / no hidden rival subsidy**: §2.4's early-bankruptcy handling explicitly
  routes the player through the *same* finale state machine as any rival closure, not a favored path.
- **No retroactive fiction in migrated saves**: §3.5's migration-origin honesty rule is a correct,
  generalized application of the digest-confirmed rival migration-origin rule to the player's own
  Legacy dossier.
- **Package ownership table (§5)** correctly keeps P11 as the live-finance authority, P12 as the sole
  registry/`active|dormant|closed` owner (matches `P15-BUILDER-ANNEX.md:299-300` verbatim: "P12 is the
  sole owner of the studio registry's durable `active | dormant | closed` fact"), P08/P08B and P13 as
  correctly gated/blocked, and P15B/P15C as the only two packages assigned new authoring surface — no
  registry, ledger, or identity authority is misattributed anywhere in the table.
