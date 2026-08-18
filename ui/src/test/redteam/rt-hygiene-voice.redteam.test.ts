// ── OPUS-REDTEAM (PF1-M4) — independent hygiene, voice and fence scans ───────
//
// The campaign ships its own gates. This file does NOT import or reuse them: every
// scanner here is written independently, so a gate that quietly stopped catching things
// cannot also be the thing that proves it still does.
//
// Charter §8 targets covered:
//   • "Voice truthfulness: … no engine jargon reaching the player anywhere."
//   • "The world-emphasis fence: no new tween/object/canvas effect anywhere in
//      punctuation …; the StartScreen stays a static title card (no intro sequence)."
//   • "Structural pins byte-identical; draw calls unmoved; no new display objects."
//   • DONE §13.3: zero `alert(` / `confirm(` / `prompt(`, bare or window-qualified.
//
// Findings-only: this file asserts; it fixes nothing.

import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const uiSrc = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const repoRoot = resolve(uiSrc, '..', '..')

const SKIP_DIRS = new Set(['node_modules', 'dist', 'test'])

function walk(dir: string, exts: string[]): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      if (SKIP_DIRS.has(entry)) continue
      out.push(...walk(full, exts))
      continue
    }
    if (exts.some((ext) => entry.endsWith(ext))) out.push(full)
  }
  return out
}

function rel(path: string): string {
  return path.replace(repoRoot + sep, '').split(sep).join('/')
}

/** Shipping code only: no *.test.ts(x), nothing under a test directory. */
function shippingFiles(): string[] {
  return walk(uiSrc, ['.ts', '.tsx']).filter((path) => !/\.test\.tsx?$/.test(path))
}

/** Line-preserving comment strip, written from scratch (not the campaign's). */
function stripComments(source: string): string {
  let out = ''
  let i = 0
  let mode: 'code' | 'line' | 'block' | 'single' | 'double' | 'tick' = 'code'
  while (i < source.length) {
    const two = source.slice(i, i + 2)
    const ch = source[i]!
    if (mode === 'code') {
      if (two === '//') { mode = 'line'; out += '  '; i += 2; continue }
      if (two === '/*') { mode = 'block'; out += '  '; i += 2; continue }
      if (ch === "'") mode = 'single'
      else if (ch === '"') mode = 'double'
      else if (ch === '`') mode = 'tick'
      out += ch
      i += 1
      continue
    }
    if (mode === 'line') {
      if (ch === '\n') { mode = 'code'; out += '\n' } else out += ' '
      i += 1
      continue
    }
    if (mode === 'block') {
      if (two === '*/') { mode = 'code'; out += '  '; i += 2; continue }
      out += ch === '\n' ? '\n' : ' '
      i += 1
      continue
    }
    // inside a string literal
    if (ch === '\\') { out += source.slice(i, i + 2); i += 2; continue }
    if ((mode === 'single' && ch === "'") || (mode === 'double' && ch === '"') || (mode === 'tick' && ch === '`')) {
      mode = 'code'
    }
    out += ch
    i += 1
  }
  return out
}

describe('REDTEAM — the browser never speaks (independent scanner)', () => {
  const PATTERNS = [
    /(^|[^.\w$])alert\s*\(/,
    /(^|[^.\w$])confirm\s*\(/,
    /(^|[^.\w$])prompt\s*\(/,
    /\bwindow\s*\.\s*(alert|confirm|prompt)\s*\(/,
    /\bglobalThis\s*\.\s*(alert|confirm|prompt)\s*\(/,
    /\bself\s*\.\s*(alert|confirm|prompt)\s*\(/,
  ]

  it('finds no native dialog call anywhere in shipping ui/src', () => {
    const offenders: string[] = []
    for (const file of shippingFiles()) {
      const code = stripComments(readFileSync(file, 'utf8'))
      code.split('\n').forEach((line, index) => {
        if (PATTERNS.some((pattern) => pattern.test(line))) {
          offenders.push(`${rel(file)}:${String(index + 1)} — ${line.trim()}`)
        }
      })
    }
    expect(offenders).toEqual([])
  })

  it('the scanner is not vacuous: it catches the bare and the qualified forms', () => {
    const fixture = [
      'function f() { alert("x") }',
      'function g() { window.confirm("y") }',
      'function h() { prompt("z") }',
      'function i() { globalThis.alert("w") }',
    ].join('\n')
    for (const line of stripComments(fixture).split('\n')) {
      expect(PATTERNS.some((pattern) => pattern.test(line))).toBe(true)
    }
  })

  it('…and does not fire on innocent look-alikes', () => {
    const innocent = [
      'const alerted = state.alertCount',
      'this.confirmLabel = label',
      'obj.prompt(1)',
      'notify.alert(2)',
      '// alert("in a comment")',
    ].join('\n')
    for (const line of stripComments(innocent).split('\n')) {
      expect(PATTERNS.some((pattern) => pattern.test(line)), line).toBe(false)
    }
  })
})

describe('REDTEAM — exactly one module may name the audio hardware', () => {
  it('AudioContext / new Audio( appear only inside the sanctioned sink', () => {
    const offenders: string[] = []
    for (const file of shippingFiles()) {
      const relative = rel(file)
      if (relative === 'ui/src/audio/sink.ts') continue
      const code = stripComments(readFileSync(file, 'utf8'))
      code.split('\n').forEach((line, index) => {
        if (/\bAudioContext\b|\bnew\s+Audio\s*\(|\bwebkitAudioContext\b/.test(line)) {
          offenders.push(`${relative}:${String(index + 1)} — ${line.trim()}`)
        }
      })
    }
    expect(offenders).toEqual([])
  })

  it('no component reaches the service through anything but its module boundary', () => {
    const offenders: string[] = []
    for (const file of shippingFiles()) {
      const code = stripComments(readFileSync(file, 'utf8'))
      if (/from ['"].*audio\/sink\.ts['"]/.test(code) && !rel(file).startsWith('ui/src/audio/')) {
        // Importing the sink TYPES is fine; constructing a WebAudioSink outside audio/ is not.
        if (/new\s+WebAudioSink\s*\(/.test(code)) offenders.push(rel(file))
      }
    }
    expect(offenders).toEqual([])
  })
})

describe('REDTEAM — the world-emphasis fence (no new canvas objects in presentation)', () => {
  const PF1_MODULE_DIRS = ['ui/src/audio', 'ui/src/presentation', 'ui/src/shell']
  const CANVAS_API =
    /\bPhaser\b|this\.add\.|\.tweens\b|GameObjects|\bnew\s+Phaser|getContext\s*\(|requestAnimationFrame\s*\(/

  it('nothing in audio/ presentation/ shell/ touches a renderer API', () => {
    const offenders: string[] = []
    for (const file of shippingFiles()) {
      const relative = rel(file)
      if (!PF1_MODULE_DIRS.some((dir) => relative.startsWith(dir))) continue
      const code = stripComments(readFileSync(file, 'utf8'))
      code.split('\n').forEach((line, index) => {
        if (CANVAS_API.test(line)) offenders.push(`${relative}:${String(index + 1)} — ${line.trim()}`)
      })
    }
    // CashReadout drives DOM text with rAF — presentation chrome over the canvas, which
    // §5-M2 explicitly allows; it creates no display object. Anything ELSE is a breach.
    const notCashReadout = offenders.filter(
      (entry) => !entry.startsWith('ui/src/presentation/CashReadout.tsx'),
    )
    expect(notCashReadout).toEqual([])
  })

  it('the cue grammar is genuinely pure — no React, no DOM, no storage, no clock', () => {
    const grammar = stripComments(
      readFileSync(join(uiSrc, 'presentation', 'eventGrammar.ts'), 'utf8'),
    )
    for (const banned of [
      'react',
      'document',
      'window',
      'localStorage',
      'setTimeout',
      'Date.now',
      'Math.random',
      'getAudioService',
    ]) {
      expect(grammar.includes(banned), `eventGrammar must not mention ${banned}`).toBe(false)
    }
  })

  it('the StartScreen is a STATIC title card — no timed sequence of any kind', () => {
    const start = stripComments(readFileSync(join(uiSrc, 'screens', 'StartScreen.tsx'), 'utf8'))
    for (const banned of ['setTimeout', 'setInterval', 'requestAnimationFrame', 'useEffect']) {
      expect(start.includes(banned), `StartScreen must not use ${banned}`).toBe(false)
    }
  })

  it('the resolved motion attribute has exactly ONE writer', () => {
    const writers: string[] = []
    for (const file of shippingFiles()) {
      const code = stripComments(readFileSync(file, 'utf8'))
      if (/setAttribute\(\s*['"]data-motion['"]/.test(code)) writers.push(rel(file))
    }
    expect(writers).toEqual(['ui/src/shell/useResolvedMotion.ts'])
  })
})

describe('REDTEAM — no engine jargon reaches the player', () => {
  /** Every double/single-quoted literal in a comment-stripped source. */
  function literals(code: string): string[] {
    const out: string[] = []
    const re = /'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"/g
    let match: RegExpExecArray | null
    while ((match = re.exec(code)) !== null) out.push(match[1] ?? match[2] ?? '')
    return out
  }

  const JARGON = [
    'acceptance receipt',
    'receipt validation',
    'SimResult',
    'GameState',
    'adapter',
    'importSaveJson',
    'exportSaveJson',
    'unattended simulation',
    'SaveFileV',
    'undefined',
    'NaN',
    'null pointer',
    'stack trace',
    'invalid tile',
  ]

  /** A `(D-11.A)`-style internal decision citation, or a `V13`-style schema name. */
  const CITATION = /\((?:[A-Z]-\d+[A-Za-z.\d]*)\)|\bD-\d+\.\d+\b/

  it('PF1-owned shell/presentation/audio literals carry none of it', () => {
    const offenders: string[] = []
    for (const file of shippingFiles()) {
      const relative = rel(file)
      if (!/^ui\/src\/(shell|presentation|audio)\//.test(relative) && relative !== 'ui/src/prefs.ts') {
        continue
      }
      const code = stripComments(readFileSync(file, 'utf8'))
      for (const literal of literals(code)) {
        // Only sentences — identifiers, class names and asset ids are not player copy.
        if (!/\s/.test(literal) || literal.length < 12) continue
        for (const term of JARGON) {
          if (literal.toLowerCase().includes(term.toLowerCase())) {
            offenders.push(`${relative}: "${literal}" contains "${term}"`)
          }
        }
        if (CITATION.test(literal)) offenders.push(`${relative}: "${literal}" carries a citation`)
      }
    }
    expect(offenders).toEqual([])
  })

  it('every sentence App now says through showNotice is player language', () => {
    const app = stripComments(readFileSync(join(uiSrc, 'App.tsx'), 'utf8'))
    const notices: string[] = []
    const re = /showNotice\(\s*([\s\S]*?)\)\s*\n/g
    let match: RegExpExecArray | null
    while ((match = re.exec(app)) !== null) {
      const arg = match[1]!
      for (const literal of literals(arg)) notices.push(literal)
    }
    expect(notices.length, 'the scan really found the replaced dialog sites').toBeGreaterThanOrEqual(5)
    for (const sentence of notices) {
      for (const term of JARGON) {
        expect(
          sentence.toLowerCase().includes(term.toLowerCase()),
          `"${sentence}" contains engine jargon "${term}"`,
        ).toBe(false)
      }
      expect(CITATION.test(sentence), `"${sentence}" carries an internal citation`).toBe(false)
    }
  })

  it('the named worst offenders are gone from shipping copy', () => {
    const retired = [
      'Publicity successor failed exact acceptance receipt validation.',
      'Studio Lot updated.',
      'New / restart',
    ]
    const hits: string[] = []
    for (const file of shippingFiles()) {
      const code = stripComments(readFileSync(file, 'utf8'))
      for (const phrase of retired) {
        if (code.includes(phrase)) hits.push(`${rel(file)}: ${phrase}`)
      }
    }
    expect(hits).toEqual([])
  })

  it('the FOURTH named offender — "unattended simulation" — ships nowhere', () => {
    // FIXED (PF1-M4). Charter §3 names it outright: «"unattended simulation"
    // (`Dashboard.tsx:262`)». The M3 voice pass rewrote exactly ONE of its five
    // player-facing occurrences (the screenplay branch of the blocked-state hint); this
    // test pinned the four that were left — Dashboard.tsx:223, :276, :278 and
    // StudioCalendar.tsx:37. All four now speak in the register that branch established,
    // with every mechanic fact preserved.
    const remaining: string[] = []
    for (const file of shippingFiles()) {
      const code = stripComments(readFileSync(file, 'utf8'))
      code.split('\n').forEach((line, index) => {
        if (line.includes('unattended simulation')) {
          remaining.push(`${rel(file)}:${String(index + 1)}`)
        }
      })
    }
    expect(remaining, 'engine vocabulary is not what the studio calls simming ahead').toEqual([])
  })
})

describe('REDTEAM — the renderer was touched exactly once, and only to go silent', () => {
  it('StudioLotView adds noAudio and nothing else audio-shaped', () => {
    const view = readFileSync(join(uiSrc, 'lot', 'StudioLotView.ts'), 'utf8')
    expect(view).toContain('audio: { noAudio: true }')
    const code = stripComments(view)
    expect(/\bsound\s*\./.test(code), 'no Phaser sound manager use').toBe(false)
    expect(/this\.add\.(sprite|image|text|graphics)/.test(code)).toBe(false)
  })

  it('no shipping module outside the sink loads a file from ui/public/audio by hand', () => {
    const offenders: string[] = []
    for (const file of shippingFiles()) {
      if (rel(file) === 'ui/src/audio/sink.ts') continue
      const code = stripComments(readFileSync(file, 'utf8'))
      // A RUNTIME asset path, not a module import: an audio file extension is the tell.
      if (/['"`][^'"`]*\/audio\/[^'"`]*\.(m4a|mp3|ogg|wav)['"`]/.test(code)) {
        offenders.push(rel(file))
      }
    }
    expect(offenders).toEqual([])
  })
})
