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
  /** Camera fill beyond the property — a hazy Californian afternoon. */
  haze: 0x9fa8a4,
  /**
   * Dry scrub apron surrounding the graded lot. Deliberately a drier, paler tan than
   * the watered lawn inside the wall, so the property boundary reads at any zoom.
   */
  surround: 0xa89a6e,
  surroundEdge: 0x93855c,

  // ── terrain ───────────────────────────────────────────────────────────────
  lawn: 0x8a9459,
  lawnAlt: 0x7d8850,
  lawnEdge: 0x6d7745,

  dirt: 0xb2996f,
  dirtEdge: 0x977f59,

  gravel: 0xa89a80,
  gravelEdge: 0x8e8168,

  road: 0x6f6b63,
  roadEdge: 0x59554e,
  roadLine: 0xe2d5b2,

  plaza: 0xc6b593,
  plazaEdge: 0xae9c7a,
  plazaSeam: 0xb8a684,

  path: 0xcabb96,
  pathEdge: 0xb0a17e,

  apron: 0x7d7568,
  apronEdge: 0x625b52,
  apronLine: 0xd8c9a4,

  // ── shadow (warm, never black) ────────────────────────────────────────────
  shadow: 0x4a3b2b,

  // ── stucco family (admin / writers / casting / theater / booth) ───────────
  cream: 0xefdfbe,
  creamLit: 0xe4cfa6,
  creamShade: 0xbb9f78,
  creamDeep: 0xa48a66,

  taupe: 0xdfcda6,
  taupeLit: 0xd2bd91,
  taupeShade: 0xab9169,

  // ── soundstage buff (matches the authored stage PNGs) ────────────────────
  buff: 0xd6c7a0,
  buffLit: 0xc9b88d,
  buffShade: 0xa89771,

  // ── post / technical block (cool warm-grey) ──────────────────────────────
  slate: 0xc0bda9,
  slateLit: 0xb0ad98,
  slateShade: 0x8f8d7b,

  // ── roofs ─────────────────────────────────────────────────────────────────
  terracotta: 0xb0603c,
  terracottaDark: 0x90492c,
  roofGravel: 0xa2977a,
  roofGravelDark: 0x877d63,
  roofMetal: 0xa98a68,
  roofMetalDark: 0x8a6d50,

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

  // ── yard / service dressing ──────────────────────────────────────────────
  crate: 0x9c7a4e,
  crateDark: 0x7d5f3a,
  timber: 0xc0a06a,
  timberDark: 0x9a7f52,
  steel: 0x6e6a60,
  canvasTarp: 0x8d8a6d,

  // ── vehicles ──────────────────────────────────────────────────────────────
  truckBody: 0x3f5a4c,
  truckTrim: 0xd8c9a4,
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
