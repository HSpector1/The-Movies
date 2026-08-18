// ── R4: the refusal voice seam (00F professional tycoon floor) ───────────────
// The floor's rule is blunt: no debug or engine string ever reaches the player, and
// every player-facing sentence is literally true (G12). The engine refuses in its own
// language — `applyActions: greenlight rejected — activeProductions at capacity (2/2)`
// — and before this seam that string was rendered verbatim at the greenlight button.
//
// These tests pin the seam's four obligations:
//   1. a KNOWN refusal is spoken as fact / reason / way forward, with no engine text;
//   2. an UNKNOWN engine refusal gets an honest generic line and keeps the raw note
//      behind a disclosure — nothing invented, nothing hidden;
//   3. a message a caller already wrote in player language is passed through untouched;
//   4. no sentence ever renders a talent id.
//
// The fixtures below are the engine's REAL throw strings, copied from src/core. That
// is deliberate: a family whose pattern drifts from the engine stops matching here.

import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { ErrorBox, RefusalNotice } from './common.tsx'
import {
  REFUSAL_FAMILIES,
  UNTRANSLATED_REFUSAL,
  UNTRANSLATED_REFUSAL_DISCLOSURE,
  looksLikeEngineLanguage,
  readRefusal,
  refusalFamilyId,
} from '../presentation/refusalVoice.ts'

afterEach(cleanup)

// One REAL engine string per family, keyed by the family it must reach.
const ENGINE_REFUSALS: Record<string, string> = {
  'production-slate-full':
    'applyActions: greenlight rejected — activeProductions at capacity (2/2)',
  'greenlight-before-founding':
    'applyActions: greenlight rejected — the studio is still in its founding draft (D-11)',
  'founding-draft-open':
    'applyActions: commissionScript rejected — the studio is still in its founding draft',
  'managed-requires-screenplay':
    'applyActions: greenlight rejected — managed studios must greenlight an authoritative Ready script project',
  'package-disagrees-with-screenplay':
    'applyActions: greenlight rejected — package facts disagree with Ready script project "script-midnight"',
  'casting-review-open':
    'applyActions: greenlightScriptProject rejected — casting session "casting-midnight" must be reviewed and acknowledged first',
  'screenplay-development-legacy':
    'applyActions: greenlightScriptProject rejected — screenplay development is not managed',
  'cast-slot-duplicate':
    'applyActions: greenlight assigns the same actor to more than one cast slot (talent-4, talent-4, talent-9)',
  'one-role-per-person':
    'applyActions: greenlight assigns talent "talent-4" to more than one role in the same production ' +
    '(writer and lead) — a talent fills exactly one role in one production (M16)',
  'already-engaged-elsewhere':
    'applyActions: greenlight talent "talent-4" is already engaged in an active production (exclusivity, M16)',
  'craft-lead-count':
    'applyActions: greenlight rejected — a film requires exactly one Production/Craft Lead (got 0) (D-11.13)',
  'not-hireable':
    'applyActions: greenlight rejected — talent "talent-4" is neither studio-contracted nor an available freelancer (D-11.12)',
  'insufficient-cash':
    'Insufficient cash — this 2500000 commitment would leave cash at -400000. New commitments require cash to ' +
    'stay at or above zero (unavoidable weekly payroll and overhead may still run it negative).',
  'casting-already-reviewed':
    'casting sessions: acknowledge rejected — session "casting-midnight" does not need review',
  'casting-session-unknown':
    'casting sessions: acknowledge references unknown session "casting-ghost"',
  'casting-sessions-inactive':
    'casting sessions: startCastingSession rejected — Casting Sessions are not managed',
}

// Debris that must never survive into a player sentence: module stamps, contract
// clause tags, engine identifiers, and the id grammar itself.
const ENGINE_DEBRIS = [
  'applyActions',
  'castingReadModel',
  'casting sessions:',
  'activeProductions',
  'craftIds',
  'M16',
  'D-11',
  'talent-',
  'script-',
  'casting-',
]

describe('R4 · the refusal voice seam', () => {
  it('reaches every declared family from the engine’s own refusal string', () => {
    // Coverage in both directions: no family without a real engine fixture, and no
    // fixture that fails to reach the family it names. A new family is a new entry in
    // REFUSAL_FAMILIES *and* a real string here — the extension law, enforced.
    const declared = REFUSAL_FAMILIES.map((family) => family.id).sort()
    expect(Object.keys(ENGINE_REFUSALS).sort()).toEqual(declared)
    for (const [familyId, message] of Object.entries(ENGINE_REFUSALS)) {
      expect(refusalFamilyId(message)).toBe(familyId)
    }
  })

  it('speaks every family as fact, reason, and way forward — with no engine debris', () => {
    for (const [familyId, message] of Object.entries(ENGINE_REFUSALS)) {
      const reading = readRefusal(message)
      expect(reading.kind).toBe('voiced')
      if (reading.kind !== 'voiced') continue
      const { headline, detail, remedy } = reading.copy
      for (const sentence of [headline, detail, remedy]) {
        expect(sentence.trim().length, familyId).toBeGreaterThan(0)
        for (const debris of ENGINE_DEBRIS) {
          expect(sentence, `${familyId} · ${debris}`).not.toContain(debris)
        }
      }
      // A way forward is an instruction, not a restatement of the problem.
      expect(remedy).not.toBe(detail)
    }
  })

  it('renders a known refusal at the greenlight button in the studio’s language', () => {
    render(<RefusalNotice message={ENGINE_REFUSALS['production-slate-full']!} />)
    const notice = screen.getByTestId('refusal-notice')
    expect(notice).toHaveAttribute('data-refusal', 'production-slate-full')
    expect(screen.getByTestId('refusal-notice-headline')).toHaveTextContent(
      'The production slate is full',
    )
    expect(screen.getByTestId('refusal-notice-detail')).toHaveTextContent(
      'The studio already has 2 of 2 pictures in production.',
    )
    expect(screen.getByTestId('refusal-notice-remedy')).toHaveTextContent(
      'Wait for a picture in production to finish and release before greenlighting another.',
    )
    // The engine's own words are GONE, not merely reworded alongside.
    expect(notice.textContent ?? '').not.toContain('applyActions')
    expect(notice.textContent ?? '').not.toContain('activeProductions')
    expect(screen.queryByTestId('refusal-notice-raw')).toBeNull()
  })

  it('names the person instead of the id, and stays true when the id cannot be resolved', () => {
    const message = ENGINE_REFUSALS['already-engaged-elsewhere']!
    const { unmount } = render(
      <RefusalNotice message={message} nameOf={(id) => (id === 'talent-4' ? 'Marta Vane' : undefined)} />,
    )
    const resolved = screen.getByTestId('refusal-notice').textContent ?? ''
    expect(resolved).toContain('Marta Vane is already working')
    expect(resolved).not.toContain('talent-4')
    unmount()

    // No resolver: the sentence loses the name, never the truth — and never leaks the id.
    render(<RefusalNotice message={message} />)
    const anonymous = screen.getByTestId('refusal-notice').textContent ?? ''
    expect(anonymous).toContain('Someone in this package is already working')
    expect(anonymous).not.toContain('talent-4')
  })

  it('gives an unknown engine refusal an honest generic voice with the raw note disclosed', () => {
    const unknown = 'applyActions: greenlight rejected — a rule nobody has voiced yet (Z-99)'
    render(<RefusalNotice message={unknown} />)
    const notice = screen.getByTestId('refusal-notice')
    expect(notice).toHaveAttribute('data-refusal', 'untranslated')
    expect(screen.getByTestId('refusal-notice-headline')).toHaveTextContent(
      UNTRANSLATED_REFUSAL.headline,
    )
    // Nothing invented: the generic line claims no cause and promises no specific cure.
    expect(screen.getByTestId('refusal-notice-detail')).toHaveTextContent(
      UNTRANSLATED_REFUSAL.detail,
    )
    // Nothing hidden either: the studio's own note is one disclosure away.
    const raw = screen.getByTestId('refusal-notice-raw')
    expect(raw).toHaveTextContent(UNTRANSLATED_REFUSAL_DISCLOSURE)
    expect(raw).toHaveTextContent(unknown)
    // And it is behind a summary, not loose in the copy.
    expect(raw.tagName.toLowerCase()).toBe('details')
  })

  it('passes a message already written in player language through untouched', () => {
    const written = 'The film is not fully assembled yet.'
    expect(looksLikeEngineLanguage(written)).toBe(false)
    render(<ErrorBox message={written} />)
    const box = screen.getByTestId('error-box')
    expect(box).toHaveAttribute('data-refusal', 'plain')
    expect(box).toHaveTextContent(written)
    // No headline / remedy scaffolding is invented around copy that never asked for it.
    expect(screen.queryByTestId('error-box-refusal-headline')).toBeNull()
    expect(screen.queryByTestId('error-box-refusal-remedy')).toBeNull()
  })

  it('closes the leak at ErrorBox itself, so no call site can route around the seam', () => {
    render(<ErrorBox message={ENGINE_REFUSALS['craft-lead-count']!} />)
    const box = screen.getByTestId('error-box')
    expect(box).toHaveAttribute('data-refusal', 'craft-lead-count')
    expect(box).toHaveTextContent('This picture has no Production/Craft Lead')
    expect(box).toHaveTextContent('Choose one Production/Craft Lead.')
    expect(box.textContent ?? '').not.toContain('applyActions')
    expect(box.textContent ?? '').not.toContain('D-11.13')
  })

  it('recognises engine language by the sim core’s own module stamp', () => {
    expect(looksLikeEngineLanguage('applyActions: whatever')).toBe(true)
    expect(looksLikeEngineLanguage('scriptReadModel: whatever')).toBe(true)
    // A module added later, never told about this file, is still caught by the stamp.
    expect(looksLikeEngineLanguage('somethingNew: whatever')).toBe(true)
    expect(looksLikeEngineLanguage('Casting review is still open.')).toBe(false)
    expect(looksLikeEngineLanguage('This save was rejected: it is not a save.')).toBe(false)
  })
})
