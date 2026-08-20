// ── sets3d — authoritative set bodies rendered as honest studio construction ──
//
// A set appears here only when `lotSetDressings` says a real engine set is mounted
// on a real stage.  The engine supplies the name, location vocabulary and lifecycle;
// this module supplies a replaceable visual kit.  Every facade deliberately exposes
// timber backs, braces and incomplete sides so it reads as movie scenery rather than
// a second, invented building on the property.

import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  type MeshStandardMaterial,
  Object3D,
} from 'three'
import type { LotSetDressing } from '../snapshot/setDressing.ts'
import type { MaterialLedger } from './materials3d.ts'

type Mat = MeshStandardMaterial

function part(geometry: BoxGeometry | CylinderGeometry, material: Mat): Mesh {
  const body = new Mesh(geometry, material)
  body.castShadow = true
  body.receiveShadow = true
  return body
}

function box(
  w: number,
  h: number,
  d: number,
  material: Mat,
  x = 0,
  y = 0,
  z = 0,
): Mesh {
  const body = part(new BoxGeometry(w, h, d), material)
  body.position.set(x, y + h / 2, z)
  return body
}

function upright(
  host: Object3D,
  x: number,
  z: number,
  height: number,
  material: Mat,
): void {
  host.add(box(0.12, height, 0.12, material, x, 0, z))
}

function brace(
  host: Object3D,
  x: number,
  z: number,
  height: number,
  material: Mat,
  direction: -1 | 1,
): void {
  const length = Math.hypot(height, 1.45)
  const rail = box(0.1, length, 0.1, material, x + direction * 0.72, 0, z + 0.58)
  rail.rotation.z = direction * Math.atan2(1.45, height)
  rail.position.y = height / 2
  host.add(rail)
}

/** Reusable scenery vocabulary. All placement remains the scene's decision. */
export class SetFactory {
  constructor(private readonly m: MaterialLedger) {}

  make(dressing: LotSetDressing): Group | null {
    const set = dressing.set
    if (set === null || set.status === 'retired') return null
    const root = new Group()
    root.name = `mounted-set:${set.id}`
    root.userData.setId = set.id
    root.userData.locationLabel = set.locationLabel

    const label = set.locationLabel.trim().toLowerCase()
    const progress = dressing.state === 'building' || dressing.state === 'repairing' ? 0.67 : 1
    if (label.includes('city') || label.includes('alley') || label.includes('police')) {
      this.urban(root, label, progress)
    } else if (label.includes('graveyard') || label.includes('field') || label.includes('jungle')) {
      this.exterior(root, label, progress)
    } else if (label.includes('ballroom') || label.includes('hotel') || label.includes('court')) {
      this.publicInterior(root, label, progress)
    } else {
      this.domesticInterior(root, label, progress)
    }

    this.scaffoldBack(root, progress)
    this.stageDeck(root)
    return root
  }

  private stageDeck(root: Group): void {
    root.add(box(8.8, 0.16, 5.4, this.m.timberDark, 0, 0.02, 0.25))
    for (let x = -4; x <= 4; x += 1) {
      root.add(box(0.055, 0.04, 5.15, this.m.timber, x, 0.18, 0.25))
    }
  }

  private scaffoldBack(root: Group, progress: number): void {
    const height = 5.3 * progress
    for (const x of [-3.7, -1.85, 0, 1.85, 3.7]) {
      upright(root, x, -0.7, height, this.m.timberDark)
      if (x < 3.7) brace(root, x + 0.9, -0.7, height, this.m.timberDark, x < 0 ? 1 : -1)
    }
    for (const y of [1.2, 2.7, 4.3]) {
      if (y >= height) continue
      root.add(box(8.0, 0.1, 0.1, this.m.timber, 0, y, -0.7))
    }
    // Stage braces kick visibly backwards. This is the silhouette that says "set".
    for (const x of [-3.4, 0, 3.4]) {
      const kick = box(0.11, 3.3, 0.11, this.m.timberDark, x, 0, -1.75)
      kick.rotation.x = -0.58
      kick.position.y = 1.55
      root.add(kick)
      root.add(box(0.95, 0.1, 1.9, this.m.timberDark, x, 0.18, -1.28))
    }
  }

  private urban(root: Group, label: string, progress: number): void {
    const height = 5.1 * progress
    root.add(box(8.2, height, 0.18, label.includes('alley') ? this.m.brick : this.m.taupe, 0, 0.2, 0))
    // False shopfronts with strong depth breaks and period awnings.
    for (const x of [-2.7, 0, 2.7]) {
      root.add(box(1.7, Math.min(2.0, height - 0.3), 0.16, this.m.stageInterior, x, 0.25, 0.16))
      root.add(box(2.2, 0.22, 1.15, this.m.awning, x, Math.min(2.35, height - 0.25), 0.68))
      if (height > 3.6) root.add(box(1.18, 1.15, 0.14, this.m.glass, x, 3.2, 0.15))
    }
    root.add(box(0.22, height + 0.35, 5.1, this.m.brick, -4.05, 0.12, 2.45))
    // Escape landing and ladder make alley/police facades read as filmable city texture.
    root.add(box(3.0, 0.12, 0.75, this.m.steel, 1.75, 3.05, 0.58))
    for (const x of [0.35, 3.15]) upright(root, x, 0.65, Math.min(4.8, height), this.m.steel)
    for (let y = 0.65; y < height - 0.3; y += 0.5) {
      root.add(box(0.95, 0.07, 0.07, this.m.steel, 3.15, y, 0.72))
    }
  }

  private exterior(root: Group, label: string, progress: number): void {
    if (label.includes('graveyard')) {
      for (let i = 0; i < 9; i++) {
        const x = -3.3 + (i % 5) * 1.55
        const z = 0.25 + Math.floor(i / 5) * 1.65 + (i % 2) * 0.25
        root.add(box(0.7, 1.05 + (i % 3) * 0.18, 0.28, this.m.slate, x, 0.2, z))
        root.add(box(0.94, 0.18, 0.38, this.m.trimDeep, x, 0.18, z))
      }
      root.add(box(8.0, 0.18, 0.18, this.m.fencePost, 0, 1.15, 4.3))
    } else if (label.includes('jungle')) {
      for (let i = 0; i < 10; i++) {
        const x = -3.8 + (i % 5) * 1.9
        const z = 0.25 + Math.floor(i / 5) * 2.2
        const trunk = part(new CylinderGeometry(0.11, 0.2, 2.2 + (i % 3) * 0.7, 7), this.m.trunk)
        trunk.position.set(x, 1.1, z)
        root.add(trunk)
        const canopy = part(new CylinderGeometry(0.12, 1.1, 1.45, 7), i % 2 ? this.m.frond : this.m.frondDark)
        canopy.position.set(x, 2.55 + (i % 3) * 0.55, z)
        root.add(canopy)
      }
    } else {
      // Country field: a barn-front flat, split rail and hay-coloured scenery bales.
      const height = 4.6 * progress
      root.add(box(7.4, height, 0.2, this.m.awning, 0, 0.2, -0.1))
      root.add(box(3.2, Math.min(3.4, height - 0.2), 0.16, this.m.timberDark, 0, 0.25, 0.15))
      for (const x of [-3.5, -1.8, 1.8, 3.5]) upright(root, x, 3.2, 1.35, this.m.fencePost)
      root.add(box(7.2, 0.14, 0.14, this.m.fencePost, 0, 0.7, 3.2))
      root.add(box(7.2, 0.14, 0.14, this.m.fencePost, 0, 1.25, 3.2))
    }
  }

  private publicInterior(root: Group, label: string, progress: number): void {
    const height = 5.2 * progress
    root.add(box(8.2, height, 0.18, label.includes('court') ? this.m.timber : this.m.cream, 0, 0.2, 0))
    for (const x of [-3.1, -1.05, 1.05, 3.1]) {
      const column = part(new CylinderGeometry(0.27, 0.34, Math.max(1, height - 0.5), 12), this.m.trim)
      column.position.set(x, Math.max(1, height - 0.5) / 2 + 0.2, 0.55)
      root.add(column)
    }
    if (height > 3) {
      root.add(box(8.55, 0.45, 0.58, this.m.brass, 0, height - 0.28, 0.3))
      root.add(box(3.1, 2.4, 0.15, this.m.stageInterior, 0, 0.25, 0.16))
    }
  }

  private domesticInterior(root: Group, label: string, progress: number): void {
    const height = 4.6 * progress
    const wall = label.includes('old') ? this.m.taupe : this.m.buff
    root.add(box(8.0, height, 0.18, wall, 0, 0.2, 0))
    root.add(box(0.18, height, 4.3, wall, -3.9, 0.2, 2.05))
    root.add(box(1.45, Math.min(2.65, height - 0.2), 0.14, this.m.timberDark, -1.9, 0.25, 0.15))
    if (height > 3.1) {
      for (const x of [0.2, 2.35]) {
        root.add(box(1.35, 1.35, 0.14, this.m.glass, x, 2.45, 0.15))
        root.add(box(1.58, 0.14, 0.25, this.m.trim, x, 2.35, 0.23))
      }
    }
    // Camera-side wall is missing on purpose. Furniture blocks establish scale.
    root.add(box(2.5, 0.72, 0.85, this.m.awning, 1.55, 0.2, 2.65))
    root.add(box(1.1, 0.52, 0.7, this.m.timber, -1.2, 0.2, 2.75))
    root.add(box(2.1, 0.12, 1.05, this.m.timberDark, -1.2, 0.72, 2.75))
  }
}
