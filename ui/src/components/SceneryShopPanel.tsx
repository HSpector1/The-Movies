// ── The Scenery Shop — where a studio commissions the places it films in ─────
//
// C2a-M2 gave the engine three verbs on a first-class entity — commission, repair,
// strike — and until this panel a player could reach none of them. A set that wears
// out with no way to repair it is exactly the unrelievable dead end owner law 2
// forbids, so the remedy the package surface points at has to exist somewhere a
// player can press it. This is that somewhere.
//
// EVERY LEGALITY IS THE ENGINE'S. The panel asks `setCommissionRefusal` /
// `setRepairRefusal` / `setStrikeRefusal` before it renders a control, and it shows
// the engine's own two sentences — the reason and the remedy — when the answer is
// no. It decides nothing, it re-words nothing, and it never disables a control
// without saying why: a greyed-out button with no sentence beside it is the
// "unexplained button" the 00F floor names.
//
// THE REFUSAL IS ATOMIC AND SO IS THE READING. A commission takes the scenery crew
// AND the stage's mount together or refuses holding nothing (§3.1), so the reason
// shown is the single most fundamental thing wrong with the request — never a
// second-order excuse, and never a list the player has to work through.
//
// THE SHOP IS GENRE-NEUTRAL. A player standing in the scenery shop is usually not
// thinking about one picture, so the catalogue is not silently ranked against one.
// What each set is BUILT FOR is stated plainly, and the package surface is where a
// particular picture's fit is worked out.

import { useMemo, useState } from 'react'
import type { GameState } from '../engine/adapter.ts'
import type { SceneryStageView, StudioSetView } from '../engine/sets.ts'
import {
  commissionSetAction,
  repairSetAction,
  sceneryBoard,
  setCommissionRefusal,
  setRepairRefusal,
  setStrikeRefusal,
  strikeSetAction,
} from '../engine/sets.ts'
import {
  conditionWord,
  genreWord,
  percentOfOne,
  picturesBeforeRepair,
  setStatusWord,
} from '../presentation/setVoice.ts'
import { money, moneyExact, score } from '../format.ts'

/** The engine's two sentences, shown as the studio said them. */
function RefusalLines({ refusal, testid }: { refusal: { reason: string; remedy: string }; testid: string }) {
  return (
    <div className="stack" data-testid={testid} style={{ gap: 2 }}>
      <span className="warn-text" data-testid={`${testid}-reason`}>
        {refusal.reason}
      </span>
      <span className="hint" data-testid={`${testid}-remedy`}>
        {refusal.remedy}
      </span>
    </div>
  )
}

/** What is standing on one stage, and the two things a player may do to it. */
function StandingSetRow({
  state,
  stage,
  onRepair,
  onStrike,
}: {
  state: GameState
  stage: SceneryStageView
  onRepair: (set: StudioSetView) => void
  onStrike: (set: StudioSetView) => void
}) {
  const set = stage.mounted
  return (
    <div className="panel stack" data-testid={`scenery-stage-${stage.stageFacilityId}`} style={{ gap: 6 }}>
      <div className="spread">
        <strong>{stage.stageName}</strong>
        <span className="badge" data-testid={`scenery-stage-state-${stage.stageFacilityId}`}>
          {set === null ? 'Standing empty' : setStatusWord(set)}
        </span>
      </div>

      {set === null ? (
        <p className="hint" style={{ margin: 0 }} data-testid={`scenery-stage-empty-${stage.stageFacilityId}`}>
          Nothing is built on this stage. Until something is, no picture can be photographed here.
        </p>
      ) : (
        <>
          <span data-testid={`scenery-set-name-${set.setId}`}>
            {set.name} — a {set.locationLabel}
          </span>
          <div className="grid grid-3">
            <div className="stack">
              <span className="hint">Built quality</span>
              <span className="mono">{score(set.quality, 0)} of 100</span>
            </div>
            <div className="stack">
              <span className="hint">Condition</span>
              <span className="mono" data-testid={`scenery-set-condition-${set.setId}`}>
                {score(set.condition, 0)} of 100 · {conditionWord(set.conditionBand)}
              </span>
            </div>
            <div className="stack">
              <span className="hint">Freshness</span>
              <span className="mono">{percentOfOne(set.novelty)}</span>
            </div>
          </div>
          {set.status === 'standing' && (
            <span className="hint" data-testid={`scenery-set-wear-${set.setId}`}>
              {picturesBeforeRepair(set.condition) === 0
                ? 'Too worn to film on until it is repaired.'
                : `Good for ${String(picturesBeforeRepair(set.condition))} more ${picturesBeforeRepair(set.condition) === 1 ? 'picture' : 'pictures'} before a repair.`}
            </span>
          )}
          {set.weeksRemaining !== null && (
            <span className="hint" data-testid={`scenery-set-weeks-${set.setId}`}>
              The scenery crew has {set.weeksRemaining}{' '}
              {set.weeksRemaining === 1 ? 'week' : 'weeks'} left on it.
            </span>
          )}

          <div className="btn-row" style={{ gap: 8 }}>
            <SetVerbButton
              label="Order a repair"
              testid={`scenery-repair-${set.setId}`}
              refusal={setRepairRefusal(state, set.setId)}
              onClick={() => onRepair(set)}
            />
            <SetVerbButton
              label={`Strike the set · ${money(set.strikeRefund)} back`}
              testid={`scenery-strike-${set.setId}`}
              refusal={setStrikeRefusal(state, set.setId)}
              onClick={() => onStrike(set)}
            />
          </div>
        </>
      )}
    </div>
  )
}

/** A verb the studio may or may not be able to do, and the reason either way. */
function SetVerbButton({
  label,
  testid,
  refusal,
  onClick,
}: {
  label: string
  testid: string
  refusal: { reason: string; remedy: string } | null
  onClick: () => void
}) {
  return (
    <div className="stack" style={{ gap: 4 }}>
      <button
        type="button"
        className="ghost"
        disabled={refusal !== null}
        onClick={onClick}
        data-testid={testid}
        aria-describedby={refusal === null ? undefined : `${testid}-why`}
      >
        {label}
      </button>
      {refusal !== null && (
        <div id={`${testid}-why`}>
          <RefusalLines refusal={refusal} testid={`${testid}-refusal`} />
        </div>
      )}
    </div>
  )
}

export function SceneryShopPanel({
  state,
  onChange,
}: {
  state: GameState
  onChange: (next: GameState) => void
}) {
  const board = useMemo(() => sceneryBoard(state), [state])
  const [stageId, setStageId] = useState<string>('')
  const [blueprintId, setBlueprintId] = useState<string>('')
  const [receipt, setReceipt] = useState<string | null>(null)

  if (!board.available) return null

  // A stage the player has not chosen is not a stage the studio may be asked about,
  // so the refusal is only read once BOTH halves of the request exist. Guessing a
  // default would show a refusal about a stage nobody named.
  const chosenStage = board.stages.find((stage) => stage.stageFacilityId === stageId) ?? null
  const chosenOffer = board.offers.find((offer) => offer.blueprintId === blueprintId) ?? null
  const request =
    chosenStage === null || chosenOffer === null
      ? null
      : { stageFacilityId: chosenStage.stageFacilityId, blueprintId: chosenOffer.blueprintId }
  const refusal = request === null ? null : setCommissionRefusal(state, request)

  function commission() {
    if (request === null) return
    const outcome = commissionSetAction(state, request)
    if (!outcome.ok) {
      setReceipt(outcome.error)
      return
    }
    setReceipt(
      `${chosenOffer!.name} is going up on ${chosenStage!.stageName}. ` +
        `${moneyExact(chosenOffer!.cost)} committed; the crew needs ${String(chosenOffer!.buildWeeks)} weeks.`,
    )
    onChange(outcome.next)
  }

  function repair(set: StudioSetView) {
    const outcome = repairSetAction(state, set.setId)
    if (!outcome.ok) {
      setReceipt(outcome.error)
      return
    }
    setReceipt(
      `${set.name} is under repair. ${moneyExact(board.repairCost)} committed; it comes back whole in ${String(board.repairWeeks)} weeks.`,
    )
    onChange(outcome.next)
  }

  function strike(set: StudioSetView) {
    const outcome = strikeSetAction(state, set.setId)
    if (!outcome.ok) {
      setReceipt(outcome.error)
      return
    }
    setReceipt(`${set.name} has been struck. ${moneyExact(set.strikeRefund)} recovered from the timber.`)
    onChange(outcome.next)
  }

  return (
    <section className="card stack" aria-labelledby="scenery-shop-heading" data-testid="scenery-shop">
      <div className="spread">
        <div>
          <div className="eyebrow">Scenery Shop · Week {state.market.tick}</div>
          <h2 id="scenery-shop-heading">The sets your pictures stand on</h2>
        </div>
        <span className="tag fact" data-testid="scenery-crew-state">
          {board.freeSceneryCrew ? 'A crew is free' : 'Every crew is working'}
        </span>
      </div>
      <p className="hint" style={{ marginTop: 0 }}>
        A picture is shot on a set, and a set is built inside a soundstage. One set stands on a
        stage at a time; a better-built set that suits the picture makes a better picture.
      </p>

      {/* ONE live region, and it is the visible receipt itself — a hidden second
          copy would announce every commission twice. It carries `aria-live` WITHOUT
          `role="status"`: the screen that hosts this panel already owns the one
          status role, and two of them on one page is an ambiguity for a screen
          reader and for the surface's own tests alike. */}
      <p
        className="hint"
        aria-live="polite"
        aria-atomic="true"
        data-testid="scenery-receipt"
        hidden={receipt === null}
      >
        {receipt ?? ''}
      </p>

      <h3 style={{ marginBottom: 0 }}>What is standing today</h3>
      <div className="stack" data-testid="scenery-stages">
        {board.stages.map((stage) => (
          <StandingSetRow
            key={stage.stageFacilityId}
            state={state}
            stage={stage}
            onRepair={repair}
            onStrike={strike}
          />
        ))}
      </div>

      <h3 style={{ marginBottom: 0 }}>Commission a set</h3>
      <div className="row" style={{ gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <label htmlFor="scenery-stage-pick">Build it on</label>
        <select
          id="scenery-stage-pick"
          value={stageId}
          onChange={(e) => setStageId(e.target.value)}
          data-testid="scenery-stage-pick"
        >
          <option value="">Choose a stage…</option>
          {board.stages.map((stage) => (
            <option key={stage.stageFacilityId} value={stage.stageFacilityId}>
              {stage.stageName}
              {stage.mounted === null ? '' : ` — ${stage.mounted.name} already stands here`}
            </option>
          ))}
        </select>
      </div>

      <table className="data" data-testid="scenery-catalog">
        <thead>
          <tr>
            <th>Set</th>
            <th>Location</th>
            <th className="num">Quality</th>
            <th>Built for</th>
            <th className="num">Cost</th>
            <th className="num">Weeks</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {board.offers.map((offer) => (
            <tr
              key={offer.blueprintId}
              data-testid={`scenery-offer-${offer.blueprintId}`}
              className={offer.blueprintId === blueprintId ? 'is-selected' : ''}
            >
              <td>{offer.name}</td>
              <td>{offer.locationLabel}</td>
              <td className="num mono">{score(offer.quality, 0)}</td>
              <td>{genreWord(offer.priorityGenre)}</td>
              <td className="num mono">{moneyExact(offer.cost)}</td>
              <td className="num mono">{offer.buildWeeks}</td>
              <td>
                <button
                  type="button"
                  className="ghost"
                  aria-pressed={offer.blueprintId === blueprintId}
                  onClick={() => setBlueprintId(offer.blueprintId)}
                  data-testid={`scenery-pick-${offer.blueprintId}`}
                >
                  Choose
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="stack" data-testid="scenery-commission">
        {request === null ? (
          <p className="hint" style={{ margin: 0 }} data-testid="scenery-commission-prompt">
            Choose a stage and a set, and the shop will quote it.
          </p>
        ) : (
          <>
            <p className="reason" style={{ margin: 0 }} data-testid="scenery-commission-quote">
              {chosenOffer!.name} on {chosenStage!.stageName} — {moneyExact(chosenOffer!.cost)} and{' '}
              {chosenOffer!.buildWeeks} weeks. The studio holds {moneyExact(board.cash)} today.
            </p>
            {refusal !== null && (
              <RefusalLines refusal={refusal} testid="scenery-commission-refusal" />
            )}
            <button
              type="button"
              className="primary"
              disabled={refusal !== null}
              onClick={commission}
              data-testid="scenery-commission-commit"
            >
              Commission {chosenOffer!.name} · {moneyExact(chosenOffer!.cost)}
            </button>
          </>
        )}
      </div>
    </section>
  )
}
