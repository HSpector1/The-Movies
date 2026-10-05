from pathlib import Path
import hashlib,difflib,json
p=Path('/Users/zacheryspector/studio-scratch/1368-recovery-witness-prep'); full=Path('/Users/zacheryspector/studio-scratch/1367-recovery-integrated-candidate/candidate'); schema=Path('/Users/zacheryspector/studio-scratch/1367-recovery-schema-candidate/candidate')
pins={};changes={}
def change(root,name,edit):
 before=(root/name).read_text();after=edit(before);assert after!=before
 target=p/'files'/name;target.parent.mkdir(parents=True,exist_ok=True);target.write_text(after)
 pins[str(root/name)]=hashlib.sha256(before.encode()).hexdigest();changes[name]=(before,after)
def c(s):
 s=s.replace("import { tick } from '../src/core/tick.js'", "import { tick } from '../src/core/tick.js'\nimport { accepted45 } from './helpers/1368-recovery-witnesses.js'")
 s=s.replace('function bareAt(week = 12) {\n  const state = generatedAt(week)', "function bareAt(kind: 'ordinary' | 'calendar' | 'operational' = 'ordinary') {\n  const witness = accepted45(kind)\n  const state = witness.live.state\n  const week = state.market.tick\n  if (kind === 'calendar') expect(week > 0 && week % 52 === 0).toBe(true)\n  if (kind === 'ordinary') expect(week % 52).not.toBe(0)")
 s=s.replace(".find(({ owner, f }) => canMarkCutting(state, owner.studioId)",".find(({ owner, f }) => owner.studioId === witness.row.studioId && f.id === witness.row.facilityId\n      && canMarkCutting(state, owner.studioId)")
 s=s.replace("'UNMET VALID PREMISE: bare lab owner with null since, no production/run/proposals at named week'", "'UNMET ACCEPTED WITNESS: exact named body with null since, no production/run/proposals'")
 s=s.replace("it('C4 actual retained research reference protects its laboratory (bounded week 280 premise)', () => {\n    const state = generatedAt(280)","it('C4 actual retained research reference protects its laboratory (accepted original45 idle witness)', () => {\n    const witness = accepted45('research')\n    const state = witness.live.state")
 s=s.replace("const project = state.technology.projects.find(p => p.studioId !== state.hollywood!.playerStudioId\n      && canMarkCutting(state, p.studioId))", "const project = state.technology.projects.find(p => p.id === witness.row.projectId\n      && p.studioId === witness.row.studioId && p.laboratoryFacilityId === witness.row.facilityId\n      && p.studioId !== state.hollywood!.playerStudioId && canMarkCutting(state, p.studioId))")
 s=s.replace("it.each([12, 52])('C5 disposal at ordinary/year boundary %i stops only this body opex before next booking', week => {\n    const { state, studioId, facilityId, operational } = bareAt(week)", "it.each(['ordinary', 'calendar'] as const)('C5 disposal at accepted %s boundary stops only this body opex before next booking', kind => {\n    const { state, studioId, facilityId, operational } = bareAt(kind)\n    const week = state.market.tick")
 s=s.replace("const observed = bareAt()\n    const { state, studioId, facilityId, operational } = bareAt(observed.operational.week)","const { state, studioId, facilityId, operational } = bareAt('operational')")
 return s
change(full,'tests/p14d2-rival-facility-disposal.test.ts',c)
def m(s):
 s=s.replace("import { recoveryPredecessor45 } from './helpers/1367-recovery-predecessors.js'", "import { recoveryPredecessor45 } from './helpers/1367-recovery-predecessors.js'\nimport { accepted45 } from './helpers/1368-recovery-witnesses.js'")
 s=s.replace("const initial = admitted(api().convertV45ToV46(predecessor(HISTORY)))\n    let selected", "// Original week53 null/zero/history tests above remain unchanged.\n    // This distinct positive disposal witness has separately accepted genuine45 provenance.\n    const witness = accepted45('ordinary')\n    const initial = admitted(witness.live as unknown as Envelope)\n    let selected")
 s=s.replace("for (const original of initial.state.hollywood!.businesses) {\n      if (original.productions.length", "for (const original of initial.state.hollywood!.businesses) {\n      if (original.studioId !== witness.row.studioId) continue\n      if (original.productions.length")
 s=s.replace("for (const facility of original.operations.facilities.filter(f => f.capability === 'laboratory')) {", "for (const facility of original.operations.facilities.filter(f => f.capability === 'laboratory' && f.id === witness.row.facilityId)) {")
 s=s.replace("UNMET VALID PREMISE: captured week 53 has no eligible paid bare lab on an idle owner; do not alter history or widen route", "UNMET ACCEPTED WITNESS: named original45 idle body must satisfy the unchanged disposal premise")
 return s
change(full,'tests/p14d2-save46-migration.test.ts',m)
def period(s):
 s=s.replace("import { recoveryOldPeriod26 } from './helpers/1367-recovery-predecessors.js'", "import { acceptedPeriod52 } from './helpers/1368-recovery-witnesses.js'")
 s=s.replace('const original312 = recoveryOldPeriod26\n','')
 s=s.replace('expect(previous.throughWeek).toBeLessThan(312)', 'expect(previous.throughWeek).toBeLessThan(lifted.state.market.tick)')
 s=s.replace('expect(last.fromWeek).toBe(312)', 'expect(last.fromWeek).toBe(lifted.state.market.tick)')
 s=s.replace('expect(last.throughWeek).toBe(312)', 'expect(last.throughWeek).toBe(lifted.state.market.tick)')
 s=s.replace("it('real week312 first charge opens exactly one old-era period without termination or disposal fields', () => {\n    stage(admittedLift(original312()), true)", "it('real original26 week52 first charge opens exactly one old-era period without termination or disposal fields', () => {\n    // The original312 missing-affordability run and input remain retained evidence.\n    const original = acceptedPeriod52()\n    expect(original.state.market.tick).toBe(52)\n    stage(admittedLift(original), true)")
 return s
change(schema,'tests/p13b-s8-old-era-period.test.ts',period)
(p/'BASE-PINS.json').write_text(json.dumps(pins,indent=2)+'\n')
for name,names in [('c-consumers.patch',['tests/p14d2-rival-facility-disposal.test.ts','tests/p14d2-save46-migration.test.ts']),('period-consumer.patch',['tests/p13b-s8-old-era-period.test.ts'])]:
 out=''
 for path in names:
  before,after=changes[path];out+=''.join(difflib.unified_diff(before.splitlines(True),after.splitlines(True),fromfile='a/'+path,tofile='b/'+path))
 (p/name).write_text(out)
