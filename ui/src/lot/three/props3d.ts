// ── props3d — physical bodies for the lot's dressing vocabulary ────────────────
//
// One builder per prop texKey the world model already places (world.ts
// landscaping/backlotDressing/establishedDressing). The PLACEMENT of every prop
// stays the world model's decision; this module only answers "what does a
// tw-boxtruck look like in three dimensions". An unknown key builds NOTHING —
// the same fail-neutral law the 2D bake holds. Sizes are metres (1.8 m adult).

import {
  BufferGeometry,
  BoxGeometry,
  CatmullRomCurve3,
  ConeGeometry,
  CylinderGeometry,
  Group,
  IcosahedronGeometry,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
  SphereGeometry,
  TorusGeometry,
  TubeGeometry,
  Vector3,
} from 'three'
import type { MaterialLedger } from './materials3d.ts'

type Mat = MeshStandardMaterial

function mesh(geo: BufferGeometry, mat: Mat, x = 0, y = 0, z = 0): Mesh {
  const m = new Mesh(geo, mat)
  m.position.set(x, y, z)
  m.castShadow = true
  m.receiveShadow = true
  return m
}

const box = (w: number, h: number, d: number, mat: Mat, x = 0, y = 0, z = 0): Mesh =>
  mesh(new BoxGeometry(w, h, d), mat, x, y + h / 2, z)

const cyl = (rt: number, rb: number, h: number, mat: Mat, x = 0, y = 0, z = 0, seg = 12): Mesh =>
  mesh(new CylinderGeometry(rt, rb, h, seg), mat, x, y + h / 2, z)

/** A stylised low-poly canopy blob. */
const blob = (r: number, mat: Mat, x = 0, y = 0, z = 0): Mesh => mesh(new IcosahedronGeometry(r, 1), mat, x, y, z)

export class PropFactory {
  constructor(private readonly m: MaterialLedger) {}

  /** Build the body for one prop key, or null when the key has no 3D body yet. */
  make(texKey: string): Object3D | null {
    const b = this.builders[texKey]
    if (b === undefined) return null
    const group = b()
    group.name = texKey
    return group
  }

  // ── greenery ──────────────────────────────────────────────────────────────
  palm(lean = 0.12): Group {
    const g = new Group()
    const segs = 4
    let y = 0
    let x = 0
    for (let i = 0; i < segs; i++) {
      const h = 1.7
      const seg = cyl(0.09 - i * 0.012, 0.11 - i * 0.012, h, this.m.trunk, x, y, 0)
      seg.rotation.z = lean * (i + 1) * 0.45
      g.add(seg)
      y += h * 0.94
      x += lean * (i + 1) * 0.55
    }
    const crownY = y + 0.4
    g.add(mesh(new SphereGeometry(0.22, 8, 6), this.m.trunk, x, crownY - 0.15, 0))
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2
      const frond = mesh(new PlaneGeometry(2.6, 0.62, 4, 1), i % 2 === 0 ? this.m.frond : this.m.frondDark)
      frond.position.set(x + Math.cos(a) * 1.05, crownY + 0.12, Math.sin(a) * 1.05)
      frond.rotation.y = -a
      frond.rotation.z = -0.55
      g.add(frond)
    }
    return g
  }

  tree(scale = 1, dark = false): Group {
    const g = new Group()
    const leaf = dark ? this.m.groveDark : this.m.grove
    g.add(cyl(0.1 * scale, 0.14 * scale, 1.1 * scale, this.m.trunk))
    g.add(blob(1.05 * scale, leaf, 0, 1.9 * scale, 0))
    g.add(blob(0.7 * scale, leaf, 0.55 * scale, 1.45 * scale, 0.2 * scale))
    g.add(blob(0.6 * scale, leaf, -0.5 * scale, 1.55 * scale, -0.25 * scale))
    return g
  }

  // ── vehicles ──────────────────────────────────────────────────────────────
  /** A late-40s sedan: pontoon body, cabin, chrome, whitewalls. ~4.6 m long. */
  sedan(body: Mat = this.m.carBody): Group {
    const g = new Group()
    g.add(box(4.3, 0.72, 1.74, body, 0, 0.36, 0))
    const hood = box(1.15, 0.34, 1.5, body, 1.45, 1.02, 0)
    hood.rotation.z = -0.045
    g.add(hood)
    g.add(box(2.0, 0.62, 1.5, body, -0.28, 1.08, 0))
    g.add(box(1.9, 0.4, 1.36, this.m.glass, -0.28, 1.32, 0))
    g.add(box(0.36, 0.2, 1.82, this.m.chrome, 2.24, 0.5, 0))
    g.add(box(0.36, 0.2, 1.82, this.m.chrome, -2.24, 0.5, 0))
    for (const sx of [1.45, -1.35]) {
      for (const sz of [0.88, -0.88]) {
        const wheel = cyl(0.36, 0.36, 0.22, this.m.tyre, sx, 0, sz, 14)
        wheel.rotation.x = Math.PI / 2
        wheel.position.y = 0.36
        g.add(wheel)
        const hub = cyl(0.14, 0.14, 0.24, this.m.chrome, sx, 0, sz, 10)
        hub.rotation.x = Math.PI / 2
        hub.position.y = 0.36
        g.add(hub)
      }
    }
    return g
  }

  boxtruck(): Group {
    const g = new Group()
    g.add(box(1.7, 1.5, 2.05, this.m.truckTrim, 2.2, 0.5, 0))
    g.add(box(1.5, 0.5, 1.85, this.m.glass, 2.2, 1.45, 0))
    g.add(box(4.0, 2.3, 2.2, this.m.truckBody, -0.85, 0.5, 0))
    g.add(box(4.6, 0.5, 2.1, this.m.truckTrim, -0.6, 0, 0))
    for (const sx of [2.15, -0.4, -2.2]) {
      for (const sz of [1.05, -1.05]) {
        const wheel = cyl(0.44, 0.44, 0.3, this.m.tyre, sx, 0, sz, 12)
        wheel.rotation.x = Math.PI / 2
        wheel.position.y = 0.44
        g.add(wheel)
      }
    }
    return g
  }

  trailer(): Group {
    const g = new Group()
    const body = box(5.2, 1.5, 2.2, this.m.trailerSkin, 0, 0.55, 0)
    g.add(body)
    const roof = cyl(1.1, 1.1, 5.2, this.m.trailerSkin, 0, 0, 0, 16)
    roof.rotation.z = Math.PI / 2
    roof.scale.set(1, 1, 0.42)
    roof.position.set(0, 2.0, 0)
    g.add(roof)
    g.add(box(3.6, 0.28, 2.26, this.m.glass, 0, 1.42, 0))
    g.add(box(0.7, 0.16, 0.5, this.m.timber, -1.2, 0.28, 1.25))
    g.add(box(0.7, 0.16, 0.5, this.m.timber, -1.2, 0.12, 1.45))
    for (const sz of [0.95, -0.95]) {
      const wheel = cyl(0.34, 0.34, 0.24, this.m.tyre, 0.4, 0, sz, 12)
      wheel.rotation.x = Math.PI / 2
      wheel.position.y = 0.34
      g.add(wheel)
    }
    return g
  }

  // ── production equipment ──────────────────────────────────────────────────
  crane(): Group {
    const g = new Group()
    g.add(box(2.6, 0.5, 1.9, this.m.steel, 0, 0.35, 0))
    for (const sx of [0.95, -0.95]) {
      for (const sz of [0.8, -0.8]) {
        const wheel = cyl(0.32, 0.32, 0.24, this.m.tyre, sx, 0, sz, 12)
        wheel.rotation.x = Math.PI / 2
        wheel.position.y = 0.32
        g.add(wheel)
      }
    }
    g.add(box(1.1, 0.9, 1.1, this.m.drum, -0.8, 0.85, 0))
    g.add(box(0.6, 0.5, 0.7, this.m.timber, 0.2, 0.85, 0.4))
    const boomLen = 7.5
    const boom = new Group()
    for (const off of [-0.16, 0.16]) {
      const rail = box(boomLen, 0.09, 0.09, this.m.steelLit, boomLen / 2 - 0.4, 0, off)
      boom.add(rail)
    }
    for (let i = 0; i < 9; i++) {
      boom.add(box(0.07, 0.07, 0.36, this.m.steel, i * 0.8, 0.04, 0))
    }
    const head = box(0.5, 0.6, 0.5, this.m.steel, boomLen - 0.4, -0.25, 0)
    boom.add(head)
    boom.position.set(0.2, 1.35, 0)
    boom.rotation.z = 0.42
    g.add(boom)
    return g
  }

  arcrig(): Group {
    const g = new Group()
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2
      const leg = cyl(0.035, 0.035, 1.9, this.m.steel, Math.cos(a) * 0.42, 0, Math.sin(a) * 0.42)
      leg.rotation.x = Math.sin(a) * 0.32
      leg.rotation.z = Math.cos(a) * 0.32
      g.add(leg)
    }
    g.add(cyl(0.05, 0.05, 0.7, this.m.steel, 0, 1.75, 0))
    const head = cyl(0.42, 0.42, 0.5, this.m.steel, 0, 0, 0, 14)
    head.rotation.z = Math.PI / 2
    head.position.set(0.12, 2.45, 0)
    g.add(head)
    const lens = cyl(0.34, 0.34, 0.06, this.m.windowLit, 0, 0, 0, 14)
    lens.rotation.z = Math.PI / 2
    lens.position.set(0.42, 2.45, 0)
    g.add(lens)
    return g
  }

  genset(): Group {
    const g = new Group()
    g.add(box(1.7, 1.05, 1.1, this.m.drum, 0, 0.3, 0))
    g.add(box(1.7, 0.12, 1.1, this.m.steel, 0, 1.35, 0))
    g.add(cyl(0.06, 0.06, 0.6, this.m.steel, 0.5, 1.4, 0.2))
    for (const sz of [0.62, -0.62]) {
      const wheel = cyl(0.3, 0.3, 0.2, this.m.tyre, 0, 0, sz, 10)
      wheel.rotation.x = Math.PI / 2
      wheel.position.y = 0.3
      g.add(wheel)
    }
    return g
  }

  cablereel(): Group {
    const g = new Group()
    for (const sy of [0.08, 1.0]) {
      const side = cyl(0.62, 0.62, 0.1, this.m.timber, 0, 0, 0, 16)
      side.position.y = 0.62
      side.rotation.x = Math.PI / 2
      side.position.z = sy - 0.55
      g.add(side)
    }
    const core = cyl(0.34, 0.34, 0.8, this.m.timberDark, 0, 0, 0, 12)
    core.rotation.x = Math.PI / 2
    core.position.y = 0.62
    core.position.z = -0.02
    g.add(core)
    return g
  }

  /** A Mitchell-era camera on a heavy four-wheel dolly and twin steel rails. */
  cameraDolly(): Group {
    const g = new Group()
    for (const z of [-0.72, 0.72]) {
      const rail = box(5.6, 0.08, 0.09, this.m.steel, 0, 0.06, z)
      g.add(rail)
      for (let x = -2.5; x <= 2.5; x += 0.65) g.add(box(0.08, 0.06, 1.7, this.m.timberDark, x, 0.03, 0))
    }
    g.add(box(2.2, 0.28, 1.55, this.m.timber, 0.2, 0.2, 0))
    for (const x of [-0.65, 0.65]) {
      for (const z of [-0.63, 0.63]) {
        const wheel = cyl(0.2, 0.2, 0.16, this.m.tyre, x + 0.2, 0, z, 12)
        wheel.rotation.x = Math.PI / 2
        wheel.position.y = 0.2
        g.add(wheel)
      }
    }
    g.add(cyl(0.08, 0.1, 1.35, this.m.steel, 0.15, 0.42, 0))
    g.add(box(1.15, 0.72, 0.62, this.m.slate, 0.15, 1.62, 0))
    g.add(cyl(0.3, 0.3, 0.28, this.m.slate, -0.2, 2.25, 0, 16))
    g.add(cyl(0.3, 0.3, 0.28, this.m.slate, 0.48, 2.25, 0, 16))
    const lens = cyl(0.22, 0.16, 0.7, this.m.steelLit, 0.78, 1.75, 0, 14)
    lens.rotation.z = Math.PI / 2
    g.add(lens)
    return g
  }

  /** A readable four-head lamp bank with flags, stand legs and a warm practical face. */
  lightBank(): Group {
    const g = new Group()
    for (const x of [-1.05, 1.05]) {
      g.add(cyl(0.055, 0.065, 3.2, this.m.steel, x, 0, 0))
      for (const z of [-0.7, 0.7]) {
        const leg = box(0.07, 1.15, 0.07, this.m.steel, x, 0, z * 0.55)
        leg.rotation.x = z > 0 ? -0.62 : 0.62
        leg.position.y = 0.45
        g.add(leg)
      }
      for (const y of [2.55, 3.15]) {
        const shell = cyl(0.34, 0.43, 0.52, this.m.slate, x, 0, 0, 14)
        shell.rotation.z = Math.PI / 2
        shell.position.y = y
        shell.position.x = x
        shell.position.z = 0
        g.add(shell)
        const face = cyl(0.31, 0.31, 0.05, this.m.stageGlow, x, 0, 0, 14)
        face.rotation.z = Math.PI / 2
        face.position.set(x + 0.29, y, 0)
        g.add(face)
      }
    }
    g.add(box(2.8, 0.12, 0.12, this.m.steel, 0, 3.65, 0))
    g.add(box(0.12, 1.25, 1.4, this.m.canvasTarp, -1.55, 2.0, 0))
    return g
  }

  /** One thick, deliberately visible cable snake for management-distance legibility. */
  cableSnake(): Group {
    const g = new Group()
    const curve = new CatmullRomCurve3([
      new Vector3(-3.2, 0.09, -0.4),
      new Vector3(-1.8, 0.09, 0.35),
      new Vector3(-0.4, 0.09, -0.2),
      new Vector3(1.0, 0.09, 0.45),
      new Vector3(3.1, 0.09, -0.15),
    ])
    g.add(mesh(new TubeGeometry(curve, 32, 0.09, 7, false), this.m.tyre))
    for (const x of [-3.2, 3.1]) {
      const plug = box(0.32, 0.16, 0.22, this.m.brass, x, 0.04, x < 0 ? -0.4 : -0.15)
      g.add(plug)
    }
    return g
  }

  /** Grip cart carrying coiled cable, apple-box substitutes and rolled canvas. */
  gripCart(): Group {
    const g = new Group()
    g.add(box(2.1, 0.18, 1.05, this.m.timber, 0, 0.52, 0))
    for (const x of [-0.78, 0.78]) {
      for (const z of [-0.48, 0.48]) {
        const wheel = cyl(0.25, 0.25, 0.13, this.m.tyre, x, 0, z, 10)
        wheel.rotation.x = Math.PI / 2
        wheel.position.y = 0.25
        g.add(wheel)
      }
    }
    for (const x of [-0.62, 0.05, 0.66]) {
      const coil = mesh(new TorusGeometry(0.34, 0.075, 7, 16), this.m.tyre, x, 1.02, 0)
      coil.rotation.x = Math.PI / 2
      g.add(coil)
    }
    g.add(box(0.62, 0.48, 0.62, this.m.crate, -0.55, 0.68, 0.25))
    g.add(box(0.62, 0.34, 0.62, this.m.timberDark, 0.3, 0.68, -0.18))
    return g
  }

  // ── the ledger of builders, keyed exactly by world.ts texKeys ─────────────
  private readonly builders: Record<string, () => Group> = {
    'tw-palm': () => this.palm(),
    'tw-tree': () => this.tree(1, false),
    'tw-tree2': () => this.tree(1.25, true),
    'tw-cypress': () => {
      const g = new Group()
      g.add(cyl(0.08, 0.12, 0.7, this.m.trunk))
      g.add(mesh(new ConeGeometry(0.75, 4.4, 8), this.m.hedgeDark, 0, 2.8, 0))
      return g
    },
    'tw-hedge': () => {
      const g = new Group()
      g.add(box(2.2, 0.95, 0.85, this.m.hedge))
      return g
    },
    'tw-scrub': () => {
      const g = new Group()
      g.add(blob(0.5, this.m.scrub, 0, 0.35, 0))
      g.add(blob(0.34, this.m.scrub, 0.45, 0.24, 0.1))
      return g
    },
    'tw-flowerbed': () => {
      const g = new Group()
      g.add(box(2.0, 0.28, 1.0, this.m.trimDeep))
      g.add(box(1.84, 0.1, 0.84, this.m.hedge, 0, 0.28, 0))
      for (let i = 0; i < 5; i++) {
        g.add(mesh(new SphereGeometry(0.09, 6, 5), this.m.awning, -0.7 + i * 0.35, 0.44, (i % 2) * 0.3 - 0.15))
      }
      return g
    },
    'tw-planter': () => {
      const g = new Group()
      g.add(box(0.8, 0.5, 0.8, this.m.trim))
      g.add(blob(0.42, this.m.hedge, 0, 0.85, 0))
      return g
    },
    'tw-lamp': () => {
      const g = new Group()
      g.add(cyl(0.05, 0.08, 3.4, this.m.steel))
      g.add(cyl(0.02, 0.02, 0.5, this.m.steel, 0.22, 3.32, 0))
      g.add(mesh(new SphereGeometry(0.16, 8, 6), this.m.windowLit, 0.42, 3.34, 0))
      return g
    },
    'tw-bench': () => {
      const g = new Group()
      g.add(box(1.6, 0.08, 0.45, this.m.timber, 0, 0.42, 0))
      g.add(box(1.6, 0.4, 0.07, this.m.timber, 0, 0.5, -0.22))
      for (const sx of [0.65, -0.65]) g.add(box(0.08, 0.42, 0.4, this.m.steel, sx, 0, 0))
      return g
    },
    'tw-crate': () => {
      const g = new Group()
      g.add(box(0.85, 0.85, 0.85, this.m.crate))
      return g
    },
    'tw-cratestack': () => {
      const g = new Group()
      g.add(box(0.9, 0.9, 0.9, this.m.crate, -0.3, 0, 0.1))
      g.add(box(0.8, 0.8, 0.8, this.m.timber, 0.55, 0, -0.15))
      g.add(box(0.75, 0.75, 0.75, this.m.crate, 0.05, 0.9, 0))
      return g
    },
    'tw-pallets': () => {
      const g = new Group()
      for (let i = 0; i < 4; i++) g.add(box(1.2, 0.13, 1.0, i % 2 ? this.m.timber : this.m.timberDark, 0, i * 0.14, 0))
      return g
    },
    'tw-lumber': () => {
      const g = new Group()
      for (let i = 0; i < 3; i++)
        for (let j = 0; j < 3 - i; j++) g.add(box(3.2, 0.12, 0.14, this.m.timber, 0, 0.2 + i * 0.13, j * 0.17 - 0.17 + i * 0.08))
      for (const sx of [-1.1, 1.1]) g.add(box(0.14, 0.2, 0.6, this.m.timberDark, sx, 0, 0))
      return g
    },
    'tw-skip': () => {
      const g = new Group()
      g.add(box(2.2, 0.9, 1.4, this.m.drum, 0, 0.15, 0))
      g.add(box(1.9, 0.2, 1.1, this.m.timberDark, 0, 1.0, 0))
      return g
    },
    'tw-drums': () => {
      const g = new Group()
      g.add(cyl(0.32, 0.32, 0.95, this.m.drum, -0.3, 0, 0.1))
      g.add(cyl(0.32, 0.32, 0.95, this.m.steel, 0.38, 0, -0.12))
      g.add(cyl(0.32, 0.32, 0.95, this.m.drum, 0.05, 0, 0.5, 10))
      return g
    },
    'tw-rack': () => {
      const g = new Group()
      for (const sx of [-0.9, 0.9]) g.add(box(0.08, 1.75, 0.08, this.m.steel, sx, 0, 0))
      g.add(box(1.9, 0.06, 0.06, this.m.steel, 0, 1.7, 0))
      for (let i = 0; i < 4; i++) g.add(box(0.34, 1.0, 0.05, i % 2 ? this.m.awning : this.m.canvasTarp, -0.6 + i * 0.4, 0.66, 0))
      return g
    },
    'tw-cart': () => {
      const g = new Group()
      g.add(box(1.4, 0.14, 0.9, this.m.timber, 0, 0.5, 0))
      g.add(box(0.5, 0.4, 0.86, this.m.crate, -0.3, 0.64, 0))
      g.add(cyl(0.03, 0.03, 0.9, this.m.steel, 0.75, 0.25, 0))
      for (const sz of [0.35, -0.35]) {
        const wheel = cyl(0.26, 0.26, 0.1, this.m.steel, 0, 0, sz, 10)
        wheel.rotation.x = Math.PI / 2
        wheel.position.y = 0.26
        g.add(wheel)
      }
      return g
    },
    'tw-ladder': () => {
      const g = new Group()
      const lad = new Group()
      for (const off of [-0.28, 0.28]) lad.add(box(0.07, 3.4, 0.07, this.m.timber, off, 0, 0))
      for (let i = 0; i < 7; i++) lad.add(box(0.56, 0.06, 0.06, this.m.timberDark, 0, 0.3 + i * 0.46, 0))
      lad.rotation.x = -0.35
      lad.position.y = 0.1
      g.add(lad)
      return g
    },
    'tw-scaffold': () => {
      const g = new Group()
      for (const sx of [-1.1, 1.1])
        for (const sz of [-0.6, 0.6]) g.add(box(0.09, 3.0, 0.09, this.m.steel, sx, 0, sz))
      for (const sy of [1.0, 2.0, 2.95]) g.add(box(2.35, 0.08, 1.35, this.m.timber, 0, sy, 0))
      return g
    },
    'tw-rigging': () => {
      const g = new Group()
      for (const sx of [-1.4, 1.4]) g.add(box(0.12, 3.6, 0.12, this.m.steel, sx, 0, 0))
      g.add(box(3.1, 0.14, 0.14, this.m.steelLit, 0, 3.55, 0))
      g.add(cyl(0.02, 0.02, 1.1, this.m.tyre, -0.6, 2.45, 0))
      g.add(cyl(0.02, 0.02, 0.8, this.m.tyre, 0.7, 2.75, 0))
      return g
    },
    'tw-flats': () => {
      const g = new Group()
      const a = box(2.6, 3.0, 0.12, this.m.trim, 0, 0, 0)
      a.rotation.x = -0.16
      g.add(a)
      const b = box(2.2, 2.6, 0.12, this.m.awning, 0.5, 0, 0.55)
      b.rotation.x = -0.2
      g.add(b)
      return g
    },
    'tw-flatlean': () => {
      const g = new Group()
      const a = box(2.2, 2.7, 0.12, this.m.canvasTarp, 0, 0, 0)
      a.rotation.x = -0.22
      g.add(a)
      return g
    },
    'tw-barrier': () => {
      const g = new Group()
      for (const sx of [-0.8, 0.8]) g.add(box(0.1, 0.9, 0.35, this.m.timberDark, sx, 0, 0))
      g.add(box(1.9, 0.22, 0.08, this.m.trim, 0, 0.62, 0))
      g.add(box(0.6, 0.22, 0.09, this.m.awning, -0.55, 0.62, 0))
      g.add(box(0.6, 0.22, 0.09, this.m.awning, 0.55, 0.62, 0))
      return g
    },
    'tw-sign': () => {
      const g = new Group()
      g.add(cyl(0.06, 0.06, 2.2, this.m.steel))
      g.add(box(1.5, 0.9, 0.08, this.m.signPanel, 0, 2.4, 0))
      return g
    },
    'tw-bannerpole': () => {
      const g = new Group()
      g.add(cyl(0.05, 0.07, 5.2, this.m.trim))
      const flag = mesh(new PlaneGeometry(1.5, 0.5), this.m.awning, 0.78, 4.85, 0)
      g.add(flag)
      return g
    },
    'tw-flag': () => {
      const g = new Group()
      g.add(cyl(0.05, 0.07, 6.4, this.m.trim))
      g.add(mesh(new SphereGeometry(0.09, 6, 5), this.m.brass, 0, 6.45, 0))
      g.add(mesh(new PlaneGeometry(1.7, 0.6), this.m.awning, 0.88, 6.0, 0))
      return g
    },
    'tw-umbrella': () => {
      const g = new Group()
      g.add(cyl(0.03, 0.03, 2.1, this.m.steel))
      g.add(mesh(new ConeGeometry(1.15, 0.5, 8), this.m.awning, 0, 2.2, 0))
      return g
    },
    'tw-booth': () => {
      const g = new Group()
      g.add(box(1.7, 2.5, 1.7, this.m.cream))
      g.add(box(1.3, 0.7, 1.72, this.m.glass, 0, 1.35, 0))
      g.add(box(2.1, 0.16, 2.1, this.m.terracotta, 0, 2.5, 0))
      return g
    },
    'tw-fence-x': () => this.fence(true),
    'tw-fence-y': () => this.fence(false),
    'tw-sedan': () => this.sedan(),
    'tw-car': () => this.sedan(this.m.carTrim),
    'tw-van': () => {
      const g = new Group()
      g.add(box(1.4, 1.3, 1.9, this.m.vanBody, 1.7, 0.45, 0))
      g.add(box(1.2, 0.45, 1.7, this.m.glass, 1.7, 1.25, 0))
      g.add(box(3.1, 1.85, 2.0, this.m.vanBody, -0.55, 0.45, 0))
      for (const sx of [1.6, -1.5]) {
        for (const sz of [0.95, -0.95]) {
          const wheel = cyl(0.38, 0.38, 0.26, this.m.tyre, sx, 0, sz, 12)
          wheel.rotation.x = Math.PI / 2
          wheel.position.y = 0.38
          g.add(wheel)
        }
      }
      return g
    },
    'tw-truck': () => this.boxtruck(),
    'tw-boxtruck': () => this.boxtruck(),
    'tw-trailer': () => this.trailer(),
    'tw-crane': () => this.crane(),
    'tw-genset': () => this.genset(),
    'tw-cablereel': () => this.cablereel(),
    'tw-arcrig': () => this.arcrig(),
    'tw-lightstand': () => this.arcrig(),
    'tw-camera-dolly': () => this.cameraDolly(),
    'tw-light-bank': () => this.lightBank(),
    'tw-cable-snake': () => this.cableSnake(),
    'tw-grip-cart': () => this.gripCart(),
  }

  private fence(alongX: boolean): Group {
    const g = new Group()
    const run = 4
    for (let i = 0; i <= 2; i++) {
      const p = cyl(0.05, 0.05, 1.3, this.m.fencePost)
      p.position.x = alongX ? i * (run / 2) - run / 2 : 0
      p.position.z = alongX ? 0 : i * (run / 2) - run / 2
      g.add(p)
    }
    for (const h of [0.55, 1.15]) {
      const rail = box(alongX ? run : 0.06, 0.07, alongX ? 0.06 : run, this.m.fencePost, 0, h, 0)
      g.add(rail)
    }
    return g
  }
}
