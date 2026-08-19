// ── crew3d — readable people, keyed to engine facts, never decorative ─────────
//
// Bodies come from the Asset Lab 05 Blender factory (committed GLBs, CC0-rigged,
// 1 unit = 1 m, 1.8 m adults; provenance carried in ui/public/spike3d/). The rigs
// ship with NO animation clips, so this module poses them procedurally: arms down
// out of the bind T-pose, deterministic per-person variation from the id hash the
// 2D world already varies with, a transform walk cycle for played weeks. Who
// stands where and WHY stays the world model's decision (presence/theater) — this
// module only answers what a grip looks like.

import { Group, Mesh, MeshStandardMaterial, Object3D, SphereGeometry, CylinderGeometry } from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { clone as cloneSkeleton } from 'three/addons/utils/SkeletonUtils.js'
import { gridHash } from '../tycoon/world.ts'

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
  'Prop_Megaphone_attach_hand_r.glb',
  'Prop_Slate_attach_hand_l.glb',
] as const

export type WorkingPose = 'stand' | 'carry' | 'direct' | 'operate' | 'haul' | 'wait'

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

export class CrewFactory {
  private prototypes = new Map<string, Object3D>()
  private props = new Map<string, Object3D>()
  loaded = false

  /** Load every character + hand prop once. Failures leave the fallback body in play. */
  async load(baseUrl: string): Promise<void> {
    const loader = new GLTFLoader()
    const one = async (file: string, into: Map<string, Object3D>): Promise<void> => {
      try {
        const gltf = await loader.loadAsync(`${baseUrl}spike3d/${file.startsWith('Prop_') ? 'props' : 'characters'}/${file}`)
        const scene = gltf.scene
        scene.traverse((node) => {
          if ((node as Mesh).isMesh) {
            node.castShadow = true
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
    if (proto === undefined) return this.fallback(seed)
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
    const { bones } = figure
    const v = (salt: number) => gridHash(seed * 0.173, salt, 5) - 0.5
    // arms out of the T
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
      case 'stand':
        break
    }
  }

  /**
   * Transform walk cycle — pure function of phase (0..1 loops), so a paused frame
   * is a legal pose and reduced motion simply never advances the phase.
   */
  static walk(figure: CrewFigure, phase: number): void {
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

  /** Attach a hand prop to a bone (slate, megaphone), if both exist. */
  attach(figure: CrewFigure, propFile: (typeof PROP_FILES)[number], hand: 'handL' | 'handR'): void {
    const bone = figure.bones[hand]
    const body = this.prop(propFile)
    if (bone === undefined || body === null) return
    bone.add(body)
  }

  /** Stylised period fallback — never an empty lot (fail-soft, like the 2D atlas). */
  private fallback(seed: number): CrewFigure {
    const g = new Group()
    const suit = new MeshStandardMaterial({ color: 0x6b5d4a, roughness: 0.9 })
    const skin = new MeshStandardMaterial({ color: 0xc9a181, roughness: 0.8 })
    const body = new Mesh(new CylinderGeometry(0.22, 0.28, 1.05, 8), suit)
    body.position.y = 0.85
    body.castShadow = true
    g.add(body)
    const head = new Mesh(new SphereGeometry(0.16, 8, 6), skin)
    head.position.y = 1.56
    head.castShadow = true
    g.add(head)
    const brim = new Mesh(new CylinderGeometry(0.24, 0.24, 0.04, 10), suit)
    brim.position.y = 1.66
    g.add(brim)
    const crown = new Mesh(new CylinderGeometry(0.13, 0.15, 0.16, 10), suit)
    crown.position.y = 1.76
    g.add(crown)
    const yaw = (gridHash(seed, 3, 9) - 0.5) * Math.PI
    g.rotation.y = yaw
    return { root: g, bones: {}, baseY: 0 }
  }
}
