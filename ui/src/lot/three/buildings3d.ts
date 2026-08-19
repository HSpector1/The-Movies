// ── buildings3d — physical bodies for the composed world's buildings ───────────
//
// One builder per authored texKey, one per capability CLASS, and one honest
// massing block for everything else — the same dressing ladder world.ts already
// rules (authored art → class body → honest block, never a borrowed body).
// Geometry carries the silhouette: roof forms, massing steps, porticos and door
// reveals do the identification work the 2D bake did with paint (00H priority 6),
// and every building wears its NAME as physical signage, not a floating label.
//
// The factory reads ONLY the composed WorldBuilding (engine geometry + authored
// presentation). It decides no status and invents no bodies.

import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  SphereGeometry,
} from 'three'
import type { WorldBuilding } from '../tycoon/buildings.ts'
import { TILE_M } from './iso3d.ts'
import { signTexture, type MaterialLedger } from './materials3d.ts'

type Mat = MeshStandardMaterial
type Face = 'px' | 'nx' | 'pz' | 'nz'

const FACE_YAW: Record<Face, number> = { pz: 0, px: Math.PI / 2, nz: Math.PI, nx: -Math.PI / 2 }

function part(geo: BoxGeometry | CylinderGeometry | ConeGeometry | SphereGeometry, mat: Mat, x = 0, y = 0, z = 0): Mesh {
  const m = new Mesh(geo, mat)
  m.position.set(x, y, z)
  m.castShadow = true
  m.receiveShadow = true
  return m
}

const box = (w: number, h: number, d: number, mat: Mat, x = 0, y = 0, z = 0): Mesh =>
  part(new BoxGeometry(w, h, d), mat, x, y + h / 2, z)

export class BuildingFactory {
  constructor(private readonly m: MaterialLedger) {}

  /**
   * The full body for one composed building, positioned by the CALLER (the scene
   * places the group at the footprint's world centre). `w`/`d` below are metres.
   */
  make(building: WorldBuilding): Group {
    const w = building.fw * TILE_M
    const d = building.fd * TILE_M
    const face = this.doorFace(building)
    const builder = this.byTexKey[building.texKey] ?? this.byCapability(building.capability)
    const g = builder.call(this, w, d, face, building.label)
    g.name = building.buildingId
    return g
  }

  /**
   * Which face the door belongs on: the face the building's own surveyed work/entry
   * anchor stands off. Fail-neutral default is the +gy face — the one every road on
   * the founding property fronts.
   */
  private doorFace(building: WorldBuilding): Face {
    const anchor = building.anchors['work'] ?? building.anchors['entry'] ?? building.anchors['wait']
    if (anchor === undefined) return 'pz'
    const cx = building.gx + building.fw / 2
    const cy = building.gy + building.fd / 2
    const dx = anchor.gx - cx
    const dy = anchor.gy - cy
    if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'px' : 'nx'
    return dy > 0 ? 'pz' : 'nz'
  }

  /** A face-local group: +z is OUT of the chosen face, origin at the wall plane. */
  private onFace(g: Group, face: Face, w: number, d: number, inset = 0): Group {
    const local = new Group()
    const half = (face === 'px' || face === 'nx' ? w : d) / 2 - inset
    local.rotation.y = FACE_YAW[face]
    local.position.set(
      face === 'px' ? half : face === 'nx' ? -half : 0,
      0,
      face === 'pz' ? half : face === 'nz' ? -half : 0,
    )
    g.add(local)
    return local
  }

  /** Physical name board, centred on a face at height `y`. */
  private sign(g: Group, face: Face, w: number, d: number, label: string, y: number, scale = 1): void {
    const board = this.onFace(g, face, w, d, -0.12)
    const texture = signTexture(label)
    const mat = new MeshStandardMaterial({ map: texture, roughness: 0.6 })
    const sw = Math.min(((face === 'px' || face === 'nx' ? d : w) - 2) * 0.8, 7.5 * scale)
    const plane = new Mesh(new PlaneGeometry(sw, sw / 4), mat)
    plane.position.set(0, y, 0.05)
    plane.castShadow = false
    plane.receiveShadow = false
    board.add(plane)
    board.add(box(sw + 0.4, sw / 4 + 0.4, 0.09, this.m.trimDeep, 0, y - (sw / 4 + 0.4) / 2, -0.06))
  }

  private windowRow(host: Group, count: number, y: number, spread: number, ww = 0.9, wh = 1.2, lit = false): void {
    for (let i = 0; i < count; i++) {
      const x = count === 1 ? 0 : -spread / 2 + (spread / (count - 1)) * i
      host.add(box(ww + 0.24, wh + 0.24, 0.08, this.m.trim, x, y - 0.12, 0.02))
      host.add(box(ww, wh, 0.1, lit ? this.m.windowLit : this.m.glass, x, y, 0.05))
    }
  }

  // ── soundstages ────────────────────────────────────────────────────────────
  private soundstage(w: number, d: number, face: Face, label: string, monitor: boolean): Group {
    const g = new Group()
    const bw = w - 0.6
    const bd = d - 0.6
    const wallH = 7.6
    // base band + corrugate upper walls
    g.add(box(bw, 1.6, bd, this.m.cream))
    g.add(box(bw - 0.08, wallH - 1.6, bd - 0.08, this.m.corrugate, 0, 1.6, 0))
    // pilaster ribs carry the vertical rhythm the baked art had
    const alongX = bw >= bd
    const ribCount = Math.max(3, Math.floor((alongX ? bw : bd) / 3.4))
    for (let i = 0; i < ribCount; i++) {
      const t = -((alongX ? bw : bd) / 2 - 1.2) + ((alongX ? bw : bd) - 2.4) * (i / (ribCount - 1))
      g.add(box(alongX ? 0.36 : bw + 0.14, wallH - 0.5, alongX ? bd + 0.14 : 0.36, this.m.trimDeep, alongX ? t : 0, 0, alongX ? 0 : t))
    }
    // barrel vault along the long axis
    const radius = (alongX ? bd : bw) / 2 - 0.2
    const barrel = new Mesh(
      new CylinderGeometry(radius, radius, (alongX ? bw : bd) - 0.4, 24, 1, false, 0, Math.PI),
      this.m.roofMetal,
    )
    barrel.rotation.z = Math.PI / 2
    barrel.rotation.x = alongX ? 0 : Math.PI / 2
    if (!alongX) barrel.rotation.z = 0, (barrel.rotation.x = Math.PI / 2), (barrel.rotation.y = Math.PI / 2)
    barrel.scale.y = alongX ? 1 : 1
    barrel.position.y = wallH
    barrel.scale.x = alongX ? 1 : 1
    // flatten the vault a little: a full half-circle reads like a hangar
    barrel.scale.z = 0.62
    if (!alongX) barrel.scale.set(0.62, 1, 1)
    barrel.castShadow = true
    barrel.receiveShadow = true
    g.add(barrel)
    if (monitor) {
      // ridge monitor with clerestory glass — the Stage-B silhouette
      const mw = (alongX ? bw : bd) * 0.55
      const monitorBox = new Group()
      monitorBox.add(box(mw, 1.7, 3.4, this.m.corrugate))
      monitorBox.add(box(mw - 0.4, 0.9, 3.5, this.m.glass, 0, 0.35, 0))
      monitorBox.add(box(mw + 0.3, 0.34, 3.9, this.m.roofMetal, 0, 1.7, 0))
      monitorBox.rotation.y = alongX ? 0 : Math.PI / 2
      monitorBox.position.y = wallH + radius * 0.62 - 0.4
      g.add(monitorBox)
    }
    for (let i = 0; i < 3; i++) {
      g.add(box(0.7, 0.55, 0.7, this.m.roofMetal, (i - 1) * (alongX ? bw : bd) * 0.22, wallH + radius * 0.62 * 0.75, (alongX ? bd : bw) * 0.18))
    }
    // elephant door with reveal, header, track and the stage's painted name
    const doorHost = this.onFace(g, face, bw, bd)
    doorHost.add(box(5.6, 5.4, 0.3, this.m.trimDeep, 0, 0, 0.02))
    doorHost.add(box(5.0, 4.9, 0.24, this.m.timberDark, 0, 0, 0.14))
    doorHost.add(box(2.4, 4.7, 0.1, this.m.timber, -1.25, 0, 0.32))
    doorHost.add(box(6.6, 0.3, 0.34, this.m.steel, 0, 5.15, 0.1))
    const lamp = part(new SphereGeometry(0.17, 8, 6), this.m.stageGlow, 0, 5.75, 0.25)
    lamp.visible = false
    doorHost.add(lamp)
    g.userData.hotLamp = lamp
    this.sign(g, face, bw, bd, label, 6.7, 0.9)
    // lean-to stage office hugs one flank
    const annexSide: Face = face === 'px' || face === 'nx' ? 'pz' : 'px'
    const annex = this.onFace(g, annexSide, bw + 3.4, bd + 3.4, 1.8)
    annex.add(box(Math.min(bw, bd) * 0.5, 3.2, 3.2, this.m.cream, 0, 0, 0))
    annex.add(box(Math.min(bw, bd) * 0.5 + 0.3, 0.24, 3.5, this.m.roofGravel, 0, 3.2, 0))
    return g
  }

  // ── the founding department buildings ─────────────────────────────────────
  private admin(w: number, d: number, face: Face, label: string): Group {
    const g = new Group()
    const bw = w - 1
    const bd = d - 1
    g.add(box(bw, 7.4, bd, this.m.cream))
    g.add(box(bw + 0.34, 0.5, bd + 0.34, this.m.trim, 0, 7.4, 0))
    // stepped Deco crown
    g.add(box(bw * 0.55, 2.6, bd * 0.55, this.m.cream, 0, 7.9, 0))
    g.add(box(bw * 0.55 + 0.3, 0.4, bd * 0.55 + 0.3, this.m.trim, 0, 10.5, 0))
    g.add(box(bw * 0.3, 1.6, bd * 0.3, this.m.cream, 0, 10.9, 0))
    for (let i = 0; i < 5; i++) {
      g.add(box(0.3, 2.4, 0.1, this.m.trimDeep, -bw * 0.22 + i * bw * 0.11, 8.0, bd * 0.275 + 0.02))
    }
    const front = this.onFace(g, face, bw, bd)
    this.windowRow(front, 6, 3.4, bw - 4)
    this.windowRow(front, 6, 5.6, bw - 4)
    // entrance portico: columns, entablature, steps
    front.add(box(5.2, 0.5, 2.6, this.m.trim, 0, 4.4, 1.2))
    for (const sx of [-2.1, -0.7, 0.7, 2.1]) {
      front.add(part(new CylinderGeometry(0.22, 0.26, 4.4, 10), this.m.trim, sx, 2.2, 1.9))
    }
    front.add(box(3.4, 3.3, 0.3, this.m.timberDark, 0, 1.65 + 0.0, 0.1))
    front.add(box(6.0, 0.24, 3.2, this.m.trim, 0, 0.12, 1.6))
    front.add(box(6.8, 0.24, 1.2, this.m.trim, 0, -0.0, 2.6))
    this.sign(g, face, bw, bd, label, 5.9, 0.8)
    return g
  }

  private casting(w: number, d: number, face: Face, label: string): Group {
    const g = new Group()
    const bw = w - 1
    const bd = d - 1
    g.add(box(bw, 6.4, bd, this.m.buff))
    const roof = part(new ConeGeometry(1, 2.4, 4), this.m.terracotta, 0, 7.5, 0)
    roof.scale.set(bw * 0.78, 1, bd * 0.78)
    roof.rotation.y = Math.PI / 4
    g.add(roof)
    const front = this.onFace(g, face, bw, bd)
    this.windowRow(front, 4, 4.6, bw - 5, 1.0, 1.3)
    // arcade porch
    front.add(box(bw - 3, 0.4, 2.4, this.m.terracotta, 0, 3.1, 1.2))
    for (let i = 0; i < 5; i++) {
      front.add(part(new CylinderGeometry(0.19, 0.22, 3.1, 8), this.m.trim, -(bw - 4) / 2 + ((bw - 4) / 4) * i, 1.55, 2.2))
    }
    front.add(box(2.6, 2.9, 0.3, this.m.timberDark, 0, 1.45, 0.08))
    this.sign(g, face, bw, bd, label, 5.4, 0.75)
    return g
  }

  private development(w: number, d: number, face: Face, label: string): Group {
    const g = new Group()
    const bw = w - 1
    const bd = d - 1
    g.add(box(bw, 5.2, bd, this.m.taupe))
    // long gable
    const alongX = bw >= bd
    const gable = part(new CylinderGeometry(1, 1, alongX ? bw + 0.6 : bd + 0.6, 3), this.m.terracotta)
    gable.rotation.z = Math.PI / 2
    gable.rotation.y = alongX ? 0 : Math.PI / 2
    gable.scale.set(1, 1, 1)
    gable.position.y = 5.2 + 0.4
    gable.scale.y = (alongX ? bd : bw) / 2 + 0.5
    gable.scale.z = 1.4
    // CylinderGeometry with 3 radial segments is a triangular prism — rotate the flat down
    gable.rotation.x = alongX ? 0 : 0
    g.add(gable)
    g.add(box(1.1, 3.2, 1.1, this.m.brick, bw * 0.28, 5.0, -bd * 0.18))
    const front = this.onFace(g, face, bw, bd)
    this.windowRow(front, 5, 3.4, bw - 4)
    front.add(box(2.4, 2.8, 0.3, this.m.timberDark, 0, 1.4, 0.08))
    front.add(box(3.0, 0.4, 1.6, this.m.awning, 0, 3.0, 0.8))
    this.sign(g, face, bw, bd, label, 4.6, 0.72)
    return g
  }

  private sawtoothShop(w: number, d: number, face: Face, label: string): Group {
    const g = new Group()
    const bw = w - 0.8
    const bd = d - 0.8
    g.add(box(bw, 4.8, bd, this.m.buff))
    const teeth = 3
    const alongX = bw >= bd
    const run = alongX ? bw : bd
    const span = alongX ? bd : bw
    for (let i = 0; i < teeth; i++) {
      const t = -span / 2 + (span / teeth) * (i + 0.5)
      const tooth = new Group()
      tooth.add(box(run - 0.4, 1.9, span / teeth - 0.3, this.m.buff, 0, 0, 0))
      const glass = box(run - 0.8, 1.5, 0.14, this.m.glass, 0, 0.2, -(span / teeth) / 2 + 0.1)
      tooth.add(glass)
      const cap = box(run - 0.2, 0.24, span / teeth + 0.1, this.m.roofMetal, 0, 1.9, 0)
      cap.rotation.x = 0.34
      cap.position.y = 2.1
      tooth.add(cap)
      tooth.position.set(alongX ? 0 : t, 4.8, alongX ? t : 0)
      tooth.rotation.y = alongX ? 0 : Math.PI / 2
      g.add(tooth)
    }
    const front = this.onFace(g, face, bw, bd)
    front.add(box(4.6, 3.9, 0.3, this.m.trimDeep, 0, 0, 0.02))
    front.add(box(4.1, 3.5, 0.2, this.m.timber, 0, 0, 0.12))
    this.windowRow(front, 3, 3.9, bw - 6, 0.8, 0.8)
    this.sign(g, face, bw, bd, label, 5.3, 0.72)
    return g
  }

  private postBlock(w: number, d: number, face: Face, label: string): Group {
    const g = new Group()
    const bw = w - 1
    const bd = d - 1
    g.add(box(bw, 5.6, bd, this.m.slate))
    g.add(box(bw + 0.3, 0.4, bd + 0.3, this.m.trimDeep, 0, 5.6, 0))
    g.add(part(new CylinderGeometry(0.8, 0.8, 1.4, 10), this.m.timberDark, -bw * 0.25, 6.9, bd * 0.2))
    g.add(box(0.5, 1.8, 0.5, this.m.steel, bw * 0.28, 5.8, -bd * 0.22))
    const front = this.onFace(g, face, bw, bd)
    this.windowRow(front, 3, 3.8, bw - 5, 0.7, 0.7)
    front.add(box(2.2, 2.7, 0.3, this.m.timberDark, 0, 1.35, 0.06))
    this.sign(g, face, bw, bd, label, 4.8, 0.7)
    return g
  }

  private office(w: number, d: number, face: Face, label: string, tall = false): Group {
    const g = new Group()
    const bw = w - 0.8
    const bd = d - 0.8
    const h = tall ? 6.8 : 4.6
    g.add(box(bw, h, bd, this.m.taupe))
    g.add(box(bw + 0.28, 0.42, bd + 0.28, this.m.trim, 0, h, 0))
    const front = this.onFace(g, face, bw, bd)
    front.add(box(Math.min(bw, bd) - 0.6, tall ? 1.7 : 1.2, 0.14, this.m.cream, 0, h - (tall ? 0.9 : 0.65), 0.02))
    this.windowRow(front, 3, 2.6, Math.min(bw - 3, 7))
    if (tall) this.windowRow(front, 3, 4.7, Math.min(bw - 3, 7))
    front.add(box(1.9, 2.5, 0.3, this.m.timberDark, 0, 1.25, 0.06))
    front.add(box(2.5, 0.34, 1.3, this.m.awning, 0, 2.85, 0.6))
    this.sign(g, face, bw, bd, label, h - (tall ? 0.9 : 0.62), 0.6)
    return g
  }

  private theater(w: number, d: number, face: Face, label: string): Group {
    const g = new Group()
    const bw = w - 0.8
    const bd = d - 0.8
    // auditorium barn behind a Deco front tower
    g.add(box(bw, 7.2, bd * 0.72, this.m.buff, 0, 0, -bd * 0.14))
    g.add(box(bw + 0.2, 0.5, bd * 0.72 + 0.2, this.m.roofSlateGreen, 0, 7.2, -bd * 0.14))
    const front = this.onFace(g, face, bw, bd)
    front.add(box(bw * 0.62, 9.6, 1.8, this.m.cream, 0, 0, -0.6))
    front.add(box(bw * 0.62 + 0.3, 0.5, 2.1, this.m.trim, 0, 9.6, -0.6))
    front.add(box(bw * 0.3, 1.8, 1.5, this.m.cream, 0, 10.1, -0.6))
    // marquee canopy with bulb dots
    front.add(box(bw * 0.56, 0.55, 2.6, this.m.marquee, 0, 4.6, 1.3))
    for (let i = 0; i < 7; i++) {
      front.add(part(new SphereGeometry(0.08, 6, 5), this.m.windowLit, -bw * 0.24 + i * bw * 0.08, 4.32, 2.5))
    }
    // vertical blade sign
    const blade = new Mesh(new PlaneGeometry(1.4, 5.2), new MeshStandardMaterial({
      map: signTexture(label, { ratio: 0.28 }),
      roughness: 0.55,
    }))
    blade.position.set(0, 8.2, 0.4 + 0.75)
    front.add(blade)
    front.add(box(1.6, 5.4, 0.2, this.m.marquee, 0, 8.2, 0.4))
    front.add(box(2.8, 2.9, 0.3, this.m.timberDark, -bw * 0.16, 1.45, 0.4))
    front.add(box(2.8, 2.9, 0.3, this.m.timberDark, bw * 0.16, 1.45, 0.4))
    for (const sx of [-bw * 0.28, bw * 0.28]) {
      front.add(box(1.3, 1.9, 0.14, this.m.signPanel, sx, 2.4, 0.35))
    }
    return g
  }

  private gate(w: number, _d: number, _face: Face, label: string): Group {
    const g = new Group()
    const bw = w - 0.4
    const span = Math.max(bw, 10)
    // twin piers + arch over the drive — the studio's front door
    for (const sx of [-span / 2 + 1.1, span / 2 - 1.1]) {
      g.add(box(2.2, 6.2, 2.6, this.m.cream, sx, 0, 0))
      g.add(box(2.5, 0.5, 2.9, this.m.trim, sx, 6.2, 0))
      g.add(part(new SphereGeometry(0.18, 8, 6), this.m.windowLit, sx, 7.0, 1.1))
      g.add(part(new CylinderGeometry(0.05, 0.05, 0.5, 6), this.m.steel, sx, 6.6, 1.1))
    }
    g.add(box(span - 2, 1.9, 1.9, this.m.cream, 0, 5.4, 0))
    g.add(box(span - 1.6, 0.45, 2.2, this.m.trim, 0, 7.3, 0))
    const nameMat = new MeshStandardMaterial({ map: signTexture(label, { ratio: 5 }), roughness: 0.6 })
    for (const sz of [1.0, -1.0]) {
      const plate = new Mesh(new PlaneGeometry(span - 3, (span - 3) / 5), nameMat)
      plate.position.set(0, 6.35, sz)
      if (sz < 0) plate.rotation.y = Math.PI
      g.add(plate)
    }
    return g
  }

  private writers(w: number, d: number, face: Face, label: string): Group {
    return this.development(Math.max(w, 8), Math.max(d, 7), face, label)
  }

  /** The lot's landmark water tower (placed as landscaping, so it is also a prop). */
  waterTower(): Group {
    const g = new Group()
    for (const [sx, sz] of [[-1.5, -1.5], [1.5, -1.5], [-1.5, 1.5], [1.5, 1.5]] as const) {
      const leg = part(new CylinderGeometry(0.09, 0.13, 8.2, 8), this.m.steel, sx * 0.8, 4.1, sz * 0.8)
      leg.rotation.x = sz * -0.075
      leg.rotation.z = sx * 0.075
      g.add(leg)
    }
    for (const y of [2.4, 4.8]) {
      g.add(box(2.9 - y * 0.18, 0.12, 0.12, this.m.steel, 0, y, 0))
      g.add(box(0.12, 0.12, 2.9 - y * 0.18, this.m.steel, 0, y, 0))
    }
    g.add(box(3.1, 0.24, 3.1, this.m.timberDark, 0, 8.0, 0))
    g.add(part(new CylinderGeometry(1.75, 1.55, 2.9, 14), this.m.timber, 0, 9.7, 0))
    g.add(part(new CylinderGeometry(1.8, 1.8, 0.34, 14), this.m.timberDark, 0, 10.4, 0))
    g.add(part(new ConeGeometry(1.95, 1.15, 14), this.m.roofMetal, 0, 11.8, 0))
    g.add(part(new SphereGeometry(0.12, 6, 5), this.m.brass, 0, 12.5, 0))
    return g
  }

  /** Honest massing block — a blueprint with no authored 3D body yet (law 12). */
  private massing(w: number, d: number, face: Face, label: string): Group {
    const g = new Group()
    const bw = w - 0.8
    const bd = d - 0.8
    g.add(box(bw, 4.4, bd, this.m.buff))
    g.add(box(bw + 0.26, 0.4, bd + 0.26, this.m.trim, 0, 4.4, 0))
    const front = this.onFace(g, face, bw, bd)
    front.add(box(1.9, 2.5, 0.3, this.m.timberDark, 0, 1.25, 0.06))
    this.sign(g, face, bw, bd, label, 3.6, 0.6)
    return g
  }

  /** Scaffolded construction site: cage, boards, and a shell at the ENGINE's fraction. */
  construction(fwTiles: number, fdTiles: number, progress01: number): Group {
    const g = new Group()
    const w = fwTiles * TILE_M - 1
    const d = fdTiles * TILE_M - 1
    const fullH = 6.4
    const shellH = Math.max(0.7, fullH * Math.min(Math.max(progress01, 0), 1))
    g.add(box(w - 1.4, shellH, d - 1.4, this.m.buff))
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
      g.add(box(0.12, fullH + 1.2, 0.12, this.m.steel, (sx * (w - 0.6)) / 2, 0, (sz * (d - 0.6)) / 2))
    }
    for (const y of [2.2, 4.4, fullH + 0.9]) {
      g.add(box(w - 0.4, 0.1, 0.34, this.m.timber, 0, y, (d - 0.6) / 2))
      g.add(box(w - 0.4, 0.1, 0.34, this.m.timber, 0, y, -(d - 0.6) / 2))
      g.add(box(0.34, 0.1, d - 0.4, this.m.timber, (w - 0.6) / 2, y, 0))
      g.add(box(0.34, 0.1, d - 0.4, this.m.timber, -(w - 0.6) / 2, y, 0))
    }
    g.add(box(2.4, 0.8, 1.4, this.m.canvasTarp, -w * 0.2, 0, d * 0.28 + 0.8))
    return g
  }

  // ── dressing ladder tables ─────────────────────────────────────────────────
  private readonly byTexKey: Record<string, (w: number, d: number, f: Face, label: string) => Group> = {
    'tw-stage-a': (w, d, f, l) => this.soundstage(w, d, f, l, false),
    'tw-stage-b': (w, d, f, l) => this.soundstage(w, d, f, l, true),
    'tw-stage-standard': (w, d, f, l) => this.soundstage(w, d, f, l, false),
    'tw-admin': (w, d, f, l) => this.admin(w, d, f, l),
    'tw-casting': (w, d, f, l) => this.casting(w, d, f, l),
    'tw-office-standard': (w, d, f, l) => this.casting(w, d, f, l),
    'tw-writers': (w, d, f, l) => this.writers(w, d, f, l),
    'tw-post': (w, d, f, l) => this.postBlock(w, d, f, l),
    'tw-post-standard': (w, d, f, l) => this.postBlock(w, d, f, l),
    'tw-scenery-standard': (w, d, f, l) => this.sawtoothShop(w, d, f, l),
    'tw-annex': (w, d, f, l) => this.office(w, d, f, l, false),
    'tw-craft': (w, d, f, l) => this.sawtoothShop(w, d, f, l),
    'tw-office-2': (w, d, f, l) => this.office(w, d, f, l, true),
    'tw-office-3': (w, d, f, l) => this.office(w, d, f, l, true),
    'tw-hall': (w, d, f, l) => this.office(w, d, f, l, true),
    'tw-theater': (w, d, f, l) => this.theater(w, d, f, l),
    'tw-gate': (w, d, f, l) => this.gate(w, d, f, l),
    'tw-tower': () => this.waterTower(),
  }

  /** Class body for a placed facility with no authored art — same ladder as 2D. */
  private byCapability(capability: string | null): (w: number, d: number, f: Face, label: string) => Group {
    switch (capability) {
      case 'soundstage':
        return (w, d, f, l) => this.soundstage(w, d, f, l, false)
      case 'set-scenery':
        return (w, d, f, l) => this.sawtoothShop(w, d, f, l)
      case 'post':
        return (w, d, f, l) => this.postBlock(w, d, f, l)
      case 'development-casting':
        return (w, d, f, l) => this.office(w, d, f, l, true)
      default:
        return (w, d, f, l) => this.massing(w, d, f, l)
    }
  }

  /** Large landscaping bodies that arrive down the PROP path. */
  makeLargeProp(texKey: string, label: string): Group | null {
    if (texKey === 'tw-tower') return this.waterTower()
    if (texKey === 'tw-writers') return this.writers(9, 7, 'pz', label || 'Writers')
    return null
  }
}
