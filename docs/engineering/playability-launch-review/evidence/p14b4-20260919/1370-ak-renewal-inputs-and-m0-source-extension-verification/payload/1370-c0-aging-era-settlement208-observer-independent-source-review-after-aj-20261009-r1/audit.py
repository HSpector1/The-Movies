from pathlib import Path
import json,hashlib,re,difflib
S=Path('/Users/zacheryspector/studio-scratch');Q=S/'1370-c0-aging-era-settlement208-observer-after-aj-proposal-20261009-r1';P=Path(__file__).parent;B=S/'1370-c0-aging-era-employment-witness-source-r9-devnull-proposal-20261008-r1'
h=lambda x:hashlib.sha256(x).hexdigest()
pins=(Q/'SOURCE-PINS.json').read_bytes();assert h(pins)=='3452218ceabf6bb63f690db2eff3f83edda56db71c5826982a92ae0c73085aaf';m=json.loads(pins)
for group in ['files','supportFiles']:
 for n,v in m[group].items():
  raw=(Q/n).read_bytes();assert len(raw)==v['bytes'] and h(raw)==v['sha256'],n
for n,v in m['externalRoles'].items():
 raw=Path(v['path']).read_bytes();assert len(raw)==v['bytes'] and h(raw)==v['sha256'],n
unchanged=[];diffs=[]
for n in m['files']:
 if (B/n).exists():
  if (B/n).read_bytes()==(Q/n).read_bytes():unchanged.append(n)
  elif (Q/(n+'.diff')).exists():
   expect=''.join(difflib.unified_diff((B/n).read_text().splitlines(True),(Q/n).read_text().splitlines(True),fromfile=str(B/n),tofile=str(Q/n)))
   assert expect==(Q/(n+'.diff')).read_text(),n;diffs.append(n)
proof=json.loads((Q/'PHASE-INPUT-PROOF.json').read_text())
for e in proof['sourceExcerpts']:
 t=Path(e['role']['path']).read_text();actual='\n'.join(t.splitlines()[e['firstLine']-1:e['lastLine']])+'\n';assert actual==e['exactText'],(e['firstLine'],e['lastLine'])
selection=json.loads((Q/'SELECTION.json').read_text())['rows'];assert len(selection)==16
source=(Q/'settlement208-core.mjs').read_text();literal=json.loads(re.search(r'export const SELECTION = (.*)\n',source).group(1));assert literal==selection
facts=json.loads(Path(m['externalRoles']['renewalGapFacts']['path']).read_text());employment=json.loads(Path(m['externalRoles']['AEmployment']['path']).read_text())
for i,(x,y) in enumerate(zip(selection,facts['remainingRenewalRows'])):
 assert x['identity']==y['identity'] and x['sourceOrder']==y['ASourceOrder']==24+i and x['talentId']==y['talentId'] and x['creativeRole']==y['creativeRole'];assert x['oldRowFinal']==y['AOriginalContract'];assert x['renewalRowFinal']==employment[24+i];assert employment[x['oldSourceOrder']]==x['oldRowFinal']
# Derive additional three Git blob role hashes directly from raw bytes, no Git command.
blobs={}
for name in ['talentMarket','talentSummary','tuning']:
 raw=Path(m['externalRoles']['A_'+name+'.ts']['path']).read_bytes();oid=hashlib.sha1(b'blob '+str(len(raw)).encode()+b'\0'+raw).hexdigest();assert oid in (Q/'witness.mts').read_text() and oid in (Q/'supervise.py').read_text();blobs[name]=oid
assert (Q/'witness-core.mjs').read_bytes()==(B/'witness-core.mjs').read_bytes()
f={'schema':'1370-a208-independent-finite-source-audit/v1','filesVerified':len(m['files']),'supportFilesVerified':len(m['supportFiles']),'externalRolesVerified':len(m['externalRoles']),'unchangedPriorFiles':unchanged,'exactUnifiedDiffs':diffs,'exactSourceExcerpts':len(proof['sourceExcerpts']),'selectionRows':16,'sourceOrderRange':[24,39],'additionalDerivedGitBlobs':blobs,'sourceImportsOrExecution':False}
(P/'FACTS.json').write_text(json.dumps(f,indent=2,sort_keys=True)+'\n');print(json.dumps(f))
