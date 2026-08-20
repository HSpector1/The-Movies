# LLM + 3D studio prototype

This prototype translates three research directions from
[Awesome-LLM-3D](https://github.com/activevisionlab/awesome-llm-3d) into a playable,
original movie-studio management interface.

## The three experiments

1. **Generative worldbuilding** — inspired by
   [LLMR](https://arxiv.org/abs/2309.12276), which explores real-time creation and
   modification of interactive worlds from language. The **Scene Composer** maps a
   production brief to an inspectable lot preset and moves the player to the matching set.
2. **Grounded scene intelligence** — inspired by
   [Chat-Scene](https://arxiv.org/abs/2312.08168), which assigns identifiers to 3D objects
   for grounded reference. Every selectable lot building has an explicit ID, semantic role,
   capacity, and spatial relationship. **Ask the Lot** answers against that small scene graph.
3. **Embodied agents** — inspired by
   [LEO](https://arxiv.org/abs/2311.12871), an embodied generalist agent that connects 3D
   perception, reasoning, planning, and action. The prototype's director, actor, and camera
   unit carry visible goals and move along routes between semantic lot locations.

## What is real in this prototype

- The studio lot is rendered as real-time Three.js geometry with lighting, shadows, fog,
  selectable objects, orbit controls, zoom, semantic IDs, and moving agents.
- All three interactions run locally and deterministically in the browser.
- The existing Project: Studio simulation remains authoritative for cash, standing,
  greenlights, production time, releases, forecasting, saves, and talent.

## Deliberate limitation

This is a product prototype of the three interaction patterns, not a bundled inference stack
for the papers' research models. Scene prompts use a small transparent local planner; scene
questions use the explicit lot graph; and unit behavior uses deterministic routes. Those seams
are designed so a hosted 3D model or language model can replace each local adapter later without
rewriting the game UI or simulation core.

## Assets and Git LFS

The original studio-lot splash art, fictional *Cosmic Tomorrow* billboard, and generated
backlot terrain texture are stored in `ui/public/assets/`. `.gitattributes` routes bitmap art,
3D binaries, source scene files, and audio through Git LFS. After cloning, run
`git lfs install` once before adding or fetching assets.

## Visual direction

The lot uses an original, code-native stylized art direction influenced by the readable
dioramas and information-rich management views of classic studio, life, theme-park, and zoo
tycoon games. The enlarged 50-acre campus contains four stages, ten support facilities, a
front gate, construction parcel, trailer compound, parking, working roads, a water tower,
street sets, 22 miniature people, production vehicles and small set dressing. The bright
daytime view, cinematic noir preset, location appeal scores, objectives, campus telemetry and
bottom build toolbar are all part of the playable browser scene rather than a static mockup.
