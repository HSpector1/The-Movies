// ── OPUS-REDTEAM (PF1-M4) — the save shell, attacked ─────────────────────────
//
// Charter §8: "Save shell: file-import of malformed/legacy/huge files; quota exhaustion
// surfacing; the mounted-textarea contract; New Studio confirm keyboard/focus behavior."
// Charter §5-M3 (Owner addendum): "the UI never claims a save succeeded when it did not."
//
// Written findings-only. PF1-M4 FIX WAVE (OPUS-FIX): the import size finding was ruled and
// fixed — an oversized file is refused on its stated size, before it is opened — and its
// pinned test is re-pinned below to the corrected behaviour.

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useLayoutEffect, useState, type ComponentProps } from 'react'
import type StudioLotScreenType from '../../lot/StudioLotScreen.tsx'
import { App } from '../../App.tsx'
import { Saves } from '../../screens/Saves.tsx'
import { ConfirmDialog } from '../../shell/ConfirmDialog.tsx'
import { PERSISTENCE_FAILURE_MESSAGE } from '../../shell/AppNotice.tsx'
import { advanceWeek, exportSaveJson } from '../../engine/adapter.ts'
import type { GameState } from '../../engine/adapter.ts'
import { saveActiveSession } from '../../engine/session.ts'
import { setStudioLotOverviewOverride } from '../../flags.ts'
import { newFoundedGame } from '../founding.ts'

const persistence = vi.hoisted(() => ({ writesSucceed: true, storageAvailable: true }))

vi.mock('../../engine/session.ts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../engine/session.ts')>()
  return {
    ...actual,
    saveActiveSession(state: GameState) {
      if (!persistence.writesSucceed) return false
      return actual.saveActiveSession(state)
    },
  }
})

vi.mock('../../shell/persistence.ts', () => ({
  browserStorageAvailable: () => persistence.storageAvailable,
}))

type MockLotProps = ComponentProps<typeof StudioLotScreenType>

vi.mock('../../lot/StudioLotScreen.tsx', () => ({
  default: (props: MockLotProps) => {
    useLayoutEffect(() => props.onPresentationMount?.(), [props.onPresentationMount])
    return (
      <main data-testid="lot-probe">
        <button
          type="button"
          data-testid="lot-saves-probe"
          onClick={() => props.onNavigate({ kind: 'saves' })}
        >
          Saves
        </button>
        <button type="button" data-testid="lot-advance-probe" onClick={() => props.onAdvance()}>
          Advance
        </button>
      </main>
    )
  },
}))

beforeEach(() => {
  persistence.writesSucceed = true
  persistence.storageAvailable = true
  localStorage.clear()
  setStudioLotOverviewOverride(false)
})

afterEach(() => {
  cleanup()
  localStorage.clear()
  setStudioLotOverviewOverride(false)
  vi.restoreAllMocks()
})

function renderSaves(state: GameState, onLoad = vi.fn()) {
  const view = render(
    <Saves state={state} onLoad={onLoad} onNewGame={() => {}} onBack={() => {}} />,
  )
  return { ...view, onLoad }
}

async function importFile(view: ReturnType<typeof renderSaves>, contents: string, name = 'save.json') {
  const file = new File([contents], name, { type: 'application/json' })
  fireEvent.change(view.getByTestId('saves-import-file'), { target: { files: [file] } })
  await waitFor(() => expect(view.getByTestId('saves-import-text')).toHaveValue(contents))
}

describe('REDTEAM — hostile file import through the ONE accept path', () => {
  const state = newFoundedGame('rt-save-import')

  it('malformed JSON is refused in the studio’s voice and loads nothing', async () => {
    const view = renderSaves(state)
    await importFile(view, '{ this is not json')
    await waitFor(() => expect(view.getByText(/This save was rejected/)).toBeInTheDocument())
    expect(view.onLoad).not.toHaveBeenCalled()
  })

  it('valid JSON of the wrong shape is refused too', async () => {
    const view = renderSaves(state)
    await importFile(view, '{"version":13,"hello":"world"}')
    await waitFor(() => expect(view.getByText(/This save was rejected/)).toBeInTheDocument())
    expect(view.onLoad).not.toHaveBeenCalled()
  })

  it('an empty file is refused rather than silently accepted', async () => {
    const view = renderSaves(state)
    const file = new File([''], 'empty.json', { type: 'application/json' })
    fireEvent.change(view.getByTestId('saves-import-file'), { target: { files: [file] } })
    await waitFor(() => expect(view.getByText(/This save was rejected/)).toBeInTheDocument())
    expect(view.onLoad).not.toHaveBeenCalled()
  })

  it('a save of a DIFFERENT studio is accepted exactly once, through the engine', async () => {
    const other = advanceWeek(newFoundedGame('rt-save-other')).next
    const view = renderSaves(state)
    await importFile(view, exportSaveJson(other))
    await waitFor(() => expect(view.onLoad).toHaveBeenCalledTimes(1))
    const [loaded] = view.onLoad.mock.calls[0] as [GameState, { converted: boolean }]
    expect(exportSaveJson(loaded)).toBe(exportSaveJson(other))
  })

  it('a file far larger than any print is refused WITHOUT being opened', async () => {
    // FIXED (PF1-M4). This pinned the defect: there was no size guard at all, so every
    // byte of a hostile file became a controlled React value and a rendered textarea
    // before the engine was ever given the chance to refuse it. The ceiling is 8 MB — an
    // order of magnitude above any real export — and it is checked against the File's own
    // stated size, so the file is never read.
    const view = renderSaves(state)
    const oversize = new File([`{"junk":"${'x'.repeat(9_000_000)}"}`], 'oversize.json', {
      type: 'application/json',
    })
    const reads: string[] = []
    const originalRead = FileReader.prototype.readAsText
    FileReader.prototype.readAsText = function readAsText(this: FileReader, blob: Blob) {
      reads.push('read')
      return originalRead.call(this, blob)
    } as typeof FileReader.prototype.readAsText
    try {
      fireEvent.change(view.getByTestId('saves-import-file'), { target: { files: [oversize] } })
      await waitFor(() => expect(view.getByText(/was not opened/)).toBeInTheDocument())
    } finally {
      FileReader.prototype.readAsText = originalRead
    }
    expect(reads, 'the refusal happens before a single byte is read').toEqual([])
    expect(
      (view.getByTestId('saves-import-text') as HTMLTextAreaElement).value,
      'and nothing of it reached component state',
    ).toBe('')
    expect(view.onLoad).not.toHaveBeenCalled()
  })

  it('a merely large file is still read and still refused by the ENGINE, not by the guard', async () => {
    // The guard is a ceiling, not a new gatekeeper: anything a studio could plausibly have
    // exported still goes through the one acceptance path and gets the engine's verdict.
    const view = renderSaves(state)
    const large = `{"junk":"${'x'.repeat(2_000_000)}"}`
    await importFile(view, large, 'large.json')
    await waitFor(() => expect(view.getByText(/This save was rejected/)).toBeInTheDocument())
    expect(view.onLoad).not.toHaveBeenCalled()
  })

  it('a file the reader itself cannot read says so, and does not claim a rejection', async () => {
    const view = renderSaves(state)
    const originalRead = FileReader.prototype.readAsText
    FileReader.prototype.readAsText = function readAsText(this: FileReader) {
      queueMicrotask(() => this.onerror?.(new ProgressEvent('error') as ProgressEvent<FileReader>))
    } as typeof FileReader.prototype.readAsText
    try {
      const file = new File(['whatever'], 'unreadable.json')
      fireEvent.change(view.getByTestId('saves-import-file'), { target: { files: [file] } })
      await waitFor(() =>
        expect(view.getByText(/That file could not be read/)).toBeInTheDocument(),
      )
    } finally {
      FileReader.prototype.readAsText = originalRead
    }
    expect(view.onLoad).not.toHaveBeenCalled()
  })

  it('the legacy V1 path has its OWN refusal sentence, never the current-format one', () => {
    const view = renderSaves(state)
    fireEvent.change(view.getByTestId('saves-import-text'), { target: { value: '{"v1":false}' } })
    fireEvent.click(view.getByTestId('saves-import-legacy'))
    expect(view.getByText(/not a valid legacy V1 save/)).toBeInTheDocument()
    expect(view.onLoad).not.toHaveBeenCalled()
  })

  it('a CURRENT save offered to the legacy button is refused, not double-converted', () => {
    const view = renderSaves(state)
    fireEvent.change(view.getByTestId('saves-import-text'), {
      target: { value: exportSaveJson(state) },
    })
    fireEvent.click(view.getByTestId('saves-import-legacy'))
    expect(view.getByText(/not a valid legacy V1 save/)).toBeInTheDocument()
    expect(view.onLoad).not.toHaveBeenCalled()
  })

  it('a dropped file goes through the identical accept path', async () => {
    const other = newFoundedGame('rt-save-dropped')
    const view = renderSaves(state)
    const file = new File([exportSaveJson(other)], 'dropped.json')
    fireEvent.drop(view.getByTestId('saves-dropzone'), { dataTransfer: { files: [file] } })
    await waitFor(() => expect(view.onLoad).toHaveBeenCalledTimes(1))
  })
})

describe('REDTEAM — the mounted-textarea contract', () => {
  const state = newFoundedGame('rt-textarea')

  it('the raw envelope is MOUNTED and correct while collapsed, and marked inert', () => {
    const view = renderSaves(state)
    const body = view.getByTestId('saves-raw-body')
    expect(body).toHaveAttribute('data-open', 'false')
    expect(body).toHaveAttribute('inert')
    const textarea = view.getByTestId('export-text') as HTMLTextAreaElement
    expect(textarea).toBeInTheDocument()
    expect(textarea.value, 'the collapsed textarea still carries the real save').toBe(
      exportSaveJson(state),
    )
  })

  it('opening the disclosure exposes the same node, never a second one', () => {
    const view = renderSaves(state)
    const before = view.getByTestId('export-text')
    fireEvent.click(view.getByTestId('saves-raw-toggle'))
    expect(view.getByTestId('saves-raw-body')).toHaveAttribute('data-open', 'true')
    expect(view.getByTestId('saves-raw-body')).not.toHaveAttribute('inert')
    expect(view.getAllByTestId('export-text')).toHaveLength(1)
    expect(view.getByTestId('export-text')).toBe(before)
  })

  it('the disclosure control announces its own state', () => {
    const view = renderSaves(state)
    const toggle = view.getByTestId('saves-raw-toggle')
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(toggle).toHaveAttribute('aria-controls', 'saves-raw-body')
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
  })
})

describe('REDTEAM — the persistence notice is a live condition, not a logged event', () => {
  it('appears while writes fail and CLEARS the moment one succeeds', async () => {
    // Seed a real session first (writes still working), THEN take the vault away.
    saveActiveSession(newFoundedGame('rt-persistence-clear'))
    persistence.writesSucceed = false
    render(<App />)
    await waitFor(() => expect(screen.getByTestId('persistence-notice')).toBeInTheDocument())
    expect(screen.getByTestId('persistence-notice')).toHaveTextContent(
      PERSISTENCE_FAILURE_MESSAGE,
    )

    persistence.writesSucceed = true
    fireEvent.click(screen.getByTestId('advance-week'))
    await waitFor(() => expect(screen.queryByTestId('persistence-notice')).toBeNull())
  })

  it('the notice cannot be dismissed away while the condition holds', async () => {
    saveActiveSession(newFoundedGame('rt-persistence-sticky'))
    persistence.writesSucceed = false
    render(<App />)
    const notice = await screen.findByTestId('persistence-notice')
    expect(
      notice.querySelector('button'),
      'a condition the player cannot fix by acknowledging it offers no dismissal',
    ).toBeNull()
  })

  it('no PF1 shell copy ever claims a save happened', () => {
    const state = newFoundedGame('rt-no-false-claim')
    const view = renderSaves(state)
    const text = view.container.textContent ?? ''
    for (const lie of ['Saved', 'saved successfully', 'Your studio has been saved', 'Save complete']) {
      expect(text.includes(lie), `the save surface must not say "${lie}"`).toBe(false)
    }
    expect(PERSISTENCE_FAILURE_MESSAGE).not.toMatch(/\bsaved\b/i)
  })
})

describe('REDTEAM — ConfirmDialog keyboard and focus, attacked directly', () => {
  function Host() {
    const [open, setOpen] = useState(false)
    const [answer, setAnswer] = useState('none')
    return (
      <div>
        <button data-testid="opener" onClick={() => setOpen(true)}>
          Open
        </button>
        <button data-testid="background-decoy">Background</button>
        <span data-testid="answer">{answer}</span>
        {open && (
          <ConfirmDialog
            title="Start a new studio?"
            body="This replaces the studio you are running now."
            confirmLabel="Start a new studio"
            onConfirm={() => {
              setAnswer('confirmed')
              setOpen(false)
            }}
            onCancel={() => {
              setAnswer('cancelled')
              setOpen(false)
            }}
          />
        )}
      </div>
    )
  }

  it('Cancel takes initial focus — the safe answer, not the destructive one', async () => {
    render(<Host />)
    fireEvent.click(screen.getByTestId('opener'))
    await waitFor(() => expect(screen.getByTestId('confirm-dialog-cancel')).toHaveFocus())
  })

  it('Escape means CANCEL even when focus sits on the destructive button', async () => {
    render(<Host />)
    fireEvent.click(screen.getByTestId('opener'))
    await waitFor(() => expect(screen.getByTestId('confirm-dialog-cancel')).toHaveFocus())
    screen.getByTestId('confirm-dialog-confirm').focus()
    fireEvent.keyDown(screen.getByTestId('confirm-dialog-confirm'), { key: 'Escape' })
    expect(screen.getByTestId('answer')).toHaveTextContent('cancelled')
  })

  it('Tab wraps inside the dialog and never reaches the background', async () => {
    render(<Host />)
    fireEvent.click(screen.getByTestId('opener'))
    const confirm = screen.getByTestId('confirm-dialog-confirm')
    const cancel = screen.getByTestId('confirm-dialog-cancel')
    await waitFor(() => expect(cancel).toHaveFocus())

    // Cancel is the LAST focusable: forward Tab must wrap to the first.
    fireEvent.keyDown(cancel, { key: 'Tab' })
    expect(confirm).toHaveFocus()

    // And back again from the first.
    fireEvent.keyDown(confirm, { key: 'Tab', shiftKey: true })
    expect(cancel).toHaveFocus()
  })

  it('focus lands back on the opener once the dialog is answered', async () => {
    render(<Host />)
    const opener = screen.getByTestId('opener')
    opener.focus()
    fireEvent.click(opener)
    await waitFor(() => expect(screen.getByTestId('confirm-dialog-cancel')).toHaveFocus())
    fireEvent.click(screen.getByTestId('confirm-dialog-cancel'))
    await waitFor(() => expect(opener).toHaveFocus())
  })

  it('a pointer on the scrim cancels; a pointer on the dialog itself does not', async () => {
    render(<Host />)
    fireEvent.click(screen.getByTestId('opener'))
    await waitFor(() => expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument())
    fireEvent.pointerDown(screen.getByTestId('confirm-dialog'))
    expect(screen.getByTestId('answer')).toHaveTextContent('none')
    fireEvent.pointerDown(screen.getByTestId('confirm-dialog-layer'))
    expect(screen.getByTestId('answer')).toHaveTextContent('cancelled')
  })

  it('the destructive verb never fires from a keyboard answer the player did not give', async () => {
    render(<Host />)
    fireEvent.click(screen.getByTestId('opener'))
    const dialog = await screen.findByTestId('confirm-dialog')
    for (const key of ['Enter', ' ', 'y', 'Y', 'ArrowRight']) {
      fireEvent.keyDown(dialog, { key })
    }
    expect(screen.getByTestId('answer')).toHaveTextContent('none')
  })
})
