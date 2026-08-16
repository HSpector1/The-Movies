import { describe, it } from 'vitest'
import { applyActions, studioPresence, tick } from '../src/core/index.js'
import {
  activateManaged,
  cheapestConcepts,
  contractedByRole,
  foundedStudio,
  packagePayload,
  readyScript,
} from './_presenceFixtures.js'

describe('probe', () => {
  it('walks', () => {
    let state = activateManaged(foundedStudio('presence-walk'))
    const concept = cheapestConcepts(state, 1)[0]!
    const writer = contractedByRole(state, 'writer')[0]!
    const director = contractedByRole(state, 'director')[0]!
    const craft = contractedByRole(state, 'craft')[0]!
    const actors = contractedByRole(state, 'actor')
    const ready = readyScript(state, concept, writer.id)
    state = ready.state
    state = applyActions(state, [
      {
        kind: 'greenlightScriptProject',
        production: packagePayload(state, ready.projectId, {
          directorId: director.id,
          craftIds: [craft.id],
          cast: { lead: actors[0]!.id, antagonist: actors[1]!.id, support: actors[2]!.id },
        }),
      },
    ])
    const pid = state.studio.activeProductions[0]!.id
    for (let i = 0; i < 10; i++) {
      const wf = state.operations.workflows.find((w) => w.productionId === pid)
      const prod = state.studio.activeProductions.find((p) => p.id === pid)
      const p = studioPresence(state)
      console.log(
        'week', state.market.tick,
        'phase', wf?.phase, 'rt', prod?.remainingTicks,
        'blocker', JSON.stringify(wf?.blocker),
        '| claimed', p.people.filter((x) => x.site !== null).map((x) => `${x.credit}@${x.site}:${x.slot}`).join(','),
        '| withheld', JSON.stringify(p.withheld),
      )
      if (wf?.phase === 'shooting' && wf.shootingTask?.status === 'unassigned') {
        state = applyActions(state, [
          { kind: 'assignShootingDirector', productionId: pid, directorId: director.id },
          { kind: 'clearSceneryLoadIn', productionId: pid },
          { kind: 'scheduleShootingTake', productionId: pid },
        ])
      }
      state = tick(state)
    }
  })
})
