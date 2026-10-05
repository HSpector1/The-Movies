#!/usr/bin/env python3
"""Static Git/source census only. Never opens fixture payloads or runs game tools."""
from pathlib import Path
import argparse, hashlib, json, re, subprocess
BASE = '6c60c26a1e4cd8a49b83e4798754e146416852a1'
OLD = '2eaa697effc38538c37da28b486786ce267a2284'
PIN_SHA = 'd8920b5c747237e76b96f7e90cf0a4cf2fb305f22109e59fbfe198456c716ec2'
EXCLUDED = ['tests/bridge-contract-consumer-lock.test.ts', 'tests/bridge-owner-ux-projection20-migration.test.ts', 'tests/bridge-p05a1-owner-greenlight.test.ts', 'tests/bridge-p05a3-roster-liveness.test.ts', 'tests/bridge-p06-checkpoint-recovery.test.ts', 'tests/bridge-p12-campaign-library.test.ts']
CONFIGS = ['package.json', 'package-lock.json', 'vitest.config.ts', 'vitest.workspace.ts', 'tsconfig.json', 'tsconfig.src.json', 'tsconfig.bridge.json', 'ui/tsconfig.json', 'ui/vite.config.ts', 'ui/src/test/setup.ts', 'src/harness/d16/vitest.d16.config.ts']
ADDITIVE = ['tests/p13b-s8-old-era-period.test.ts','tests/p14d2-rival-cost-cutting.test.ts','tests/p14d2-rival-cost-cutting-adapter.test.ts','tests/p14d2-rival-facility-disposal.test.ts','tests/p14d2-save46-migration.test.ts']
PATTERNS = {
 'live_or_historical_v45_symbol': r'\b(?:validateSaveV45|convertV44ToV45|convertV45ToV44|migrateToV45|SaveFileV45|GameStateV45)\b',
 'version45_literal_or_error': r'(?:version[^\n]{0,55}\b45\b|\b45\b[^\n]{0,55}version|validateSaveV45:)',
 'writer_reader_or_frozen_builder': r'\b(?:makeSave|validateSaveV\d+|migrateToV\d+|convertV\d+ToV\d+)\b',
 'historical_staging_caller': r'\badmitRivalPlans\s*\(',
 'capture_or_pin_site': r'(?:fixtures/|\.json\.gz|MANIFEST|sha256|[0-9a-f]{64})',
 'natural_recovery_or_manifest_assertion': r'(?:shelving|costCutting|facilityDisposal|campaignLegacy|powerRanking|terminationSpend)',
}
def sha(b): return hashlib.sha256(b).hexdigest()
def main():
 ap=argparse.ArgumentParser(); ap.add_argument('--repo',required=True,type=Path); ap.add_argument('--candidate',required=True,type=Path); ap.add_argument('--pins',required=True,type=Path); ap.add_argument('--output',required=True,type=Path); a=ap.parse_args()
 if a.output.exists() or a.output.is_symlink(): raise SystemExit('exclusive output already exists')
 def git(*args): return subprocess.check_output(['git','-C',str(a.repo),*args])
 assert git('rev-parse', BASE+'^{commit}').decode().strip()==BASE
 pb=a.pins.read_bytes(); assert sha(pb)==PIN_SHA; pins=json.loads(pb)
 def tracked(rev): return git('ls-tree','-r','--name-only',rev,'--','tests','ui','src').decode().splitlines()
 names=tracked(BASE); oldnames=tracked(OLD)
 core=sorted(p for p in names if p.startswith('tests/') and p.endswith('.test.ts') and not p.startswith('tests/fixtures/'))
 ui=sorted(p for p in names if p.startswith('ui/') and re.search(r'\.test\.tsx?$',p))
 d16=sorted(p for p in names if p.startswith('src/harness/d16/') and p.endswith('.test.ts'))
 assert len(core)==460 and len(ui)==204 and len(d16)==10
 assert set(EXCLUDED)<=set(core)
 runnable=sorted(set(core)-set(EXCLUDED)); assert len(runnable)==454
 oldcore=set(p for p in oldnames if p.startswith('tests/') and p.endswith('.test.ts') and not p.startswith('tests/fixtures/'))
 def blob(path):
  assert not path.startswith('tests/fixtures/')
  return git('show',BASE+':'+path)
 src=sorted(p for p in pins if p.startswith('src/'))
 assert len(src)==188
 production=[]; source_inventory={}
 for p in src:
  f=a.candidate/p
  assert f.is_file() and not f.is_symlink(), p
  raw=f.read_bytes(); expected=pins[p]; expected=expected if isinstance(expected,str) else expected['sha256']
  assert sha(raw)==expected,p
  orig=blob(p); row={'baseSha256':sha(orig),'candidateSha256':sha(raw),'baseBytes':len(orig),'candidateBytes':len(raw),'baseGitBlob':git('rev-parse',BASE+':'+p).decode().strip()}
  source_inventory[p]=row
  if orig!=raw:production.append(p)
 assert len(production)==13,production
 code=sorted(p for p in names if ((p.startswith('tests/') and not p.startswith('tests/fixtures/')) or p.startswith('ui/') or p.startswith('src/harness/d16/')) and p.endswith(('.ts','.tsx')))
 # Git paths enumerate names, not payload. Only explicitly admitted code is opened.
 data={p:blob(p) for p in code}
 configs={p:blob(p) for p in CONFIGS}
 sites=[]
 compiled={k:re.compile(v) for k,v in PATTERNS.items()}
 for p,b in data.items():
  for line,text in enumerate(b.decode().splitlines(),1):
   tags=[k for k,v in compiled.items() if v.search(text)]
   if tags:sites.append({'path':p,'line':line,'categories':tags,'text':text.strip()})
 inventory={p:{'sha256':sha(b),'bytes':len(b)} for p,b in sorted(data.items())}
 configrows={p:{'sha256':sha(b),'bytes':len(b),'gitBlob':git('rev-parse',BASE+':'+p).decode().strip()} for p,b in configs.items()}
 # Recheck candidate source and named pin file after census; no live index/HEAD operation is performed.
 assert a.pins.read_bytes()==pb
 for p in src: assert sha((a.candidate/p).read_bytes())==source_inventory[p]['candidateSha256']
 a.output.mkdir(parents=True)
 def dump(name,value): (a.output/name).write_text(json.dumps(value,indent=2)+'\n')
 for name,ls in [('core-all-460.txt',core),('core-headless-454.txt',runnable),('core-owner-native-excluded-6.txt',EXCLUDED),('ui-204.txt',ui),('d16-10.txt',d16),('focused-new-5.txt',ADDITIVE),('candidate-core-with-focused-459.txt',sorted(set(runnable)|set(ADDITIVE)))]:
  (a.output/name).write_text('\n'.join(ls)+'\n')
 dump('SOURCE-INVENTORY.json',source_inventory);dump('CODE-INVENTORY.json',inventory);dump('CONFIG-PINS.json',configrows);dump('STATIC-SITES.json',sites)
 dump('CENSUS.json',{'status':'STATIC_ONLY_NOT_FALLOUT_RESULT','baseHead':BASE,'priorBroadHead':OLD,'candidateRoot':str(a.candidate),'candidatePinsPath':str(a.pins),'candidatePinsSha256':sha(pb),'sourceCount':len(src),'productionDiffs':production,'coreTracked':len(core),'coreHeadless':len(runnable),'ui':len(ui),'d16':len(d16),'coreAddedSincePriorBroad':sorted(set(core)-oldcore),'coreRemovedSincePriorBroad':sorted(oldcore-set(core)),'focusedAdditiveTestPaths':ADDITIVE,'provisionalFinalHeadlessFileCount':len(set(runnable)|set(ADDITIVE)),'codeFilesRead':len(data),'staticSiteCount':len(sites),'staticSiteTagCounts':{k:sum(k in s['categories'] for s in sites) for k in PATTERNS},'limits':['No game/types/tests executed. No fixture payload opened.','Static categories are candidate sites, not assertions that changes are required.','Five additive paths are a selection proposal; parent must bind final reviewed test bytes and helper closure separately.','Current parent HEAD must be reconciled against this fixed baseline before assembly.']})
 dump('OUTPUT-MANIFEST.json',{p.name:{'sha256':sha(p.read_bytes()),'bytes':p.stat().st_size} for p in sorted(a.output.iterdir()) if p.is_file()})
 print(json.dumps({'output':str(a.output),'coreHeadless':len(runnable),'ui':len(ui),'d16':len(d16),'newFocused':len(ADDITIVE),'sourceDiffs':len(production),'sites':len(sites)}))
if __name__=='__main__':main()
