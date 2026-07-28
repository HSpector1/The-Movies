// ── Palette ───────────────────────────────────────────────────────────────────
// A restrained, warm, classic-Hollywood identity: golden-hour light, cream stucco,
// terracotta, sage lawns, warm asphalt, brass accents. Deliberately NOT saturated
// primaries and NOT developer gray. Numbers are 0xRRGGBB for Phaser.

export const COLORS = {
  skyTop: 0xf5e6c8,
  skyBottom: 0xe6c79c,
  ground: 0x9aa877,

  // lawn tile
  lawn: 0x93a86c,
  lawnAlt: 0x8a9f63,
  lawnEdge: 0x74894f,

  // walkway tile
  path: 0xdac9a6,
  pathEdge: 0xc4b184,

  // road tile
  road: 0x6f6a63,
  roadEdge: 0x585249,
  roadLine: 0xe9dcbf,

  // plaza / courtyard tile
  plaza: 0xe4d7bc,
  plazaEdge: 0xcbbd9c,
  plazaSeam: 0xd3c4a2,

  // dirt / expansion pad
  dirt: 0xb39a74,
  dirtEdge: 0x9c8460,

  // stucco building (cream)
  cream: 0xefe3c6,
  creamRight: 0xe1d2ad,
  creamLeft: 0xc9b78e,

  // admin (taupe art-deco)
  taupe: 0xcdbb9a,
  taupeRight: 0xbea886,
  taupeLeft: 0xa48f6c,
  brass: 0xcaa25a,
  brassDark: 0xa9863f,

  // soundstage (buff hangar)
  buff: 0xdcc9a0,
  buffRight: 0xcab98d,
  buffLeft: 0xb09f72,
  stageDoor: 0x8a7a5c,
  stageDoorSeam: 0x766650,

  // post-production (cool technical)
  slate: 0xb9c0c4,
  slateRight: 0xa7afb4,
  slateLeft: 0x8b9499,

  // theater
  marquee: 0xf1e4c4,
  marqueeTrim: 0xb8484a, // deep red
  bladeSign: 0xb8484a,

  // roofs
  terracotta: 0xb56a4a,
  terracottaDark: 0x9c583c,
  roofFlat: 0xb7a988,
  roofFlatDark: 0xa1936f,

  // accents
  recordingOn: 0xe64b3c,
  recordingOff: 0x6b3a34,
  window: 0xbcd2d8,
  windowLit: 0xf6e4a6,
  glass: 0x9fb7bf,

  // props
  trunk: 0x7a5a3a,
  palmFrond: 0x5f7d43,
  hedge: 0x6f8a4c,
  hedgeDark: 0x5d7740,
  planter: 0xba6a48,
  lampPost: 0x4a443c,
  lampGlow: 0xf7e6a8,
  bench: 0x8a6a48,
  towerTank: 0xcdbda0,
  towerLeg: 0x6d6459,
  vehicleBody: 0x7d4b46,
  vehicleTrim: 0xe4d7bc,
  worker: 0x3d4a63, // muted figures
  workerAlt: 0x6a4b4b,
  banner: 0xb8484a,
  bannerGold: 0xcaa25a,

  // on-canvas ui
  labelBg: 0x241a12,
  labelText: 0xf5ecd8,
  selection: 0xf7d774,
  hover: 0xffffff,
  shadow: 0x2a2016,

  // ── pass-2 additions ──────────────────────────────────────────────────────
  // grounding & terrain
  plinth: 0xd7c6a6, // building foundation slab
  plinthEdge: 0xbda983,
  curb: 0xd9cbac,
  wallStucco: 0xe3d4b4, // perimeter wall
  wallStuccoR: 0xd3c19c,
  wallStuccoL: 0xbba982,
  wallCoping: 0xb56a4a, // terracotta coping cap
  tarmacApron: 0x7c766d, // stage apron paving

  // production activity
  stageInterior: 0xf6e6b0, // warm light spilling from an open stage
  stageInteriorDim: 0x2b2418,
  doorOpen: 0x3a3227,
  titleBoard: 0xf1e6cc,
  titleBoardLeg: 0x6d5a3c,
  cartBody: 0x5e6b6a,
  crate: 0x2b2620,
  cone: 0xc86a3c,
  cable: 0x2a2620,
  lightStand: 0x4a443c,
  lightHead: 0xf6e6b0,
  reflector: 0xd8cdb2,

  // ambient roles
  skin: 0xe8caa8,
  roleCrew: 0x3d4a63, // blue coverall
  roleCrewHat: 0xd8b04a, // hard hat
  roleOffice: 0x8a6a48, // tan/brown office wear
  roleTalent: 0xf0ead9, // pale glamour coat
  roleTalentTrim: 0xb8484a,
  roleGrip: 0x5a5048, // grip in olive/grey
  roleDirector: 0x4a3b2c, // director: brown coat
  roleDirectorHat: 0x2f2419, // fedora / beret
  roleDirectorScarf: 0xb8484a,
  rolePhotog: 0x4b4640, // photographer: grey
  cameraBox: 0x1c1712,
  takeFlash: 0xfff4d0, // brief "take" light cue
  activityMark: 0xf7d774,

  // vehicles
  vanBody: 0x4a5a52,
  vanRoof: 0xe4d7bc,
  cartRoof: 0xb8484a,
  cartFrame: 0x6d6459,

  // dressing / signage / flags
  pennantWarm: 0xcaa25a,
  pennantRed: 0xb8484a,
  flagCloth: 0xb8484a,
  flagPole: 0x6d6459,
  signPost: 0x6d5a3c,
  signPanel: 0x2f2318,
  gateLetter: 0xf5ecd8,
  boothRoof: 0xb56a4a,
  marqueeLit: 0xf6e6b0,
  marqueeBulb: 0xffe9a8,
} as const

export type ColorKey = keyof typeof COLORS
