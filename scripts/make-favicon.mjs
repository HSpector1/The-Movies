// ── The tab icon (PF1-M3) ────────────────────────────────────────────────────
//
// Generates the product's favicon pair as PNGs, from geometry, with nothing downloaded and
// nothing installed: Node's own zlib is the only dependency, and the encoder below is a
// minimal PNG writer (RGBA, no interlace, one IDAT).
//
// The mark is a clapperboard in the product's brass (--accent #c9a24a) on the product's
// panel dark (#14161c) — the same two colours the shell already uses, so the tab agrees
// with the page. Everything is computed, so the output is byte-stable across machines and
// re-running this script is a no-op on a clean tree.
//
// Run:  node scripts/make-favicon.mjs
// Writes: ui/public/favicon-32.png, ui/public/favicon-180.png

import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(repoRoot, 'ui', 'public')

const BG = [0x14, 0x16, 0x1c, 0xff]
const BRASS = [0xc9, 0xa2, 0x4a, 0xff]
const BRASS_DIM = [0x8a, 0x72, 0x33, 0xff]
const INK = [0x0b, 0x0d, 0x12, 0xff]

const CRC_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c >>> 0
  }
  return table
})()

function crc32(buf) {
  let c = 0xffffffff
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length, 0)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body), 0)
  return Buffer.concat([length, body, crc])
}

function encodePng(size, pixels) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // colour type: RGBA
  // 10..12 stay zero: deflate, adaptive filtering, no interlace.

  // One filter byte (0 = None) per scanline, then the row's RGBA bytes.
  const raw = Buffer.alloc(size * (1 + size * 4))
  for (let y = 0; y < size; y++) {
    const rowStart = y * (1 + size * 4)
    raw[rowStart] = 0
    for (let x = 0; x < size; x++) {
      const p = (y * size + x) * 4
      raw.set(pixels.subarray(p, p + 4), rowStart + 1 + x * 4)
    }
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

/**
 * The mark, in normalised 0..1 coordinates so both sizes are the same drawing.
 *
 * A clapperboard: a brass slate with a hinged clapstick across the top, the stick carrying
 * four dark diagonal bands. Solid shapes only — no glyph, no font, nothing to render.
 */
function markColour(u, v) {
  const inset = 0.10
  if (u < inset || u > 1 - inset || v < inset || v > 1 - inset) return BG

  const stickTop = 0.20
  const stickBottom = 0.40
  // The clapstick is hinged: its underside rides a shallow slope across the board.
  const slope = 0.055 * (u - 0.5)

  if (v < stickTop + slope) return BG
  if (v < stickBottom + slope) {
    // Diagonal bands across the stick. Brass on ink, three full pairs at either size.
    const band = Math.floor((u * 6 + v * 2.4) % 2)
    return band === 0 ? BRASS : INK
  }
  if (v < stickBottom + slope + 0.035) return BRASS_DIM // the hinge line
  if (v > 1 - inset - 0.02) return BRASS_DIM // the slate's foot
  return BRASS
}

function render(size) {
  const pixels = Buffer.alloc(size * size * 4)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // Sample at the pixel centre: at 32px the difference is visible on the diagonals.
      const colour = markColour((x + 0.5) / size, (y + 0.5) / size)
      pixels.set(colour, (y * size + x) * 4)
    }
  }
  return encodePng(size, pixels)
}

mkdirSync(outDir, { recursive: true })
for (const size of [32, 180]) {
  const file = join(outDir, `favicon-${size}.png`)
  writeFileSync(file, render(size))
  console.log(`wrote ${file}`)
}
