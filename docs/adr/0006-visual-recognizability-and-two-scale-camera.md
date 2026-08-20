# ADR 0006: Visual recognizability and two-scale camera

- Status: Accepted
- Date: 2026-08-20

## Context

The Owner has made visual recognizability relative to *The Movies* (2005) a
first-class product goal at the same conceptual tier as systems
recognizability. The desired reaction is recognition of the filmmaking-studio
fantasy followed by recognition that Project: Studio advances it with modern
production quality.

The inherited Three.js client deliberately pursued a readable "handsome
diorama." That work remains useful as a regression oracle and management-view
donor, but it is not the final production-client art direction. The current
Unity client already uses perspective cameras, Cinemachine, selectable focus,
and an orbitable pitch range; its default overview and flat presentation still
read too much like a model when judged from campaign captures.

Protected Lionhead assets, textures, layouts, UI artwork, and other production
material remain prohibited. Representative screenshots may be used locally as
visual references, never adopted as project assets.

## Decision

Unity will deliver one coherent camera and presentation system with two
interaction scales:

- **Management scale:** elevated oblique overview, strong campus navigation,
  readable departments, construction, queues, occupancy, and selection.
- **Inspection/production scale:** lower human-scale perspective, useful
  vertical convergence, production and building focus, smooth transitions,
  collision/occlusion handling, and a credible sense of inhabiting the lot.

The production visual target is a stylized, period-readable studio rather than
an exclusively high-isometric diorama or a literal recreation of the 2005
game. Authored surface variation must distinguish grass, paving, stucco,
timber, metal, roofing, glass, and scenery. Characters must have believable
human proportions plus face, hair, wardrobe, era, and role readability.
Production activity must visibly read as filmmaking. Backlot scenery must read
as temporary construction from the working side and as a convincing location
from the camera-facing side.

UI will retain a restrained world-first footprint and modern accessibility
while developing a specific period-studio identity. Generic dark dashboard
panels and literal copies of the original UI are both rejected.

The lower-perspective camera comparison is an evidence-gathering Unity task,
not renewed investment in Three.js. It must preserve management readability
and will be evaluated through paired overview, production-focus, hero-stage,
construction, and human-close captures before replacing the known-good camera
defaults. Existing art is reused or retired selectively; there is no blanket
Asset Lab write-off.

## Consequences

- Visual Golden checkpoints require side-by-side review against the previous
  Project: Studio Golden and legally retained reference screenshots.
- Passing tests, frame budgets, or draw-call targets cannot compensate for a
  persistent "wrong game" or tabletop-model reaction.
- Visual critique must ask whether the lot feels inhabitable, people are
  human-scale and role-readable, the era is visible, production looks like
  filmmaking, and both camera scales work.
- Overview readability remains a requirement, but no longer constrains medium
  and close views to the inherited diorama treatment.
- Three.js stays preserved and working, but production camera, character,
  material, UI, and filmmaking-activity investment belongs in Unity.

## Revisit when

A validated Unity comparison shows that the two-scale camera harms tycoon
legibility, or provenance-cleared asset constraints make a specific material or
character target infeasible. The first-class recognizability goal itself may be
changed only by a later explicit Owner ruling.
