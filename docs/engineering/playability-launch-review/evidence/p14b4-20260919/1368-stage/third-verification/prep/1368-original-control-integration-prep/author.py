from pathlib import Path
import difflib,hashlib,json
p=Path('/Users/zacheryspector/studio-scratch/1368-original-control-integration-prep'); b=Path('/Users/zacheryspector/studio-scratch/1368-b-witness-prep/candidate'); c=Path('/Users/zacheryspector/studio-scratch/1368-recovery-witness-candidate/candidate'); pins={}
def read(root,name):
 s=(root/name).read_text();pins[str(root/name)]=hashlib.sha256(s.encode()).hexdigest();return s
def write(name,s):
 f=p/'files'/name;f.parent.mkdir(parents=True,exist_ok=True);f.write_text(s)
def diff(name,old,new):return ''.join(difflib.unified_diff(old.splitlines(True),new.splitlines(True),fromfile='a/'+name if old else '/dev/null',tofile='b/'+name))
# Builder extraction from independently accepted measured operational test.
name='tests/p14d2-c-operational-boundary-1368.test.ts';source=read(b,name)
imports=source[:source.index("it('C5")].replace("import { expect, it }", "import { expect }").replace("'./helpers/1368-renewal-fixture.js'", "'./1368-renewal-fixture.js'").replace("'../src/", "'../../src/")
imports=imports.replace(', disposeRivalFacility','').replace('blueprintById, facilityDemolitionRefund','blueprintById')
body=source[source.index('  const original ='):source.index('  const { state: input, id, facilityId, naturalSince } = witness!')]
end="""  const { state: input, id: studioId, facilityId, naturalSince } = witness!
  const operational = input.hollywood!.receipts.find(r => r.kind === 'laboratoryOperational'
    && r.studioId === studioId && r.facilityId === facilityId)!
  expect(bytes(original)).toBe(prior)
  return { state: input, studioId, facilityId, operational, naturalSince }
}
"""
helper=imports+'// Exact measured construction/premise builder; original C5 assertions remain in their leaf.\nexport function operationalBoundary208() {\n'+body+end
hname='tests/helpers/1368-operational-boundary.ts';write(hname,helper)
name='tests/p14d2-rival-facility-disposal.test.ts';old=read(c,name);new=old.replace("import { accepted45 } from './helpers/1368-recovery-witnesses.js'", "import { accepted45 } from './helpers/1368-recovery-witnesses.js'\nimport { operationalBoundary208 } from './helpers/1368-operational-boundary.js'")
new=new.replace("const { state, studioId, facilityId, operational } = bareAt('operational')", "// Accepted alternate paid first-lab route; failed original45 operational search is retained evidence.\n    const { state, studioId, facilityId, operational, naturalSince } = operationalBoundary208()")
start=new.index("  it('C5 disposal at the actual operational boundary")
end=new.index("  it('C6",start)
leaf=new[start:end]
leaf=leaf.replace("const after = api().disposeRivalFacility(state, studioId, facilityId)", "const before = bytes(state)\n    const after = api().disposeRivalFacility(state, studioId, facilityId)")
leaf=leaf.replace("expect(movements(after, studioId, 'facilityOpex')).toBe(movements(state, studioId, 'facilityOpex'))", "expect(movements(after, studioId, 'facilityOpex')).toBe(movements(state, studioId, 'facilityOpex'))\n    expect(bytes(state)).toBe(before)\n    expect(b(after, studioId).account.cash - b(state, studioId).account.cash).toBe(facilityDemolitionRefund(blueprintById('research-laboratory')!))\n    console.log('1368_C_OPERATIONAL_WITNESS', JSON.stringify({ week: state.market.tick, studioId, facilityId,\n      entryKind: naturalSince === null ? 'explicit-synthetic-since208' : 'actual-natural-cutting-retained', naturalSince }))")
new=new[:start]+leaf+new[end:];write(name,new)
(p/'original-c-operational-wiring.patch').write_text(diff(hname,'',helper)+diff(name,old,new))
# Adoption fixture builder, preserving the actual entry/capital/provenance/positive-cost checks.
source=read(b,'tests/p14d2-b-adoption-boundary-1368.test.ts')
imports=source[:source.index('function commitments(')].replace("import { expect, it }", "import { expect }").replace("'../src/", "'../../src/")
body=source[source.index("  let original = generateWorld"):source.index('  const candidate = structuredClone(input)')]
helper=imports+'// Exact measured public-migration fixture; original B restriction assertions stay in their leaf.\nexport function adoptionBoundary416() {\n'+body+"  expect(bytes(input)).toBe(inputBefore); expect(bytes(original)).toBe(old)\n  expect(input.talentMarket.proposals.some(p => p.issuerStudioId === id)).toBe(false)\n  return { input, control, id }\n}\n"
hname='tests/helpers/1368-adoption-boundary.ts';write(hname,helper)
name='tests/p14d2-rival-cost-cutting.test.ts';old=read(b,name);new=old.replace("import { genuineRenewal196 } from './helpers/1368-renewal-fixture.js'", "import { genuineRenewal196 } from './helpers/1368-renewal-fixture.js'\nimport { adoptionBoundary416 } from './helpers/1368-adoption-boundary.js'")
a='''      const witness = commitmentControls().get(kind)
      expect(witness, `bounded S8 / genuine196 inputs lack a valid idle ${kind} control; report prerequisite failure`).toBeDefined()'''
bb='''      // Only adoption uses the separately accepted public-migration fixture.
      // The original S8 discovery route and its missing-input evidence are preserved.
      const witness = kind === 'adoption' ? adoptionBoundary416() : commitmentControls().get(kind)
      expect(witness, `named control lacks a valid idle ${kind} positive; report prerequisite failure`).toBeDefined()'''
assert old.count(a)==1;new=new.replace(a,bb);write(name,new)
(p/'original-b-adoption-wiring.patch').write_text(diff(hname,'',helper)+diff(name,old,new))
(p/'BASE-PINS.json').write_text(json.dumps(pins,indent=2)+'\n')
for f in p.glob('*.patch'): print(f.name,hashlib.sha256(f.read_bytes()).hexdigest())
