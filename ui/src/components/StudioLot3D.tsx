import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

export type LotZoneId =
  | 'administration'
  | 'soundstage-a'
  | 'soundstage-b'
  | 'city-street'
  | 'western-set'
  | 'backlot-park'

export type ScenePreset = 'golden-age' | 'noir' | 'western' | 'musical'

type StudioLot3DProps = {
  selectedZone: LotZoneId
  onSelectZone: (zone: LotZoneId) => void
  scenePreset: ScenePreset
  takeNumber: number
  activeProductions: number
}

type BuildingSpec = {
  id: LotZoneId
  label: string
  x: number
  z: number
  width: number
  depth: number
  height: number
  color: number
  roof?: 'flat' | 'gable'
}

const BUILDINGS: BuildingSpec[] = [
  { id: 'administration', label: 'Studio HQ', x: 0, z: 13.25, width: 6.1, depth: 4.1, height: 2.5, color: 0xf3dba5 },
  { id: 'soundstage-a', label: 'Stage 01', x: -8.4, z: -6.7, width: 6.25, depth: 5.5, height: 4.35, color: 0x88a6a4, roof: 'gable' },
  { id: 'soundstage-b', label: 'Stage 02', x: -0.6, z: -7.7, width: 6.4, depth: 5.4, height: 4.1, color: 0xd18a68, roof: 'gable' },
  { id: 'city-street', label: 'Metro Set', x: 8.4, z: -5.85, width: 6.2, depth: 4.5, height: 3.4, color: 0xd7b079 },
  { id: 'western-set', label: 'Frontier Set', x: 10.1, z: 5.35, width: 6.4, depth: 4.3, height: 2.55, color: 0xbb7946 },
  { id: 'backlot-park', label: 'Garden Set', x: -8.8, z: 5.8, width: 6.4, depth: 4.5, height: 0.24, color: 0x71a269 },
]

const SPEC_BY_ID = Object.fromEntries(BUILDINGS.map((building) => [building.id, building])) as Record<LotZoneId, BuildingSpec>

function material(color: number, roughness = 0.72, metalness = 0) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness })
}

function roundedBox(
  parent: THREE.Object3D,
  size: [number, number, number],
  position: [number, number, number],
  color: number,
  radius = 0.1,
  options: { roughness?: number; metalness?: number; castShadow?: boolean; receiveShadow?: boolean } = {},
) {
  const mesh = new THREE.Mesh(
    new RoundedBoxGeometry(size[0], size[1], size[2], 3, Math.min(radius, size[0] / 4, size[1] / 4, size[2] / 4)),
    material(color, options.roughness ?? 0.72, options.metalness ?? 0),
  )
  mesh.position.set(...position)
  mesh.castShadow = options.castShadow ?? true
  mesh.receiveShadow = options.receiveShadow ?? true
  parent.add(mesh)
  return mesh
}

function cylinder(
  parent: THREE.Object3D,
  radiusTop: number,
  radiusBottom: number,
  height: number,
  position: [number, number, number],
  color: number,
  segments = 14,
) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments),
    material(color, 0.7),
  )
  mesh.position.set(...position)
  mesh.castShadow = true
  mesh.receiveShadow = true
  parent.add(mesh)
  return mesh
}

function makeCanvasTexture(
  width: number,
  height: number,
  draw: (ctx: CanvasRenderingContext2D, width: number, height: number) => void,
) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  draw(ctx, width, height)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

function makeLabel(text: string, accent = '#d8ae52') {
  const texture = makeCanvasTexture(512, 128, (ctx) => {
    ctx.fillStyle = 'rgba(250, 245, 228, .94)'
    ctx.roundRect(8, 8, 496, 112, 28)
    ctx.fill()
    ctx.strokeStyle = accent
    ctx.lineWidth = 7
    ctx.stroke()
    ctx.fillStyle = '#173936'
    ctx.font = '700 40px Avenir, Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text.toUpperCase(), 256, 66)
  })
  if (!texture) return new THREE.Sprite()
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false, depthTest: false }),
  )
  sprite.scale.set(2.75, 0.69, 1)
  return sprite
}

function makeSign(text: string, background: string, foreground: string) {
  const texture = makeCanvasTexture(768, 256, (ctx, width, height) => {
    ctx.fillStyle = background
    ctx.fillRect(0, 0, width, height)
    ctx.strokeStyle = 'rgba(255,255,255,.6)'
    ctx.lineWidth = 12
    ctx.strokeRect(13, 13, width - 26, height - 26)
    ctx.fillStyle = foreground
    ctx.font = 'italic 700 92px Georgia'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, width / 2, height / 2 + 4)
  })
  return texture
}

function addTree(parent: THREE.Object3D, x: number, z: number, scale = 1, tint = 0x4f8a55) {
  const group = new THREE.Group()
  group.position.set(x, 0, z)
  cylinder(group, 0.09 * scale, 0.15 * scale, 1.2 * scale, [0, 0.6 * scale, 0], 0x7b4a2d, 8)
  const crownMaterial = material(tint, 0.9)
  for (const [cx, cy, cz, size] of [
    [-0.3, 1.33, 0, 0.58],
    [0.28, 1.42, 0.09, 0.63],
    [0, 1.7, -0.13, 0.61],
  ] as const) {
    const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(size * scale, 1), crownMaterial)
    crown.position.set(cx * scale, cy * scale, cz * scale)
    crown.scale.y = 0.88
    crown.castShadow = true
    group.add(crown)
  }
  parent.add(group)
}

function addPalm(parent: THREE.Object3D, x: number, z: number, scale = 1) {
  const group = new THREE.Group()
  group.position.set(x, 0, z)
  const trunk = cylinder(group, 0.09 * scale, 0.15 * scale, 2.55 * scale, [0, 1.25 * scale, 0], 0x8a5c37, 9)
  trunk.rotation.z = 0.04
  const leafMaterial = material(0x3f7c51, 0.92)
  for (let i = 0; i < 9; i++) {
    const leaf = new THREE.Mesh(new THREE.CapsuleGeometry(0.09 * scale, 1.05 * scale, 4, 7), leafMaterial)
    leaf.position.set(0, 2.65 * scale, 0)
    leaf.rotation.z = Math.PI / 2.7
    leaf.rotation.y = (i / 9) * Math.PI * 2
    leaf.translateY(0.45 * scale)
    leaf.castShadow = true
    group.add(leaf)
  }
  parent.add(group)
}

function addHedge(parent: THREE.Object3D, x: number, z: number, width: number, depth: number, rotation = 0) {
  const hedge = roundedBox(parent, [width, 0.46, depth], [x, 0.25, z], 0x4f8452, 0.2)
  hedge.rotation.y = rotation
  return hedge
}

function addLamp(parent: THREE.Object3D, x: number, z: number) {
  cylinder(parent, 0.035, 0.055, 1.35, [x, 0.69, z], 0x24464b, 9)
  const cap = roundedBox(parent, [0.28, 0.12, 0.28], [x, 1.37, z], 0x284448, 0.04, { metalness: 0.35 })
  cap.rotation.y = Math.PI / 4
  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.105, 12, 8),
    new THREE.MeshStandardMaterial({ color: 0xffe9b5, emissive: 0xffc868, emissiveIntensity: 1.8, roughness: 0.35 }),
  )
  bulb.position.set(x, 1.44, z)
  parent.add(bulb)
}

function addBench(parent: THREE.Object3D, x: number, z: number, rotation = 0) {
  const group = new THREE.Group()
  group.position.set(x, 0, z)
  group.rotation.y = rotation
  roundedBox(group, [1.05, 0.12, 0.34], [0, 0.42, 0], 0xa96c3f, 0.05)
  roundedBox(group, [1.05, 0.5, 0.1], [0, 0.68, -0.15], 0xb87b49, 0.04)
  cylinder(group, 0.035, 0.035, 0.42, [-0.38, 0.21, 0], 0x314b4b, 8)
  cylinder(group, 0.035, 0.035, 0.42, [0.38, 0.21, 0], 0x314b4b, 8)
  parent.add(group)
}

function addVehicle(parent: THREE.Object3D, x: number, z: number, color: number, rotation = 0, van = false) {
  const group = new THREE.Group()
  group.position.set(x, 0.14, z)
  group.rotation.y = rotation
  const length = van ? 1.75 : 1.35
  roundedBox(group, [length, 0.38, 0.72], [0, 0.33, 0], color, 0.16, { roughness: 0.48, metalness: 0.12 })
  roundedBox(group, [van ? 1.03 : 0.72, van ? 0.62 : 0.46, 0.64], [van ? -0.2 : -0.05, van ? 0.7 : 0.62, 0], van ? 0xeee2c8 : 0x9fd0d3, 0.13, { roughness: 0.45 })
  roundedBox(group, [0.03, 0.32, 0.5], [van ? 0.34 : 0.1, van ? 0.78 : 0.67, 0], 0x315260, 0.01, { roughness: 0.25, metalness: 0.1 })
  for (const [wx, wz] of [[-length * 0.3, -0.38], [length * 0.3, -0.38], [-length * 0.3, 0.38], [length * 0.3, 0.38]] as const) {
    const wheel = cylinder(group, 0.15, 0.15, 0.08, [wx, 0.2, wz], 0x172124, 12)
    wheel.rotation.x = Math.PI / 2
  }
  parent.add(group)
}

function addWindows(
  parent: THREE.Object3D,
  x: number,
  y: number,
  z: number,
  count: number,
  spacing: number,
  color = 0x315f69,
) {
  for (let i = 0; i < count; i++) {
    const wx = x + (i - (count - 1) / 2) * spacing
    roundedBox(parent, [0.48, 0.68, 0.08], [wx, y, z], 0xf4dca9, 0.035)
    roundedBox(parent, [0.36, 0.55, 0.085], [wx, y, z + 0.012], color, 0.025, { roughness: 0.25, metalness: 0.18 })
    roundedBox(parent, [0.035, 0.55, 0.09], [wx, y, z + 0.025], 0xe7c879, 0.008)
  }
}

function addStageDetails(parent: THREE.Object3D, spec: BuildingSpec) {
  const frontZ = spec.z + spec.depth / 2 + 0.07
  roundedBox(parent, [2.3, 2.25, 0.16], [spec.x, 1.25, frontZ], 0x35575d, 0.05, { metalness: 0.22 })
  for (const offset of [-0.58, 0, 0.58]) {
    roundedBox(parent, [0.045, 2.1, 0.18], [spec.x + offset, 1.25, frontZ + 0.02], 0xd8bd7d, 0.01, { metalness: 0.15 })
  }
  roundedBox(parent, [2.55, 0.25, 0.24], [spec.x, 2.47, frontZ], 0xf0d392, 0.06)
  roundedBox(parent, [0.86, 0.3, 0.22], [spec.x, 2.83, frontZ], 0x203e42, 0.05)

  // Side buttresses and roof vents make the stages feel functional.
  for (const offset of [-spec.width * 0.34, 0, spec.width * 0.34]) {
    roundedBox(parent, [0.14, spec.height * 0.85, 0.22], [spec.x + offset, spec.height * 0.48, spec.z + spec.depth / 2 + 0.05], 0xf0cf8a, 0.03)
  }
  for (const offset of [-1.25, 0, 1.25]) {
    cylinder(parent, 0.19, 0.23, 0.34, [spec.x + offset, spec.height + 0.8, spec.z], 0x5a7475, 12)
    cylinder(parent, 0.27, 0.2, 0.12, [spec.x + offset, spec.height + 1.01, spec.z], 0x739091, 12)
  }
  roundedBox(parent, [1.65, 0.72, 0.06], [spec.x, spec.height - 0.62, frontZ + 0.03], 0x23474a, 0.04)
  const stageNumber = makeSign(spec.id === 'soundstage-a' ? 'STAGE 01' : 'STAGE 02', '#24494a', '#f7e4ae')
  if (stageNumber) {
    const signMaterial = new THREE.MeshBasicMaterial({ map: stageNumber, toneMapped: false })
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.5), signMaterial)
    sign.position.set(spec.x, spec.height - 0.62, frontZ + 0.071)
    parent.add(sign)
  }
}

function addAdministrationDetails(parent: THREE.Object3D, spec: BuildingSpec) {
  const frontZ = spec.z + spec.depth / 2 + 0.07
  roundedBox(parent, [1.4, 2.55, 1.15], [spec.x, spec.height + 0.95, spec.z], 0xf7e6bb, 0.1)
  roundedBox(parent, [0.3, 3.25, 1.22], [spec.x, spec.height + 1.14, spec.z], 0xe0b55f, 0.05)
  roundedBox(parent, [2.1, 0.24, 1.35], [spec.x, spec.height + 2.5, spec.z], 0x2f7771, 0.08, { metalness: 0.1 })
  roundedBox(parent, [1.18, 1.35, 0.13], [spec.x, 0.85, frontZ], 0x34746f, 0.05, { metalness: 0.15 })
  roundedBox(parent, [1.55, 0.28, 0.5], [spec.x, 1.66, frontZ + 0.03], 0xe1b65d, 0.06)
  addWindows(parent, spec.x - 1.66, 1.25, frontZ, 2, 0.75)
  addWindows(parent, spec.x + 1.66, 1.25, frontZ, 2, 0.75)
  for (let i = 0; i < 4; i++) {
    roundedBox(parent, [2.15 + i * 0.23, 0.1, 0.42], [spec.x, 0.05 + i * 0.08, frontZ + 0.34 + i * 0.18], 0xf0dbad, 0.03)
  }
  const signTexture = makeSign('SILVERLINE', '#f1ddac', '#245b58')
  if (signTexture) {
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.63, 0.54), new THREE.MeshBasicMaterial({ map: signTexture, toneMapped: false }))
    sign.position.set(spec.x, spec.height + 1.22, spec.z + 0.59)
    parent.add(sign)
  }
}

function addCityDetails(parent: THREE.Object3D, spec: BuildingSpec) {
  const colors = [0xe7c47e, 0xb7d1c5, 0xdf9470, 0xf2d69d]
  const frontZ = spec.z + spec.depth / 2 + 0.13
  for (let i = 0; i < 4; i++) {
    const x = spec.x + (i - 1.5) * 1.12
    const height = 2.25 + (i % 3) * 0.3
    roundedBox(parent, [1.03, height, 0.48], [x, height / 2 + 0.2, spec.z + 1.43], colors[i]!, 0.04)
    roundedBox(parent, [0.83, 0.48, 0.1], [x, 0.72, frontZ], i % 2 === 0 ? 0x2d6570 : 0x7a403b, 0.025)
    roundedBox(parent, [0.72, 0.52, 0.1], [x, 1.62, frontZ], 0x416d78, 0.02, { roughness: 0.28, metalness: 0.12 })
    const awning = roundedBox(parent, [0.9, 0.12, 0.6], [x, 1.05, frontZ + 0.2], i % 2 === 0 ? 0xef6656 : 0x4f8a88, 0.04)
    awning.rotation.x = -0.22
  }
  // Fire escape and rooftop details.
  roundedBox(parent, [0.08, 2.0, 0.12], [spec.x + 1.25, 1.62, frontZ + 0.1], 0x3b4b4d, 0.01, { metalness: 0.7 })
  for (let y = 0.85; y < 2.45; y += 0.52) {
    roundedBox(parent, [0.85, 0.06, 0.32], [spec.x + 1.25, y, frontZ + 0.12], 0x3b4b4d, 0.01, { metalness: 0.7 })
  }
}

function addWesternDetails(parent: THREE.Object3D, spec: BuildingSpec) {
  const frontZ = spec.z + spec.depth / 2 + 0.13
  const colors = [0xa95e37, 0xd39558, 0x8c5237, 0xc27b43]
  for (let i = 0; i < 4; i++) {
    const x = spec.x + (i - 1.5) * 1.13
    const height = 1.25 + (i % 2) * 0.35
    roundedBox(parent, [1.05, height, 0.42], [x, height / 2 + 0.25, spec.z + 1.28], colors[i]!, 0.025)
    roundedBox(parent, [0.78, 0.23, 0.09], [x, height, frontZ], 0x6d3f2b, 0.02)
    roundedBox(parent, [0.42, 0.7, 0.1], [x, 0.62, frontZ], 0x56382d, 0.02)
    const porch = roundedBox(parent, [1.05, 0.08, 0.72], [x, 1.04, frontZ + 0.24], 0xe1b36c, 0.02)
    porch.rotation.x = -0.17
    cylinder(parent, 0.025, 0.035, 0.72, [x - 0.39, 0.66, frontZ + 0.47], 0x71472f, 6)
    cylinder(parent, 0.025, 0.035, 0.72, [x + 0.39, 0.66, frontZ + 0.47], 0x71472f, 6)
  }
  // Windmill silhouette.
  cylinder(parent, 0.035, 0.055, 2.3, [spec.x + 2.1, 1.35, spec.z - 0.4], 0x56615d, 8)
  const hub = cylinder(parent, 0.14, 0.14, 0.12, [spec.x + 2.1, 2.45, spec.z - 0.32], 0x54605e, 10)
  hub.rotation.x = Math.PI / 2
  for (let i = 0; i < 6; i++) {
    const blade = roundedBox(parent, [0.06, 1.0, 0.04], [spec.x + 2.1, 2.45, spec.z - 0.24], 0x65706d, 0.01, { metalness: 0.4 })
    blade.rotation.z = (i / 6) * Math.PI
  }
}

function addGardenDetails(parent: THREE.Object3D, spec: BuildingSpec) {
  const waterMaterial = new THREE.MeshStandardMaterial({ color: 0x54b7ba, roughness: 0.22, metalness: 0.08 })
  const basin = cylinder(parent, 1.03, 1.14, 0.28, [spec.x, 0.23, spec.z], 0xe5d09d, 28)
  basin.material = material(0xe5d09d, 0.8)
  const water = cylinder(parent, 0.88, 0.88, 0.06, [spec.x, 0.4, spec.z], 0x56bcc1, 32)
  water.material = waterMaterial
  cylinder(parent, 0.14, 0.22, 0.82, [spec.x, 0.81, spec.z], 0xe9d5a8, 14)
  const spray = cylinder(parent, 0.04, 0.07, 0.66, [spec.x, 1.5, spec.z], 0x86e6df, 10)
  ;(spray.material as THREE.MeshStandardMaterial).transparent = true
  ;(spray.material as THREE.MeshStandardMaterial).opacity = 0.6
  for (const [x, z, rotation] of [
    [spec.x - 1.75, spec.z, Math.PI / 2],
    [spec.x + 1.75, spec.z, -Math.PI / 2],
  ] as const) addBench(parent, x, z, rotation)
  addHedge(parent, spec.x, spec.z - 1.35, 4.6, 0.35)
  addHedge(parent, spec.x, spec.z + 1.35, 4.6, 0.35)
  addHedge(parent, spec.x - 2.25, spec.z, 2.4, 0.35, Math.PI / 2)
  addHedge(parent, spec.x + 2.25, spec.z, 2.4, 0.35, Math.PI / 2)
  for (const [x, z] of [[-1.65, -0.85], [1.65, -0.85], [-1.65, 0.85], [1.65, 0.85]] as const) {
    const flower = cylinder(parent, 0.25, 0.3, 0.16, [spec.x + x, 0.26, spec.z + z], 0x6d985b, 12)
    const flowerMaterial = flower.material as THREE.MeshStandardMaterial
    flowerMaterial.emissive.setHex((x + z) > 0 ? 0xe96f6a : 0xf3cf65)
    flowerMaterial.emissiveIntensity = 0.3
  }
}

type CampusFacilityOptions = {
  label: string
  x: number
  z: number
  width: number
  depth: number
  height: number
  body: number
  trim?: number
  roof?: number
}

function addCampusFacility(parent: THREE.Object3D, options: CampusFacilityOptions) {
  const { label, x, z, width, depth, height, body, trim = 0xf0d7a0, roof = 0x486968 } = options
  const group = new THREE.Group()
  group.position.set(x, 0, z)
  roundedBox(group, [width + 0.6, 0.18, depth + 0.6], [0, 0.06, 0], 0xd9cfb6, 0.13)
  roundedBox(group, [width, height, depth], [0, height / 2 + 0.16, 0], body, 0.12)
  roundedBox(group, [width + 0.18, 0.3, depth + 0.18], [0, height + 0.24, 0], roof, 0.08, { metalness: 0.12 })
  roundedBox(group, [1.0, 1.35, 0.12], [0, 0.85, depth / 2 + 0.08], 0x315a62, 0.045, { metalness: 0.16 })
  roundedBox(group, [1.35, 0.2, 0.52], [0, 1.58, depth / 2 + 0.2], trim, 0.05)
  const windowCount = Math.max(2, Math.floor(width / 1.45))
  addWindows(group, 0, Math.min(1.42, height * 0.58), depth / 2 + 0.07, windowCount, 1.05)
  for (const offset of [-width * 0.3, width * 0.3]) {
    cylinder(group, 0.16, 0.2, 0.28, [offset, height + 0.55, 0], 0x7e9090, 12)
    cylinder(group, 0.23, 0.17, 0.08, [offset, height + 0.72, 0], 0x596f70, 12)
  }
  const signTexture = makeSign(label, '#f3dfad', '#285d59')
  if (signTexture) {
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(Math.min(width * 0.48, 2.8), 0.64),
      new THREE.MeshBasicMaterial({ map: signTexture, toneMapped: false }),
    )
    sign.position.set(0, height - 0.38, depth / 2 + 0.075)
    group.add(sign)
  }
  parent.add(group)
  return group
}

function addStudioEntrance(parent: THREE.Object3D) {
  const group = new THREE.Group()
  group.position.set(0, 0, 20.8)
  for (const side of [-1, 1]) {
    roundedBox(group, [2.2, 2.15, 2.6], [side * 5.15, 1.14, 0], 0xf0d6a0, 0.18)
    roundedBox(group, [2.5, 0.28, 2.86], [side * 5.15, 2.34, 0], 0x34716c, 0.08)
    addWindows(group, side * 5.15, 1.24, 1.34, 2, 0.72)
    roundedBox(group, [0.72, 1.18, 0.12], [side * 5.15, 0.8, 1.36], 0x30555e, 0.04)
    roundedBox(group, [0.72, 3.6, 0.72], [side * 3.45, 1.86, 0], 0xf4dfae, 0.11)
    roundedBox(group, [0.28, 4.3, 0.28], [side * 3.45, 2.2, 0], 0xe1b65c, 0.05)
  }
  roundedBox(group, [6.25, 0.65, 0.78], [0, 3.72, 0], 0x2c6864, 0.18)
  roundedBox(group, [5.45, 0.12, 0.84], [0, 3.44, 0], 0xf0c85f, 0.05)
  const signTexture = makeSign('SILVERLINE STUDIOS', '#2b6662', '#ffe7a4')
  if (signTexture) {
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(5.5, 1.05), new THREE.MeshBasicMaterial({ map: signTexture, toneMapped: false }))
    sign.position.set(0, 3.75, 0.42)
    group.add(sign)
  }
  for (const side of [-1, 1]) {
    const gate = roundedBox(group, [2.7, 0.08, 1.25], [side * 1.4, 0.72, 0.15], 0xb98f3d, 0.02, { metalness: 0.48 })
    gate.rotation.z = side * 0.08
    cylinder(group, 0.035, 0.05, 3.4, [side * 7.25, 1.7, 0.2], 0x405e60, 8)
    const flag = new THREE.Mesh(
      new THREE.PlaneGeometry(1.15, 0.62),
      new THREE.MeshStandardMaterial({ color: side < 0 ? 0xd45f4f : 0x2e7d76, side: THREE.DoubleSide, roughness: 0.76 }),
    )
    flag.position.set(side * 6.7, 3.05, 0.2)
    group.add(flag)
  }
  parent.add(group)
}

function addConstructionSite(parent: THREE.Object3D, x: number, z: number) {
  const group = new THREE.Group()
  group.position.set(x, 0, z)
  roundedBox(group, [8.4, 0.16, 6.4], [0, 0.04, 0], 0xc89a60, 0.1)
  roundedBox(group, [6.2, 2.45, 4.35], [0, 1.36, 0], 0xc8b48c, 0.08)
  const scaffoldMaterial = 0x697875
  for (const sx of [-3.45, -2.3, -1.15, 0, 1.15, 2.3, 3.45]) {
    for (const sz of [-2.35, 2.35]) cylinder(group, 0.025, 0.035, 3.85, [sx, 1.95, sz], scaffoldMaterial, 6)
  }
  for (const sy of [0.55, 1.4, 2.25, 3.1]) {
    for (const sz of [-2.35, 2.35]) roundedBox(group, [7.1, 0.045, 0.055], [0, sy, sz], scaffoldMaterial, 0.01, { metalness: 0.55 })
  }
  for (const sx of [-3.45, 3.45]) {
    for (const sy of [0.55, 1.4, 2.25, 3.1]) roundedBox(group, [0.055, 0.045, 4.75], [sx, sy, 0], scaffoldMaterial, 0.01, { metalness: 0.55 })
  }
  roundedBox(group, [2.0, 0.28, 0.18], [0, 2.18, 2.45], 0xf0d574, 0.04)
  for (const [cx, cz, size] of [[-2.9, -2.0, 0.52], [-2.2, -1.8, 0.65], [2.75, -1.9, 0.46]] as const) {
    roundedBox(group, [size, size, size], [cx, size / 2 + 0.14, cz], 0x96613e, 0.03)
  }
  parent.add(group)
}

function addTrailerCompound(parent: THREE.Object3D, x: number, z: number) {
  const colors = [0xf1e8cf, 0xcfe3de, 0xf0d9c1, 0xd9e6e4, 0xf3e9d5, 0xd7e8dc]
  roundedBox(parent, [11.5, 0.14, 6.1], [x, 0.035, z], 0xd9c9a6, 0.16)
  for (let i = 0; i < 6; i++) {
    const row = Math.floor(i / 3)
    const tx = x + (i % 3 - 1) * 3.35
    const tz = z + (row - 0.5) * 2.65
    const trailer = roundedBox(parent, [2.65, 1.35, 1.25], [tx, 0.83, tz], colors[i]!, 0.18, { metalness: 0.08 })
    trailer.rotation.y = row === 0 ? 0 : Math.PI
    roundedBox(parent, [0.64, 0.52, 0.08], [tx - 0.62, 0.98, tz + (row === 0 ? 0.66 : -0.66)], 0x43707b, 0.04)
    roundedBox(parent, [0.48, 0.94, 0.08], [tx + 0.77, 0.69, tz + (row === 0 ? 0.66 : -0.66)], 0x8b6545, 0.03)
    cylinder(parent, 0.18, 0.18, 0.09, [tx - 0.78, 0.28, tz - 0.68], 0x243033, 12).rotation.x = Math.PI / 2
    cylinder(parent, 0.18, 0.18, 0.09, [tx + 0.78, 0.28, tz - 0.68], 0x243033, 12).rotation.x = Math.PI / 2
  }
}

function addParkingLot(parent: THREE.Object3D, x: number, z: number) {
  roundedBox(parent, [12.5, 0.12, 6.2], [x, 0.025, z], 0x59615d, 0.12)
  for (let lane = -1; lane <= 1; lane += 2) {
    for (let i = 0; i < 6; i++) {
      const px = x + (i - 2.5) * 1.85
      const pz = z + lane * 1.7
      roundedBox(parent, [0.055, 0.025, 1.35], [px - 0.82, 0.1, pz], 0xe9d9a8, 0.005, { castShadow: false })
      if (i % 2 === 0 || lane === 1) addVehicle(parent, px, pz, [0xd85e4f, 0x4c8e8a, 0xd9ad45, 0x476c86][(i + lane + 1) % 4]!, Math.PI / 2, i === 5)
    }
  }
}

function addExpandedCityBlock(parent: THREE.Object3D, x: number, z: number) {
  const colors = [0xb2c9c2, 0xdfbd79, 0xc97e62, 0xe9d09a, 0x93b7b0]
  for (let i = 0; i < 5; i++) {
    const bx = x + (i - 2) * 1.25
    const height = 2.4 + (i % 3) * 0.52
    roundedBox(parent, [1.16, height, 1.15], [bx, height / 2 + 0.18, z], colors[i]!, 0.045)
    roundedBox(parent, [0.72, 0.52, 0.08], [bx, 0.73, z + 0.62], i % 2 ? 0x6d473f : 0x2e6570, 0.025)
    addWindows(parent, bx, 1.72, z + 0.61, 1, 0.8)
    cylinder(parent, 0.12, 0.15, 0.34, [bx, height + 0.4, z], 0x657b7b, 10)
  }
}

function createPerson(bodyColor: number, skinColor: number, hairColor: number, badgeColor?: number) {
  const group = new THREE.Group()
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.3, 18),
    new THREE.MeshBasicMaterial({ color: 0x10201e, transparent: true, opacity: 0.28, depthWrite: false }),
  )
  shadow.rotation.x = -Math.PI / 2
  shadow.position.y = 0.012
  group.add(shadow)

  const leftLeg = roundedBox(group, [0.16, 0.43, 0.18], [-0.11, 0.28, 0], 0x304f58, 0.07)
  const rightLeg = roundedBox(group, [0.16, 0.43, 0.18], [0.11, 0.28, 0], 0x304f58, 0.07)
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.38, 5, 10), material(bodyColor, 0.68))
  torso.position.y = 0.72
  torso.castShadow = true
  group.add(torso)
  const leftArm = roundedBox(group, [0.12, 0.43, 0.13], [-0.28, 0.73, 0], bodyColor, 0.06)
  leftArm.rotation.z = -0.15
  const rightArm = roundedBox(group, [0.12, 0.43, 0.13], [0.28, 0.73, 0], bodyColor, 0.06)
  rightArm.rotation.z = 0.15
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), material(skinColor, 0.78))
  head.position.y = 1.19
  head.castShadow = true
  group.add(head)
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.225, 16, 9, 0, Math.PI * 2, 0, Math.PI * 0.58), material(hairColor, 0.9))
  hair.position.y = 1.23
  hair.castShadow = true
  group.add(hair)

  if (badgeColor !== undefined) {
    const marker = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.17, 0),
      new THREE.MeshStandardMaterial({ color: badgeColor, emissive: badgeColor, emissiveIntensity: 0.45, roughness: 0.35 }),
    )
    marker.name = 'agent-marker'
    marker.position.y = 1.72
    marker.castShadow = true
    group.add(marker)
  }
  group.userData.leftLeg = leftLeg
  group.userData.rightLeg = rightLeg
  group.userData.leftArm = leftArm
  group.userData.rightArm = rightArm
  return group
}

export function StudioLot3D({
  selectedZone,
  onSelectZone,
  scenePreset,
  takeNumber,
  activeProductions,
}: StudioLot3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const zoneMeshesRef = useRef<Map<LotZoneId, THREE.Mesh[]>>(new Map())
  const selectionRef = useRef<THREE.Group | null>(null)
  const onSelectRef = useRef(onSelectZone)
  const [webglUnavailable, setWebglUnavailable] = useState(false)

  useEffect(() => {
    onSelectRef.current = onSelectZone
  }, [onSelectZone])

  useEffect(() => {
    const selectedSpec = SPEC_BY_ID[selectedZone]
    for (const [id, meshes] of zoneMeshesRef.current) {
      for (const mesh of meshes) {
        const meshMaterial = mesh.material as THREE.MeshStandardMaterial
        meshMaterial.emissive.setHex(id === selectedZone ? 0x8a641c : 0x000000)
        meshMaterial.emissiveIntensity = id === selectedZone ? 0.24 : 0
      }
    }
    const selection = selectionRef.current
    if (selection) {
      selection.position.set(selectedSpec.x, 0, selectedSpec.z)
      selection.userData.height = selectedSpec.height
      const diamond = selection.getObjectByName('selection-diamond')
      if (diamond) diamond.position.y = Math.max(1.35, selectedSpec.height + 1.35)
      const ring = selection.getObjectByName('selection-ring')
      if (ring) ring.scale.set(selectedSpec.width * 0.28, selectedSpec.depth * 0.42, 1)
    }
  }, [selectedZone])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || navigator.userAgent.toLowerCase().includes('jsdom')) return

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' })
    } catch {
      setWebglUnavailable(true)
      return
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.35))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = scenePreset === 'noir' ? 0.92 : 1.18

    const scene = new THREE.Scene()
    const skyColor = scenePreset === 'noir' ? 0x102c38 : 0x8ec8ca
    const fogColor = scenePreset === 'noir' ? 0x15313a : 0xaed3c8
    scene.background = new THREE.Color(skyColor)
    scene.fog = new THREE.Fog(fogColor, 62, 112)

    const camera = new THREE.PerspectiveCamera(33, 1, 0.1, 170)
    let yaw = -0.38
    let pitch = 0.84
    let distance = 72
    const target = new THREE.Vector3(0, 1.1, -0.8)
    const updateCamera = () => {
      camera.position.set(
        target.x + Math.sin(yaw) * Math.cos(pitch) * distance,
        target.y + Math.sin(pitch) * distance,
        target.z + Math.cos(yaw) * Math.cos(pitch) * distance,
      )
      camera.lookAt(target)
    }
    updateCamera()

    const hemi = new THREE.HemisphereLight(
      scenePreset === 'noir' ? 0x79a9c4 : 0xfff4d2,
      scenePreset === 'noir' ? 0x091b22 : 0x5d704e,
      scenePreset === 'noir' ? 1.55 : 2.2,
    )
    scene.add(hemi)
    const sun = new THREE.DirectionalLight(
      scenePreset === 'noir' ? 0xb8dfff : 0xffc66f,
      scenePreset === 'noir' ? 2.6 : 3.8,
    )
    sun.position.set(-28, 42, 30)
    sun.castShadow = true
    sun.shadow.mapSize.set(1536, 1536)
    sun.shadow.bias = -0.00035
    sun.shadow.camera.left = -38
    sun.shadow.camera.right = 38
    sun.shadow.camera.top = 34
    sun.shadow.camera.bottom = -34
    sun.shadow.camera.far = 110
    scene.add(sun)
    const fill = new THREE.DirectionalLight(scenePreset === 'noir' ? 0x3f8cb6 : 0x70b7a8, 1.1)
    fill.position.set(12, 8, -10)
    scene.add(fill)

    // A full campus footprint replaces the earlier compact showcase island.
    roundedBox(scene, [66, 1.1, 47.5], [0, -0.62, 0], scenePreset === 'western' ? 0xa7774d : 0x55745c, 0.72, { roughness: 0.98 })
    const groundTexture = new THREE.TextureLoader().load('/assets/studio-backlot-ground-v2.png')
    groundTexture.colorSpace = THREE.SRGBColorSpace
    groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping
    groundTexture.repeat.set(4.8, 3.4)
    groundTexture.anisotropy = renderer.capabilities.getMaxAnisotropy()
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: scenePreset === 'western' ? 0xd0a06e : 0xd8d6b1,
      map: groundTexture,
      roughness: 1,
    })
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(65.4, 46.9), groundMaterial)
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -0.045
    ground.receiveShadow = true
    scene.add(ground)

    const roadMaterial = material(scenePreset === 'noir' ? 0x23353c : 0x4b5551, 0.98)
    const roadSpecs = [
      [0, 15.85, 3.3, 10.5],
      [0, 0, 3.0, 24.0],
      [0, 9.35, 62.5, 2.7],
      [0, -0.2, 62.5, 2.7],
      [0, -13.35, 62.5, 2.7],
      [-15.25, -4.2, 2.55, 28.7],
      [15.4, -2.1, 2.55, 24.6],
    ] as const
    for (const [x, z, width, depth] of roadSpecs) {
      const sidewalk = new THREE.Mesh(
        new RoundedBoxGeometry(width + 0.82, 0.09, depth + 0.82, 2, 0.08),
        material(0xded3b7, 0.96),
      )
      sidewalk.position.set(x, 0.015, z)
      sidewalk.receiveShadow = true
      scene.add(sidewalk)
      const road = new THREE.Mesh(new RoundedBoxGeometry(width, 0.11, depth, 2, 0.05), roadMaterial)
      road.position.set(x, 0.075, z)
      road.receiveShadow = true
      scene.add(road)
    }
    // Painted road dashes and curbs add scale cues.
    for (let z = -11.8; z <= 19.5; z += 2.4) roundedBox(scene, [0.07, 0.035, 0.78], [0, 0.1, z], 0xe8ce87, 0.01, { castShadow: false })
    for (const roadZ of [-13.35, -0.2, 9.35]) {
      for (let x = -29; x <= 29; x += 2.5) roundedBox(scene, [0.82, 0.035, 0.06], [x, 0.1, roadZ], 0xe8ce87, 0.01, { castShadow: false })
    }
    for (const crossingZ of [8.75, -0.8, -13.95]) {
      for (const crossingX of [-1.05, -0.52, 0, 0.52, 1.05]) {
        roundedBox(scene, [0.34, 0.028, 0.14], [crossingX, 0.145, crossingZ], 0xf4ead2, 0.01, { castShadow: false })
      }
    }
    for (const crossingX of [-15.85, 14.75]) {
      for (const crossingZ of [-0.72, -0.2, 0.32]) {
        roundedBox(scene, [0.14, 0.028, 0.34], [crossingX, 0.145, crossingZ], 0xf4ead2, 0.01, { castShadow: false })
      }
    }

    // Perimeter walls and planting establish a believable, expandable studio estate.
    for (let x = -29; x <= 29; x += 3.2) {
      if (Math.abs(x) > 7.1) roundedBox(scene, [2.75, 0.72, 0.28], [x, 0.36, 22.2], 0xe4d1a9, 0.08)
      roundedBox(scene, [2.75, 0.72, 0.28], [x, 0.36, -22.2], 0xd4c39d, 0.08)
    }
    for (let z = -19; z <= 19; z += 3.0) {
      roundedBox(scene, [0.28, 0.72, 2.55], [-32.15, 0.36, z], 0xd4c39d, 0.08)
      roundedBox(scene, [0.28, 0.72, 2.55], [32.15, 0.36, z], 0xd4c39d, 0.08)
    }
    addStudioEntrance(scene)

    // Pavement pads under each building create clean buildable parcels.
    for (const spec of BUILDINGS) {
      roundedBox(scene, [spec.width + 0.6, 0.18, spec.depth + 0.6], [spec.x, 0.06, spec.z], 0xded4ba, 0.14, { roughness: 0.9 })
    }

    const zoneMeshes = new Map<LotZoneId, THREE.Mesh[]>()
    for (const spec of BUILDINGS) {
      const building = roundedBox(scene, [spec.width, spec.height, spec.depth], [spec.x, spec.height / 2 + 0.14, spec.z], spec.color, spec.id === 'backlot-park' ? 0.2 : 0.14)
      building.userData.zoneId = spec.id
      zoneMeshes.set(spec.id, [building])

      if (spec.roof === 'gable') {
        const roof = new THREE.Mesh(
          new THREE.CylinderGeometry(spec.width * 0.51, spec.width * 0.51, spec.depth + 0.08, 32, 1, false, 0, Math.PI),
          material(spec.id === 'soundstage-a' ? 0x345c62 : 0x774b45, 0.76, 0.08),
        )
        roof.rotation.set(0, Math.PI / 2, Math.PI / 2)
        roof.position.set(spec.x, spec.height + 0.17, spec.z)
        roof.scale.y = 0.23
        roof.castShadow = true
        scene.add(roof)
        addStageDetails(scene, spec)
      }

      if (spec.id === 'administration') addAdministrationDetails(scene, spec)
      if (spec.id === 'city-street') addCityDetails(scene, spec)
      if (spec.id === 'western-set') addWesternDetails(scene, spec)
      if (spec.id === 'backlot-park') addGardenDetails(scene, spec)

      const label = makeLabel(spec.label, spec.id === selectedZone ? '#e5b94d' : '#86a89b')
      label.position.set(spec.x, Math.max(1.55, spec.height + (spec.roof ? 1.6 : 1.0)), spec.z)
      scene.add(label)
    }
    zoneMeshesRef.current = zoneMeshes

    // The campus reads as an operating studio rather than a set sampler: casting,
    // post, wardrobe, props, food, research and additional stages occupy distinct parcels.
    for (const facility of [
      { label: 'CASTING HALL', x: -9.8, z: 15.2, width: 7.4, depth: 4.3, height: 2.35, body: 0xe9bd88, roof: 0x3d6968 },
      { label: 'PRODUCTION', x: 9.6, z: 14.6, width: 8.2, depth: 4.7, height: 2.6, body: 0xc3d6cb, roof: 0x487173 },
      { label: 'POST HOUSE', x: -21.8, z: 13.0, width: 8.4, depth: 5.6, height: 3.0, body: 0xd6aa78, roof: 0x6b4e43 },
      { label: 'WARDROBE', x: -22.5, z: 4.4, width: 7.8, depth: 5.0, height: 2.65, body: 0xb7cfbf, roof: 0x3f6866 },
      { label: 'PROP HOUSE', x: -24.0, z: -6.6, width: 9.2, depth: 5.9, height: 3.4, body: 0xc98b67, roof: 0x694843 },
      { label: 'SCENE SHOP', x: -23.4, z: -17.5, width: 10.4, depth: 6.2, height: 3.9, body: 0x91aaa4, roof: 0x385d62 },
      { label: 'COMMISSARY', x: 22.4, z: 6.0, width: 8.5, depth: 5.1, height: 2.45, body: 0xf0c985, roof: 0x4f7771 },
      { label: 'RESEARCH', x: 23.0, z: -0.3, width: 8.2, depth: 4.8, height: 2.85, body: 0xb7d2cf, roof: 0x42696c },
      { label: 'STAGE 03', x: 8.9, z: -17.7, width: 8.8, depth: 6.6, height: 4.55, body: 0x799a9a, roof: 0x31565d },
      { label: 'STAGE 04', x: 21.6, z: -17.2, width: 9.1, depth: 6.4, height: 4.2, body: 0xc17c62, roof: 0x654a48 },
    ] as const) addCampusFacility(scene, facility)

    addConstructionSite(scene, -27.0, 18.0)
    addTrailerCompound(scene, 24.5, 16.9)
    addParkingLot(scene, 23.6, -7.2)
    addExpandedCityBlock(scene, 20.4, -5.2)

    // Selection ring and hovering studio marker replace the prototype-style emissive block.
    const selection = new THREE.Group()
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.88, 1.0, 48),
      new THREE.MeshBasicMaterial({ color: 0xf5c650, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false }),
    )
    ring.name = 'selection-ring'
    ring.rotation.x = -Math.PI / 2
    ring.position.y = 0.17
    selection.add(ring)
    const diamond = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.24, 0),
      new THREE.MeshStandardMaterial({ color: 0xffd35a, emissive: 0xd18d17, emissiveIntensity: 0.8, roughness: 0.3 }),
    )
    diamond.name = 'selection-diamond'
    diamond.castShadow = true
    selection.add(diamond)
    const initialSpec = SPEC_BY_ID[selectedZone]
    selection.position.set(initialSpec.x, 0, initialSpec.z)
    selection.userData.height = initialSpec.height
    diamond.position.y = Math.max(1.35, initialSpec.height + 1.35)
    ring.scale.set(initialSpec.width * 0.28, initialSpec.depth * 0.42, 1)
    scene.add(selection)
    selectionRef.current = selection

    // Studio landmark: art-deco water tower with a full structural silhouette.
    const towerGroup = new THREE.Group()
    towerGroup.position.set(-29.0, 0.1, -13.8)
    const tank = cylinder(towerGroup, 0.94, 0.84, 1.2, [0, 4.75, 0], 0xe2e1d5, 24)
    ;(tank.material as THREE.MeshStandardMaterial).metalness = 0.34
    ;(tank.material as THREE.MeshStandardMaterial).roughness = 0.42
    cylinder(towerGroup, 0.12, 1.0, 0.65, [0, 5.65, 0], 0xd65548, 24)
    for (const [x, z] of [[-0.62, -0.5], [0.62, -0.5], [-0.62, 0.5], [0.62, 0.5]] as const) {
      const leg = cylinder(towerGroup, 0.055, 0.085, 4.15, [x, 2.15, z], 0x436467, 8)
      leg.rotation.z = x * -0.025
    }
    for (const y of [0.8, 1.7, 2.6, 3.5]) {
      roundedBox(towerGroup, [1.55, 0.045, 0.045], [0, y, -0.5], 0x557477, 0.01, { metalness: 0.5 })
      roundedBox(towerGroup, [0.045, 0.045, 1.1], [-0.62, y, 0], 0x557477, 0.01, { metalness: 0.5 })
    }
    scene.add(towerGroup)

    // Generated original key art is treated as a real in-world production asset.
    const billboardTexture = new THREE.TextureLoader().load('/assets/cosmic-tomorrow-billboard.png')
    billboardTexture.colorSpace = THREE.SRGBColorSpace
    const billboardGroup = new THREE.Group()
    billboardGroup.position.set(2.4, 0, -21.15)
    roundedBox(billboardGroup, [5.8, 3.5, 0.24], [0, 4.05, 0], 0xf0d592, 0.08)
    const billboard = new THREE.Mesh(
      new THREE.PlaneGeometry(5.42, 3.05),
      new THREE.MeshStandardMaterial({ map: billboardTexture, roughness: 0.62, emissive: scenePreset === 'noir' ? 0x173849 : 0x000000, emissiveIntensity: 0.32 }),
    )
    billboard.position.set(0, 4.05, 0.14)
    billboardGroup.add(billboard)
    for (const x of [-1.9, 1.9]) cylinder(billboardGroup, 0.08, 0.11, 2.6, [x, 1.3, 0], 0x486568, 10)
    scene.add(billboardGroup)

    // Landscaping, palms, street furniture, equipment and vehicles fill the full campus.
    for (const [x, z, scale, tint] of [
      [-30.2, 18.9, 0.92, 0x4f8d56], [-18.2, 18.7, 0.86, 0x5c9355], [-14.3, 14.6, 0.9, 0x477f51],
      [-14.4, 5.6, 0.82, 0x4f8c50], [-14.0, -6.5, 0.86, 0x4b8054], [-14.2, -17.5, 0.82, 0x568f59],
      [-4.8, 18.4, 0.9, 0x477957], [4.8, 18.3, 0.86, 0x508451], [14.3, 14.8, 0.82, 0x4f8d56],
      [15.0, 5.4, 0.78, 0x5c9355], [15.0, -6.8, 0.84, 0x477f51], [15.0, -17.4, 0.8, 0x4f8c50],
      [30.0, 18.7, 0.92, 0x4b8054], [30.0, 8.8, 0.82, 0x568f59], [30.2, -2.8, 0.88, 0x477957],
      [30.0, -12.7, 0.82, 0x508451], [30.0, -19.0, 0.92, 0x4f8d56], [-30.0, -1.0, 0.82, 0x5c9355],
    ] as const) addTree(scene, x, z, scale, tint)
    for (const [x, z, scale] of [
      [-13.7, 18.7, 1.05], [-4.2, 20.0, 0.9], [4.2, 19.9, 0.9], [14.2, 18.5, 1.05],
      [-13.7, 9.0, 0.82], [14.2, 8.8, 0.82], [-15.0, -13.1, 0.8], [15.2, -12.8, 0.85],
    ] as const) addPalm(scene, x, z, scale)
    for (const [x, z] of [
      [-4.2, 10.8], [4.2, 10.8], [-4.2, 8.0], [4.2, 8.0], [-4.2, 1.25], [4.2, 1.25],
      [-4.2, -1.65], [4.2, -1.65], [-11.8, -1.65], [11.8, -1.65], [-18.6, -11.8], [18.4, -11.8],
      [-1.7, 18.4], [1.7, 18.4],
    ] as const) addLamp(scene, x, z)
    addBench(scene, -5.0, 12.0)
    addBench(scene, 5.0, 12.0, Math.PI)
    addBench(scene, -12.1, 5.8, Math.PI / 2)
    addVehicle(scene, -5.6, -0.55, 0xe65f4e, 0, true)
    addVehicle(scene, 5.7, 0.48, 0x3e8c86, Math.PI, false)
    addVehicle(scene, -15.3, 11.5, 0xe0b64f, Math.PI / 2, false)
    addVehicle(scene, 15.35, 2.4, 0x5678a0, Math.PI / 2, true)
    addVehicle(scene, -1.0, 17.2, 0xd76555, 0, false)
    for (const [x, z] of [[-4.1, 8.0], [4.15, 1.35], [-11.7, -1.75], [11.7, -11.85], [-18.0, 8.0], [18.0, 8.0]] as const) {
      cylinder(scene, 0.11, 0.13, 0.36, [x, 0.25, z], 0xc94e43, 10)
      cylinder(scene, 0.16, 0.09, 0.1, [x, 0.49, z], 0xe26a56, 10)
    }
    for (const [x, z] of [[-17.0, 7.9], [-17.0, -1.65], [16.9, 7.9], [16.9, -11.75]] as const) {
      roundedBox(scene, [0.46, 0.65, 0.5], [x, 0.4, z], 0x315e59, 0.08)
      roundedBox(scene, [0.52, 0.08, 0.56], [x, 0.76, z], 0x263f40, 0.04)
    }

    // Production trailers and prop crates.
    const trailer = roundedBox(scene, [2.6, 1.4, 1.05], [-13.0, 0.84, 2.55], 0xf0e5cc, 0.16, { metalness: 0.08 })
    trailer.rotation.y = Math.PI / 2
    for (const z of [1.9, 2.6, 3.3]) roundedBox(scene, [0.08, 0.52, 0.45], [-12.45, 0.95, z], 0x4a7580, 0.03, { metalness: 0.12 })
    for (const [x, z, size] of [[4.4, -10.7, 0.55], [5.05, -10.85, 0.7], [5.75, -10.55, 0.5]] as const) {
      roundedBox(scene, [size, size, size], [x, size / 2 + 0.12, z], 0x9a6842, 0.035)
    }

    // Lightweight film gear near the city set.
    for (const [x, z] of [[5.3, -2.85], [11.4, -2.8], [18.2, -3.0]] as const) {
      for (const offset of [-0.18, 0.18]) {
        const leg = cylinder(scene, 0.015, 0.025, 0.78, [x + offset, 0.39, z], 0x263d41, 6)
        leg.rotation.z = offset * 0.8
      }
      roundedBox(scene, [0.42, 0.5, 0.16], [x, 0.88, z], 0xffdf83, 0.04, { metalness: 0.3 })
    }

    if (scenePreset === 'musical') {
      const floor = new THREE.Mesh(
        new THREE.CircleGeometry(2.05, 40),
        new THREE.MeshStandardMaterial({ color: 0xd985a6, emissive: 0x6a325a, emissiveIntensity: 0.38, roughness: 0.42 }),
      )
      floor.rotation.x = -Math.PI / 2
      floor.position.set(-8.8, 0.32, 5.8)
      scene.add(floor)
    }
    if (scenePreset === 'noir') {
      for (const [x, z, color] of [[6.4, -7.4, 0x2e9ce3], [10.8, -5.4, 0xf25b61], [7.2, -3.1, 0x50b9a3], [20.2, -5.0, 0x8668e4]] as const) {
        const neon = new THREE.PointLight(color, 25, 8, 1.8)
        neon.position.set(x, 2.6, z)
        scene.add(neon)
      }
    }

    // Embodied cast and crew are now readable miniature people, not colored pegs.
    const peoplePalette = [
      [0xe65e4e, 0xe9b48b, 0x3b271f], [0x3c8f8b, 0x9c674d, 0x241b19],
      [0xf1c85e, 0xd18d69, 0x6a3c25], [0x8069b0, 0xf0c2a0, 0x443127],
      [0xe17e62, 0x815442, 0x231b18], [0x5d849b, 0xe5ad80, 0xc18a4b],
      [0x78945d, 0xb8765c, 0x29201e], [0xd98c45, 0xe2aa82, 0x493126],
      [0x4d7698, 0x8e5e49, 0x201a18], [0xb75e72, 0xf0c6a5, 0x6c4b35],
    ] as const
    const badgeColors = [0xffd456, 0x6bd4ca, 0x7db7e8]
    const people = Array.from({ length: 22 }, (_, index) => {
      const colors = peoplePalette[index % peoplePalette.length]!
      return createPerson(colors[0], colors[1], colors[2], index < 3 ? badgeColors[index] : undefined)
    })
    people.forEach((person, index) => {
      person.userData.phase = index / people.length
      person.userData.routeIndex = index % 4
      person.userData.laneOffset = (Math.floor(index / 4) - 2.5) * 0.16
      person.scale.setScalar(index < 3 ? 0.9 : 0.72 + (index % 3) * 0.04)
      scene.add(person)
    })
    const routes = [
      [new THREE.Vector3(-3.8, 0.13, 10.7), new THREE.Vector3(-1.5, 0.13, 2.0), new THREE.Vector3(3.8, 0.13, 1.8), new THREE.Vector3(4.2, 0.13, 9.0)],
      [new THREE.Vector3(-13.7, 0.13, -1.7), new THREE.Vector3(-13.2, 0.13, -11.7), new THREE.Vector3(3.5, 0.13, -11.7), new THREE.Vector3(13.6, 0.13, -2.0)],
      [new THREE.Vector3(-1.15, 0.13, 19.3), new THREE.Vector3(-1.15, 0.13, 10.5), new THREE.Vector3(13.6, 0.13, 10.6), new THREE.Vector3(14.0, 0.13, 1.4), new THREE.Vector3(1.2, 0.13, 1.4)],
      [new THREE.Vector3(-29.8, 0.13, 10.1), new THREE.Vector3(-16.8, 0.13, 10.1), new THREE.Vector3(-16.8, 0.13, -12.0), new THREE.Vector3(-29.3, 0.13, -12.0)],
    ]

    const productionMarkers: THREE.Mesh[] = []
    for (let i = 0; i < activeProductions; i++) {
      const marker = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.22, 0),
        new THREE.MeshStandardMaterial({ color: 0xffd157, emissive: 0xe59a1e, emissiveIntensity: 1.1, roughness: 0.3 }),
      )
      marker.position.set(-8.4 + i * 7.8, 6.25, -6.7 - i * 1.0)
      scene.add(marker)
      productionMarkers.push(marker)
    }

    // Warm, deterministic atmosphere specks give the diorama subtle life.
    const particles = new Float32Array(160 * 3)
    for (let i = 0; i < 160; i++) {
      particles[i * 3] = ((i * 47) % 620) / 10 - 31
      particles[i * 3 + 1] = 0.8 + ((i * 31) % 55) / 10
      particles[i * 3 + 2] = ((i * 83) % 430) / 10 - 21.5
    }
    const particleGeometry = new THREE.BufferGeometry()
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particles, 3))
    const particleCloud = new THREE.Points(
      particleGeometry,
      new THREE.PointsMaterial({ color: scenePreset === 'noir' ? 0x7fc7dd : 0xffe7a8, size: 0.035, transparent: true, opacity: 0.38, depthWrite: false }),
    )
    scene.add(particleCloud)

    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()
    let dragging = false
    let moved = false
    let previousX = 0
    let previousY = 0
    const onPointerDown = (event: PointerEvent) => {
      dragging = true
      moved = false
      previousX = event.clientX
      previousY = event.clientY
      canvas.setPointerCapture(event.pointerId)
    }
    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return
      const dx = event.clientX - previousX
      const dy = event.clientY - previousY
      if (Math.abs(dx) + Math.abs(dy) > 2) moved = true
      yaw -= dx * 0.006
      pitch = THREE.MathUtils.clamp(pitch + dy * 0.004, 0.48, 1.12)
      previousX = event.clientX
      previousY = event.clientY
      updateCamera()
    }
    const onPointerUp = (event: PointerEvent) => {
      dragging = false
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId)
      if (moved) return
      const rect = canvas.getBoundingClientRect()
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(pointer, camera)
      const interactiveMeshes = [...zoneMeshes.values()].flat()
      const hit = raycaster.intersectObjects(interactiveMeshes, false)[0]
      const zoneId = hit?.object.userData.zoneId as LotZoneId | undefined
      if (zoneId) onSelectRef.current(zoneId)
    }
    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      distance = THREE.MathUtils.clamp(distance + event.deltaY * 0.018, 34, 88)
      updateCamera()
    }
    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerup', onPointerUp)
    canvas.addEventListener('wheel', onWheel, { passive: false })

    const resize = () => {
      const width = Math.max(1, canvas.clientWidth)
      const height = Math.max(1, canvas.clientHeight)
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    resize()

    const clock = new THREE.Clock()
    let frame = 0
    let lastRender = -40
    const animate = (now = 0) => {
      frame = requestAnimationFrame(animate)
      if (now - lastRender < 33) return
      lastRender = now
      const elapsed = clock.getElapsedTime()
      people.forEach((person, index) => {
        const phase = (elapsed * (0.035 + takeNumber * 0.006) + person.userData.phase) % 1
        const route = routes[Number(person.userData.routeIndex)]!
        const scaled = phase * route.length
        const from = route[Math.floor(scaled) % route.length]!
        const to = route[(Math.floor(scaled) + 1) % route.length]!
        const local = scaled - Math.floor(scaled)
        person.position.lerpVectors(from, to, local)
        person.position.x += Number(person.userData.laneOffset)
        person.lookAt(to.x, person.position.y, to.z)
        const stride = Math.sin(elapsed * 8 + index) * 0.45
        ;(person.userData.leftLeg as THREE.Mesh).rotation.x = stride
        ;(person.userData.rightLeg as THREE.Mesh).rotation.x = -stride
        ;(person.userData.leftArm as THREE.Mesh).rotation.x = -stride * 0.65
        ;(person.userData.rightArm as THREE.Mesh).rotation.x = stride * 0.65
        const agentMarker = person.getObjectByName('agent-marker')
        if (agentMarker) {
          agentMarker.position.y = 1.72 + Math.sin(elapsed * 3.2 + index) * 0.07
          agentMarker.rotation.y += 0.015
        }
      })
      productionMarkers.forEach((marker, index) => {
        marker.position.y += Math.sin(elapsed * 3 + index) * 0.0018
        marker.rotation.y += 0.02
      })
      diamond.position.y = Math.max(1.35, Number(selection.userData.height) + 1.35) + Math.sin(elapsed * 3.3) * 0.12
      diamond.rotation.y += 0.022
      ring.material.opacity = 0.68 + Math.sin(elapsed * 3.3) * 0.17
      particleCloud.rotation.y = elapsed * 0.004
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', onPointerUp)
      canvas.removeEventListener('wheel', onWheel)
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Sprite || object instanceof THREE.Points) {
          object.geometry?.dispose()
          const objectMaterials = Array.isArray(object.material) ? object.material : [object.material]
          for (const objectMaterial of objectMaterials) {
            if ('map' in objectMaterial && objectMaterial.map instanceof THREE.Texture) objectMaterial.map.dispose()
            objectMaterial.dispose()
          }
        }
      })
      renderer.dispose()
      zoneMeshesRef.current = new Map()
      selectionRef.current = null
    }
  }, [scenePreset, takeNumber, activeProductions])

  return (
    <div className="studio-lot-canvas-wrap" data-testid="studio-lot-3d">
      <canvas ref={canvasRef} aria-label="Interactive 3D studio lot" />
      {webglUnavailable && (
        <div className="lot-canvas-fallback">
          <span>3D preview unavailable</span>
          <small>Your studio simulation is still running.</small>
        </div>
      )}
      <div className="lot-canvas-help">Drag to orbit · Scroll to zoom · Select a building</div>
      <div className="live-chip"><span className="live-dot" /> LIVE LOT</div>
    </div>
  )
}
