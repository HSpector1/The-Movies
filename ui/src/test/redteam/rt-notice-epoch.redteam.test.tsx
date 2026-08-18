// ── OPUS-REDTEAM (PF1-M4) — the transient-notice epoch, attacked ─────────────
//
// Charter §5-M2: "every toast/receipt strip carries an explicit lifecycle — it clears on
// the next unrelated player action or week advance, and never sits indefinitely."
// Charter §8: "Dialog-replacement control flow: the 3 refusal paths that relied on
// alert()'s blocking semantics — prove no race with dispatch/autosave."
//
// The epoch is the whole mechanism, and the three blocking dialog sites land their notice
// in DIFFERENT orderings relative to the epoch bump: sites 3 and 4 never dispatch at all
// (no bump), site 5 dispatches FIRST and then speaks (bump and notice in one commit).
// Both orderings are attacked here at the hook, where the rule actually lives.
//
// Findings-only: this file asserts; it fixes nothing.

import { act, cleanup, render } from '@testing-library/react'
import { StrictMode, useCallback, useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useTransientNotice } from '../../presentation/transientNotice.ts'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

/**
 * The smallest faithful model of App's two channels: a notice with its own serial, and an
 * epoch bumped by every authoritative state replacement. `dispatchThenSpeak` is site 5's
 * ordering (both in one commit); `speakOnly` is sites 3 and 4 (nothing dispatched).
 */
function Harness({ strict = false, onExpireSpy }: { strict?: boolean; onExpireSpy?: () => void }) {
  const [epoch, setEpoch] = useState(0)
  const [notice, setNotice] = useState<{ key: number; message: string } | null>(null)
  const [serial, setSerial] = useState(0)
  const dismiss = useCallback(() => {
    onExpireSpy?.()
    setNotice(null)
  }, [onExpireSpy])
  useTransientNotice(notice?.key ?? null, notice !== null, epoch, dismiss)

  const speak = (message: string) => {
    setSerial((s) => {
      setNotice({ key: s + 1, message })
      return s + 1
    })
  }

  const body = (
    <div>
      <span data-testid="notice">{notice?.message ?? ''}</span>
      <span data-testid="epoch">{epoch}</span>
      <button data-testid="speak-only" onClick={() => speak(`refused ${String(serial + 1)}`)}>
        speak
      </button>
      <button
        data-testid="speak-same"
        onClick={() => speak('the studio could not do that')}
      >
        speak the same sentence
      </button>
      <button
        data-testid="dispatch-then-speak"
        onClick={() => {
          setEpoch((e) => e + 1)
          speak('the studio advanced, but details were unavailable')
        }}
      >
        dispatch then speak
      </button>
      <button data-testid="dispatch" onClick={() => setEpoch((e) => e + 1)}>
        dispatch
      </button>
      <button data-testid="double-dispatch" onClick={() => setEpoch((e) => e + 2)}>
        dispatch twice
      </button>
    </div>
  )
  return strict ? <StrictMode>{body}</StrictMode> : body
}

function click(view: ReturnType<typeof render>, id: string) {
  act(() => {
    view.getByTestId(id).dispatchEvent(new MouseEvent('click', { bubbles: true }))
  })
}

describe('REDTEAM — a notice survives its own action and expires on the next', () => {
  it('sites 3/4 ordering: a refusal that dispatched nothing survives, then expires once', () => {
    const view = render(<Harness />)
    click(view, 'speak-only')
    expect(view.getByTestId('notice')).toHaveTextContent('refused 1')

    click(view, 'dispatch')
    expect(view.getByTestId('notice')).toHaveTextContent('')
  })

  it('site 5 ordering: a notice that lands in the SAME commit as its own dispatch survives', () => {
    const view = render(<Harness />)
    click(view, 'dispatch-then-speak')
    expect(
      view.getByTestId('notice'),
      'the epoch its own action bumped must not expire it',
    ).toHaveTextContent('the studio advanced, but details were unavailable')
    expect(view.getByTestId('epoch')).toHaveTextContent('1')

    click(view, 'dispatch')
    expect(view.getByTestId('notice')).toHaveTextContent('')
  })

  it('two epochs in one commit still only cost the notice its ONE life', () => {
    const view = render(<Harness />)
    click(view, 'speak-only')
    click(view, 'double-dispatch')
    expect(view.getByTestId('notice')).toHaveTextContent('')
  })

  it('the SAME sentence twice is two notices, and the second gets its own life', () => {
    const view = render(<Harness />)
    click(view, 'speak-same')
    click(view, 'dispatch')
    expect(view.getByTestId('notice')).toHaveTextContent('')

    click(view, 'speak-same')
    expect(view.getByTestId('notice')).toHaveTextContent('the studio could not do that')
    click(view, 'dispatch')
    expect(view.getByTestId('notice')).toHaveTextContent('')
  })

  it('a notice never sits indefinitely: ten actions later it is long gone', () => {
    const view = render(<Harness />)
    click(view, 'speak-only')
    for (let i = 0; i < 10; i++) click(view, 'dispatch')
    expect(view.getByTestId('notice')).toHaveTextContent('')
  })

  it('expiry fires exactly ONCE, not once per subsequent action', () => {
    const spy = vi.fn()
    const view = render(<Harness onExpireSpy={spy} />)
    click(view, 'speak-only')
    click(view, 'dispatch')
    click(view, 'dispatch')
    click(view, 'dispatch')
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('StrictMode’s double-invoked effect does not expire a brand-new notice', () => {
    const spy = vi.fn()
    const view = render(<Harness strict onExpireSpy={spy} />)
    click(view, 'speak-only')
    expect(view.getByTestId('notice')).toHaveTextContent('refused 1')
    expect(spy).not.toHaveBeenCalled()
    click(view, 'dispatch')
    expect(view.getByTestId('notice')).toHaveTextContent('')
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('nothing is written down when a notice expires — no storage key is created', () => {
    localStorage.clear()
    const view = render(<Harness />)
    click(view, 'speak-only')
    click(view, 'dispatch')
    expect(localStorage.length, 'dismissal is not a journal').toBe(0)
  })

  it('an absent notice cannot be expired, however many epochs pass', () => {
    const spy = vi.fn()
    const view = render(<Harness onExpireSpy={spy} />)
    for (let i = 0; i < 5; i++) click(view, 'dispatch')
    expect(spy).not.toHaveBeenCalled()
  })
})
