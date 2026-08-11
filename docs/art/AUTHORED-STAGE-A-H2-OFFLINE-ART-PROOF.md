# Authored Stage A — H2 "Stage Front" — offline art proof

**Status: INITIAL AUTHORED CANDIDATE. NOT ADOPTED. ART DIRECTOR CHECKPOINT DECISION REQUIRED.**
Branch `art-authored-stage-a-h2-offline-proof`, base `56eae12`, cut from production authority
`5e19b25eb67e5c689ca60248dc7cf5efbda95f6d`.

Governed by [`AUTHORED-ENVIRONMENT-PIPELINE-STANDARD.md`](AUTHORED-ENVIRONMENT-PIPELINE-STANDARD.md)
(**§3A** is the export path) and [`STAGE-A-AUTHORED-PREFLIGHT-REFRESH.md`](STAGE-A-AUTHORED-PREFLIGHT-REFRESH.md).

**No runtime integration — at this checkpoint.** No PNG in `ui/public/lot/`, no flag, no preload,
no `BUILDING_TEX` change, no runtime module touched. `git diff` against the base is documentation
only.

> **Temporal note.** This document records the **offline-art** checkpoint state at `b5bcdfc`, and
> the sentence above was true of that commit. The later runtime-proof work — which does add the
> authored pair to `ui/public/lot/`, a default-OFF flag and a preload — is a **separate, later**
> checkpoint documented in [`AUTHORED-STAGE-A-H2-RUNTIME-PROOF.md`](AUTHORED-STAGE-A-H2-RUNTIME-PROOF.md).
> It changes no conclusion below: offline **art acceptance** and runtime **integration acceptance**
> are distinct gates, and this one is unamended.

**Source authority:** `HSpector1/project-studio-art-source` (**private**), branch
`stage-a-h2-stage-front`, commit `c0b6306`, directory `stage-a-h2-stage-front/`. Concept C stays
frozen at `8b0e28b` in `stage-a/`, untouched.

---

## 1. Headline

**H2 passes its gates, and it passes the one Concept C died on.**

A blind reviewer, unprompted and never given the word "soundstage", answered the first question —
*what kind of building is this?* — with **"a sound stage… reads as 'Stage 4,' where they actually
shoot"** at **80 %** confidence. The same reviewer called the procedural control **"a warehouse /
storage or scenery shed"** at **35 %**.

| gate | result |
|---|---|
| Class legibility without signage (§16) | **PASS** — "a sound stage", 80 % |
| Peer finish beside current Stage B (§17) | **PASS** — "correctly plainer", "no blocker" |
| Differentiation from current Stage B | **PASS** — never confusable; roof-led vs front-led |
| Not an unfinished version of Stage B | **PASS** — "V1 does not; it looks finished" |
| Buff family, normal | **PASS** — 0.8655, dev 0.0066 |
| Buff family, worn | **PASS** — 0.8638, dev 0.0049 |
| Raw geometry delta | **PASS** — 0 px |
| Clickable-mask delta | **PASS** — 0 px |
| Alpha bit-identity normal↔worn | **PASS** — 0 px |
| Registration / ground contact | **PASS** — 9 px setback, insets 15/15 |
| Export determinism (3 runs) | **PASS** — identical, alpha bit-exact |

---

## 2. What was built

Current production Stage B is **roof-led**. H2 is **front-led** — a tall clear-span sealed mass
under a flat parapet roof, with the authored investment concentrated where Stage B has no
counterpart: a monumental frontispiece of two blunt pylons with stepped Deco caps, one brass
datum band, and an elephant door under a flat canopy, with a human-scale personnel door set into
the near pylon.

**The 3:1 door scale contrast is the class signal** — 197 × 80 px against 36 × 27 px. The blind
reviewer identified exactly that, unprompted: *"the recessed entry bay between the two pylons — a
tall opening wide enough to roll scenery through. That's the elephant-door silhouette, and it's
the single strongest signal."*

### One in-build revision, disclosed

The first render sat at the procedural wall height. A 4×4 flat-roofed mass at that height puts
most of the sprite into an empty roof plane and read as a depot — failing §16 outright. The mass
was raised once, using headroom the canvas already allows, and the candidate was then frozen. No
design change was made after the candidate was first complete. Recorded rather than presented as
a clean single pass.

---

## 3. The export change is what made this pass

Run diagnostically (§37) on the **same** H2 renders:

| | RGBA §3A (the candidate) | PNG-8 §3B (diagnostic only) |
|---|---|---|
| **buff ratio, normal** | **0.8655 — PASS** (dev 0.0066) | **0.8803 — FAIL** (dev 0.0214) |
| alpha bytes altered | **0** | **104,337** |
| anti-aliased rim altered | **0** | **2,551** |
| distinct RGB above alpha 200 | **128** | **32** |
| opaque px displaced by > 8 | **0.001 %** | **11.584 %** |
| pair bytes | 144,679 | 21,540 |

**PNG-8 would have failed H2's governed value gate exactly as it failed Concept C's.** This is the
second independent building confirming lesson **AY**, and it retires any argument for reintroducing
PNG-8 on byte-count grounds.

---

## 4. Measurements — on the final RGBA export

| measurement | result |
|---|---|
| Canvas | 512 × 368 ✅ · ground centre (256, 240) ✅ · originY `0.6521739130434783` preserved |
| Alpha bbox | x[15, 496] y[15, 358] |
| Registration | left inset **15**, right inset **15**, lowest opaque row **358** = **9 px above the near apex**; centroid x **254.97** (Stage B: 254.58) |
| Ground contact | −10 px vs the governed diamond at x=256 — **inset by design**, matching Stage B's forecourt |
| Raw normal↔worn geometry delta | **0 px** |
| Final alpha-value delta | **0 px** |
| Clickable-mask delta (`alpha > 0`) | **0 px** |
| Distinct RGB (alpha > 200) | **128** both finishes |
| Distinct alpha values | 93 · 105,874 fully opaque |
| True soft edge | 2.2 % of non-zero alpha |
| Alpha islands | 1 · detached islands **0** |
| Determinism | 3 runs identical, alpha bit-exact, **PASS** |

### Detail-survival census

| feature | disposition |
|---|---|
| Clear-span mass · frontispiece · elephant door · lit/shadow corner | **KEEP** (primary, all survive) |
| Pylons + stepped caps · parapet + coping · base course · brass band · canopy | **KEEP** (secondary; the reviewer named the pylons, bay and band as the finish that lets it sit beside Stage B) |
| Personnel door | **KEEP** — small, but it is the scale reference and it reads |
| Door leaf seams (4) | **COLLAPSES CLEANLY** — becomes one dark field |
| Roof deck | **KEEP but flagged** — see §6 |
| Shadow-elevation glazing slot | **NOISE / DECIDE** — see §6 |

Management-readable elements: **≥ 8**, of which the pylons, caps, brass band, parapet and
personnel door do class/finish rather than massing work — clearing the ≥ 6 / ≥ 2 target.

---

## 5. Blind review — one independent reviewer, class question first

Order was mandatory and observed: building type **before** any comparison, never primed with
"soundstage". The activity marker that prints the word was masked out of every frame along with
the stage letters, companion nav and dev chrome.

| question | Version 1 (H2) | Version 2 (procedural) |
|---|---|---|
| **What kind of building?** | **"a sound stage… where they actually shoot"** | "warehouse / storage or scenery shed" |
| Confidence | **80 %** | **35 %** — "genuinely ambiguous" |
| Strongest class signal | the recessed entry bay between the pylons — the elephant-door silhouette | the concentric stepped roof, which says *"important building, not working building"* |
| Different from the centre building? | Yes, both versions | — |
| Same studio / world / class? | **"yes on all three"** | "same world, same studio, **different class**" |
| Unfinished version of its neighbour? | **No** — "it looks finished" | **Yes** — "greybox geometry that hasn't had its detail pass" |
| More production-ready | **Version 1, "by a wide margin. It's not close."** | — |
| Enough finish to sit beside Stage B? | **Yes** — "plainer, but correctly plainer" | — |
| Noisy at wide distance? | **No** | Yes — the bullseye "reads as a decal rather than geometry" |
| Blocker? | **"No blocker."** | — |

The reviewer also independently re-diagnosed the procedural roof's bullseye and its loss of edge
definition against the ground — with no knowledge of that history.

---

## 6. Two observations, deliberately not corrected

1. **The roof plane.** A single large flat field. The reviewer named it *"the one place it looks
   cheaper than the centre building"* and proposed vents, a skylight run or roof gear. **That
   directly conflicts with the standing detail budget**, which omits roof vents and roof units as
   proven management-camera noise (lesson **AV**; Stage B removed exactly those at release
   closure). This is a genuine tension between peer finish and the detail budget, and it is the
   Art Director's call, not an autonomous one.
2. **The glazing slot** on the shadow elevation reads as *"stray scratches rather than skylights
   or glazing"*. Commit to it as a proper clerestory strip, or delete it.

Neither was changed. The first-pass stop rule was observed.

---

## 7. Production peer, re-verified at grading time

Per the refresh's own rule — the comparison peer is a moving authority — production was
re-checked immediately before evidence capture: local = tracking = live remote =
`5e19b25eb67e5c689ca60248dc7cf5efbda95f6d`, and Stage B's bytes still
`aa375a00…e7b`. Unchanged from the authority this proof began against.

---

## 8. Recommended next action

**A — H2 INITIAL ART GATE PASSES — ART DIRECTOR NEXT CHECKPOINT DECISION REQUIRED.**

Every gate passes, including the class-legibility gate that closed Concept C, and the independent
reviewer records no blocker. The two open observations in §6 are bounded and one of them needs a
ruling on detail budget versus peer finish before it can be acted on at all.
