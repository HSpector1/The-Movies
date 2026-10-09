from pathlib import Path
import json,hashlib,math
B=Path('/Users/zacheryspector/studio-scratch')
R=Path('/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919')
O=Path(__file__).parent
inputs={
 'comparison':(B/'1370-c0-three-employment-preimages-comparison-20261009-r1/REPORT.json','b419fd0eea96ce9f646842fefeb7b1cc028a0dd07ee1146aca4892e36a47be1c'),
 'H_employment':(B/'1370-c0-three-employment-preimages-comparison-20261009-r1/H-original-employment.json','09bcc35ba327579ac63dd1ed63535b23cbc8ff55b25fd9597a2872a819f08750'),
 'A_employment':(B/'1370-c0-three-employment-preimages-comparison-20261009-r1/post-aging-employment.json','4cffcb410893395f8ee93da2d7d6146f35db2369962fe333e02de8d2fc7c0b58'),
 'R9_frame':(B/'1370-c0-three-employment-preimages-comparison-20261009-r1/accepted-witness-frame.ndjson','8b0b70f110c37199dc320045b2fec0ac384c323fddfba88bbae620bf34766c50'),
 'comparison_acceptance':(B/'1370-c0-three-employment-preimages-observed-independent-review-20261009-r1/RECEIPT.json','faf6df1cb38011ff74b7fbbca9c712da242d13cc6b15f8581dc1f1019202cb3d'),
 'row0_review':(B/'1370-c0-initial-quote-generated-person-source-equivalence-independent-review-20261009-r1/RECEIPT.json','9814ce7dcaf76b0fd141e28e0bf1de930c8575bc5c19bccd0fb1a313c38f7ceb'),
 'source_pins':(B/'1370-c0-initial-quote-generated-person-source-equivalence-20261009-r1/SOURCE-PINS.json','038888024a8190a1bd5f8c5df897bda779649e16a3864c993eeb78f5df4ff4a5'),
 'H_result':(B/'1369-c0-preimage-recorded-runs-r7/historical-clean-clean-r1/RESULT.json','5235b18b83c8e70dd12b36a7bda932e78cb5b55ef344419a92e4e370f540c5cc'),
 'H_context':(B/'1369-c0-preimage-recorded-runs-r7/historical-clean-clean-r1/preimages/terminal-context.ndjson','8e9e1f68bcfee6a3d6f235b433e1f2e2d455dcc8a005c4011b78c25023bde268'),
 'F1_result':(B/'1370-c0-f1-film-hold-original-cap-recorded-runs-r4/f1-clean-f1-original-cap-20261008-r1-f1-clean/RESULT.json','4c7392c6b0bbca57c0d87cc54230fed21eea0ea4dadf52a398ede306b2c35a71'),
 'F1_context':(B/'1370-c0-f1-film-hold-original-cap-recorded-runs-r4/f1-clean-f1-original-cap-20261008-r1-f1-clean/preimages/terminal-context.ndjson','ffc5a7347500924edf03e89fcf71a8481f8b61e7e3f494f351f4a54009703480'),
 'F1_trace':(B/'1370-c0-f1-film-hold-original-cap-recorded-runs-r4/f1-clean-f1-original-cap-20261008-r1-f1-clean/preimages/trace.ndjson','889d23bfc8f79378311b7642b823fafedeb37c4e17126ca4d2ffa4fa4ea31994'),
 'AF_manifest':(R/'1370-af-post-restart-repairs-and-diagnostic-preparation/ARCHIVE-MANIFEST.json','e9d1439a15a26bd2090f85cb8f45299d6774a04a98cb5288aaa592e6486846ff'),
 'AC_manifest':(R/'1370-ac-accepted-source-and-current-head-preparation/ARCHIVE-MANIFEST.json','29e185aeedd7b6ce4d4b80cae286b45aedaa6b18a50ec8352edc001c88ffc6f0')}
data={};pins={}
for role,(p,h) in inputs.items():
 raw=p.read_bytes();assert len(raw)<=4*1024*1024;assert hashlib.sha256(raw).hexdigest()==h,(role,'hash')
 pins[role]={'path':str(p),'bytes':len(raw),'sha256':h}
 data[role]=[json.loads(x) for x in raw.splitlines()] if role.endswith(('context','trace')) else json.loads(raw)
for arm in ['H','F1']:
 assert data[arm+'_result']['accepted'] is True
 for kind in ['context']+(['trace'] if arm=='F1' else []):
  p=pins[arm+'_'+kind];a=data[arm+'_result']['artifacts'][p['path']];assert a['bytes']==p['bytes'] and a['sha256']==p['sha256']
h={r['person']['id']:r for r in data['H_context'] if r['week']==208}
f={r['person']['id']:r for r in data['F1_context'] if r['week']==208}
assert len(h)==len(f)==24 and set(h)==set(f)
records=[]
for x in data['comparison']['H-original_to_post-aging']['records']:
 if x['status']!='CHANGED' or x['left']['sourceOrder']==0:continue
 l=x['left']['row'];r=x['right']['row'];t=l['terms'];pid=t['talentId']
 assert {z['path'] for z in x['allUnequalFields']}=={'$.terms.annualSalary','$.terms.signingBonus'}
 records.append({'identity':x['identity'],'H_sourceOrder':x['left']['sourceOrder'],'A_sourceOrder':x['right']['sourceOrder'],'startWeek':t['startWeek'],'termWeeks':t['termWeeks'],'talentId':pid,'role':h[pid]['person']['role'],'H_terms':t,'A_terms':r['terms'],'H_person208_line':data['H_context'].index(h[pid])+1,'F1_person208_line':data['F1_context'].index(f[pid])+1,'H_age208':h[pid]['person']['age'],'F1_age208':f[pid]['person']['age'],'H_storedSalary208':h[pid]['person']['salary'],'F1_storedSalary208':f[pid]['person']['salary'],'bonusFractionCheck':all(math.floor(y['terms']['annualSalary']*.18+.5)==y['terms']['signingBonus'] for y in [l,r]),'annualAttribution':'UNEXPLAINED_BY_THIS_SLICE'})
assert len(records)==38 and sum(x['startWeek']==0 for x in records)==22 and sum(x['startWeek']==208 for x in records)==16
assert all(x['bonusFractionCheck'] for x in records)
agpath=R/'1370-ag-materialization-and-b-causal-outcomes/ARCHIVE-MANIFEST.json';agraw=agpath.read_bytes();ag=json.loads(agraw);pins['AG_manifest']={'path':str(agpath),'bytes':len(agraw),'sha256':hashlib.sha256(agraw).hexdigest()}
archive=[]
for role,pin in pins.items():
 matches=[x for x in ag['archiveCandidates'] if x.get('source')==pin['path'] and x.get('sha256')==pin['sha256']]
 archive.append({'inputRole':role,'AG_directEntry':[{k:x[k] for k in ['proposedRepositoryPath','gitBlobOid','sha256','bytes']} for x in matches],'limit':'Positive metadata inclusion only; no fresh Git verification. Absence here does not prove absence in earlier archives.'})
facts={'schema':'1370-remaining-employment-quote-next-slice-source-only-r1','remaining':{'week0':22,'week208':16,'total':38},'all38BonusRelationsMatchSharedFraction':True,'H_person208_count':len(h),'F1_person208_count':len(f),'H_F1_storedSalary208_all24Equal':all(h[k]['person']['salary']==f[k]['person']['salary'] for k in h),'traceSalaryObservationCount':sum(x.get('kind')=='salary' for x in data['F1_trace']),'records':records,'archiveMetadata':archive,'claimLimit':'Artifact/source preparation only. No remaining annual salary causally attributed; no historical offer locals newly measured; no engine/RNG/Node/game execution.'}
def write(n,d):
 with (O/n).open('x') as out:json.dump(d,out,indent=2);out.write('\n')
write('INPUT-PINS.json',pins);write('FACTS.json',facts)
