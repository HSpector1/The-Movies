# Character Clothing Art Standard (Asset Lab 05C)

Builds on the 05B clothing standard (modeled shells, not paint). 05C makes the garments look
**worn**, not like smooth armor blocks, and makes roles read by **outfit** (not just colour +
headwear).

## Worn-garment details (all shirt roles)
- **Collar:** a raised folded band at the neckline (`spine_03`), not just a ring.
- **Front placket + buttons:** a thin vertical strip down the chest front (−Y) with 3 button dots →
  reads as a buttoned shirt.
- **Chest pocket:** a small box on the chest.
- **Rolled-sleeve cuff:** a thicker shirt band where the upper-arm sleeve meets the skin forearm.
- **Hem / waistband:** the shirt hem ellipsoid overlaps the trouser waistband (from iter 1).

## Hi-vis vest (Electric / Maintenance-hi-vis)
A fitted rounded shell ~1.5 cm proud of the chest (iter 1) **plus two silver reflective bands**
wrapping the chest — the classic hi-vis read. No longer a bulky floating box.

## Role outfits (read by silhouette + garment, not just colour)
| Role | Outfit |
|------|--------|
| PA | collared buttoned shirt + pocket, trousers, clipboard, side-part hair (no hat) |
| Grip | flat cap + collared work shirt + tool belt |
| Electric | hard hat + **hi-vis vest with reflective stripes** + tool belt |
| Maintenance | soft cap + **slate coveralls** (one-piece, collar/placket/pocket) + tool belt |
| Office | admin bun + lightweight dark top (collar/placket) + clipboard (no hat, no vest) |
| Director (opt) | fedora + long tapered coat |

Colours accept a PALETTE key or an RGB tuple; skin tone stays independent of role (per-instance
`overrides`). Every garment detail is part of the single skinned mesh and weighted to the torso
bones, so it deforms with the body and cannot detach.

## Clipping
Clipboard held clearly in front of the torso (pushed −Y, tilted), so it no longer intersects the
shirt/coat. Garment details tested across the six clips (deformation iteration validates).

## Evidence
`proof/lab05c/iteration-03/`: hero fronts/3q (collar/placket/pocket/cuffs), Electric (vest stripes),
Maintenance (coveralls), role lineup. Before: `proof/lab05c/iteration-02/`.
