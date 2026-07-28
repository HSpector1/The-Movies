// ── Authored-asset pipeline (Stage A) ────────────────────────────────────────
// Original isometric sprites are authored here as SVG (editable vector source),
// then rendered to transparent PNGs via `rsvg-convert`, and loaded into the
// existing Phaser scene. SVG buys gradients, soft contact shadows, and crisp
// anti-aliased edges the runtime Graphics fills cannot — a materially higher tier
// than the procedural art, while matching the exact 2:1 isometric camera.
//
// The geometry below IS the editable source. Nothing is copied or traced from any
// game or real studio — every shape is constructed from primitives here.
//
//   node tools/build-assets.mjs        # render all → src/assets/authored/*.png
//
// Output: PNGs in src/assets/authored/ + a metadata block printed for
// src/lot/authored-assets.ts (placement: origin + footprint).

import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const OUT = fileURLToPath(new URL('../src/assets/authored/', import.meta.url))
const TMP = fileURLToPath(new URL('../.asset-tmp/', import.meta.url))
mkdirSync(OUT, { recursive: true })
mkdirSync(TMP, { recursive: true })

// 2:1 isometric — must match src/lot/iso.ts
const HW = 64
const HH = 32
const RENDER_SCALE = 2 // render at 2x for crisp downscale in-engine

// iso projection: grid (gx,gy) at height z (px up) → 2D (x,y), y down.
const iso = (gx, gy, z = 0) => ({ x: (gx - gy) * HW, y: (gx + gy) * HH - z })

// ── tiny SVG helpers ──────────────────────────────────────────────────────────
const P = (pts) => pts.map((p) => `${r(p.x)},${r(p.y)}`).join(' ')
const r = (n) => Math.round(n * 100) / 100
const poly = (pts, fill, extra = '') => `<polygon points="${P(pts)}" fill="${fill}" ${extra}/>`
const path = (d, attrs) => `<path d="${d}" ${attrs}/>`

// A finished SVG doc from body + defs, auto-fit to a given bounds with padding.
function svgDoc(bounds, defs, body) {
  const pad = 6
  const x0 = bounds.x0 - pad
  const y0 = bounds.y0 - pad
  const w = bounds.x1 - bounds.x0 + pad * 2
  const h = bounds.y1 - bounds.y0 + pad * 2
  return {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${r(x0)} ${r(y0)} ${r(w)} ${r(h)}" width="${Math.ceil(w)}" height="${Math.ceil(h)}"><defs>${defs}</defs>${body}</svg>`,
    w: Math.ceil(w),
    h: Math.ceil(h),
    x0,
    y0,
  }
}

// Standard material gradients (warm classic-Hollywood).
function grads() {
  const lg = (id, c0, c1, x1 = 0, y1 = 1) =>
    `<linearGradient id="${id}" x1="0" y1="0" x2="${x1}" y2="${y1}">` +
    `<stop offset="0" stop-color="${c0}"/><stop offset="1" stop-color="${c1}"/></linearGradient>`
  return [
    lg('gStucco', '#efe3c6', '#d8c8a6'),
    lg('gStuccoL', '#cdbb9a', '#a48f6c'),
    lg('gTaupe', '#d7c6a4', '#b7a483'),
    lg('gTaupeL', '#a48f6c', '#8a765a'),
    lg('gBrass', '#e2c072', '#a9863f'),
    lg('gTerra', '#c07a54', '#9c583c'),
    lg('gTerraL', '#a5624180', '#7d3f2a'),
    lg('gGlass', '#cfe0e2', '#8fb0b6'),
    `<radialGradient id="gGlow" cx="0.5" cy="0.5" r="0.6"><stop offset="0" stop-color="#fff3cf"/><stop offset="1" stop-color="#f3d98a" stop-opacity="0"/></radialGradient>`,
    `<filter id="soft" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="3"/></filter>`,
    `<filter id="softbig" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="6"/></filter>`,
  ].join('')
}

// Ground contact shadow (soft blurred diamond) centered on footprint center.
function groundShadow(fw, fd) {
  const c = iso(fw / 2, fd / 2, 0)
  const w = (fw + fd) * HW * 0.5
  const h = (fw + fd) * HH * 0.5
  return `<ellipse cx="${r(c.x)}" cy="${r(c.y)}" rx="${r(w * 0.62)}" ry="${r(h * 0.62)}" fill="#2a2016" opacity="0.28" filter="url(#softbig)"/>`
}

// An iso cuboid: returns {faces} svg for a box of footprint fw×fd, height H,
// anchored so grid (0,0) ground corner is at iso(0,0,0). Colors are fill refs.
function isoBox(ox, oy, fw, fd, H, { roof, right, left, seam = true }) {
  const p = (gx, gy, z) => {
    const q = iso(gx, gy, z)
    return { x: q.x + ox, y: q.y + oy }
  }
  const right_ = poly([p(0, fd, 0), p(fw, fd, 0), p(fw, fd, H), p(0, fd, H)], right)
  const left_ = poly([p(fw, 0, 0), p(fw, fd, 0), p(fw, fd, H), p(fw, 0, H)], left)
  const roof_ = poly([p(0, 0, H), p(fw, 0, H), p(fw, fd, H), p(0, fd, H)], roof)
  const seam_ = seam
    ? `<line x1="${r(p(fw, fd, 0).x)}" y1="${r(p(fw, fd, 0).y)}" x2="${r(p(fw, fd, H).x)}" y2="${r(p(fw, fd, H).y)}" stroke="#000" stroke-opacity="0.08" stroke-width="1"/>`
    : ''
  return { right: right_, left: left_, roof: roof_, seam: seam_, p }
}

// ── GATE ──────────────────────────────────────────────────────────────────────
// A substantial Deco entrance: two massive pillars, a deep lettered header beam
// with bulb trim, a stepped crown, flanking guard booths, and striped entry
// barriers — spanning the boulevard (3 tiles in gy).
function buildGate() {
  const fw = 1
  const fd = 3
  const H = 128
  const cy = fd / 2
  // face helper in absolute grid coords
  const f = (a, fill, extra = '') => poly(a.map(([gx, gy, z]) => iso(gx, gy, z)), fill, extra)

  const body = []
  body.push(groundShadow(fw + 0.7, fd + 0.7))

  // connecting ground plinth ties the whole structure together
  const pz = 16
  body.push(f([[0, 0, 0], [1, 0, 0], [1, 0, pz], [0, 0, pz]], 'url(#gStuccoL)'))
  body.push(f([[1, 0, 0], [1, fd, 0], [1, fd, pz], [1, 0, pz]], '#a48f6c'))
  body.push(f([[0, 0, pz], [1, 0, pz], [1, fd, pz], [0, fd, pz]], 'url(#gTaupe)'))

  // two solid pillars (fore + aft along the drive), thick and connected by base
  const pillar = (gy0, gy1) => {
    body.push(f([[0.05, gy0, pz], [0.95, gy0, pz], [0.95, gy0, H], [0.05, gy0, H]], 'url(#gTaupe)')) // up-right face
    body.push(f([[0.95, gy0, pz], [0.95, gy1, pz], [0.95, gy1, H], [0.95, gy0, H]], 'url(#gTaupeL)')) // side face
    body.push(f([[0.05, gy0, H], [0.95, gy0, H], [0.95, gy1, H], [0.05, gy1, H]], 'url(#gTaupe)')) // top
    // brass capital + base band
    body.push(f([[0.05, gy0, H - 12], [0.95, gy0, H - 12], [0.95, gy0, H - 5], [0.05, gy0, H - 5]], 'url(#gBrass)'))
    body.push(f([[0.05, gy0, pz + 4], [0.95, gy0, pz + 4], [0.95, gy0, pz + 11], [0.05, gy0, pz + 11]], 'url(#gBrass)'))
    // fluting
    for (let i = 1; i < 4; i++) {
      const fx = 0.05 + (i / 4) * 0.9
      const a = iso(fx, gy0, pz + 14)
      const c = iso(fx, gy0, H - 16)
      body.push(`<line x1="${r(a.x)}" y1="${r(a.y)}" x2="${r(c.x)}" y2="${r(c.y)}" stroke="#000" stroke-opacity="0.07" stroke-width="1.3"/>`)
    }
  }
  pillar(0, 0.95) // aft (up-right)
  // header lintel spanning the full drive, resting on both pillars
  const lz0 = H - 30
  const lg = []
  lg.push(f([[0.1, 0, lz0], [0.9, 0, lz0], [0.9, fd, lz0], [0.1, fd, lz0]], 'url(#gTaupe)')) // underside-front top? drawn as broad top-facing
  lg.push(f([[0.1, 0, lz0], [0.1, fd, lz0], [0.1, fd, H + 6], [0.1, 0, H + 6]], '#f0e5c8')) // lit broad face (up-right)
  lg.push(f([[0.9, 0, lz0], [0.9, fd, lz0], [0.9, fd, H + 6], [0.9, 0, H + 6]], 'url(#gTaupeL)'))
  lg.push(f([[0.1, 0, H + 6], [0.9, 0, H + 6], [0.9, fd, H + 6], [0.1, fd, H + 6]], 'url(#gTaupe)')) // top
  // bulb trim + brass band along the lit face
  lg.push(f([[0.09, 0, lz0 + 3], [0.09, fd, lz0 + 3], [0.09, fd, lz0 + 7], [0.09, 0, lz0 + 7]], 'url(#gBrass)'))
  for (let i = 0; i <= 9; i++) {
    const t = 0.25 + (i / 9) * (fd - 0.5)
    const q = iso(0.08, t, H + 1)
    lg.push(`<circle cx="${r(q.x)}" cy="${r(q.y)}" r="2" fill="#ffe9a8"/>`)
  }
  // stepped deco crown centered on the lintel
  for (let s = 0; s < 3; s++) {
    const t = s / 3
    const half = (1 - t) * 0.85
    const z = H + 6 + s * 12
    lg.push(f([[0.2, cy - half, z], [0.55, cy - half, z], [0.55, cy + half, z], [0.2, cy + half, z]], s % 2 ? 'url(#gBrass)' : 'url(#gStucco)'))
    lg.push(f([[0.2, cy + half, z], [0.55, cy + half, z], [0.55, cy + half, z + 12], [0.2, cy + half, z + 12]], 'url(#gTaupeL)'))
  }
  body.push(lg.join(''))
  pillar(fd - 0.95, fd) // fore (down-left), drawn after lintel so it reads in front

  // striped drop-arm barrier across the opening
  const a0 = iso(0.5, 1.0, pz + 6)
  const a1 = iso(0.5, 2.0, pz + 6)
  body.push(`<line x1="${r(a0.x)}" y1="${r(a0.y)}" x2="${r(a1.x)}" y2="${r(a1.y)}" stroke="#e9dcbf" stroke-width="4" stroke-linecap="round"/>`)
  for (let i = 0; i < 4; i++) {
    const s0 = iso(0.5, 1.0 + (i / 4), pz + 6)
    const s1 = iso(0.5, 1.0 + (i + 0.5) / 4, pz + 6)
    body.push(`<line x1="${r(s0.x)}" y1="${r(s0.y)}" x2="${r(s1.x)}" y2="${r(s1.y)}" stroke="#b8484a" stroke-width="4" stroke-linecap="round"/>`)
  }

  const corners = []
  for (const gx of [-0.1, 1.1]) for (const gy of [-0.2, fd + 1]) for (const z of [0, H + 44]) corners.push(iso(gx, gy, z))
  const bounds = {
    x0: Math.min(...corners.map((c) => c.x)),
    y0: Math.min(...corners.map((c) => c.y)),
    x1: Math.max(...corners.map((c) => c.x)),
    y1: Math.max(...corners.map((c) => c.y)),
  }
  const doc = svgDoc(bounds, grads(), body.join(''))
  const gc = iso(fw / 2, fd / 2, 0)
  return { key: 'a-gate', doc, originX: (gc.x - doc.x0) / doc.w, originY: (gc.y - doc.y0) / doc.h, fw, fd }
}

// ── render pipeline ───────────────────────────────────────────────────────────
function render(asset) {
  const svgPath = `${TMP}${asset.key}.svg`
  const pngPath = `${OUT}${asset.key}.png`
  writeFileSync(svgPath, asset.doc.svg)
  execFileSync('rsvg-convert', [
    '-w', String(asset.doc.w * RENDER_SCALE),
    '-h', String(asset.doc.h * RENDER_SCALE),
    svgPath, '-o', pngPath,
  ])
  return {
    key: asset.key,
    file: `${asset.key}.png`,
    w: asset.doc.w * RENDER_SCALE,
    h: asset.doc.h * RENDER_SCALE,
    originX: Math.round(asset.originX * 1000) / 1000,
    originY: Math.round(asset.originY * 1000) / 1000,
    fw: asset.fw,
    fd: asset.fd,
  }
}

const ASSETS = [buildGate()]
const meta = ASSETS.map(render)
rmSync(TMP, { recursive: true, force: true })

console.log('rendered:', meta.map((m) => `${m.file} ${m.w}x${m.h} origin(${m.originX},${m.originY})`).join('\n  '))
console.log('\n--- metadata (for src/lot/authored-assets.ts) ---')
console.log(JSON.stringify(meta, null, 2))
