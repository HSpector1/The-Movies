// ── Tycoon world palette — warm 1948 California ───────────────────────────────
//
// Sampled from the Operation Hollywood plate (`ui/public/lot/hollywood/district-base.png`)
// and then lifted in value for readability at management zoom. The plate is a
// golden-hour render with heavy atmospheric falloff; a navigable diorama has to stay
// legible when the whole property is on screen, so every sampled hue is kept and only
// the value is raised.
//
// Representative raw samples (9×9 box averages from the plate):
//   stucco lit      #c1a07e      stucco mid    #ad8f71      booth cream  #bc9e80
//   asphalt lit     #807164      asphalt mid   #4d4139      asphalt dark #292119
//   roof metal      #866a51      stage glow    #895429      haze         #696c7d
//
// ── C1-M6b, THE OCHRE SHIFT ───────────────────────────────────────────────────
//
// The lot read competent and COLD: one flat blue-olive lawn under warm buildings, so
// the ground fought the architecture instead of holding it. The Owner's 2005 corpus
// answers the same question with a sun-baked property — dry golden ground blotched
// with watered scrub, a hot pale sand beyond the wall, and terracotta and stucco
// sitting ON that warmth rather than against it.
//
// Every terrain hue therefore rotates toward yellow (75° → 50…68°) and rises in value,
// and the second grass tone is inverted: it used to be a DARKER green (mottling that
// read as damp), it is now a LIGHTER sun-scorched gold (mottling that reads as heat).
// A third, driest tone lands on the verges the traffic wears.
//
// READABILITY WAS THE CONSTRAINT, NOT THE COST. A lighter ground erodes exactly two
// things, and both are paid for here rather than accepted:
//   • silhouette separation — every SHADE wall tone is darkened so the value ladder
//     (roof > lit wall > shade wall > ground) survives a ground that came up ~8 points
//     of lightness. The scene deepens its baked contact shadows for the same reason;
//   • warm-on-warm chrome — the gold selection ring, the pale hover, the guidance pool
//     and the ghost outline would all have gone quiet over gold ground, so the scene
//     now lays every one of them over a dark halo (`chromeHalo`). Colour identity is
//     unchanged; contrast is restored from underneath.
//
// Value ladder after the shift (L*, HSL lightness), which is what the separation
// actually rests on:
//   road 41 · dirt 48 · lawn 50 · lawnAlt 54 · lawnDry 58 · gravel 58 · surround 64 ·
//   path 69 · plaza 68 — paving stays a clear band ABOVE every grass tone, grass stays
//   a clear band above the roads, and the construction pad stays below all of them.
//
// LIGHT DIRECTION: upper-left. That is the convention the existing isometric bake
// framework already uses (the `gy = fd` face — lower-left on screen — is the lit face)
// and the convention the two authored soundstage PNGs are rendered in. Every shadow in
// this world therefore falls toward the lower-right.
//
// This module is deliberately separate from `../scene/palette.ts`: that one is the
// retained dusk palette of the legacy rollback scene and must not move.
//
// Numbers are 0xRRGGBB for Phaser.

export const WARM = {
  // ── atmosphere ────────────────────────────────────────────────────────────
  /** Camera fill beyond the property — a hot, hazy Californian afternoon. */
  haze: 0xb3aa99,
  /**
   * Dry scrub apron surrounding the graded lot. Deliberately a HOTTER, PALER sand than
   * the watered lawn inside the wall, so the property boundary reads at any zoom: the
   * studio is the darker, greener island in a bleached landscape (2005 corpus).
   */
  surround: 0xc4b183,
  surroundEdge: 0xb09c6c,

  // ── terrain ───────────────────────────────────────────────────────────────
  /** Watered grass in full sun. Hue 70° → 64°: the rotation the whole pass is named for. */
  lawn: 0xa0a55d,
  /**
   * The mottle. Inverted at C1-M6b: this used to be a darker green and is now the
   * SUN-SCORCHED patch, which is what gives the ground the corpus' blotched character.
   */
  lawnAlt: 0xb0a765,
  /** The driest tone — verges the traffic wears, and the margins nobody waters. */
  lawnDry: 0xbdb06d,
  lawnEdge: 0x84884e,

  /** Bare graded earth. Pushed REDDER so a construction pad never reads as scorch. */
  dirt: 0xa8804f,
  dirtEdge: 0x8a6740,

  gravel: 0xada08a,
  gravelEdge: 0x92866e,

  road: 0x716b5d,
  roadEdge: 0x5b5548,
  roadLine: 0xe8dcbb,
  /** Worn wheel tracks and shoulder scuff, laid into the ground bake. */
  roadWear: 0x5f5a4d,

  plaza: 0xc6b593,
  plazaEdge: 0xae9c7a,
  plazaSeam: 0xb8a684,

  path: 0xcabb96,
  pathEdge: 0xb0a17e,

  apron: 0x7f7565,
  apronEdge: 0x625b52,
  apronLine: 0xd8c9a4,

  // ── shadow (warm, never black) ────────────────────────────────────────────
  shadow: 0x4a3b2b,
  /**
   * The contrast bed every piece of warm chrome is laid over (C1-M6b).
   *
   * Selection gold, hover cream, the guidance pool's rim and the ghost's outline are all
   * warm and light, and the ground is now warm and light too. Rather than recolour four
   * established cues, the scene strokes this underneath each of them: identity is kept,
   * contrast comes from below, and it works over pale surround AND dark asphalt.
   */
  chromeHalo: 0x2a2118,

  // ── stucco family (admin / writers / casting / theater / booth) ───────────
  //
  // Every SHADE tone below is darker than it was before the ochre shift. The ground came
  // up ~8 points of lightness; the shaded face of a building has to come down to keep the
  // silhouette ladder (roof > lit wall > shade wall > ground) that lets a body read at
  // management zoom with no outline at all.
  cream: 0xefdfbe,
  creamLit: 0xe4cfa6,
  creamShade: 0xb0906a,
  creamDeep: 0x99795a,

  taupe: 0xdfcda6,
  taupeLit: 0xd2bd91,
  taupeShade: 0xa08661,

  // ── soundstage buff (matches the authored stage PNGs) ────────────────────
  buff: 0xd6c7a0,
  buffLit: 0xc9b88d,
  buffShade: 0x9d8b66,

  // ── post / technical block (cool warm-grey) ──────────────────────────────
  slate: 0xc0bda9,
  slateLit: 0xb0ad98,
  slateShade: 0x87856f,

  // ── roofs ─────────────────────────────────────────────────────────────────
  //
  // C1-M6b makes the roof a FAMILY BADGE, so a glance at the property answers what a
  // building is for before any label is read:
  //   terracotta gable → development (Development, Office II, Office III)
  //   green slate hip  → casting / talent
  //   brass-capped flat + roof monitor → the Development & Casting Hall
  //   corrugated metal → service (Craft Services, Scenery & Post)
  //   barrel metal     → soundstages · deco taupe + brass → civic (Admin, Theater, Gate)
  terracotta: 0xb0603c,
  terracottaDark: 0x90492c,
  roofGravel: 0xa2977a,
  roofGravelDark: 0x877d63,
  roofMetal: 0xa98a68,
  roofMetalDark: 0x8a6d50,
  /** Casting's green-slate hip — the one cool roof on the lot, and unmistakable. */
  roofSlateGreen: 0x6f8474,
  roofSlateGreenDark: 0x55685c,
  /** Corrugated service metal — Craft Services and the Scenery & Post workshop. */
  corrugate: 0x9fa197,
  corrugateDark: 0x7d7f76,
  /** Development's chimney: the one masonry note in the founding cluster. */
  brick: 0x9e5a44,
  brickDark: 0x7c4433,

  // ── trim / signage ────────────────────────────────────────────────────────
  brass: 0xc9a24a,
  brassDark: 0x8a7233,
  signPanel: 0x2e2a20,
  signInk: 0xf5ecd4,
  awning: 0xa8493f,
  awningDark: 0x8b3b32,
  marquee: 0xf3e4bd,

  // ── glazing ───────────────────────────────────────────────────────────────
  glass: 0x93aab0,
  glassDeep: 0x76909a,
  windowLit: 0xf3d792,
  stageGlow: 0xd9a24f,

  // ── planting ──────────────────────────────────────────────────────────────
  trunk: 0x7a5b3c,
  frond: 0x59713f,
  frondDark: 0x445a31,
  hedge: 0x6d8348,
  hedgeDark: 0x596e39,
  planter: 0xb26a44,
  /** Dry backlot scrub — the planting that grows where nobody waters. */
  scrub: 0x8b8b4f,
  scrubDark: 0x6f7040,

  // ── yard / service dressing ──────────────────────────────────────────────
  crate: 0x9c7a4e,
  crateDark: 0x7d5f3a,
  timber: 0xc0a06a,
  timberDark: 0x9a7f52,
  steel: 0x6e6a60,
  steelLit: 0x8b8779,
  canvasTarp: 0x8d8a6d,
  /** Painted oil drums — the one hit of studio red out in the yard. */
  drum: 0xa8503a,
  drumAlt: 0x4f6a72,
  /** Chain-link and post-and-rail fencing round the working yards. */
  fenceWire: 0x8e8d80,
  fencePost: 0x7d6544,

  // ── vehicles ──────────────────────────────────────────────────────────────
  truckBody: 0x3f5a4c,
  truckTrim: 0xd8c9a4,
  vanBody: 0x7a5240,
  carBody: 0x2e2b28,
  carTrim: 0xc9b47c,
  tyre: 0x1b1815,

  // ── status lamps ──────────────────────────────────────────────────────────
  lampAvailable: 0x3f8a58,
  lampHeld: 0xc98a2a,
  lampFilming: 0xb5271c,
  lampIdle: 0x6b6252,
  lampGlass: 0xf6e4b4,

  // ── on-canvas chrome ─────────────────────────────────────────────────────
  labelBg: 0x241d14,
  labelInk: 0xf6ebd2,
  selection: 0xe6c273,
  hover: 0xf3e4bd,
} as const

export type WarmColorKey = keyof typeof WARM
