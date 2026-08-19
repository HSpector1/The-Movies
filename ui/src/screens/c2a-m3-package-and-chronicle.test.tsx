// ── C2a-M3 — provenance and set demand where the money is committed ──────────
//
// Two surfaces, one milestone claim: the fantasy has to be VISIBLE where the
// player is DECIDING, and it has to survive into the record.
//
//   1. AT THE GREENLIGHT. The package says who wrote the screenplay, and — joined
//      to M2's own "Where this picture will shoot" panel — what the SCRIPT calls
//      for. The beat structure IS the set demand (charter §3.5): each of the
//      seven beats happens in one kind of place, and the package lists those
//      places with the scenes that ask for them and whether the studio owns one.
//   2. ON THE RECORD. The Chronicle of a released picture carries the credit, and
//      a picture retitled after release carries the NEW title with the working
//      title kept beside it — because the career credits and the press clippings
//      keep the old one forever, by design.
//
// FIT IS ADVISORY (§3.1) AND SO IS DEMAND (§3.5, V1). Nothing here renders a
// missing location as a blocker; an unowned location costs fit and variety and
// refuses nothing. Turning demand into a reservation is M4's work.

import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { applyActions, beatsForGenre, requiredSetTypes } from '../../../src/core/index.ts'
import type { CreativeCohesion, FilmRecordView, GameState } from '../engine/adapter.ts'
import { packageSetPlan } from '../engine/sets.ts'
import {
  commissionOriginalScreenplayAction,
  renameScreenplayAction,
  screenplayIdentityForConcept,
} from '../engine/screenplay.ts'
import { SetStagePanel } from '../components/SetStagePanel.tsx'
import { FilmPackageSummary } from '../components/FilmPackageSummary.tsx'
import { FilmRecord } from './FilmRecord.tsx'
import { newFoundedGame } from '../test/founding.ts'

function managed(seed: string): GameState {
  return applyActions(newFoundedGame(seed), [
    { kind: 'activateStudioOperations' },
    { kind: 'activateScriptDevelopment' },
  ])
}

/** A studio with one original screenplay of its own, being written right now. */
function withOriginal(seed: string, genre: 'crime' | 'horror' = 'crime'): {
  state: GameState
  conceptId: string
  writerName: string
} {
  const state = managed(seed)
  const writer = state.talent.find(
    (person) => person.role === 'writer' && state.contracts.some((c) => c.talentId === person.id),
  )
  if (writer === undefined) throw new Error('fixture: no contracted writer')
  const commissioned = commissionOriginalScreenplayAction(state, {
    writerId: writer.id,
    genre,
    shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
    promise: {
      genre,
      intendedSegments: ['adult'],
      ranges: { intimacy: [-0.4, 0.4], tonalWeight: [-0.4, 0.4], kineticEnergy: [-0.4, 0.4] },
    },
  })
  if (!commissioned.ok) throw new Error(commissioned.error)
  return {
    state: commissioned.next,
    conceptId: commissioned.next.concepts.at(-1)!.id,
    writerName: writer.name,
  }
}

describe('C2a-M3 — the package says what the script calls for', () => {
  it('lists every location the beats ask for, the scenes that ask, and whether it stands', () => {
    const { state, conceptId } = withOriginal('m3-package-demand', 'horror')
    const identity = screenplayIdentityForConcept(state, conceptId)!
    const plan = packageSetPlan(state, 'horror')

    render(<SetStagePanel plan={plan} demand={identity.requiredSets} />)

    const demand = screen.getByTestId('pkg-set-demand')
    // The demand IS the beat structure: the distinct locations, in first-beat order.
    expect(identity.requiredSets.map((row) => row.setType)).toEqual(
      requiredSetTypes(beatsForGenre('horror')),
    )
    for (const row of identity.requiredSets) {
      const line = within(demand).getByTestId(`pkg-set-demand-${row.setType}`)
      expect(line.textContent).toContain(`The script calls for ${row.label}`)
      // The engine id is never printed at the player (`00F` tycoon floor).
      expect(line.textContent).not.toContain(row.setType)
      for (const beat of row.beats) expect(line.textContent).toContain(beat)
      expect(
        within(demand).getByTestId(`pkg-set-demand-standing-${row.setType}`).textContent,
      ).toBe(row.standing ? 'Standing' : 'Not built')
    }
    // Advisory, exactly as the set panel already is: no blocker language.
    expect(screen.getByTestId('pkg-set-advisory')).toBeTruthy()
    expect(demand.textContent).not.toContain('cannot')
  })

  it('says nothing about locations to a studio whose pictures are not bound to sets (G12)', () => {
    const state = newFoundedGame('m3-package-demand-unbound')
    const plan = packageSetPlan(state, state.concepts[0]!.genre)
    expect(plan.required).toBe(false)
    const { container } = render(
      <SetStagePanel
        plan={plan}
        demand={[{ setType: 'back-alley', label: 'Back Alley', beats: ['Chase'], standing: false }]}
      />,
    )
    expect(container.firstChild).toBeNull()
  })
})

describe('C2a-M3 — the package says who wrote it', () => {
  // The package summary needs a cohesion block to render at all; this one is not
  // under test and carries no claim of its own.
  const cohesion: CreativeCohesion = {
    score: 60,
    tier: 'mixed',
    strengths: [],
    conflicts: [],
    explanation: '',
    talentIndependent: true,
  }

  it('credits the studio’s own writer on an original, and keeps the working title after a rename', () => {
    const { state, conceptId, writerName } = withOriginal('m3-package-credit')
    const workingTitle = screenplayIdentityForConcept(state, conceptId)!.title
    const renamed = renameScreenplayAction(state, conceptId, 'The Long Way Down')
    if (!renamed.ok) throw new Error(renamed.error)
    const identity = screenplayIdentityForConcept(renamed.next, conceptId)!

    render(
      <FilmPackageSummary
        cohesion={cohesion}
        screenplay={{ provenance: identity.provenance, requiredSets: identity.requiredSets }}
      />,
    )

    expect(screen.getByTestId('pkg-screenplay-origin').textContent).toBe('Original')
    expect(screen.getByTestId('pkg-screenplay-credit').textContent).toBe(
      `An Original Screenplay by ${writerName}`,
    )
    expect(screen.getByTestId('pkg-screenplay-working-title').textContent).toBe(
      `Written as ‘${workingTitle}’.`,
    )
  })

  it('says a market premise came from the market, and claims no author for it', () => {
    const state = managed('m3-package-credit-market')
    const identity = screenplayIdentityForConcept(state, state.concepts[0]!.id)!

    render(
      <FilmPackageSummary
        cohesion={cohesion}
        screenplay={{ provenance: identity.provenance, requiredSets: identity.requiredSets }}
      />,
    )

    expect(screen.getByTestId('pkg-screenplay-origin').textContent).toBe('Acquired')
    expect(screen.getByTestId('pkg-screenplay-credit').textContent).toBe(
      'Acquired from the open script market',
    )
    expect(screen.queryByTestId('pkg-screenplay-working-title')).toBeNull()
  })
})

describe('C2a-M3 — the Chronicle keeps the credit', () => {
  function chronicleView(screenplay: FilmRecordView['screenplay']): FilmRecordView {
    return {
      productionId: 'prod-0001',
      conceptTitle: 'The Long Way Down',
      chronicle: {
        productionId: 'prod-0001',
        title: 'The Long Way Down',
        genre: 'crime',
        reception: {
          critic: { stars: 3.5, score: 68 },
          audience: { tier: 'liked', label: 'Audiences liked it', score: 66 },
        },
        creativeRecord: { available: false },
        credits: { available: false },
        productionRecord: { available: false },
        packageRecord: { available: false },
      },
      participants: { available: false },
      criticScore: 68,
      boxOffice: { opening: 4_000_000, total: 12_000_000 },
      committedCost: 6_000_000,
      studioRevenue: 7_000_000,
      profit: 1_000_000,
      projected: false,
      screenplay,
    } as unknown as FilmRecordView
  }

  it('names the writer on the record, with the title the writers first gave it', () => {
    render(
      <FilmRecord
        view={chronicleView({
          origin: 'original',
          label: 'An Original Screenplay by Ava Hartwell',
          writerId: 'talent-ava',
          writerName: 'Ava Hartwell',
          generatedTitle: 'A Fraction of Midnight',
          renamedWeek: 41,
          renamed: true,
        })}
        onBack={() => undefined}
      />,
    )

    expect(screen.getByTestId('record-screenplay-credit').textContent).toBe(
      'An Original Screenplay by Ava Hartwell · Written as ‘A Fraction of Midnight’.',
    )
  })

  it('credits nobody rather than the wrong person when the premise cannot be resolved', () => {
    render(<FilmRecord view={chronicleView(null)} onBack={() => undefined} />)
    expect(screen.queryByTestId('record-screenplay-credit')).toBeNull()
  })
})
