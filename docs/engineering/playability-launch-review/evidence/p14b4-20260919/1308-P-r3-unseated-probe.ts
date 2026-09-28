// Probe on the UNCHANGED engine (HEAD): weeks where each founding rival's own team member is not
// seated (industryBusyTalentIds) — facts for the R3 RED premise, measured, never invented.
import { tick } from '/Users/zacheryspector/The-Movies-headless-program/src/core/tick.ts'
import { p13aGeneratedStudio } from '/Users/zacheryspector/The-Movies-headless-program/src/harness/p13a/fixtures.ts'
import { industryBusyTalentIds } from '/Users/zacheryspector/The-Movies-headless-program/src/core/hollywood.ts'
let s = p13aGeneratedStudio()
const rows = s.hollywood!.identities.filter(i => i.enteredWeek === 0).map(i => i.studioId)
const free: Record<string, number[]> = {}
for (let w = 0; w <= 190; w++) {
  const busy = industryBusyTalentIds(s.hollywood)
  for (const id of rows) for (const k of [0, 1, 2, 3, 4, 5]) {
    const person = `person-${id}-${k}`
    const employed = s.hollywood!.activeEmploymentOrdinals.some(i => s.hollywood!.employment[i]!.terms.talentId === person && s.hollywood!.employment[i]!.studioId === id)
    if (employed && !busy.has(person)) (free[person] ??= []).push(s.market.tick)
  }
  s = tick(s)
}
for (const [p, weeks] of Object.entries(free)) console.log(p, weeks.length, JSON.stringify(weeks))
