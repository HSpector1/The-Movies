import { useMemo, useState } from 'react'
import type { GameState, FilmResult } from '../engine/adapter.ts'
import {
  selectWeek,
  selectCash,
  standingChannels,
  selectActiveProductions,
  selectReleasedFilms,
  canGreenlightMore,
  findConcept,
} from '../engine/adapter.ts'
import { money, score } from '../format.ts'
import { Metric } from '../components/common.tsx'
import {
  StudioLot3D,
  type LotZoneId,
  type ScenePreset,
} from '../components/StudioLot3D.tsx'

type DashboardView = 'lot' | 'slate' | 'lab'

const ZONE_INFO: Record<
  LotZoneId,
  { name: string; type: string; description: string; relation: string; capacity: string }
> = {
  administration: {
    name: 'Administration',
    type: 'Studio operations',
    description: 'Greenlights, casting calls and production planning happen here.',
    relation: 'Between Stage 01 and the City Street, facing the main gate.',
    capacity: '8 offices · screening room',
  },
  'soundstage-a': {
    name: 'Soundstage 01',
    type: 'Interior production',
    description: 'A flexible acoustic stage with a two-storey lighting grid.',
    relation: 'West of Administration and north of the water tower.',
    capacity: '18,000 sq ft · 3 sets',
  },
  'soundstage-b': {
    name: 'Soundstage 02',
    type: 'Large-format production',
    description: 'The lot’s largest stage, suited to ambitious practical builds.',
    relation: 'Directly north of Administration, beside Stage 01.',
    capacity: '24,000 sq ft · 4 sets',
  },
  'city-street': {
    name: 'Metropolitan Street',
    type: 'Exterior set',
    description: 'A redressable block of shops, tenements and practical entrances.',
    relation: 'East of Stage 02 and across the road from the Western Set.',
    capacity: '7 façades · 2 practicals',
  },
  'western-set': {
    name: 'Frontier Street',
    type: 'Exterior set',
    description: 'Timber storefronts, a saloon interior and a broad stunt lane.',
    relation: 'South-east corner of the lot, behind Metropolitan Street.',
    capacity: '6 façades · stunt lane',
  },
  'backlot-park': {
    name: 'Garden Set',
    type: 'Exterior set',
    description: 'A controlled green space for romance, drama and musical scenes.',
    relation: 'South-west of Administration, screened from Stage 01 by trees.',
    capacity: '3 garden looks · pond',
  },
}

function sceneFromPrompt(prompt: string): {
  preset: ScenePreset
  message: string
  detail: string
} {
  const normalized = prompt.toLowerCase()
  if (normalized.includes('noir') || normalized.includes('night') || normalized.includes('rain')) {
    return {
      preset: 'noir',
      message: 'Noir unit staged on Metropolitan Street',
      detail: 'Night exposure, blue practicals and a red doorway cue are now live.',
    }
  }
  if (normalized.includes('western') || normalized.includes('dust') || normalized.includes('frontier')) {
    return {
      preset: 'western',
      message: 'Frontier unit staged on the backlot',
      detail: 'The ground palette and set dressing now favor a dusty exterior shoot.',
    }
  }
  if (normalized.includes('musical') || normalized.includes('dance') || normalized.includes('color')) {
    return {
      preset: 'musical',
      message: 'Musical unit staged in the Garden Set',
      detail: 'A performance floor and warmer show lighting have been added.',
    }
  }
  return {
    preset: 'golden-age',
    message: 'Classic studio day staged across the lot',
    detail: 'Balanced daylight and general-purpose production spaces are ready.',
  }
}

function answerSceneQuestion(question: string, zone: LotZoneId, activeCount: number) {
  const q = question.trim().toLowerCase()
  if (!q) return `${ZONE_INFO[zone].name}: ${ZONE_INFO[zone].description}`
  if (q.includes('behind') || q.includes('where') || q.includes('next') || q.includes('beside')) {
    return `${ZONE_INFO[zone].name} is ${ZONE_INFO[zone].relation.toLowerCase()}`
  }
  if (q.includes('busy') || q.includes('available') || q.includes('free')) {
    if (zone === 'soundstage-a' || zone === 'soundstage-b') {
      return activeCount > 0
        ? `${ZONE_INFO[zone].name} is reserved. ${activeCount} production${activeCount === 1 ? '' : 's'} currently occupy the stage district.`
        : `${ZONE_INFO[zone].name} is available and ready for a new production.`
    }
    return `${ZONE_INFO[zone].name} is available for unit work; no stage lock applies here.`
  }
  if (q.includes('capacity') || q.includes('large') || q.includes('fit')) {
    return `${ZONE_INFO[zone].name} supports ${ZONE_INFO[zone].capacity.toLowerCase()}. ${ZONE_INFO[zone].description}`
  }
  return `Grounded on the selected location: ${ZONE_INFO[zone].description} It is ${ZONE_INFO[zone].relation.toLowerCase()}`
}

export function Dashboard({
  state,
  onAssemble,
  onAdvance,
  onCreateTalent,
  onOpenHub,
  onSaves,
  onOpenAutopsy,
}: {
  state: GameState
  onAssemble: () => void
  onAdvance: () => void
  onCreateTalent: () => void
  onOpenHub?: () => void
  onSaves: () => void
  onOpenAutopsy: (film: FilmResult) => void
}) {
  const [view, setView] = useState<DashboardView>('lot')
  const [selectedZone, setSelectedZone] = useState<LotZoneId>('administration')
  const [scenePrompt, setScenePrompt] = useState('Stage a rain-soaked noir street at night')
  const [scenePreset, setScenePreset] = useState<ScenePreset>('golden-age')
  const [composerResult, setComposerResult] = useState(
    'Describe a production setup and the lot will block a matching scene.',
  )
  const [sceneQuestion, setSceneQuestion] = useState('What is beside this building?')
  const [sceneAnswer, setSceneAnswer] = useState(
    'Select a building, then ask where it is, whether it is free, or what it can hold.',
  )
  const [takeNumber, setTakeNumber] = useState(0)

  const week = selectWeek(state)
  const cash = selectCash(state)
  const channels = standingChannels(state)
  const active = selectActiveProductions(state)
  const canGreenlight = canGreenlightMore(state)
  const selectedInfo = ZONE_INFO[selectedZone]
  const currentProduction = active[0]
  const currentConcept = currentProduction ? findConcept(state, currentProduction.conceptId) : null
  const agentTasks = useMemo(() => {
    if (takeNumber === 0) {
      return [
        ['Director', 'Blocking the next setup', 'Planning'],
        ['Lead actor', 'Waiting at Stage 01', 'Ready'],
        ['Camera crew', 'Moving to marks', 'En route'],
      ]
    }
    return [
      ['Director', `Running take ${takeNumber}`, 'Directing'],
      ['Lead actor', 'Performing the scene', 'On camera'],
      ['Camera crew', 'Tracking the action', 'Rolling'],
    ]
  }, [takeNumber])

  function composeScene() {
    const result = sceneFromPrompt(scenePrompt)
    setScenePreset(result.preset)
    setComposerResult(`${result.message}. ${result.detail}`)
    if (result.preset === 'noir') setSelectedZone('city-street')
    if (result.preset === 'western') setSelectedZone('western-set')
    if (result.preset === 'musical') setSelectedZone('backlot-park')
  }

  function askScene() {
    setSceneAnswer(answerSceneQuestion(sceneQuestion, selectedZone, active.length))
  }

  return (
    <div className="studio-shell">
      <header className="studio-topbar">
        <button className="studio-wordmark" onClick={() => setView('lot')} aria-label="Open studio lot">
          <span className="studio-monogram">S</span>
          <span>
            <strong>SILVERLINE</strong>
            <small>MOTION PICTURE STUDIOS</small>
          </span>
        </button>

        <nav className="studio-nav" aria-label="Studio sections">
          <button className={view === 'lot' ? 'active' : ''} onClick={() => setView('lot')}>
            Studio lot
          </button>
          <button className={view === 'slate' ? 'active' : ''} onClick={() => setView('slate')}>
            Production slate
          </button>
          <button className={view === 'lab' ? 'active' : ''} onClick={() => setView('lab')}>
            3D research lab
          </button>
        </nav>

        <div className="studio-resources">
          <span>
            <small>◷ WEEK</small>
            <strong data-testid="dash-week">{week}</strong>
          </span>
          <span>
            <small>◆ STUDIO FUNDS</small>
            <strong data-testid="dash-cash" className={cash < 0 ? 'money neg' : 'money pos'}>
              {money(cash)}
            </strong>
          </span>
          <button className="round-menu" onClick={onSaves} aria-label="Open saves" data-testid="open-saves">
            •••
          </button>
        </div>
        <span className="sr-only" data-testid="seed-label">
          seed “{state.seed}”
        </span>
      </header>

      <main className="studio-main">
        {view === 'lot' && (
          <section className="lot-workspace">
            <div className="lot-stage">
              <StudioLot3D
                selectedZone={selectedZone}
                onSelectZone={setSelectedZone}
                scenePreset={scenePreset}
                takeNumber={takeNumber}
                activeProductions={active.length}
              />
              <div className="lot-title">
                <span>50-ACRE MAIN CAMPUS</span>
                <h1>Your studio is awake.</h1>
                <p>{active.length > 0 ? `${active.length} production in motion.` : 'The stages are waiting for their first picture.'}</p>
              </div>
              <div className="lot-campus-stats" aria-label="Studio campus summary">
                <span><strong>4</strong> STAGES</span>
                <span><strong>10</strong> FACILITIES</span>
                <span><strong>22</strong> CREW ACTIVE</span>
                <span><strong>82</strong> LOT PRESTIGE</span>
              </div>
              <div className="camera-rail" aria-label="Lot camera presets">
                <button onClick={() => setSelectedZone('administration')} title="Center administration">⌂</button>
                <button onClick={() => setSelectedZone('soundstage-a')} title="Center soundstages">▰</button>
                <button onClick={() => setSelectedZone('city-street')} title="Center street sets">▥</button>
              </div>
              <div className="lot-objective">
                <span className="objective-star">★</span>
                <span>
                  <small>STUDIO GOAL</small>
                  <strong>{active.length > 0 ? 'Deliver your picture' : 'Greenlight your first picture'}</strong>
                  <em>{active.length > 0 ? `${currentProduction?.remainingTicks ?? 0} weeks until release` : 'Choose a concept and assemble your stars'}</em>
                </span>
                <b>{active.length > 0 ? '1 / 3' : '0 / 1'}</b>
              </div>
              <div className="lot-gamebar" aria-label="Studio management tools">
                <button onClick={onAssemble} disabled={!canGreenlight}>
                  <span>🎬</span><small>Produce</small>
                </button>
                <button onClick={onOpenHub} disabled={!onOpenHub}>
                  <span>★</span><small>Stars</small>
                </button>
                <button onClick={() => setSelectedZone('soundstage-a')}>
                  <span>▰</span><small>Stages</small>
                </button>
                <button onClick={() => setView('lab')}>
                  <span>✦</span><small>Lot AI</small>
                </button>
              </div>
            </div>

            <aside className="lot-inspector">
              <div className="inspector-kicker">SELECTED LOCATION</div>
              <div className="inspector-heading">
                <span className="location-glyph">{selectedZone.startsWith('soundstage') ? '▰' : '◆'}</span>
                <div>
                  <h2>{selectedInfo.name}</h2>
                  <p>{selectedInfo.type}</p>
                </div>
              </div>
              <p className="inspector-copy">{selectedInfo.description}</p>

              <div className="location-scorecard">
                <div><span>Appeal</span><strong>{selectedZone === 'administration' ? '86' : '74'}</strong></div>
                <div><span>Condition</span><strong>Excellent</strong></div>
                <div><span>Queue</span><strong>{active.length > 0 ? active.length : 'Clear'}</strong></div>
              </div>

              <dl className="location-facts">
                <div>
                  <dt>STATUS</dt>
                  <dd><span className="status-light" /> Operational</dd>
                </div>
                <div>
                  <dt>CAPACITY</dt>
                  <dd>{selectedInfo.capacity}</dd>
                </div>
                <div>
                  <dt>SPATIAL NOTE</dt>
                  <dd>{selectedInfo.relation}</dd>
                </div>
              </dl>

              <div className="inspector-divider" />
              <div className="production-now">
                <div className="spread">
                  <span className="inspector-kicker">ON THE LOT</span>
                  <span className="mini-live"><span /> LIVE</span>
                </div>
                <h3>{currentConcept?.title ?? 'No picture on the floor'}</h3>
                <p>
                  {currentProduction
                    ? `Stage unit · ${currentProduction.remainingTicks} weeks remaining`
                    : 'Greenlight a film to activate your first production unit.'}
                </p>
                <div className="production-progress"><span style={{ width: currentProduction ? `${Math.max(12, 100 - currentProduction.remainingTicks * 12)}%` : '0%' }} /></div>
              </div>

              <div className="inspector-actions">
                <button
                  className="button-brass"
                  onClick={onAssemble}
                  disabled={!canGreenlight}
                  data-testid="assemble-film"
                >
                  + Greenlight a picture
                </button>
                <button className="button-dark" onClick={onAdvance} data-testid="advance-week">
                  Advance one week →
                </button>
              </div>
            </aside>
          </section>
        )}

        {view === 'slate' && (
          <section className="slate-view">
            <div className="section-heading">
              <div>
                <span className="eyebrow">PRODUCTION OFFICE</span>
                <h1>The studio slate</h1>
                <p>Every active picture, forecast, and completed release in one place.</p>
              </div>
              <button className="button-brass" onClick={onAssemble} disabled={!canGreenlight}>
                + Greenlight picture
              </button>
            </div>
            <div className="standing-strip">
              {channels.map((channel) => (
                <div key={channel.key}>
                  <span>{channel.label}</span>
                  <strong>{channel.value.toFixed(0)}</strong>
                  <div><i style={{ width: `${channel.value}%` }} /></div>
                  <small>{channel.meaning}</small>
                </div>
              ))}
            </div>
          </section>
        )}

        {view === 'lab' && (
          <section className="lab-view">
            <div className="section-heading">
              <div>
                <span className="eyebrow">AWESOME-LLM-3D · APPLIED PROTOTYPES</span>
                <h1>Three ideas, running on your lot</h1>
                <p>Research concepts translated into direct, playable studio-management tools.</p>
              </div>
              <button className="button-dark" onClick={() => setView('lot')}>See them on the lot</button>
            </div>

            <div className="lab-grid">
              <article className="lab-card composer-card">
                <div className="lab-number">01</div>
                <span className="eyebrow">GENERATIVE WORLDBUILDING</span>
                <h2>Scene Composer</h2>
                <p>Turn a production brief into a staged 3D environment with an explicit, editable result.</p>
                <label htmlFor="scene-prompt">Production brief</label>
                <textarea
                  id="scene-prompt"
                  data-testid="scene-prompt"
                  value={scenePrompt}
                  onChange={(event) => setScenePrompt(event.target.value)}
                  rows={4}
                />
                <button className="button-brass" onClick={composeScene} data-testid="compose-scene">
                  Compose on lot
                </button>
                <div className="lab-result" data-testid="composer-result">
                  <span>RESULT</span>
                  {composerResult}
                </div>
              </article>

              <article className="lab-card grounding-card">
                <div className="lab-number">02</div>
                <span className="eyebrow">GROUNDED SCENE INTELLIGENCE</span>
                <h2>Ask the Lot</h2>
                <p>Query a selected 3D object and get an answer grounded in the scene graph, not a generic description.</p>
                <div className="selected-pill">◆ {selectedInfo.name}</div>
                <label htmlFor="scene-question">Question</label>
                <input
                  id="scene-question"
                  type="text"
                  value={sceneQuestion}
                  onChange={(event) => setSceneQuestion(event.target.value)}
                  onKeyDown={(event) => event.key === 'Enter' && askScene()}
                />
                <button className="button-dark" onClick={askScene} data-testid="ask-scene">Ask selected location</button>
                <div className="lab-result" data-testid="spatial-response">
                  <span>GROUNDED ANSWER</span>
                  {sceneAnswer}
                </div>
              </article>

              <article className="lab-card agents-card">
                <div className="lab-number">03</div>
                <span className="eyebrow">EMBODIED AGENTS</span>
                <h2>Autonomous Unit</h2>
                <p>Cast and crew carry goals through the spatial lot, then coordinate when the director calls action.</p>
                <div className="agent-list">
                  {agentTasks.map(([name, task, status]) => (
                    <div className="agent-row" key={name}>
                      <span className="agent-avatar">{name.slice(0, 1)}</span>
                      <span><strong>{name}</strong><small>{task}</small></span>
                      <em>{status}</em>
                    </div>
                  ))}
                </div>
                <button
                  className="button-brass"
                  onClick={() => setTakeNumber((value) => value + 1)}
                  data-testid="call-action"
                >
                  {takeNumber > 0 ? `Cut — run take ${takeNumber + 1}` : 'Call action'}
                </button>
                <div className="lab-result">
                  <span>DIRECTOR STATE</span>
                  {takeNumber > 0 ? `Take ${takeNumber} is live. Agents have synchronized their goals.` : 'Unit is blocked and waiting for the cue.'}
                </div>
              </article>
            </div>
          </section>
        )}

        <section className="dashboard-support" aria-label="Studio simulation details">
          <div className="support-actions">
            <button onClick={() => setView('slate')}>Slate</button>
            <button onClick={onOpenHub} disabled={!onOpenHub} data-testid="open-talent-hub">Talent directory</button>
            <button onClick={onCreateTalent} data-testid="open-talent-creator">Create talent</button>
          </div>

          <div className="standing-test-surface">
            {channels.map((channel) => (
              <div key={channel.key} data-testid={`standing-${channel.key}`}>
                {channel.label} {channel.value.toFixed(0)} — {channel.meaning}
              </div>
            ))}
          </div>

          <ProductionTables state={state} onOpenAutopsy={onOpenAutopsy} compact={view !== 'slate'} />
        </section>
      </main>

      <footer className="studio-footer">
        <span>THE SILVERLINE LOT · EST. 1936</span>
        <span>REAL-TIME 3D PROTOTYPE</span>
      </footer>
    </div>
  )
}

function ProductionTables({
  state,
  onOpenAutopsy,
  compact = false,
}: {
  state: GameState
  onOpenAutopsy: (film: FilmResult) => void
  compact?: boolean
}) {
  const active = selectActiveProductions(state)
  const recent = [...selectReleasedFilms(state)].reverse().slice(0, 6)
  return (
    <div className={compact ? 'simulation-tables simulation-tables-compact' : 'simulation-tables'}>
      <section className="slate-panel">
        <div className="spread"><h2>In production</h2><span>{active.length} active</span></div>
        {active.length === 0 ? (
          <div className="empty" data-testid="no-active">Nothing in production. Assemble a film to get started.</div>
        ) : (
          <div className="production-list" data-testid="active-list">
            {active.map((production) => {
              const concept = findConcept(state, production.conceptId)
              return (
                <article key={production.id} data-testid={`active-${production.id}`}>
                  <span className="poster-placeholder">{concept?.genre.slice(0, 1).toUpperCase()}</span>
                  <div>
                    <span className="eyebrow">{concept?.genre ?? 'production'} · FACT</span>
                    <h3>{concept?.title ?? production.conceptId}</h3>
                    <p>{production.remainingTicks} weeks left</p>
                  </div>
                  <div className="production-forecast">
                    <Metric label="Forecast total" small>
                      <span className="tag estimate">Est</span> {money(production.forecastSnapshot.expectedTotal)}
                    </Metric>
                    <Metric label="Forecast critic" small>
                      <span className="tag estimate">Est</span> {score(production.forecastSnapshot.expectedCriticScore)}
                    </Metric>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      <section className="slate-panel">
        <div className="spread"><h2>Recent releases</h2><span>{recent.length} pictured</span></div>
        {recent.length === 0 ? (
          <div className="empty" data-testid="no-releases">No films have released yet.</div>
        ) : (
          <table className="data" data-testid="releases-table">
            <thead><tr><th>Film</th><th className="num">Critic</th><th className="num">Total</th><th /></tr></thead>
            <tbody>
              {recent.map((film) => {
                const concept = findConcept(state, film.conceptId)
                return (
                  <tr key={film.productionId} data-testid={`release-${film.productionId}`}>
                    <td>{concept?.title ?? film.conceptId}</td>
                    <td className="num">{score(film.criticScore)}</td>
                    <td className="num">{money(film.boxOffice.total)}</td>
                    <td><button onClick={() => onOpenAutopsy(film)} data-testid={`autopsy-${film.productionId}`}>Autopsy</button></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
