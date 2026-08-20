// ── atmosphere3d — fixed 1948 Southern California sky + image-based fill ─────
//
// The studio stays in one authored afternoon for this spike.  This is deliberately
// not a day/night system and it owns no simulation state: a three-band sky, matching
// horizon fog and a one-time PMREM simply give the existing PBR materials something
// plausible to reflect.  The palette is restrained so the playable lot remains the
// subject rather than becoming a fantasy landscape.

import {
  BackSide,
  BufferAttribute,
  Color,
  Fog,
  Mesh,
  MeshBasicMaterial,
  PMREMGenerator,
  Scene,
  SphereGeometry,
  type WebGLRenderer,
  type WebGLRenderTarget,
} from 'three'

const SKY_TOP = new Color(0x86a5b4)
const SKY_MID = new Color(0xc4c3b2)
const SKY_HORIZON = new Color(0xd8c8a8)
const SKY_GROUND = new Color(0xa99b78)

function skyDome(radius: number): Mesh {
  const geometry = new SphereGeometry(radius, 32, 18)
  const position = geometry.attributes.position
  const colours = new Float32Array(position.count * 3)
  const colour = new Color()

  for (let i = 0; i < position.count; i++) {
    const y01 = position.getY(i) / radius
    if (y01 >= 0.22) {
      colour.copy(SKY_MID).lerp(SKY_TOP, Math.min(1, (y01 - 0.22) / 0.78))
    } else if (y01 >= -0.04) {
      colour.copy(SKY_HORIZON).lerp(SKY_MID, (y01 + 0.04) / 0.26)
    } else {
      colour.copy(SKY_GROUND).lerp(SKY_HORIZON, Math.min(1, (y01 + 1) / 0.96))
    }
    colours[i * 3] = colour.r
    colours[i * 3 + 1] = colour.g
    colours[i * 3 + 2] = colour.b
  }
  geometry.setAttribute('color', new BufferAttribute(colours, 3))
  const material = new MeshBasicMaterial({
    vertexColors: true,
    side: BackSide,
    fog: false,
    depthWrite: false,
  })
  const dome = new Mesh(geometry, material)
  dome.name = '1948-california-sky'
  dome.renderOrder = -100
  return dome
}

export type AtmosphereBuild = {
  sky: Mesh
  fog: Fog
  environment: WebGLRenderTarget
  dispose: () => void
}

/** Build one fixed afternoon atmosphere and its soft PBR reflection source. */
export function buildAtmosphere(renderer: WebGLRenderer): AtmosphereBuild {
  const sky = skyDome(900)
  const environmentScene = new Scene()
  const environmentSky = skyDome(80)
  environmentScene.add(environmentSky)

  const pmrem = new PMREMGenerator(renderer)
  pmrem.compileCubemapShader()
  const environment = pmrem.fromScene(environmentScene, 0.045, 0.1, 180)
  pmrem.dispose()
  environmentSky.geometry.dispose()
  ;(environmentSky.material as MeshBasicMaterial).dispose()

  return {
    sky,
    fog: new Fog(SKY_HORIZON, 430, 650),
    environment,
    dispose: () => {
      sky.geometry.dispose()
      ;(sky.material as MeshBasicMaterial).dispose()
      environment.dispose()
    },
  }
}
