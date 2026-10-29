import sys,re,glob
W=sys.argv[1]
OLD='sha256:6cdb8065eedbfe81d794f6e0a17db71570729ac5701f688ea033b2175bfe4a5a'
NEW='sha256:aaafd0bdf597d3538acc5cb77568dd38de43dd50c7f052767ee40bb8e16ea448'
def edit(path, pairs):
    s=open(path).read()
    for a,b,n in pairs:
        assert s.count(a)==n, (path, a[:70], s.count(a))
        s=s.replace(a,b)
    open(path,'w').write(s)
# 1. pins 69 -> 70 across tests/bridge*.test.ts
files=0; hits=0
for p in glob.glob(W+'/tests/bridge*.test.ts'):
    s=open(p).read()
    s2,n1=re.subn(r"toBe\(69\)","toBe(70)",s); s2,n2=re.subn(r"projection-69\b","projection-70",s2)
    if n1+n2: files+=1; hits+=n1+n2; open(p,'w').write(s2)
print("pin files",files,"pins",hits)
# 2. relationships: SCHEMA_ID pin + OUTGOING_69
p=W+'/tests/bridge-p14b5-relationships.test.ts'
edit(p,[
 ("    // Current69 (playtest-response slice): the checked-in manifest's schemaId after the generator regenerated it on the slice commit.\n    expect(SCHEMA_ID).toBe('%s')"%OLD,
  "    // Current69 (playtest-response slice): the checked-in manifest's schemaId after the generator regenerated it on the slice commit.\n    // Current70 (ASTRA Sprint 20): the intent option's `confirmation` field; the checked-in manifest's schemaId after the\n    // generator regenerated it on the slice commit aa4c335f; outgoing69 is prior (its genuine capture, bridge-runtime-checkpoint.test.ts).\n    expect(SCHEMA_ID).toBe('%s')\n    expect(SCHEMA_ID).not.toBe(OUTGOING_69)"%NEW,1),
 ("OUTGOING_67, OUTGOING_68].sort())","OUTGOING_67, OUTGOING_68, OUTGOING_69].sort())",2),
])
s=open(p).read(); i=s.index("const OUTGOING_68 ="); j=s.index("\n",i)+1
s=s[:j]+"const OUTGOING_69 = '%s' // ASTRA Sprint 20 (projection 70): outgoing69 (the edb1cee4 snapshot's identity, tag p18-sprint19-checkpoint-20261029) registered beneath current70\n"%OLD+s[j:]
open(p,'w').write(s)
# 3. runtime-checkpoint.ts registration
p=W+'/bridge/runtime-checkpoint.ts'
edit(p,[("export const SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS: ReadonlyMap<string, string> = new Map<string, string>([\n",
 "export const SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS: ReadonlyMap<string, string> = new Map<string, string>([\n"
 "  // Projection70 (ASTRA Sprint 20, Owner decision E): the outgoing69 identity (projection 69, the immutable snapshot edb1cee4,\n"
 "  // tag p18-sprint19-checkpoint-20261029), prior beneath current70. The intent option gains `confirmation` (none | required);\n"
 "  // protocol 4 and Save51 are unchanged, so each slot is already live and takes the governed prior path as identity; the\n"
 "  // opaque journal resets. Its genuine capture ran on a detached sparse snapshot of edb1cee4 (producer\n"
 "  // docs/engineering/audits/2026-10-22-codebase-review/astra-sprints-17-21/sprint20/bridge-step/tools/capture69.ts in the\n"
 "  // records repository; tests/fixtures/bridge/genuine-projection69-runtime).\n"
 "  ['%s', 'projection-v69'],\n"%OLD,1)])
# 4. session.ts: derive from the hidden action too; N6
p=W+'/bridge/session.ts'
edit(p,[
 ("const CONFIRMATION_REQUIRED_KINDS: ReadonlySet<AvailableIntent['kind']> = new Set(['cancellationAction', 'cancelFeaturedBooking', 'cancelTvSeason', 'settleTvObligations'])\nexport const intentConfirmation = (kind: AvailableIntent['kind']): AvailableIntent['confirmation'] => (CONFIRMATION_REQUIRED_KINDS.has(kind) ? 'required' : 'none')",
  "const CONFIRMATION_REQUIRED_KINDS: ReadonlySet<AvailableIntent['kind']> = new Set(['cancellationAction', 'cancelFeaturedBooking', 'cancelTvSeason', 'settleTvObligations'])\n/** Engine verbs published under a broader kind that are cancellations all the same (review FIX-1): the plan cancel rides\n * `physicalPlanAction`. `cancelResearch` (under `researchAction`) keeps every verified result and is NOT marked; the Owner\n * question is recorded in the sprint record. */\nconst CONFIRMATION_REQUIRED_ACTIONS: ReadonlySet<string> = new Set(['cancelPhysicalPlan'])\nexport const intentConfirmation = (kind: AvailableIntent['kind'], hiddenAction: unknown = null): AvailableIntent['confirmation'] => {\n  if (CONFIRMATION_REQUIRED_KINDS.has(kind)) return 'required'\n  const verb = typeof hiddenAction === 'object' && hiddenAction !== null ? (hiddenAction as { kind?: unknown }).kind : undefined\n  return typeof verb === 'string' && CONFIRMATION_REQUIRED_ACTIONS.has(verb) ? 'required' : 'none'\n}",1),
 ("  const confirmed = { ...fields, confirmation: intentConfirmation(fields.kind) }","  const confirmed = { ...fields, confirmation: intentConfirmation(fields.kind, hiddenAction) }",1),
 ("productionId:null,confirmation:'none'},","productionId:null,confirmation:intentConfirmation(pending.kind)},",1),
 ("        projectId: null, castingSessionId: null, productionId: null, confirmation: 'none' },","        projectId: null, castingSessionId: null, productionId: null, confirmation: intentConfirmation(pending.kind) },",2),
 ("      productionId: null,\n      confirmation: 'none',\n    } as const","      productionId: null,\n      confirmation: intentConfirmation(pending.kind),\n    } as const",1),
])
print("fix1-a applied")
