// ── crew3d — readable people, keyed to engine facts, never decorative ─────────
//
// Bodies come from the Asset Lab 05 Blender factory (committed GLBs, CC0-rigged,
// 1 unit = 1 m, 1.8 m adults; provenance carried in ui/public/spike3d/). The rigs
// ship with NO animation clips, so this module poses them procedurally: arms down
// out of the bind T-pose, deterministic per-person variation from the id hash the
// 2D world already varies with, a transform walk cycle for played weeks. Who
// stands where and WHY stays the world model's decision (presence/theater) — this
// module only answers what a grip looks like.

import {
  CylinderGeometry,
  Float32BufferAttribute,
  Group,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Quaternion,
  SkinnedMesh,
  SphereGeometry,
} from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { clone as cloneSkeleton } from 'three/addons/utils/SkeletonUtils.js'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { gridNoise } from '../tycoon/world.ts'

export type CrewRole =
  | 'director'
  | 'actor'
  | 'writer'
  | 'craft'
  | 'grip'
  | 'electric'
  | 'camera'
  | 'maintenance'
  | 'office'
  | 'pa'

const ROLE_FILE: Record<CrewRole, string> = {
  director: 'Char_Director_Standard.glb',
  actor: 'Char_Office_Standard.glb',
  writer: 'Char_PA_Standard.glb',
  craft: 'Char_Carpenter_Heavy.glb',
  grip: 'Char_Grip_Standard.glb',
  electric: 'Char_Electric_Heavy.glb',
  camera: 'Char_CameraDP_Standard.glb',
  maintenance: 'Char_Maintenance_Heavy.glb',
  office: 'Char_Office_Standard.glb',
  pa: 'Char_PA_Standard.glb',
}

const PROP_FILES = [
  'Prop_StudioCamera.glb',
  'Prop_Fresnel.glb',
  'Prop_DirectorsChair.glb',
  'Prop_CStand.glb',
  'Prop_AppleBox_Full.glb',
  'Prop_Boom_attach_hand_r.glb',
  'Prop_CableReel.glb',
  'Prop_Megaphone_attach_hand_r.glb',
  'Prop_Slate_attach_hand_l.glb',
] as const

export type WorkingPose = 'stand' | 'idle' | 'carry' | 'direct' | 'operate' | 'haul' | 'wait'

type Bones = {
  upperarmL?: Object3D
  upperarmR?: Object3D
  lowerarmL?: Object3D
  lowerarmR?: Object3D
  thighL?: Object3D
  thighR?: Object3D
  calfL?: Object3D
  calfR?: Object3D
  head?: Object3D
  spine?: Object3D
  handL?: Object3D
  handR?: Object3D
  pelvis?: Object3D
}

export type CrewFigure = {
  root: Object3D
  bones: Bones
  baseY: number
}

/** Arms-down pose out of the factory bind T-pose. Tuned against captures. */
const ARM_DOWN = 1.18
const ELBOW_BEND = 0.22
const FULL_TURN = Math.PI * 2

type BoneRotations = Map<Object3D, Quaternion>

type FigurePoseState = {
  seed: number
  pose: WorkingPose
  bind: BoneRotations
  base: BoneRotations
}

// Animation bookkeeping is presentation-only and deliberately kept outside the
// public figure shape. A WeakMap also lets rebuilt scene figures be collected.
const POSE_STATE = new WeakMap<CrewFigure, FigurePoseState>()

/**
 * Asset-Lab characters carry 7–9 flat-colour primitives on one rig. GLTFLoader
 * correctly preserves them as separate SkinnedMeshes, but that multiplies both
 * draw submission and skeleton work for every visible person. Bake each material
 * colour into a vertex attribute and merge sibling primitives onto their shared
 * skeleton: identical silhouette/rig, one skinned draw.
 */
function collapseCharacterPrimitives(root: Object3D): void {
  const byParent = new Map<Object3D, SkinnedMesh[]>()
  root.traverse((node) => {
    const skinned = node as SkinnedMesh
    if (!skinned.isSkinnedMesh || skinned.parent === null) return
    const siblings = byParent.get(skinned.parent) ?? []
    siblings.push(skinned)
    byParent.set(skinned.parent, siblings)
  })

  for (const [parent, meshes] of byParent) {
    if (meshes.length < 2) continue
    const first = meshes[0]
    const sameTransform = meshes.every(
      (mesh) =>
        mesh.position.equals(first.position) &&
        mesh.quaternion.equals(first.quaternion) &&
        mesh.scale.equals(first.scale),
    )
    if (!sameTransform) continue

    const geometries = meshes.map((mesh) => {
      const geometry = mesh.geometry.clone()
      const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material
      const colour = material instanceof MeshStandardMaterial ? material.color : undefined
      const position = geometry.getAttribute('position')
      const colours = new Float32Array(position.count * 3)
      for (let i = 0; i < position.count; i++) {
        colours[i * 3] = colour?.r ?? 0.5
        colours[i * 3 + 1] = colour?.g ?? 0.5
        colours[i * 3 + 2] = colour?.b ?? 0.5
      }
      geometry.setAttribute('color', new Float32BufferAttribute(colours, 3))
      return geometry
    })
    const geometry = mergeGeometries(geometries, false)
    for (const part of geometries) part.dispose()
    if (geometry === null) continue

    const material = new MeshStandardMaterial({ vertexColors: true, roughness: 0.82 })
    const combined = new SkinnedMesh(geometry, material)
    combined.name = `${first.name || 'crew'}-merged`
    combined.position.copy(first.position)
    combined.quaternion.copy(first.quaternion)
    combined.scale.copy(first.scale)
    combined.bindMode = first.bindMode
    combined.bind(first.skeleton, first.bindMatrix)
    combined.castShadow = false
    combined.receiveShadow = true
    combined.frustumCulled = false

    for (const mesh of meshes) parent.remove(mesh)
    parent.add(combined)
    for (const mesh of meshes) {
      mesh.geometry.dispose()
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      for (const oldMaterial of materials) oldMaterial.dispose()
    }
  }
}

function captureRotations(bones: Bones): BoneRotations {
  const rotations: BoneRotations = new Map()
  for (const bone of Object.values(bones)) {
    if (bone !== undefined && !rotations.has(bone)) rotations.set(bone, bone.quaternion.clone())
  }
  return rotations
}

function resetRotations(rotations: BoneRotations): void {
  for (const [bone, rotation] of rotations) bone.quaternion.copy(rotation)
}

function applyBasePose(figure: CrewFigure, pose: WorkingPose, seed: number): void {
  const state = POSE_STATE.get(figure) ?? {
    seed,
    pose,
    bind: captureRotations(figure.bones),
    base: new Map<Object3D, Quaternion>(),
  }
  state.seed = seed
  resetRotations(state.bind)

  const { bones } = figure
  const v = (salt: number) => gridNoise(seed * 0.173, salt, 5) - 0.5
  // Arms out of the T-pose. These offsets are re-applied from the captured bind
  // pose, so switching work poses cannot accumulate rotations either.
  if (bones.upperarmL) bones.upperarmL.rotation.x = 0
  bones.upperarmL?.rotateZ(-(ARM_DOWN + v(1) * 0.14))
  bones.upperarmR?.rotateZ(ARM_DOWN + v(2) * 0.14)
  bones.lowerarmL?.rotateZ(-(ELBOW_BEND + v(3) * 0.1))
  bones.lowerarmR?.rotateZ(ELBOW_BEND + v(4) * 0.1)
  bones.head?.rotateY(v(5) * 0.5)
  switch (pose) {
    case 'carry':
      // both forearms raised to hold a load at the waist
      bones.upperarmL?.rotateY(0.5)
      bones.upperarmR?.rotateY(-0.5)
      bones.lowerarmL?.rotateZ(-0.95)
      bones.lowerarmR?.rotateZ(0.95)
      break
    case 'direct':
      // right arm up and out — the set's voice
      bones.upperarmR?.rotateZ(-1.75)
      bones.lowerarmR?.rotateZ(0.4)
      bones.spine?.rotateY(0.15)
      break
    case 'operate':
      // hands forward at chest height, head down a touch
      bones.upperarmL?.rotateY(0.75)
      bones.upperarmR?.rotateY(-0.75)
      bones.lowerarmL?.rotateZ(-0.7)
      bones.lowerarmR?.rotateZ(0.7)
      bones.head?.rotateX(0.16)
      break
    case 'haul':
      // leaning into a pull
      bones.spine?.rotateX(0.3)
      bones.upperarmL?.rotateY(0.55)
      bones.upperarmR?.rotateY(-0.55)
      break
    case 'wait':
      bones.spine?.rotateX(-0.05)
      bones.head?.rotateY(v(6) * 0.9)
      break
    case 'idle':
    case 'stand':
      break
  }

  state.pose = pose
  state.base = captureRotations(bones)
  POSE_STATE.set(figure, state)
}

export class CrewFactory {
  private prototypes = new Map<string, Object3D>()
  private props = new Map<string, Object3D>()
  loaded = false

  /** Load every character + crew prop once. Failures leave the fallback body in play. */
  async load(baseUrl: string): Promise<void> {
    const loader = new GLTFLoader()
    const one = async (file: string, into: Map<string, Object3D>): Promise<void> => {
      try {
        const gltf = await loader.loadAsync(`${baseUrl}spike3d/${file.startsWith('Prop_') ? 'props' : 'characters'}/${file}`)
        const scene = gltf.scene
        if (!file.startsWith('Prop_')) collapseCharacterPrimitives(scene)
        scene.traverse((node) => {
          if ((node as Mesh).isMesh) {
            // Tens of rig parts each issuing a second skinned shadow draw was the
            // dominant overview cost. A batched contact-blob pass in ThreeLotScene
            // grounds people while the PBR figures still receive the authored sun.
            node.castShadow = false
            node.receiveShadow = true
            // Bind-pose bounds cull skinned crew in close views (3D-spike lesson).
            node.frustumCulled = false
          }
        })
        into.set(file, scene)
      } catch {
        // fail-neutral: the stylised fallback figure serves instead
      }
    }
    await Promise.all([
      ...Object.values(ROLE_FILE).map((f) => one(f, this.prototypes)),
      ...PROP_FILES.map((f) => one(f, this.props)),
    ])
    this.loaded = true
  }

  /** One posed person. `seed` keys every variation deterministically. */
  person(role: CrewRole, seed: number, pose: WorkingPose = 'stand'): CrewFigure {
    const proto = this.prototypes.get(ROLE_FILE[role])
    if (proto === undefined) return this.fallback(seed, pose)
    const root = cloneSkeleton(proto)
    // Normalise to 1.8 m regardless of export scale drift.
    const wrapped = new Group()
    wrapped.add(root)
    const bones: Bones = {}
    root.traverse((node) => {
      switch (node.name) {
        case 'upperarm_l': bones.upperarmL = node; break
        case 'upperarm_r': bones.upperarmR = node; break
        case 'lowerarm_l': bones.lowerarmL = node; break
        case 'lowerarm_r': bones.lowerarmR = node; break
        case 'thigh_l': bones.thighL = node; break
        case 'thigh_r': bones.thighR = node; break
        case 'calf_l': bones.calfL = node; break
        case 'calf_r': bones.calfR = node; break
        case 'Head': bones.head = node; break
        case 'spine_02': bones.spine = node; break
        case 'hand_l': bones.handL = node; break
        case 'hand_r': bones.handR = node; break
        case 'pelvis': bones.pelvis = node; break
      }
    })
    const figure: CrewFigure = { root: wrapped, bones, baseY: 0 }
    POSE_STATE.set(figure, {
      seed,
      pose,
      bind: captureRotations(bones),
      base: new Map<Object3D, Quaternion>(),
    })
    this.applyPose(figure, pose, seed)
    return figure
  }

  /** A staged hand/apron prop from the factory library, or null. */
  prop(file: (typeof PROP_FILES)[number]): Object3D | null {
    const proto = this.props.get(file)
    if (proto === undefined) return null
    const copy = proto.clone(true)
    copy.traverse((node) => {
      if ((node as Mesh).isMesh) {
        node.castShadow = true
        node.receiveShadow = true
      }
    })
    return copy
  }

  applyPose(figure: CrewFigure, pose: WorkingPose, seed: number): void {
    applyBasePose(figure, pose, seed)
  }

  /**
   * A restrained loop for stationary work. It is a pure function of the figure,
   * semantic pose and phase (0..1): every frame first restores the captured base
   * pose, then adds small phase offsets. Repeating a phase therefore produces the
   * exact same bone transforms with no cumulative drift.
   */
  static work(figure: CrewFigure, pose: WorkingPose, phase: number): void {
    let state = POSE_STATE.get(figure)
    if (state === undefined) {
      const captured = captureRotations(figure.bones)
      state = { seed: 0, pose, bind: captured, base: captured }
      POSE_STATE.set(figure, state)
    } else if (state.pose !== pose) {
      applyBasePose(figure, pose, state.seed)
      state = POSE_STATE.get(figure) ?? state
    }

    resetRotations(state.base)
    figure.root.position.y = figure.baseY

    const loop = ((phase % 1) + 1) % 1
    const figureOffset = gridNoise(state.seed * 0.019, state.seed * 0.031, 197) * FULL_TURN
    const t = loop * FULL_TURN + figureOffset
    const lead = Math.sin(t)
    const follow = Math.sin(t + Math.PI * 0.58)
    const counter = Math.sin(t + Math.PI)
    const double = Math.sin(t * 2 + Math.PI * 0.23)
    const b = figure.bones

    switch (pose) {
      case 'idle':
      case 'stand':
        b.spine?.rotateZ(lead * 0.018)
        b.head?.rotateY(follow * 0.1)
        b.upperarmL?.rotateX(double * 0.018)
        b.upperarmR?.rotateX(-double * 0.018)
        break
      case 'direct':
        b.spine?.rotateY(counter * 0.045)
        b.head?.rotateY(lead * 0.06)
        b.upperarmR?.rotateZ(lead * 0.16)
        b.lowerarmR?.rotateZ(follow * 0.11)
        break
      case 'operate':
        b.spine?.rotateX(double * 0.025)
        b.head?.rotateX(follow * 0.035)
        b.lowerarmL?.rotateX(lead * 0.09)
        b.lowerarmR?.rotateX(counter * 0.09)
        break
      case 'haul':
        b.spine?.rotateX((lead + 1) * 0.035)
        b.upperarmL?.rotateX(follow * 0.11)
        b.upperarmR?.rotateX(follow * 0.11)
        b.thighL?.rotateX(counter * 0.035)
        b.thighR?.rotateX(lead * 0.035)
        break
      case 'carry':
        b.spine?.rotateZ(lead * 0.035)
        b.pelvis?.rotateZ(counter * 0.025)
        b.lowerarmL?.rotateX(follow * 0.045)
        b.lowerarmR?.rotateX(follow * 0.045)
        b.head?.rotateY(double * 0.055)
        break
      case 'wait':
        b.spine?.rotateZ(lead * 0.025)
        b.pelvis?.rotateZ(counter * 0.018)
        b.head?.rotateY(follow * 0.16)
        break
    }
  }

  /**
   * Transform walk cycle — pure function of phase (0..1 loops), so a paused frame
   * is a legal pose and reduced motion simply never advances the phase.
   */
  static walk(figure: CrewFigure, phase: number): void {
    const state = POSE_STATE.get(figure)
    if (state !== undefined) resetRotations(state.base)
    const s = Math.sin(phase * Math.PI * 2)
    const c = Math.sin(phase * Math.PI * 2 + Math.PI)
    const b = figure.bones
    if (b.thighL) b.thighL.rotation.x = s * 0.52
    if (b.thighR) b.thighR.rotation.x = c * 0.52
    if (b.calfL) b.calfL.rotation.x = Math.max(0, -s) * 0.65
    if (b.calfR) b.calfR.rotation.x = Math.max(0, -c) * 0.65
    if (b.upperarmL) b.upperarmL.rotation.x = c * 0.35
    if (b.upperarmR) b.upperarmR.rotation.x = s * 0.35
    figure.root.position.y = figure.baseY + Math.abs(s) * 0.035
  }

  /** Attach a hand prop to a bone (slate, megaphone, boom), if both exist. */
  attach(figure: CrewFigure, propFile: (typeof PROP_FILES)[number], hand: 'handL' | 'handR'): void {
    const bone = figure.bones[hand]
    const body = this.prop(propFile)
    if (bone === undefined || body === null) return
    bone.add(body)
  }

  /** Stylised period fallback — never an empty lot (fail-soft, like the 2D atlas). */
  private fallback(seed: number, pose: WorkingPose): CrewFigure {
    const g = new Group()
    const suit = new MeshStandardMaterial({ color: 0x6b5d4a, roughness: 0.9 })
    const skin = new MeshStandardMaterial({ color: 0xc9a181, roughness: 0.8 })
    const body = new Mesh(new CylinderGeometry(0.22, 0.28, 1.05, 8), suit)
    body.position.y = 0.85
    body.castShadow = false
    g.add(body)
    const head = new Mesh(new SphereGeometry(0.16, 8, 6), skin)
    head.position.y = 1.56
    head.castShadow = false
    g.add(head)
    const brim = new Mesh(new CylinderGeometry(0.24, 0.24, 0.04, 10), suit)
    brim.position.y = 1.66
    g.add(brim)
    const crown = new Mesh(new CylinderGeometry(0.13, 0.15, 0.16, 10), suit)
    crown.position.y = 1.76
    g.add(crown)
    const yaw = (gridNoise(seed, 3, 9) - 0.5) * Math.PI
    g.rotation.y = yaw
    const figure: CrewFigure = { root: g, bones: {}, baseY: 0 }
    POSE_STATE.set(figure, { seed, pose, bind: new Map(), base: new Map() })
    return figure
  }
}
