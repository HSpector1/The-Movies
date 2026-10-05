from pathlib import Path
import json,hashlib,shutil,difflib
S=Path('/Users/zacheryspector/studio-scratch')
D=S/'1368-second-milestone-publication'
R=Path('/Users/zacheryspector/The-Movies-headless-program')
FIRST=R/'docs/engineering/playability-launch-review/evidence/p14b4-20260919/1368-stage/first-verification'
first_manifest=json.loads((FIRST/'MANIFEST.json').read_text())
first_by_source={r['source']:r for r in first_manifest['files']}
first_by_hash={r['sha256']:r for r in first_manifest['files']}
rows=[];refs=[]
def sha(b):return hashlib.sha256(b).hexdigest()
def add(src,dest,status='completed-evidence'):
 src=Path(src);assert src.is_file() and not src.is_symlink(),str(src)
 before=src.read_bytes();h=sha(before)
 old=first_by_source.get(str(src))
 if old and old['sha256']==h:
  assert sha((FIRST/old['path']).read_bytes())==h
  refs.append({'source':str(src),'existingPublication':str(FIRST/old['path']),'sha256':h,'bytes':len(before),'reason':'already committed unchanged in first-verification'})
  return
 p=D/dest;p.parent.mkdir(parents=True,exist_ok=True)
 assert not p.exists(),str(p)
 with p.open('xb') as out:out.write(before)
 assert p.read_bytes()==before and src.read_bytes()==before,'source changed during copy: '+str(src)
 rows.append({'path':dest,'source':str(src),'sha256':h,'bytes':len(before),'status':status})
def folder_named(src,dest,names,status='completed-evidence'):
 for n in names:add(S/src/n,dest+'/'+n,status)
def output_pair(src,dest):folder_named(src,dest,['output.txt','result.json'])
def prep(src,dest):
 p=S/src; pins=json.loads((p/'SHA256.json').read_text())
 for n,h in pins.items():
  assert sha((p/n).read_bytes())==h,src+'/'+n
  add(p/n,dest+'/'+n,'reviewed-preparation-unlanded')
 add(p/'SHA256.json',dest+'/SHA256.json','reviewed-preparation-unlanded')
# Completed renewal consumers and their exact runtime source map.
folder_named('1368-b-witness-prep','renewal',['SOURCE-PINS-consumer.json','run-consumer.py','SOURCE-PINS-additive.json','run-additive.py'])
for n in ['consumer-types-r1','consumer-behavior-r1','consumer-adapter-r1','additive-types-r1','additive-adoption-r1','additive-operational-r1']:
 output_pair('1368-b-witness-prep/'+n,'renewal/'+n)
# Reviewed C/period and additional B/C preparation, no mutable candidate tree copied.
prep('1368-recovery-witness-prep','recovery-prep')
prep('1368-recovery-witness-filter-prep','filter-prep')
prep('1368-b-research-witness-prep','additive-prep')
folder_named('1368-recovery-witness-candidate','recovery-runs',[
 'SOURCE-PINS.json','SOURCE-PINS-v2.json','SOURCE-PINS-v3.json','QUALIFIER-PIN.txt',
 'producer-r1.ts','producer-r2.ts','run.py','run-v2.py','run-v3.py','run-period-consumer.py',
 'producer-and-loaders.patch.apply.txt','c-consumers.patch.apply.txt','period-consumer.patch.apply.txt'])
for n in ['types-r1','types-r2','types-r3','period26-r2','period-consumer-r1','save45-r2','save45-r3']:
 output_pair('1368-recovery-witness-candidate/'+n,'recovery-runs/'+n)
folder_named('1368-recovery-witness-26-01','accepted-captures/period52',['MANIFEST.json','RESULT.json','period52.json.gz'],'independently-accepted-original26-capture')
# Exact named new payload copies only; no decompression or discovery of older fixtures.
for n in ['ordinary.json.gz','calendar.json.gz','research.json.gz','baseline265.json.gz','baseline280.json.gz']:
 add(S/'1368-recovery-witness-45-01'/n,'unaccepted/save45-timeout-r2/'+n,'TIMEOUT-UNACCEPTED-PARTIAL-NO-CAPTURE-MANIFEST')
folder_named('1368-recovery-witness-45-02','completed-partial/save45-r3',[
 'MANIFEST.json','RESULT.json','ordinary.json.gz','calendar.json.gz','research.json.gz','baseline265.json.gz','baseline280.json.gz'],
 'COMPLETED-PRODUCER-FAIL-MISSING-OPERATIONAL-ROW-REVIEW-SEPARATE')
add(S/'1368-implementation-review/REVIEW.md','implementation/REVIEW.md','source-only-review-not-promotion-approval')
for n in ['1368-postrelease-prep','1368-postrelease-prep-v2','1368-postrelease-prep-v3']:prep(n,'postrelease/'+n)
folder_named('1368-postrelease-run-01','postrelease/staged-types',[
 'TYPE-SOURCE-PINS.json','TYPE-SOURCE-PINS-v2.json','TYPE-SOURCE-PINS-v2-r2.json','TYPE-SOURCE-PINS-v2-r3.json','TYPE-SOURCE-PINS-v3-r1.json',
 'run-types-v2.py','run-types-v2-r2.py','run-types-v2-r3.py','run-types-v3-r1.py','probe-r1.ts.preserved','vite-config-r2.ts.preserved','tsconfig.postrelease.json'])
for n in ['types-v2-r2','types-v2-r3','types-v3-r1']:output_pair('1368-postrelease-run-01/'+n,'postrelease/staged-types/'+n)
reviews=['RENEWAL196-CONSUMER-MEASURED.md','PERIOD52-CAPTURE-ACCEPTANCE.md','PERIOD52-CONSUMER-MEASURED.md',
 'C-PERIOD-WITNESS-STATIC-REVIEW.md','C-WITNESS-NECESSARY-FILTER-REVIEW.md','B-RESEARCH-ADOPTION-C-OPERATIONAL-STATIC.md','BASELINE265-ADDENDUM.md',
 'ADOPTION-OPERATIONAL-MEASURED-AND-WIRING.md','DELAYED-POSTRELEASE-STATIC-REVIEW.md','DELAYED-POSTRELEASE-V2-REVIEW.md','DELAYED-POSTRELEASE-V3-CONFIG-REVIEW.md']
folder_named('1368-independent-review','reviews',reviews)
logs=['1368-b-consumer-types-r1','1368-b-consumer-behavior-r1','1368-b-consumer-adapter-r1',
 '1368-b-additive-types-r1','1368-b-additive-adoption-r1','1368-c-additive-operational-r1',
 '1368-witness-types-r1','1368-witness-types-r2','1368-recovery-witness-types-r3',
 '1368-period26-capture-r2','1368-period-consumer-r1','1368-save45-witness-capture-r2','1368-save45-witness-capture-r3',
 '1368-postrelease-types-v2-r1','1368-postrelease-types-v2-r2','1368-postrelease-types-v2-r3','1368-postrelease-types-v3-r1']
for stem in logs:
 for ext in ['.log','.log.meta']:add(S/(stem+ext),'lanes/'+stem+ext)
# Reconstruct consumed differences against the already-preserved ABC base. Never reread fixtures.
base_pins=json.loads((S/'1367-recovery-witness-diagnostic-prep/abc-pins.json').read_text())
base_root=S/'1367-recovery-integrated-candidate/candidate'
variants=[('renewal-consumer',S/'1368-b-witness-prep','SOURCE-PINS-consumer.json'),
          ('additive-consumers',S/'1368-b-witness-prep','SOURCE-PINS-additive.json'),
          ('period-save45-r2',S/'1368-recovery-witness-candidate','SOURCE-PINS-v2.json'),
          ('save45-r3',S/'1368-recovery-witness-candidate','SOURCE-PINS-v3.json')]
reconstruction=[]
for name,owner,pinfile in variants:
 pins=json.loads((owner/pinfile).read_text());changed=[];patch=''
 for path,expected in pins.items():
  if base_pins.get(path)==expected:continue
  assert not path.startswith(('tests/fixtures/','node_modules/'))
  source=owner/'candidate'/path
  if name=='period-save45-r2' and path=='tests/1368-recovery-witness-producer.test.ts':source=owner/'producer-r2.ts'
  data=source.read_bytes();assert sha(data)==expected,(name,path)
  first=first_by_hash.get(expected)
  if first:
   assert sha((FIRST/first['path']).read_bytes())==expected
   changed.append({'path':path,'sha256':expected,'authority':'existing first-verification exact file','existingPublication':str(FIRST/first['path'])})
   continue
  # One delta covers only changed/new source/test/config files; no full gameplay tree.
  prior=b''
  if path in base_pins:
   f=base_root/path;prior=f.read_bytes();assert sha(prior)==base_pins[path]
  patch+='diff --git a/'+path+' b/'+path+'\n'
  if not prior:patch+='new file mode 100644\n'
  patch+=''.join(difflib.unified_diff(prior.decode().splitlines(True),data.decode().splitlines(True),fromfile='a/'+path if prior else '/dev/null',tofile='b/'+path))
  changed.append({'path':path,'sha256':expected,'bytes':len(data),'baseSha256':base_pins.get(path),'authority':'exact small delta in '+name+'.patch','source':str(source)})
 p=D/'reconstruction'/(name+'.patch');p.parent.mkdir(exist_ok=True);p.write_text(patch)
 reconstruction.append({'name':name,'inputPins':str(owner/pinfile),'inputPinsSha256':sha((owner/pinfile).read_bytes()),'base':'fullABC candidate reconstructed by preserved full-abc.patch c6941628c03b4cbf56273d0dbf6a7541b994cdf71da81c1df41302fd31982cf7 against d1e084b65093a940ff2f224941e8cf52ac69a08a','basePinsSha256':sha((S/'1367-recovery-witness-diagnostic-prep/abc-pins.json').read_bytes()),'consumedFiles':len(pins),'unchangedBaseFiles':sum(base_pins.get(n)==h for n,h in pins.items()),'patchSha256':sha(p.read_bytes()),'changedFiles':changed,'application':'Start from ABC; apply this variant delta, then replace the listed exact first-verification file references. Verify every file against inputPins. Variants are alternatives, not patches to stack.'})
# Persist only source-hash provenance; no fixture body was opened other than exact copying authorized new captures.
(D/'RECONSTRUCTION.json').write_text(json.dumps(reconstruction,indent=2)+'\n')
(D/'COPY-RECEIPT.json').write_text(json.dumps({'format':'1368-second-milestone-copies/v1','files':rows,'unchangedFirstVerificationReferences':refs,'firstVerificationManifestSha256':sha((FIRST/'MANIFEST.json').read_bytes())},indent=2)+'\n')
print(json.dumps({'copiedFiles':len(rows),'referencedExisting':len(refs),'bytes':sum(r['bytes'] for r in rows),'reconstructionVariants':len(reconstruction)}))
