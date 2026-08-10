// ── The CURRENT production authored-art export path ──────────────────────────
//
// Production Stage B moved off true PNG-8 at `fdfdfea` because indexing has to encode
// RGB and alpha jointly in one table, which averaged the 1-px silhouette rim and
// posterised tonal ramps. The forward path is truecolour RGBA with the RGB channel
// reduced and the alpha channel untouched, exported by
// `scripts/art/authored-asset-pipeline.py rgba-export`.
//
// Two things are covered here, and they are different in kind:
//   1. the SHIPPED assets on disk still satisfy the contract (no quarantine dependency);
//   2. the TOOL behaves per contract and is deterministic (self-contained synthetic input).
//
// Byte-identical reproduction of the shipped Stage B pair from its raw renders is proved
// by `rgba-verify` against the adoption-pack sources, which live outside this repository;
// it is recorded in the standard rather than asserted here.
import { describe, it, expect } from 'vitest'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(here, '..', '..', '..')
const TOOL = join(repoRoot, 'scripts', 'art', 'authored-asset-pipeline.py')
const LOT = join(repoRoot, 'ui', 'public', 'lot')

/** Walk a PNG's chunk stream. The container is part of the contract, so read it directly. */
function chunks(file: string): { types: string[]; depth: number; colourType: number; interlace: number } {
  const buf = readFileSync(file)
  const types: string[] = []
  let i = 8
  while (i < buf.length) {
    const len = buf.readUInt32BE(i)
    types.push(buf.toString('latin1', i + 4, i + 8))
    i += 12 + len
  }
  return { types, depth: buf[24], colourType: buf[25], interlace: buf[28] }
}

/** Decode a PNG to RGBA via the pipeline tool's own dependency stack, not a JS decoder. */
function decode(file: string): { w: number; h: number; rgba: Uint8Array } {
  const out = execFileSync(
    'python3',
    ['-c', `
import sys
from PIL import Image
im = Image.open(sys.argv[1]).convert("RGBA")
sys.stdout.buffer.write(im.width.to_bytes(4,"big") + im.height.to_bytes(4,"big") + im.tobytes())
`, file],
    { maxBuffer: 64 * 1024 * 1024 },
  )
  const w = out.readUInt32BE(0)
  const h = out.readUInt32BE(4)
  return { w, h, rgba: new Uint8Array(out.subarray(8)) }
}

const alphaOf = (d: { rgba: Uint8Array }) => d.rgba.filter((_, i) => i % 4 === 3)

function distinctRgbAboveAlpha(d: { rgba: Uint8Array }, floor: number): number {
  const s = new Set<number>()
  for (let i = 0; i < d.rgba.length; i += 4) {
    if (d.rgba[i + 3]! > floor) s.add((d.rgba[i]! << 16) | (d.rgba[i + 1]! << 8) | d.rgba[i + 2]!)
  }
  return s.size
}

describe('current production authored export — the shipped Stage B assets', () => {
  const normal = join(LOT, 'b-stage-b.png')
  const worn = join(LOT, 'b-stage-b-ud.png')

  it('1. both are 8-bit truecolour RGBA, non-interlaced', () => {
    for (const f of [normal, worn]) {
      const c = chunks(f)
      expect({ depth: c.depth, colourType: c.colourType, interlace: c.interlace }, f)
        .toEqual({ depth: 8, colourType: 6, interlace: 0 })
    }
  })

  it('2. neither carries PLTE or tRNS — they are not indexed', () => {
    for (const f of [normal, worn]) {
      const { types } = chunks(f)
      expect(types, f).not.toContain('PLTE')
      expect(types, f).not.toContain('tRNS')
      expect(types.filter((t) => t !== 'IDAT'), f).toEqual(['IHDR', 'IEND'])
    }
  })

  it('3. the RGB channel is reduced to the recovered 128-colour contract', () => {
    for (const f of [normal, worn]) {
      expect(distinctRgbAboveAlpha(decode(f), 0), f).toBe(128)
    }
  })

  it('4. alpha is bit-identical between the two finishes', () => {
    // LotScene swaps the under-dressed texture WITHOUT re-running setInteractive, so a
    // differing alpha map silently reshapes the pixel-perfect hit area. The superseded
    // PNG-8 pair differed in 8,652 alpha pixels; this pair must differ in none.
    const a = alphaOf(decode(normal))
    const b = alphaOf(decode(worn))
    expect(a.length).toBe(b.length)
    let differing = 0
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) differing++
    expect(differing, 'normal/worn alpha must be bit-identical').toBe(0)
  })

  it('5. alpha is genuinely lossless, not collapsed into a palette-sized set', () => {
    // PNG-8 has to spend palette entries on alpha, which is what flattened the rim.
    const values = new Set(alphaOf(decode(normal)))
    expect(values.size).toBeGreaterThan(200)
    expect(values.has(255)).toBe(true)
  })
})

describe('rgba-export tool contract', () => {
  /** A small synthetic RGBA source: a soft-edged alpha ramp over many distinct colours. */
  function synth(dir: string): string {
    const p = join(dir, 'src.png')
    execFileSync('python3', ['-c', `
import sys
from PIL import Image
W = H = 48
im = Image.new("RGBA", (W, H))
px = im.load()
for y in range(H):
    for x in range(W):
        a = 0 if x < 4 else (255 if x > 12 else (x - 4) * 31)
        px[x, y] = ((x * 5) % 256, (y * 7) % 256, (x * y) % 256, a)
im.save(sys.argv[1])
`, p])
    return p
  }

  it('6. output is truecolour RGBA with no PLTE/tRNS, alpha preserved exactly', () => {
    const dir = mkdtempSync(join(tmpdir(), 'rgba-export-'))
    try {
      const src = synth(dir)
      execFileSync('python3', [TOOL, 'rgba-export', '--normal', src, '--worn', src,
        '--out-dir', dir, '--stem', 't', '--colours', '16'], { encoding: 'utf8' })
      const out = join(dir, 't.png')
      const c = chunks(out)
      expect(c.colourType).toBe(6)
      expect(c.types).not.toContain('PLTE')
      expect(c.types).not.toContain('tRNS')
      const before = alphaOf(decode(src))
      const after = alphaOf(decode(out))
      expect(after.length).toBe(before.length)
      let differing = 0
      for (let i = 0; i < before.length; i++) if (before[i] !== after[i]) differing++
      expect(differing, 'alpha must survive the export byte-exactly').toBe(0)
      expect(distinctRgbAboveAlpha(decode(out), 0)).toBeLessThanOrEqual(16)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('7. repeated runs are byte-identical', () => {
    const dir = mkdtempSync(join(tmpdir(), 'rgba-export-det-'))
    try {
      const src = synth(dir)
      const hashes = new Set<string>()
      for (const run of ['a', 'b', 'c']) {
        const sub = join(dir, run)
        execFileSync('python3', [TOOL, 'rgba-export', '--normal', src, '--worn', src,
          '--out-dir', sub, '--stem', 't', '--colours', '16'], { encoding: 'utf8' })
        hashes.add(readFileSync(join(sub, 't.png')).toString('base64'))
      }
      expect(hashes.size, 'three clean runs must produce one artefact').toBe(1)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('8. the historical PNG-8 path is still available and clearly separate', () => {
    const dir = mkdtempSync(join(tmpdir(), 'png8-still-'))
    try {
      const src = synth(dir)
      execFileSync('python3', [TOOL, 'quantize', '--normal', src, '--worn', src,
        '--out-dir', dir, '--stem', 'q'], { encoding: 'utf8' })
      const c = chunks(join(dir, 'q.png'))
      expect(c.colourType, 'quantize must still emit INDEXED PNG-8').toBe(3)
      expect(c.types).toContain('PLTE')
      expect(c.types).toContain('tRNS')
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})
