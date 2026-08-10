// ── Authored stage: the offline-render substitution ───────────────────────────
//
// EXPERIMENTAL, DEFAULT OFF. This is the whole mechanism by which ONE soundstage's
// procedurally-baked texture is replaced by a pre-rendered PNG produced offline against
// the calibrated camera contract. It exists so that swapping in an approved candidate
// render is a one-file drop, not an integration project.
//
// Everything else in the lot is generated at runtime from Phaser Graphics (assets.ts).
// This module introduces the lot's FIRST loaded asset, and does it in the two smallest
// places it can:
//
//   preload()  →  queueAuthoredStage(scene, on)   queues the PNG under a texture key
//   create()   →  applyAuthoredStage(scene, on)   rewrites ONE BUILDING_TEX entry
//
// The substitution is a REGISTRY edit, made after bakeAllTextures() and before
// buildBuildings(). That ordering is the design, and it is what keeps the change this
// small — everything downstream already reads the registry:
//
//   • layout.ts:69-73 derives the placed footprint from BUILDING_TEX.fw/fd, so the
//     metadata below is what stops the lot silently shifting.
//   • LotScene.ts:401 sets the sprite origin from BUILDING_TEX.originY, so the anchor
//     lands on the footprint ground centre exactly as the baked texture's did.
//   • LotScene.ts:402 arms the pixel-perfect hit test on the sprite AFTER the texture is
//     chosen, so the hit area is built against the authored alpha — correct by
//     construction, with no re-arming step to forget. (Re-arming would be required only
//     if the swap happened after the sprite existed; it deliberately does not.)
//   • the ground shadow (LotScene.ts:394), the "Stage A/B" plaque (signage.ts:102, at 52%
//     face height), the accent band and the recording bulb are all positioned from the
//     texture's own width/height + originY, so they keep working over the new sprite.
//
// The render itself must therefore contain NO ground shadow, NO signage lettering and a
// real alpha channel — the game draws the first two and hit-tests the third.
// See calib/CAMERA-CONTRACT.json in the spike quarantine.

import { BUILDING_TEX, type BakedSprite } from './assets'
import authoredStageUrl from './authored/authored-stage.png'

/**
 * What an offline render has to declare about itself. This travels WITH the PNG (see
 * `AUTHORED_STAGE` below) — there is no global asset config, and adding one is not
 * authorized. It is exactly the camera contract's anchor + scale, restated as data so it
 * can be checked against the file that actually loaded.
 */
export type AuthoredStageMeta = {
  /** x of the footprint ground centre, in texture pixels from the left edge. */
  anchorX: number
  /** y of the footprint ground centre, in texture pixels from the TOP edge. */
  anchorY: number
  /** footprint width in tiles (+gx). Must match the stage this replaces. */
  fwTiles: number
  /** footprint depth in tiles (+gy). Must match the stage this replaces. */
  fdTiles: number
  /** horizontal pixels per grid tile. The 2:1 dimetric makes tile height half of this. */
  pxPerTile: number
}

/** One authored render, bound to the registry entry it stands in for. */
export type AuthoredStageAsset = {
  /** the BUILDING_TEX key whose texture this replaces — ONE stage, by design. */
  registryKey: 'stageA' | 'stageB'
  /** the Phaser texture key the PNG is registered under. */
  texKey: string
  /** module URL of the PNG, fingerprinted and emitted by Vite. */
  url: string
  meta: AuthoredStageMeta
}

/**
 * THE ART SWAP POINT.
 *
 * The PNG beside this file is candidate A, "RIDGE-MONITOR STAGE" — a real offline render
 * through the calibrated rig (512 x 378, 122,803 B). It replaced the gray magenta-hatched
 * placeholder the mechanism was built and measured against. To swap another candidate in:
 *
 *   1. copy the approved render over `./authored/authored-stage.png`
 *   2. if its height differs from 378 px, set `anchorY` to `texH - 128`
 *
 * Nothing else changes. `applyAuthoredStage` re-derives the origin from the file that
 * actually loaded and REFUSES the swap if the metadata and the pixels disagree, so a
 * mis-specified candidate falls back to the procedural stage instead of moving the lot.
 */
export const AUTHORED_STAGE: AuthoredStageAsset = {
  registryKey: 'stageB',
  texKey: 'b-stage-authored',
  url: authoredStageUrl,
  meta: {
    anchorX: 256,
    anchorY: 250, // texH(378) - 128; the 4x4 ground diamond is 256 px tall
    fwTiles: 4,
    fdTiles: 4,
    pxPerTile: 128,
  },
}

/** Half-pixel indexing (pixel centres vs boundaries) is not an error; anything more is. */
const ANCHOR_TOLERANCE_PX = 1

/** Texture width the contract requires for this footprint: `(fw + fd) * pxPerTile / 2`. */
export function expectedTextureWidth(meta: AuthoredStageMeta): number {
  return ((meta.fwTiles + meta.fdTiles) * meta.pxPerTile) / 2
}

/**
 * y of the footprint ground centre the contract requires, given the texture's real height.
 * The ground diamond is `(fw + fd) * tileH / 2` px tall with its bottom apex on the last
 * row, so its centre sits half that above the bottom. (tileH = pxPerTile / 2.)
 */
export function expectedAnchorY(meta: AuthoredStageMeta, texH: number): number {
  return texH - ((meta.fwTiles + meta.fdTiles) * meta.pxPerTile) / 8
}

/**
 * The normalized origin Phaser needs, derived from the metadata and the LOADED texture —
 * the same quantity `assets.ts:110` computes for a baked stage, just measured instead of
 * constructed.
 */
export function authoredStageOrigin(
  meta: AuthoredStageMeta,
  texW: number,
  texH: number,
): { originX: number; originY: number } {
  return { originX: meta.anchorX / texW, originY: meta.anchorY / texH }
}

/** Every way a render can fail the contract. Reported, never thrown. */
export type AuthoredStageRefusal =
  | 'bad-pxPerTile'
  | 'bad-footprint'
  | 'bad-texture-size'
  | 'footprint-mismatch'
  | 'width-mismatch'
  | 'anchor-x-off-centre'
  | 'anchor-y-off-ground'

/**
 * Check a render against the contract AND against the stage it is standing in for.
 * Returns null when it is safe to substitute, or a short reason why it is not.
 *
 * The footprint check is the load-bearing one: `layout.ts` derives placement from
 * `BUILDING_TEX.fw/fd`, so a render that claims a different footprint would silently move
 * the building. Refusing is always better than moving the lot.
 */
export function validateAuthoredStage(
  meta: AuthoredStageMeta,
  texW: number,
  texH: number,
  replaces: BakedSprite | undefined,
): AuthoredStageRefusal | null {
  if (!(meta.pxPerTile > 0) || meta.pxPerTile % 8 !== 0) return 'bad-pxPerTile'
  if (!(meta.fwTiles > 0) || !(meta.fdTiles > 0)) return 'bad-footprint'
  if (!(texW > 0) || !(texH > 0)) return 'bad-texture-size'
  if (replaces && (meta.fwTiles !== replaces.fw || meta.fdTiles !== replaces.fd)) {
    return 'footprint-mismatch'
  }
  if (texW !== expectedTextureWidth(meta)) return 'width-mismatch'
  if (Math.abs(meta.anchorX - texW / 2) > ANCHOR_TOLERANCE_PX) return 'anchor-x-off-centre'
  if (Math.abs(meta.anchorY - expectedAnchorY(meta, texH)) > ANCHOR_TOLERANCE_PX) {
    return 'anchor-y-off-ground'
  }
  return null
}

/** Is this the authored texture? Used to keep the procedural finish swaps off it. */
export function isAuthoredStageTexture(
  key: string,
  asset: AuthoredStageAsset = AUTHORED_STAGE,
): boolean {
  return key === asset.texKey
}

/** The minimum of a Phaser.Scene this module touches — so it is testable without Phaser. */
type LoaderHost = { load: { image(key: string, url: string): unknown } }
type TextureHost = {
  textures: {
    exists(key: string): boolean
    get(key: string): { getSourceImage(): { width: number; height: number } }
  }
}

/** Why the substitution did or did not happen. Surfaced through LotScene.identityDebug(). */
export type AuthoredStageOutcome = {
  applied: boolean
  reason: 'ok' | 'flag-off' | 'texture-missing' | 'no-baked-stage' | AuthoredStageRefusal
}

/**
 * Queue the authored PNG. Call from `Scene.preload()` so the texture exists before
 * `create()` bakes and places anything.
 *
 * With the flag off this queues nothing, and Phaser's loader completes synchronously on an
 * empty queue (LoaderPlugin.start → loadComplete), so `create()` still runs in the same
 * tick it always did. Flag OFF is the shipped scene, unchanged.
 */
export function queueAuthoredStage(
  scene: LoaderHost,
  enabled: boolean,
  asset: AuthoredStageAsset = AUTHORED_STAGE,
): boolean {
  if (!enabled) return false
  scene.load.image(asset.texKey, asset.url)
  return true
}

/**
 * Substitute the authored render for one stage's baked texture.
 *
 * MUST run in `create()` immediately after `bakeAllTextures()` and before anything reads
 * the registry (origins, `placedBuildings()`, `buildBuildings()`).
 *
 * Any failure — flag off, image never loaded, metadata that disagrees with the pixels —
 * leaves BUILDING_TEX untouched, which is exactly the procedural presentation.
 */
export function applyAuthoredStage(
  scene: TextureHost,
  enabled: boolean,
  asset: AuthoredStageAsset = AUTHORED_STAGE,
): AuthoredStageOutcome {
  if (!enabled) return { applied: false, reason: 'flag-off' }
  if (!scene.textures.exists(asset.texKey)) return { applied: false, reason: 'texture-missing' }

  const baked = BUILDING_TEX[asset.registryKey]
  if (!baked) return { applied: false, reason: 'no-baked-stage' }

  const src = scene.textures.get(asset.texKey).getSourceImage()
  const problem = validateAuthoredStage(asset.meta, src.width, src.height, baked)
  if (problem) return { applied: false, reason: problem }

  const { originX, originY } = authoredStageOrigin(asset.meta, src.width, src.height)
  BUILDING_TEX[asset.registryKey] = {
    key: asset.texKey,
    originX,
    originY,
    fw: asset.meta.fwTiles,
    fd: asset.meta.fdTiles,
  }
  return { applied: true, reason: 'ok' }
}
