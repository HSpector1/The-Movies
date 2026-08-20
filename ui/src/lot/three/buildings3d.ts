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
    const wallH = 7.2
    // A pale masonry plinth and cornice keep the industrial corrugation from reading
    // as one enormous brown shed. These are studio stages, not farm hangars.
    g.add(box(bw, 1.35, bd, this.m.cream))
    g.add(box(bw - 0.08, wallH - 1.35, bd - 0.08, this.m.corrugate, 0, 1.35, 0))
    g.add(box(bw + 0.12, 0.24, bd + 0.12, this.m.trim, 0, 1.22, 0))
    g.add(box(bw + 0.18, 0.22, bd + 0.18, this.m.roofMetal, 0, wallH - 0.18, 0))

    // Shallow exterior pilasters on both long elevations. The previous ribs were
    // full-depth slabs through the building; surface ribs give the same readable
    // rhythm without turning the body into a row of cross walls.
    const alongX = bw >= bd
    const run = alongX ? bw : bd
    const span = alongX ? bd : bw
    const ribCount = Math.max(4, Math.floor(run / 3.2))
    for (let i = 0; i < ribCount; i++) {
      const t = -(run / 2 - 1.0) + (run - 2.0) * (i / (ribCount - 1))
      for (const side of [-1, 1]) {
        g.add(box(
          alongX ? 0.3 : 0.18,
          wallH - 0.55,
          alongX ? 0.18 : 0.3,
          this.m.trimDeep,
          alongX ? t : side * (bw / 2 + 0.03),
          0.24,
          alongX ? side * (bd / 2 + 0.03) : t,
        ))
      }
    }

    // A low studio barrel, not a half-round aircraft hangar. CylinderGeometry's
    // half-circle opens along local +x; rotate it onto X, flatten that local axis
    // into a 1.7–2.35 m rise, then turn the whole roof for a Z-running building.
    const radius = span / 2 + 0.18
    const roofRise = Math.min(2.35, Math.max(1.7, span * 0.16))
    const roof = new Group()
    const barrel = new Mesh(
      new CylinderGeometry(radius, radius, run + 0.28, 28, 1, false, 0, Math.PI),
      this.m.roofMetal,
    )
    barrel.rotation.z = Math.PI / 2
    barrel.scale.set(roofRise / radius, 1, 1)
    barrel.castShadow = true
    barrel.receiveShadow = true
    roof.add(barrel)
    roof.rotation.y = alongX ? 0 : Math.PI / 2
    roof.position.y = wallH
    g.add(roof)

    if (monitor) {
      // A compact ridge monitor with clerestory glass distinguishes Stage B while
      // retaining the low 1940s industrial silhouette.
      const mw = run * 0.46
      const monitorBox = new Group()
      monitorBox.add(box(mw, 1.3, 2.65, this.m.cream))
      monitorBox.add(box(mw - 0.38, 0.58, 2.72, this.m.glass, 0, 0.36, 0))
      monitorBox.add(box(mw + 0.28, 0.26, 3.0, this.m.roofMetal, 0, 1.3, 0))
      monitorBox.rotation.y = alongX ? 0 : Math.PI / 2
      monitorBox.position.y = wallH + roofRise * 0.64
      g.add(monitorBox)
    }

    // Square roof ventilators create a recognizable soundstage roof rhythm.
    for (let i = 0; i < 3; i++) {
      const t = (i - 1) * run * 0.23
      g.add(box(0.68, 0.5, 0.68, this.m.steel, alongX ? t : 0, wallH + roofRise * 0.8, alongX ? 0 : t))
      g.add(box(0.86, 0.14, 0.86, this.m.roofMetal, alongX ? t : 0, wallH + roofRise * 0.8 + 0.5, alongX ? 0 : t))
    }

    // Cream end wall, panelled elephant door, personnel door, track and bollards:
    // the service facade should identify the building before its name is readable.
    const frontSpan = face === 'px' || face === 'nx' ? bd : bw
    const doorW = Math.max(2.6, Math.min(5.3, frontSpan - 2.2))
    const doorH = 4.75
    const frontPanelW = Math.max(doorW + 0.8, Math.min(frontSpan - 0.35, doorW + 3.2))
    const doorHost = this.onFace(g, face, bw, bd)
    doorHost.add(box(frontPanelW, wallH - 0.48, 0.2, this.m.cream, 0, 0.2, 0.03))
    doorHost.add(box(0.34, wallH - 0.2, 0.28, this.m.trimDeep, -frontPanelW / 2 + 0.18, 0, 0.1))
    doorHost.add(box(0.34, wallH - 0.2, 0.28, this.m.trimDeep, frontPanelW / 2 - 0.18, 0, 0.1))
    doorHost.add(box(doorW + 0.54, doorH + 0.48, 0.3, this.m.trimDeep, 0, 0, 0.12))
    const openDoor = new Group()
    // The hot state is a genuine open portal: a dark soundstage volume with a warm
    // practical rim, not the old brown rectangle that read as another closed panel.
    openDoor.add(box(doorW, doorH, 0.2, this.m.stageInterior, 0, 0.2, 0.31))
    openDoor.add(box(doorW - 0.75, doorH - 0.72, 0.08, this.m.slate, 0, 0.42, 0.45))
    openDoor.add(box(doorW - 0.35, 0.16, 0.28, this.m.stageGlow, 0, 0.18, 0.68))
    for (const sx of [-0.28, 0.28]) {
      openDoor.add(box(0.42, 0.12, 0.08, this.m.stageGlow, sx * doorW, doorH - 0.42, 0.56))
    }
    // A dark interior flat breaks up the opening and hints at scenery beyond the
    // threshold; it is deliberately non-semantic set dressing inside a truthful hot stage.
    openDoor.add(box(doorW * 0.22, doorH * 0.48, 0.09, this.m.timberDark, -doorW * 0.25, 0.36, 0.57))
    // Retracted panel edges make the opening read as a working elephant door rather
    // than a bright rectangle pasted on the facade.
    for (const sx of [-1, 1]) {
      openDoor.add(box(0.48, doorH - 0.15, 0.12, this.m.slate, sx * (doorW / 2 - 0.25), 0.28, 0.56))
      for (const y of [0.95, 2.15, 3.35, 4.45]) {
        if (y >= doorH) continue
        openDoor.add(part(new SphereGeometry(0.105, 7, 5), this.m.stageGlow, sx * (doorW / 2 - 0.42), y, 0.73))
      }
    }
    openDoor.visible = false
    doorHost.add(openDoor)

    const closedDoor = new Group()
    closedDoor.add(box(doorW, doorH, 0.22, this.m.slate, 0, 0.2, 0.49))
    for (let i = 1; i < 4; i++) {
      closedDoor.add(box(0.075, doorH - 0.2, 0.08, this.m.steel, -doorW / 2 + (doorW * i) / 4, 0.3, 0.65))
    }
    for (const y of [1.35, 2.85, 4.2]) {
      closedDoor.add(box(doorW - 0.18, 0.1, 0.08, this.m.steel, 0, y, 0.65))
    }
    doorHost.add(closedDoor)
    g.userData.hotOpenDoor = openDoor
    g.userData.hotClosedDoor = closedDoor
    doorHost.add(box(doorW + 1.05, 0.28, 0.4, this.m.steel, 0, doorH + 0.5, 0.2))
    for (const sx of [-1, 1]) {
      doorHost.add(part(new CylinderGeometry(0.14, 0.17, 0.85, 10), this.m.brass, sx * (doorW / 2 + 0.48), 0.425, 0.72))
    }
    if (frontPanelW - doorW > 2.5) {
      const serviceX = doorW / 2 + 0.78
      doorHost.add(box(1.05, 2.35, 0.18, this.m.timberDark, serviceX, 0.2, 0.34))
      doorHost.add(box(0.58, 0.5, 0.1, this.m.glass, serviceX, 1.55, 0.47))
      doorHost.add(box(1.35, 0.22, 0.9, this.m.awning, serviceX, 2.6, 0.68))
    }
    doorHost.add(box(0.08, 1.05, 0.08, this.m.steel, 0, doorH + 0.74, 0.38))
    const lamp = part(new SphereGeometry(0.18, 8, 6), this.m.stageGlow, 0, doorH + 1.7, 0.42)
    lamp.visible = false
    doorHost.add(lamp)
    g.userData.hotLamp = lamp
    this.sign(g, face, bw, bd, label, wallH - 0.55, 0.88)

    // A glazed lean-to stage office hugs a visible flank and completes the service
    // composition instead of reading as an unexplained box sunk into the main wall.
    const annexSide: Face = face === 'px' || face === 'nx' ? 'pz' : 'px'
    const annex = this.onFace(g, annexSide, bw, bd)
    const annexW = Math.min(run * 0.42, 6.6)
    annex.add(box(annexW, 3.05, 2.9, this.m.cream, 0, 0, 1.42))
    annex.add(box(annexW + 0.3, 0.24, 3.2, this.m.roofGravel, 0, 3.05, 1.42))
    for (const sx of [-annexW * 0.24, annexW * 0.24]) {
      annex.add(box(0.94, 1.05, 0.1, this.m.glass, sx, 1.25, 2.92))
      annex.add(box(1.12, 1.23, 0.08, this.m.trim, sx, 1.16, 2.86))
    }
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
    const wallH = 5.2
    g.add(box(bw, wallH, bd, this.m.taupe))
    // Two pitched roof planes form a true long gable. The previous triangular
    // cylinder already encoded the full run in its geometry and then multiplied
    // that axis by half the building span, producing a roof several buildings long.
    const alongX = bw >= bd
    const run = alongX ? bw : bd
    const span = alongX ? bd : bw
    const halfRoofSpan = span / 2 + 0.48
    const roofRise = Math.min(2.25, Math.max(1.45, span * 0.2))
    const roofPitch = Math.atan2(roofRise, halfRoofSpan)
    const slopeLength = Math.hypot(halfRoofSpan, roofRise)
    for (const side of [-1, 1]) {
      const panel = alongX
        ? box(run + 0.9, 0.24, slopeLength, this.m.terracotta)
        : box(slopeLength, 0.24, run + 0.9, this.m.terracotta)
      panel.position.set(
        alongX ? 0 : side * halfRoofSpan / 2,
        wallH + roofRise / 2,
        alongX ? side * halfRoofSpan / 2 : 0,
      )
      if (alongX) panel.rotation.x = side * roofPitch
      else panel.rotation.z = -side * roofPitch
      g.add(panel)
    }
    // Stepped stucco infill closes the two gable ends beneath the roof planes.
    for (const end of [-1, 1]) {
      for (let level = 0; level < 3; level++) {
        const layerH = roofRise / 3
        const layerSpan = span * (1 - (level + 0.5) / 3)
        g.add(box(
          alongX ? 0.22 : layerSpan,
          layerH,
          alongX ? layerSpan : 0.22,
          this.m.taupe,
          alongX ? end * (run / 2 - 0.04) : 0,
          wallH + level * layerH,
          alongX ? 0 : end * (run / 2 - 0.04),
        ))
      }
    }
    g.add(box(
      alongX ? run + 1.0 : 0.3,
      0.18,
      alongX ? 0.3 : run + 1.0,
      this.m.roofMetal,
      0,
      wallH + roofRise - 0.08,
      0,
    ))
    g.add(box(1.1, 3.2, 1.1, this.m.brick, bw * 0.28, wallH - 0.2, -bd * 0.18))
    const front = this.onFace(g, face, bw, bd)
    const facadeSpan = face === 'px' || face === 'nx' ? bd : bw
    this.windowRow(front, 5, 3.4, Math.max(2.4, facadeSpan - 4))
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
    // The building's authoritative name belongs on the broad marquee face, where
    // a normal horizontal sign texture remains legible at management distance.
    const marqueeW = Math.min(bw * 0.48, 6.4)
    const marqueeName = new Mesh(new PlaneGeometry(marqueeW, marqueeW / 4), new MeshStandardMaterial({
      map: signTexture(label),
      roughness: 0.55,
    }))
    marqueeName.position.set(0, 4.82, 2.62)
    front.add(marqueeName)

    // A period blade uses stacked architectural-type letters. The old 0.28-aspect
    // canvas attempted to squeeze the entire horizontal label into 36 pixels and
    // clipped it almost completely. "THEATRE" identifies this truthful building
    // class while the marquee above carries its actual engine-provided name.
    const bladeBottom = 5.55
    const bladeH = 5.5
    front.add(box(1.64, bladeH, 0.22, this.m.marquee, 0, bladeBottom, 0.48))
    const bladeLetters = [...'THEATRE']
    bladeLetters.forEach((letter, i) => {
      const letterPlate = new Mesh(new PlaneGeometry(0.68, 0.62), new MeshStandardMaterial({
        map: signTexture(letter, { ratio: 1 }),
        roughness: 0.5,
      }))
      letterPlate.position.set(0, bladeBottom + bladeH - 0.55 - i * 0.72, 0.61)
      front.add(letterPlate)
    })
    for (const side of [-1, 1]) {
      for (let i = 0; i < 6; i++) {
        front.add(part(
          new SphereGeometry(0.055, 6, 5),
          this.m.windowLit,
          side * 0.69,
          bladeBottom + 0.48 + i * 0.9,
          0.63,
        ))
      }
    }
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

  /** Phase-readable construction, derived only from the ENGINE's progress fraction. */
  construction(fwTiles: number, fdTiles: number, progress01: number): Group {
    const g = new Group()
    const w = fwTiles * TILE_M - 1
    const d = fdTiles * TILE_M - 1
    const innerW = Math.max(2.2, w - 1.2)
    const innerD = Math.max(2.2, d - 1.2)
    const fullH = 6.4
    const p = Math.min(Math.max(progress01, 0), 1)
    const phase = (start: number, end: number): number =>
      Math.min(1, Math.max(0, (p - start) / (end - start)))

    const braceX = (x0: number, y0: number, x1: number, y1: number, z: number): void => {
      const len = Math.hypot(x1 - x0, y1 - y0)
      const beam = part(
        new BoxGeometry(len, 0.11, 0.11),
        this.m.timberDark,
        (x0 + x1) / 2,
        (y0 + y1) / 2,
        z,
      )
      beam.rotation.z = Math.atan2(y1 - y0, x1 - x0)
      g.add(beam)
    }
    const braceZ = (z0: number, y0: number, z1: number, y1: number, x: number): void => {
      const len = Math.hypot(z1 - z0, y1 - y0)
      const beam = part(
        new BoxGeometry(0.11, 0.11, len),
        this.m.timberDark,
        x,
        (y0 + y1) / 2,
        (z0 + z1) / 2,
      )
      beam.rotation.x = -Math.atan2(y1 - y0, z1 - z0)
      g.add(beam)
    }

    // Phase 1 — surveyed foundation: slab, timber forms, footing pads and rebar.
    // Even a zero-progress placement therefore reads as a real job site rather
    // than a mysteriously shortened finished building.
    g.add(box(innerW, 0.16, innerD, this.m.roofGravel, 0, 0.02, 0))
    g.add(box(innerW + 0.28, 0.26, 0.3, this.m.timberDark, 0, 0.05, innerD / 2))
    g.add(box(innerW + 0.28, 0.26, 0.3, this.m.timberDark, 0, 0.05, -innerD / 2))
    g.add(box(0.3, 0.26, innerD, this.m.timberDark, innerW / 2, 0.05, 0))
    g.add(box(0.3, 0.26, innerD, this.m.timberDark, -innerW / 2, 0.05, 0))
    for (const sx of [-1, 0, 1]) {
      for (const sz of [-1, 1]) {
        g.add(box(0.62, 0.2, 0.62, this.m.trimDeep, sx * innerW * 0.42, 0.12, sz * innerD * 0.42))
      }
    }
    if (p < 0.22) {
      const rebarH = 0.55 + phase(0, 0.22) * 1.15
      for (const sx of [-1, 0, 1]) {
        for (const sz of [-1, 1]) {
          g.add(part(
            new CylinderGeometry(0.026, 0.026, rebarH, 6),
            this.m.steel,
            sx * innerW * 0.42,
            0.25 + rebarH / 2,
            sz * innerD * 0.42,
          ))
        }
      }
    }

    // Phase 2 — a timber/steel frame rises continuously, with readable headers
    // and diagonal bracing rather than the old always-complete scaffold cage.
    const frameT = phase(0.12, 0.5)
    const frameH = frameT <= 0 ? 0 : Math.max(0.75, fullH * frameT)
    if (frameH > 0) {
      const postPoints: Array<[number, number]> = [
        [-innerW / 2, -innerD / 2], [0, -innerD / 2], [innerW / 2, -innerD / 2],
        [-innerW / 2, innerD / 2], [0, innerD / 2], [innerW / 2, innerD / 2],
        [-innerW / 2, 0], [innerW / 2, 0],
      ]
      for (const [x, z] of postPoints) g.add(box(0.17, frameH, 0.17, this.m.timber, x, 0.28, z))
      for (const level of [2.15, 4.25, 6.3]) {
        if (level > frameH + 0.12) continue
        for (const z of [-innerD / 2, innerD / 2]) {
          g.add(part(new BoxGeometry(innerW + 0.18, 0.15, 0.18), this.m.timber, 0, level, z))
        }
        for (const x of [-innerW / 2, innerW / 2]) {
          g.add(part(new BoxGeometry(0.18, 0.15, innerD + 0.18), this.m.timber, x, level, 0))
        }
      }
      const braceTop = Math.min(frameH, 2.55)
      if (braceTop > 0.9) {
        braceX(-innerW / 2 + 0.1, 0.38, 0, braceTop, innerD / 2 + 0.02)
        braceX(0, braceTop, innerW / 2 - 0.1, 0.38, innerD / 2 + 0.02)
        braceZ(-innerD / 2 + 0.1, 0.38, 0, braceTop, innerW / 2 + 0.02)
        braceZ(0, braceTop, innerD / 2 - 0.1, 0.38, innerW / 2 + 0.02)
      }
    }

    // Phase 3 — staggered back, side and loading-face panels make enclosure
    // progress legible while preserving an open elephant-door-sized work front.
    const backH = fullH * phase(0.43, 0.67)
    const leftH = fullH * phase(0.5, 0.74)
    const rightH = fullH * phase(0.56, 0.8)
    const frontH = fullH * phase(0.62, 0.86)
    if (backH > 0.08) g.add(box(innerW, backH, 0.28, this.m.buff, 0, 0.24, -innerD / 2))
    if (leftH > 0.08) g.add(box(0.28, leftH, innerD, this.m.buff, -innerW / 2, 0.24, 0))
    if (rightH > 0.08) g.add(box(0.28, rightH, innerD, this.m.buff, innerW / 2, 0.24, 0))
    if (frontH > 0.08) {
      const openingW = Math.min(4.4, innerW * 0.46)
      const pierW = Math.max(0.35, (innerW - openingW) / 2)
      for (const side of [-1, 1]) {
        g.add(box(
          pierW,
          frontH,
          0.28,
          this.m.buff,
          side * (openingW / 2 + pierW / 2),
          0.24,
          innerD / 2,
        ))
      }
      if (frontH > 4.55) {
        g.add(box(innerW, frontH - 4.5, 0.3, this.m.buff, 0, 4.74, innerD / 2))
        g.add(box(openingW + 0.5, 0.2, 0.36, this.m.steel, 0, 4.48, innerD / 2 + 0.04))
      }
    }

    // Working scaffold tracks the height of the current work and disappears as
    // the building finishes. Platforms and crossed braces retain a clear site read.
    if (p >= 0.2 && p < 0.97) {
      const scaffoldH = Math.min(fullH + 0.8, Math.max(2.35, frameH + 0.72, frontH + 0.72))
      const scaffoldZ = innerD / 2 + 0.48
      const scaffoldW = innerW * 0.9
      for (const x of [-scaffoldW / 2, 0, scaffoldW / 2]) {
        for (const z of [scaffoldZ - 0.58, scaffoldZ]) {
          g.add(box(0.08, scaffoldH, 0.08, this.m.steel, x, 0.18, z))
        }
      }
      for (let level = 1.35; level < scaffoldH; level += 1.45) {
        g.add(part(new BoxGeometry(scaffoldW + 0.12, 0.11, 0.7), this.m.timber, 0, level, scaffoldZ - 0.29))
      }
      const braceHeight = Math.min(scaffoldH - 0.25, 3.0)
      braceX(-scaffoldW / 2, 0.35, 0, braceHeight, scaffoldZ + 0.03)
      braceX(0, braceHeight, scaffoldW / 2, 0.35, scaffoldZ + 0.03)
    }

    // Phase 4 — exposed joists give way to roof sheets from back to front.
    const roofT = phase(0.76, 1)
    if (roofT > 0) {
      const rafterCount = Math.max(1, Math.ceil(roofT * 6))
      for (let i = 0; i < rafterCount; i++) {
        const z = rafterCount === 1
          ? -innerD / 2
          : -innerD / 2 + (innerD * i) / 5
        g.add(part(new BoxGeometry(innerW + 0.28, 0.16, 0.18), this.m.timber, 0, fullH + 0.18, z))
      }
      const sheetT = phase(0.81, 1)
      if (sheetT > 0) {
        const coveredD = innerD * sheetT
        g.add(box(
          innerW + 0.38,
          0.2,
          coveredD,
          this.m.roofMetal,
          0,
          fullH + 0.18,
          -innerD / 2 + coveredD / 2,
        ))
      }
    }

    // Material stacks remain inside the claimed footprint and make the low phase
    // especially legible; they are presentation of the build, never extra truth.
    const plankLen = Math.min(3.2, innerW * 0.34)
    for (let i = 0; i < 4; i++) {
      g.add(box(plankLen, 0.11, 0.15, i % 2 === 0 ? this.m.timber : this.m.timberDark, -innerW * 0.22, 0.24 + i * 0.12, innerD * 0.27))
    }
    g.add(box(Math.min(1.7, innerW * 0.22), 0.76, Math.min(1.3, innerD * 0.22), this.m.canvasTarp, innerW * 0.28, 0.2, innerD * 0.26))
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
