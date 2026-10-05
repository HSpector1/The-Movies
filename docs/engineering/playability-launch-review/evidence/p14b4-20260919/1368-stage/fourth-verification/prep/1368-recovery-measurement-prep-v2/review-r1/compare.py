#!/usr/bin/env python3
"""Compare exactly 4 arms × 5 seeds × 3 independent processes. No gameplay/source writes.
Missing/failed runs are prerequisites, not a passing zero. Emits findings; never grants closure.
"""
import argparse,hashlib,json
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--runs',required=True);p.add_argument('--runs-sha256',required=True);p.add_argument('--output',required=True);a=p.parse_args()
sha=lambda b:hashlib.sha256(b).hexdigest()
raw=Path(a.runs).read_bytes()
if sha(raw)!=a.runs_sha256:raise SystemExit('run index pin mismatch')
rows=json.loads(raw)['runs'];seeds=['p13a-core-causal-01','seed-b','p13b-s8-bridge-probe-01','p13-public-commercial-adoption','p15a1-w2-market-01'];arms=['C0','A','AB','ABC'];modes=['clean','observed','repeat']
expected={(x,y,z) for x in arms for y in seeds for z in modes};keys=[(r['arm'],r['seed'],r['mode']) for r in rows]
if len(keys)!=len(set(keys)) or set(keys)!=expected:raise SystemExit('exact 60 process index required; missing run is unmet prerequisite')
out=Path(a.output)
if out.exists() or out.is_symlink():raise SystemExit('exclusive comparison output required')
for x in [out,*out.parents]:
 if x.is_symlink():raise SystemExit('symlink output refused')
def loadlines(path):return [json.loads(s) for s in path.read_text().splitlines()]
data={};bindings=[]
for r in rows:
 root=Path(r['path']);result=json.loads((root/'result.json').read_text())
 if result['status']!='MEASURED' or not result['allGuardsExact']:raise SystemExit('execution prerequisite failed: '+str(root))
 resultsha=sha((root/'result.json').read_bytes())
 if resultsha!=r['resultSha256']:raise SystemExit('result pin changed')
 d=root/'data';weekly=loadlines(d/'weekly.jsonl');summary=json.loads((d/'summary.json').read_text())
 if [w['week'] for w in weekly]!=list(range(521)):raise SystemExit('not exact 0..520 weekly data')
 key=(r['arm'],r['seed'],r['mode']);data[key]={'weekly':weekly,'summary':summary,'branches':loadlines(d/'branches.jsonl') if (d/'branches.jsonl').is_file() else [],'money':loadlines(d/'money.jsonl'),'receipts':loadlines(d/'receipts.jsonl'),'timing':json.loads((d/'timing.json').read_text())}
 bindings.append({'key':key,'resultSha256':resultsha,'files':{name:sha((d/name).read_bytes()) for name in ['summary.json','weekly.jsonl','money.jsonl','receipts.jsonl','research.jsonl','annual.json','timing.json']}})
findings=[];parity=[]
for arm in arms:
 for seed in seeds:
  clean=data[(arm,seed,'clean')];obs=data[(arm,seed,'observed')];repeat=data[(arm,seed,'repeat')]
  same=all([w['stateSha256'] for w in clean['weekly']]==[w['stateSha256'] for w in other['weekly']] and clean['summary']['finalRngSha256']==other['summary']['finalRngSha256'] for other in [obs,repeat])
  repeated=obs['branches']==repeat['branches'] and obs['money']==repeat['money'] and obs['receipts']==repeat['receipts']
  parity.append({'arm':arm,'seed':seed,'untouchedSourceParityEveryWeek':same,'independentObservedOutputRepeat':repeated})
  if not same or not repeated:findings.append({'kind':'STOP-observer-or-replay-divergence','arm':arm,'seed':seed})
comparisons=[];lowmarket=[]
for seed in seeds:
 A=data[('A',seed,'observed')]
 for arm in arms:
  d=data[(arm,seed,'observed')];branches=d['branches'];weekly=d['weekly'];summary=d['summary']
  outcomes={};packages=[]
  for row in branches:
   if row['kind']=='evaluation':
    f=row['facts'];k=('retry' if f['retry'] else 'ready')+':'+f['outcome'];outcomes[k]=outcomes.get(k,0)+1
   if row['kind']=='package' and row['facts']['lockScreenplay']:packages.append(row['facts'])
  if sum(outcomes.values())!=summary['evaluationRows']:raise SystemExit('evaluation conservation mismatch')
  globalEntry=min((x['firstEntry'] for x in summary['stats'] if x['firstEntry'] is not None),default=None)
  studies=[]
  for st in summary['stats']:
   sid=st['studioId'];entry=st['firstEntry'];base=next(x for x in A['summary']['stats'] if x['studioId']==sid)
   aa=next(x for x in A['summary']['shadow'] if x['studioId']==sid);bb=next(x for x in summary['shadow'] if x['studioId']==sid)
   closure=lambda r,k:next((x['week'] for x in r[k]['transitions'] if x['to']=='closed'),None)
   hastened=st['firstNonpositive'] is not None and (base['firstNonpositive'] is None or st['firstNonpositive']<base['firstNonpositive'])
   closes={k:{'candidate':closure(bb,k),'A':closure(aa,k)} for k in ['a','b']}
   laterA=[r for batch in A['receipts'] for r in batch['receipts'] if r['studioId']==sid and r['kind']=='filmAnnounced' and entry is not None and r['week']>entry]
   entryfacts=[r for r in branches if r['kind']=='rivalCostCuttingEntry' and r['facts']['studioId']==sid and r['inputWeek']==entry]
   # A later greenlight is a SUSPECT requiring the exact entry evidence; not itself proof of legal restart at entry.
   if arm in ['AB','ABC'] and laterA:findings.append({'kind':'STOP-parent-review-possible-false-positive','arm':arm,'seed':seed,'studioId':sid,'entry':entry,'laterAGreenlights':laterA,'actualEntryFacts':entryfacts,'disposition':'unresolved until actual lawful restart at entry is adjudicated; no imagined future cash'})
   if arm in ['AB','ABC'] and hastened:findings.append({'kind':'route-first-nonpositive-earlier-than-A','arm':arm,'seed':seed,'studioId':sid})
   for k,c in closes.items():
    if arm in ['AB','ABC'] and c['candidate'] is not None and (c['A'] is None or c['candidate']<c['A']):findings.append({'kind':'shadow-closure-due-earlier-than-A','conditionArm':k,'arm':arm,'seed':seed,'studioId':sid,**c})
   laterMoney=[r for r in d['money'] if r['studioId']==sid and entry is not None and r['inputWeek']>entry]
   spendAfter={kind:sum(r['delta'].get(kind,0) for r in laterMoney) for kind in sorted({k for r in laterMoney for k in r['delta']})}
   bodyDisposals=[r for batch in d['receipts'] for r in batch['receipts'] if r['studioId']==sid and r['kind']=='facilityDisposed']
   before=[w for w in weekly if globalEntry is None or w['week']<=globalEntry]
   account_prefix=all(next((b['emptyRefundComparableAccountSha256'] for b in w['businesses'] if b['studioId']==sid),None)==next((b['emptyRefundComparableAccountSha256'] for b in A['weekly'][w['week']]['businesses'] if b['studioId']==sid),None) for w in before)
   if arm=='AB' and not account_prefix:findings.append({'kind':'AB-account-identity-before-first-entry-failed','seed':seed,'studioId':sid,'firstGlobalEntry':globalEntry})
   studies.append({'studioId':sid,'entry':entry,'entryFacts':entryfacts,'firstNonpositive':st['firstNonpositive'],'AFirstNonpositive':base['firstNonpositive'],'hastenedNonpositive':hastened,'shadowClosureDue':closes,'accountIdentityThroughFirstGlobalInputEntry':account_prefix if arm=='AB' else 'not-applicable-C-refund-may-change-account','firstsAfterEntry':st['firstsAfterEntry'],'movementsStrictlyAfterEntry':spendAfter,'disposals':bodyDisposals,'cumulativeBackedRefund':sum(r['refund'] for r in bodyDisposals),'terminationDecisionEvidence':[r for r in branches if r['kind'] in ['termination-charge','rivalCostCuttingReleaseAllowed'] and r['facts']['studioId']==sid],'disposalCandidateEvidence':[r for r in branches if r['kind']=='disposal-candidate' and r['facts']['studioId']==sid]})
   films=[f for f in summary['films'] if f['studioId']==sid and f['settledWeek'] is not None]
   money=[r for r in d['money'] if r['studioId']==sid];fixed=sum(-sum(r['delta'].get(k,0) for k in ['payroll','overhead','facilityOpex']) for r in money)
   nine=fixed/len(money)*9 if money else None
   net=sum(f['studioRevenueReceived']-f['directCommitment'] for f in films)/len(films) if films else None
   direct=sum(f['directCommitment'] for f in films);revenue=sum(f['studioRevenueReceived'] for f in films)
   pkg=[f for f in packages if f['studioId']==sid];n=sum(f['enumerated'] for f in pkg)
   lowmarket.append({'arm':arm,'seed':seed,'studioId':sid,'baseMarketValue':weekly[0]['baseMarketValue'],'settledFilmCount':len(films),'averageFilmNet':net,'revenueToDirectCost':revenue/direct if direct else None,'actualAverageFixedCostPerNineWeeks':nine,'nineWeekCycleSurplus':net-nine if net is not None and nine is not None else None,'coversFixedCostAtNineWeekPace':net>=nine if net is not None and nine is not None else None,'negativeForecastOperatingMarginShare':sum(f['negativeOperatingMargin'] for f in pkg)/n if n else None,'basis':'all actually evaluated locked packages including cash-skipped forecasts; all settled observed films, not a guarantee of continued pace','releaseAwareness':[r['facts'] for r in branches if r['kind']=='release-standing' and r['facts']['studioId']==sid]})
  comparisons.append({'arm':arm,'seed':seed,'evaluationOutcomes':outcomes,'evaluationTotal':sum(outcomes.values()),'studios':studies})
 AB=data[('AB',seed,'observed')]
 earliest=min((x['firstEntry'] for x in AB['summary']['stats'] if x['firstEntry'] is not None),default=None)
 abprefix=all(AB['weekly'][w]['emptyRecoveryComparableSha256'] is not None and AB['weekly'][w]['emptyRecoveryComparableSha256']==A['weekly'][w]['emptyRecoveryComparableSha256'] for w in range((earliest if earliest is not None else 520)+1))
 comparisons.append({'armPair':'A/AB','seed':seed,'firstGlobalEntryInputWeek':earliest,'wholeStateIdentityThroughThatInput':abprefix,'timingCaveat':'AB includes Save46 validation/representation overhead; no timing normalization'})
 if not abprefix:findings.append({'kind':'AB-whole-state-before-first-entry-failed','seed':seed})
 # Whole-state C0/A prefix ends at first changed actual evaluation label, measured on the control inputs.
 C=data[('C0',seed,'observed')];changed=[r['inputWeek'] for r in C['branches'] if r['kind']=='package' and r['facts'].get('oldLabel')!=r['facts'].get('amendedLabel')]
 first=min(changed) if changed else None
 prefix=all(C['weekly'][w]['emptyRecoveryComparableSha256']==A['weekly'][w]['emptyRecoveryComparableSha256'] for w in range((first if first is not None else 520)+1))
 comparisons.append({'armPair':'C0/A','seed':seed,'firstControlChangedLabelInputWeek':first,'wholeStateIdentityThroughThatInput':prefix,'firstWholeStateDifference':next((w for w in range(521) if C['weekly'][w]['emptyRecoveryComparableSha256']!=A['weekly'][w]['emptyRecoveryComparableSha256']),None)})
 if not prefix:findings.append({'kind':'identity-before-changed-label-failed','seed':seed})
lowmarket.sort(key=lambda x:(x['baseMarketValue'],x['seed'],x['arm'],x['studioId']))
out.mkdir();report={'scope':'current natural520 only; not complete1363-V','inputBindings':bindings,'parity':parity,'comparisons':comparisons,'lowMarket':lowmarket,'findings':findings,'status':'MEASURED-FINDINGS' if findings else 'BOUNDED-MEASURED-NO-FINDING','notRun':['historical154 equal-basis tracing','1560..6240 condition checkpoints','same-candidate G-P/G-L and genuine post2040 release cost','enabled-pressure followup','real-loan restart','player-only identity route','Row6 and promise148 chains'],'acceptance':'No closure, tuning, dormant-survivor or promotion authority granted.'}
(out/'REPORT.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({'reportSha256':sha((out/'REPORT.json').read_bytes()),'findings':len(findings)}))
