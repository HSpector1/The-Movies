// Pipeline script — selects the REPRESENTATIVE SUBSET (contract §5) and stages
// runtime-ready copies. Writes manifests/curation.json (single source of truth for the
// subset). Does NOT convert Downtown glTF here — that is optimize-gltf.mjs's job.
//
// Scope discipline: this is a representative subset, NOT the full kit (§13 "do not expand
// into a full studio environment"). 31 Downtown pieces / 12 props / 2 animation libraries.
import { mkdirSync, copyFileSync, existsSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { EXTRACTED, PUBLIC_ASSETS, MANIFESTS } from './lib.mjs'

const DOWNTOWN_GLTF = join(EXTRACTED, 'downtown-city-megakit', 'Exports', 'glTF (Godot)')
const PROPS_DIR = join(EXTRACTED, 'fbx-props', 'FBX')
const ANIM_DIR = join(EXTRACTED, 'universal-animation-library', 'Universal Animation Library[Standard]', 'Unreal-Godot')

// --- Downtown: 1 hero building + 2 more, 12 modular parts, roads, sidewalks, decals, props ---
const downtown = [
  ['Building_Small_1', 'building', 'assembled hero building'],
  ['Building_Medium_2_001', 'building', 'assembled building'],
  ['Building_Large_2', 'building', 'assembled building'],
  ['Brick_Plain_1', 'modular', 'wall'], ['Brick_Window_Square_Single', 'modular', 'wall+window'],
  ['Brick_CornerColumn_Center', 'modular', 'corner'], ['Brick_TopTrim', 'modular', 'top trim'],
  ['Cornice_Brick_Center', 'modular', 'cornice'], ['Trim_FirstFloor_Wall', 'modular', 'ground floor'],
  ['Trim_FirstFloor_Window_001', 'modular', 'ground-floor window'], ['Roof_Slate_Center', 'modular', 'roof'],
  ['Roof_Slate_Corner', 'modular', 'roof corner'], ['Door_1', 'modular', 'door'],
  ['DoorFrame_Wooden', 'modular', 'door frame'], ['Metal_FullWindow', 'modular', 'metal facade window'],
  ['Street_2Lane', 'road', '2-lane road'], ['Street_4Lane', 'road', '4-lane road'],
  ['Street_4WayIntersection', 'road', 'intersection'], ['Street_Curve_2Lane', 'road', 'curved road'],
  ['Sidewalk_Straight_3m', 'sidewalk', 'sidewalk'], ['Sidewalk_Corner_Round_3m', 'sidewalk', 'sidewalk corner'],
  ['Sidewalk_Straight_3m_Stripe', 'sidewalk', 'sidewalk striped'],
  ['Decal_Crosswalk', 'decal', 'crosswalk'], ['Decal_DoubleYellow_Straight', 'decal', 'lane line'],
  ['Prop_ACUnit', 'streetprop', 'AC unit'], ['Prop_Bollard', 'streetprop', 'bollard'],
  ['Prop_ManholeCover', 'streetprop', 'manhole'], ['Prop_Planter_Single', 'streetprop', 'planter'],
  ['Prop_Drain', 'streetprop', 'drain'],
  ['Door_2', 'door', 'door variant'], ['Metal_Window', 'window', 'window variant'],
].map(([name, role, note]) => ({ name, role, note, src: join(DOWNTOWN_GLTF, name + '.gltf') }))

// --- FBX interior props: 12, for the furnished-set scene. LICENSE-UNCLEAR (§5). ---
const props = [
  'Couch_Medium1', 'Chair_1', 'Table_RoundSmall', 'Bookshelf', 'Shelf_1', 'Houseplant_3',
  'Light_Floor1', 'Light_Desk', 'Carpet_1', 'NightStand_1', 'Fireplace', 'Bathroom_Mirror1',
].map((name) => ({ name, src: join(PROPS_DIR, name + '.fbx') }))

// --- Animation libraries: in-place + root-motion. All 43 clips shared; 6 required roles mapped. ---
const animation = [
  { name: 'UAL1_Standard', file: 'UAL1_Standard.glb', rootMotion: false, src: join(ANIM_DIR, 'UAL1_Standard.glb') },
  { name: 'UAL1_Standard_RM', file: 'UAL1_Standard_RM.glb', rootMotion: true, src: join(ANIM_DIR, 'UAL1_Standard_RM.glb') },
]
const roleClipMap = {
  idle: 'Idle_Loop', walk: 'Walk_Loop', talkingIdle: 'Idle_Talking_Loop',
  seated: 'Sitting_Idle_Loop', interaction: 'PickUp_Table', repair: 'Fixing_Kneeling',
}

// --- stage runtime-ready copies (props + animation need no conversion) ---
for (const d of ['downtown', 'props', 'animation']) mkdirSync(join(PUBLIC_ASSETS, d), { recursive: true })
const warn = []
let copied = 0
for (const pr of props) {
  if (existsSync(pr.src)) { copyFileSync(pr.src, join(PUBLIC_ASSETS, 'props', pr.name + '.fbx')); copied++ }
  else warn.push('missing prop ' + pr.src)
}
for (const a of animation) {
  if (existsSync(a.src)) { copyFileSync(a.src, join(PUBLIC_ASSETS, 'animation', a.file)); copied++ }
  else warn.push('missing animation ' + a.src)
}
for (const d of downtown) if (!existsSync(d.src)) warn.push('missing downtown source ' + d.src)

writeFileSync(join(MANIFESTS, 'curation.json'), JSON.stringify({
  tool: 'curate', scale: { unit: 'meter', adultHeight: 1.8 },
  downtown, props, animation, roleClipMap,
}, null, 2) + '\n')

console.log(`curated subset: downtown=${downtown.length} (to convert), props=${props.length} (copied fbx), animation=${animation.length} (copied glb)`)
console.log(`runtime files staged: ${copied}`)
if (warn.length) { console.log('WARNINGS:'); warn.forEach((w) => console.log('  ! ' + w)) }
console.log('wrote manifests/curation.json')
