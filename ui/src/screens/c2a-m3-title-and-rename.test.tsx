// ── C2a-M3 — the title moment, and retitling a picture ───────────────────────
//
// The second half of the §12-M3 fantasy: the writer hands the picture over, and
// what they hand over has a NAME. These tests hold four things:
//
//   1. the board says who wrote it — "An Original Screenplay by ‹writer›" — and
//      names the picture in the writer's own moment ("… is writing ‘T’" while the
//      draft is out, "… delivers ‘T’" once it is in);
//   2. RENAME WITHOUT CEREMONY: one field, one button, and the new title is live
//      on the board immediately;
//   3. what the writers first called it SURVIVES the rename, on the same card —
//      because two frozen-history surfaces keep it forever by design, and a board
//      that hid it would make those look like bugs;
//   4. a MARKET premise is not renamable and the surface does not offer it — V1
//      scope is generated screenplays only (charter §3.5), and the refusal is the
//      engine's.

import { useState } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import {
  advanceWeek,
  commissionScriptAction,
  foundManagedStudioAction,
  foundingApplicantCards,
  newGame,
  scriptProjectsBoard,
  signContractAction,
} from '../engine/adapter.ts'
import type { CreativeRole, GameState } from '../engine/adapter.ts'
import {
  commissionOriginalScreenplayAction,
  screenplayIdentityForProject,
} from '../engine/screenplay.ts'
import { WritersRoom } from './WritersRoom.tsx'

afterEach(cleanup)

const FOUNDING_COUNTS: Record<CreativeRole, number> = {
  actor: 3,
  director: 1,
  writer: 2,
  craft: 1,
}

function managedStudio(seed: string): GameState {
  let state = newGame(seed)
  const cards = foundingApplicantCards(state)
  for (const role of ['actor', 'director', 'writer', 'craft'] as const) {
    for (const card of cards
      .filter((candidate) => candidate.profile.role === role)
      .slice(0, FOUNDING_COUNTS[role])) {
      const signed = signContractAction(state, card.profile.id, 104)
      if (!signed.ok) throw new Error(signed.error)
      state = signed.next
    }
  }
  const founded = foundManagedStudioAction(state)
  if (!founded.ok) throw new Error(founded.error)
  return founded.next
}

function writerFor(state: GameState): { id: string; name: string } {
  const writer = scriptProjectsBoard(state).commission.writers.find(
    (candidate) => candidate.available && candidate.primaryRole === 'writer',
  )
  if (writer === undefined) throw new Error('fixture: no writer is available')
  return { id: writer.id, name: writer.name }
}

/** A studio with one original screenplay being written by one of its own. */
function studioWritingAnOriginal(seed: string): {
  state: GameState
  writerName: string
  projectId: string
} {
  const managed = managedStudio(seed)
  const writer = writerFor(managed)
  const commissioned = commissionOriginalScreenplayAction(managed, {
    writerId: writer.id,
    genre: 'drama',
    shape: { opening: 'slowSetup', midpoint: 'reversal', ending: 'bittersweet' },
    promise: {
      genre: 'drama',
      intendedSegments: ['adult'],
      ranges: { intimacy: [-0.4, 0.4], tonalWeight: [-0.4, 0.4], kineticEnergy: [-0.4, 0.4] },
    },
  })
  if (!commissioned.ok) throw new Error(commissioned.error)
  const state = commissioned.next
  return {
    state,
    writerName: writer.name,
    projectId: state.scriptDevelopment.projects.at(-1)!.id,
  }
}

/** The Writers Room over a live state, the way the App holds it. */
function renderRoom(initial: GameState): { current: () => GameState } {
  let state = initial
  function Host() {
    const [live, setLive] = useState(initial)
    state = live
    return (
      <WritersRoom
        state={live}
        onChange={(next) => { state = next; setLive(next) }}
        onOpenPackage={() => undefined}
        onBack={() => undefined}
      />
    )
  }
  render(<Host />)
  return { current: () => state }
}

describe('C2a-M3 — the title moment and the rename', () => {
  it('the board credits the writer and names the picture while it is being written', () => {
    const { state, writerName, projectId } = studioWritingAnOriginal('m3-board-credit')
    const identity = screenplayIdentityForProject(state, projectId)!

    render(
      <WritersRoom
        state={state}
        onChange={() => undefined}
        onOpenPackage={() => undefined}
        onBack={() => undefined}
      />,
    )

    expect(screen.getByTestId(`script-provenance-label-${projectId}`).textContent).toBe(
      `An Original Screenplay by ${writerName}`,
    )
    expect(screen.getByTestId(`script-title-moment-${projectId}`).textContent).toBe(
      `${writerName} is writing ‘${identity.title}’.`,
    )
    // Nothing has been retitled, so nothing claims it has.
    expect(screen.queryByTestId(`script-working-title-${projectId}`)).toBeNull()
  })

  it('says the writer DELIVERS it once the draft is in', () => {
    const { state, writerName, projectId } = studioWritingAnOriginal('m3-board-delivery')
    let delivered = state
    for (let week = 0; week < 8; week += 1) {
      delivered = advanceWeek(delivered).next
      if (scriptProjectsBoard(delivered).sections.needsReview.length > 0) break
    }
    const identity = screenplayIdentityForProject(delivered, projectId)!

    render(
      <WritersRoom
        state={delivered}
        onChange={() => undefined}
        onOpenPackage={() => undefined}
        onBack={() => undefined}
      />,
    )

    expect(screen.getByTestId(`script-title-moment-${projectId}`).textContent).toBe(
      `${writerName} delivers ‘${identity.title}’.`,
    )
  })

  it('retitles the picture without ceremony, and keeps what the writers called it', () => {
    const { state, projectId } = studioWritingAnOriginal('m3-rename-without-ceremony')
    const workingTitle = screenplayIdentityForProject(state, projectId)!.title
    const live = renderRoom(state)

    fireEvent.click(screen.getByTestId(`script-rename-open-${projectId}`))
    fireEvent.change(screen.getByTestId(`script-rename-input-${projectId}`), {
      target: { value: 'The Long Way Down' },
    })
    fireEvent.click(screen.getByTestId(`script-rename-save-${projectId}`))

    // Live on the board, immediately, with no dialog and no confirmation step.
    expect(screen.getByTestId(`script-card-${projectId}`).textContent).toContain(
      'The Long Way Down',
    )
    // …and the record of the working title stands beside it.
    expect(screen.getByTestId(`script-working-title-${projectId}`).textContent).toBe(
      `Written as ‘${workingTitle}’.`,
    )

    // The engine agrees: one field written, the blueprint's generated title intact.
    const after = live.current()
    const identity = screenplayIdentityForProject(after, projectId)!
    expect(identity.title).toBe('The Long Way Down')
    expect(identity.provenance.generatedTitle).toBe(workingTitle)
    expect(identity.provenance.renamed).toBe(true)
    // Identity is untouched by a rename, by the shape of the action itself.
    expect(identity.conceptId).toBe(screenplayIdentityForProject(state, projectId)!.conceptId)
  })

  it('refuses an empty title in the engine’s own words, and keeps the picture named', () => {
    const { state, projectId } = studioWritingAnOriginal('m3-rename-refusal')
    const live = renderRoom(state)
    const workingTitle = screenplayIdentityForProject(state, projectId)!.title

    fireEvent.click(screen.getByTestId(`script-rename-open-${projectId}`))
    fireEvent.change(screen.getByTestId(`script-rename-input-${projectId}`), {
      target: { value: '   ' },
    })
    fireEvent.click(screen.getByTestId(`script-rename-save-${projectId}`))

    expect(screen.getByTestId(`script-rename-error-${projectId}`).textContent).toContain(
      'A screenplay needs a title.',
    )
    expect(screenplayIdentityForProject(live.current(), projectId)!.title).toBe(workingTitle)
  })

  it('does not offer a rename on a premise bought from the market', () => {
    const managed = managedStudio('m3-market-premise-not-renamable')
    const board = scriptProjectsBoard(managed)
    const concept = board.commission.concepts[0]!
    const writer = writerFor(managed)
    const commissioned = commissionScriptAction(managed, {
      conceptId: concept.id,
      writerId: writer.id,
      shape: { opening: 'slowSetup', midpoint: 'reversal', ending: 'bittersweet' },
      promise: {
        genre: concept.genre,
        intendedSegments: ['adult'],
        ranges: { intimacy: [-0.4, 0.4], tonalWeight: [-0.4, 0.4], kineticEnergy: [-0.4, 0.4] },
      },
    })
    if (!commissioned.ok) throw new Error(commissioned.error)
    const state = commissioned.next
    const projectId = state.scriptDevelopment.projects.at(-1)!.id

    render(
      <WritersRoom
        state={state}
        onChange={() => undefined}
        onOpenPackage={() => undefined}
        onBack={() => undefined}
      />,
    )

    expect(screen.getByTestId(`script-provenance-label-${projectId}`).textContent).toBe(
      'Acquired from the open script market',
    )
    expect(screen.queryByTestId(`script-rename-open-${projectId}`)).toBeNull()
    // The market premise has no studio writer to credit with the story.
    expect(screen.queryByTestId(`script-title-moment-${projectId}`)).toBeNull()
    // And the engine is the authority that says so, not this surface.
    expect(screenplayIdentityForProject(state, projectId)!.renameRefusal).toContain(
      'Only a screenplay this studio wrote can be retitled.',
    )
  })
})
