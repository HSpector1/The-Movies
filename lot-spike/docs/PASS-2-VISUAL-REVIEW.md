# Pass 2 — Living Studio Visual Review

What the pass changed, the four reviews, and honest limitations. Screenshots are
in `lot-spike/shots/pass-2/`. Baselines (`before-*`, `baseline-*`) were captured
from the pass-1 commit for direct comparison.

---

## Baseline diagnosis (pass-1 spike)

The functional spike worked but read as a diagram, not a place. Concretely:

- Buildings **floated on an empty diamond** — no lot boundary, thin shadows, no
  foundations. (`before-established-overview.png`)
- The **gate was tiny** and did not read as an entrance; **admin** did not anchor.
- **Active vs idle stages differed only by tint + a floating card** and a small
  bulb — the single biggest gap.
- **Ambient life** was identical dots on continuous loops; one vehicle; no roles.
- **Struggling vs established** differed by count/tint/one vehicle — not authored
  storytelling.
- **Production tags** were fixed-size and could overlap; not zoom-aware.
- **Prototype controls** (mode toggle, action log) were mixed into player chrome.

Preserved from pass-1: the `StudioLotSnapshot` boundary, deterministic seeded RNG,
no core imports, the info panel, the action-log integration proof, the camera
model, and the warm palette direction.

---

## What changed

**Composition** — enclosed the lot with a back **perimeter wall** + front
**hedge** (gate gap on the boulevard); strengthened the **Gate → Boulevard →
Plaza → Administration** journey with palm/lamp/banner-lined boulevard and a plaza
the boulevard runs into. (`after-established-overview.png`, `entrance-hero.png`)

**Architecture / grounding** — every building now sits on a **foundation plinth**
with a softer contact shadow; roads gained an apron material in front of stages.
Rebuilt the **gate** as a hero (Deco arch, twin pillars, studio-name lettering,
guard booth). Admin keeps its Deco crown and gains a forecourt flag (when
established) + a directional sign.

**Production activity** — the core system. An active stage now shows **open-door
spill light, a pulsing recording light, an equipment cluster (cart/crates/lamp/
cones), a title-board easel with the film name, a parked production van, and crew
loitering at the apron**. Idle = closed/maintained; closed = dark. Readable with
no card. (`close-production-activity.png`, `active-vs-idle-stage-comparison.png`)

**Ambient life** — four distinct roles (crew, office, talent, grip) on routes with
**dwell stops** and clusters; vehicles (roadster, van, golf cart) on road routes
that dwell at stage aprons; more life when the studio is busy.

**State communication** — authored struggling/established dressing: banners, flag,
café umbrellas, lusher planting, and busier traffic appear only when established;
closed buildings/stages dim. Same lot, two conditions.
(`struggling-vs-established-comparison.png`)

**Interaction / camera / chrome** — production tags are **zoom-responsive**
(compact marker far / full card mid / hidden close); cursor-centered zoom retained;
named camera framings added; **prototype controls moved into a dashed "PROTOTYPE"
dock**, distinct from the player chrome.

**Technical** — added deterministic verification hooks and a headless assertion
suite (`tools/capture.mjs`): fixture load, state switching, select/deselect,
navigation events, no display-object leak on repeated snapshots, single canvas on
destroy/recreate, and no console errors.

---

## Review A — Visual composition

- **Focal hierarchy:** present. The framed diamond + boulevard lead the eye
  gate → plaza → admin; the stage district reads as its own zone. *Pass.*
- **Buildings distinct:** yes — Deco admin, gabled bungalows, vaulted stages,
  slate post, marquee theater are separable by silhouette. *Pass.*
- **Reads as a movie studio:** yes — vaulted numbered stages, water tower, marquee,
  gate lettering, production gear. *Pass.*
- **Alive:** yes at management/observation zoom (`close-production-activity.png`).
- **Negative space:** the expansion pad and lawns give intentional quiet against the
  busy plaza/stages. *Pass.*
- **Struggling vs established clearly different:** yes
  (`struggling-vs-established-comparison.png`). *Pass.*
- **Finding (minor):** the gate **arch** structure is subtler than the lettering at
  overview zoom — the entrance reads more from lettering + booth + banners than
  from the arch mass itself. Logged for a future pass.

## Review B — Interaction & UX

- Clickable affordance: hover outline + label + lift make targets obvious. *Pass.*
- Hover/selection states clear; selection is a calm gold outline, not a neon glow.
  *Pass.* (`established-active-stage-selected.png`)
- Camera comfortable: drag, cursor-zoom, keys, reset all verified. *Pass.*
- Labels readable, tags de-clutter by zoom (`zoomed-out-full-lot.png` shows compact
  markers). *Pass.*
- Active production is understandable **without** opening a panel (spill light +
  gear + tag). *Pass.*
- Chrome supports the world: player chrome is minimal; prototype affordances are
  fenced off in the dock. *Pass.*
- Small viewport usable (`small-viewport.png`) — everything fits at 1024×640,
  though detail is naturally small. *Pass with note.*

## Review C — Studio-ownership fantasy

- **Does it feel like owning a studio?** Substantially yes — the enclosed lot,
  named gate, and visible shoots read as *my* place.
- **Worth returning to watch?** At management/observation zoom, yes: crew loiter,
  a van pulls up, the recording light pulses. The **most compelling moment** is
  zooming into an active stage and seeing the doors glow with gear and crew around
  them (`close-production-activity.png`).
- **Consequence:** the struggling↔established contrast communicates it well.
- **What still limits attachment:** ambient beats are pleasant but not yet
  *surprising* (no one-off character moments à la RCT's photo-taking guest); the
  gate arch could be a stronger landmark.

## Review D — Technical boundary

- No simulation truth owned by the lot; it reads snapshot facts only. **Confirmed.**
- No private core imports added (`fromGameState.ts` remains types-only). **Confirmed.**
- Snapshots are not mutated. **Confirmed.**
- Cosmetics deterministic; **no `Math.random`** (`grep` clean). **Confirmed.**
- Stable building IDs intact; view remains embeddable; destroy/recreate leaves one
  canvas (asserted). **Confirmed.**
- No save-format changes; main worktree untouched. **Confirmed.**

---

## Correction pass (highest-value)

Enclosed the **front two edges** with a low perimeter hedge (gate gap on the
boulevard). Before the correction the lot still floated at the bottom; after, it
reads as a bounded property from every framing. (Applied and re-verified in
`after-established-overview.png`.)

## Retained vs rejected

- **Retained:** perimeter framing, plinths, production-activity dressing, four
  ambient roles, dwelling routes, authored state dressing, zoom-responsive tags,
  prototype dock.
- **Rejected / not attempted this pass:** a full layout re-choreography (risk vs
  reward too high — strengthened the existing composition instead); baked "open
  door panels" as separate geometry (the spill-light quad reads well enough and is
  cheaper); per-agent personality beats (deferred).

## Unresolved weaknesses / limitations

- The gate **arch** mass could be a stronger overview landmark (lettering carries it).
- Ambient life lacks **one-off surprise beats**; motion is pleasant but uniform.
- No **click-to-inspect a character**, no thought bubbles (out of scope this pass).
- `GameState → snapshot` is proven at the **type level only**; not wired to a live
  engine — that is the integration step, still out of scope.
- WebGL under headless swiftshader shows GPU-perf console *warnings* (not errors);
  irrelevant on real hardware.

## Next recommended milestone

**One authored "a film is being made" vignette per active stage** — a short,
deterministic, looping micro-sequence (crew carries a case in through the doors, a
clap of the title board, the van departs) plus **click-to-inspect** on ambient
characters. This is the cheapest next step that converts "pleasant to glance at"
into "worth lingering on," and it stays fully inside the presentation boundary. A
full-3D migration is **not** recommended on this pass's evidence: the stylized 2.5D
diorama already delivers the fantasy at a fraction of the cost.
