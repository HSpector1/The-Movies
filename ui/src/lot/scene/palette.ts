// ── Palette ───────────────────────────────────────────────────────────────────
// Gate D1 art-direction revision (owner ruling B): the approved spike composition
// and procedural flat-shaded look are preserved, but the palette is retuned to belong
// to the *dark* Project: Studio product. The sky/ground move to a restrained dusk
// (matching the product --bg backdrop), the "this one / attention" accents are tied to
// the product brass (--accent #c9a24a), and the on-canvas label chrome uses the product
// panel/text tokens. The warm stucco building faces are kept (a magic-hour studio lot
// reads correctly against a dark sky) so silhouettes stay recognizable.
// Numbers are 0xRRGGBB for Phaser.

export const COLORS = {
  // Dusk sky, aligned to the product --bg backdrop (the mount-element CSS gradient).
  skyTop: 0x20242f,
  skyBottom: 0x14161c,
  ground: 0x6f7d55,

  // lawn tile (dimmed sage under dusk)
  lawn: 0x6d7f4f,
  lawnAlt: 0x647648,
  lawnEdge: 0x54653b,

  // walkway tile
  path: 0xb3a888,
  pathEdge: 0x9a8f70,

  // road tile
  road: 0x565049,
  roadEdge: 0x413c35,
  roadLine: 0xcdbf9a,

  // plaza / courtyard tile
  plaza: 0xbfb290,
  plazaEdge: 0xa89b7a,
  plazaSeam: 0xb0a380,

  // dirt / expansion pad
  dirt: 0x8a7a5e,
  dirtEdge: 0x6f6249,

  // stucco building (cream) — warm faces, kept recognizable
  cream: 0xefe3c6,
  creamRight: 0xe1d2ad,
  creamLeft: 0xc9b78e,

  // admin (taupe art-deco)
  taupe: 0xcdbb9a,
  taupeRight: 0xbea886,
  taupeLeft: 0xa48f6c,
  brass: 0xc9a24a, // product --accent
  brassDark: 0x8a7233, // product --accent-dim

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
  bannerGold: 0xc9a24a, // product brass

  // on-canvas ui — aligned to the product panel/text tokens so labels read as cards
  labelBg: 0x1c1f28, // product --bg-panel
  labelText: 0xe8eaf0, // product --text
  selection: 0xdcbb63, // brass selection ring (the product's "this one" signal)
  hover: 0xf0e6c8,
  shadow: 0x0b0d12, // deep dusk shadow

  // ── pass-2 additions ──────────────────────────────────────────────────────
  // grounding & terrain
  plinth: 0xd7c6a6, // building foundation slab
  plinthEdge: 0xbda983,
  curb: 0xcabf9f,
  wallStucco: 0xe3d4b4, // perimeter wall
  wallStuccoR: 0xd3c19c,
  wallStuccoL: 0xbba982,
  wallCoping: 0xb56a4a, // terracotta coping cap
  tarmacApron: 0x6c675f, // stage apron paving (cooler under dusk)

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
  activityMark: 0xc9a24a, // product brass — ties the activity/attention cue to the UI

  // vehicles
  vanBody: 0x4a5a52,
  vanRoof: 0xe4d7bc,
  cartRoof: 0xb8484a,
  cartFrame: 0x6d6459,

  // dressing / signage / flags
  pennantWarm: 0xc9a24a, // product brass
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
