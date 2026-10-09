import os,sys,json,stat,hashlib,importlib.util,datetime,collections
from pathlib import Path
assert sys.dont_write_bytecode
S=Path('/Users/zacheryspector/studio-scratch');HERE=Path(__file__).resolve().parent
G=S/'1370-c0-aging-era-witness-r7-parent-guard-preparation-20261008-r2';F=G/'evidence/postflight-r9-20261009-r1';D=S/'1370-c0-aging-era-employment-witness-r9-exact-draft-20261008-r1';O=S/'1370-c0-aging-era-employment-witness-r9-adoption-output-20261008-r1'
def sha(raw):return hashlib.sha256(raw).hexdigest()
def read(p):
 p=Path(p);assert p.resolve(strict=True)==p
 fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  a=os.fstat(fd);assert stat.S_ISREG(a.st_mode)
  with os.fdopen(os.dup(fd),'rb') as f:raw=f.read()
  b=os.fstat(fd);assert (a.st_dev,a.st_ino,a.st_size,a.st_mtime_ns,a.st_ctime_ns)==(b.st_dev,b.st_ino,b.st_size,b.st_mtime_ns,b.st_ctime_ns);return raw
 finally:os.close(fd)
def j(p):return json.loads(read(p))
def pinned(p,h):raw=read(p);assert sha(raw)==h,str(p);return raw
def load(p,h,name):
 pinned(p,h);spec=importlib.util.spec_from_file_location(name,p);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m
pinned(F/'SNAPSHOT.json','555867b2be0abf76728fc8b905c52a73512b5da31d24162d804e7e1b9d8c9347');pinned(F/'PINS.json','3952c8f763bbe30b0cde00123bc89103516157fc4bea30208561c9273bf6a715');pinned(F/'PARENT-TOOL-OUTCOME.json','5edcda79d62db5289a5f15e9bf2c68cf8517e9bada2dd668c93c9ddae8094f67')
snap=j(F/'SNAPSHOT.json');pins=j(F/'PINS.json');tool=j(F/'PARENT-TOOL-OUTCOME.json')
assert snap['status']==pins['status']=='GUARDS_ACCEPTED_READONLY' and snap['phase']=='postflight' and tool['actualToolExit']==0 and tool['actualToolSession']==80695 and tool['explicitActualOwnedPgid'] is None and tool['explicitNumericOwnedGroupClearanceClaim'] is False
for n,h in pins['files'].items():pinned(F/n,h)
base=Path(snap['baseline']['path']);pinned(base,'b087ec768c52328d142433555d8549e4d9e365fe4293810fe4fac5c042281a12')
pre=G/'evidence/postflight-pre-r9-20261009-r1/SNAPSHOT.json';pinned(pre,'9462f60eaa9a6563b90c4e0cfe126d9d5d4dd427b8cf7b1a10eb601562fce5af');assert snap['immutable']==j(base)['immutable']==j(pre)['immutable']
g=load(G/'snapshot.py','ed43cd95fbbc13a2194338a8fe8dd48e05a56b1b77a4cdcb377f60ea17429740','accepted_guard_readonly');pinned(G/'CONFIG.json','7232a61e4115f774d2e21ffd99aea707993de434fd575cc5cf8793d119610e62');config=j(G/'CONFIG.json')
for x in [snap['currentBefore'],snap['currentAfter']]:
 assert x['fdOriginalAndEphemeralPassed'] and x['relevantWorkersAbsent'] and x['oldNumericPidsAbsent'] and x['bootSessionUuid']==config['bootSessionUuid'] and 'AC Power' in x['power'] and x['freeBytes']>=config['requiredFreeBytes'] and x['ownedGroupIdsChecked']==[] and x['ownedGroupClearanceClaim'] is False
assert {k:v for k,v in snap['rootsBefore'].items() if k!='scratchParent'}=={k:v for k,v in snap['rootsAfter'].items() if k!='scratchParent'}==snap['immutable']['strictRoots']
binding=j(config['bindingPath']);pinned(config['bindingPath'],snap['immutable']['bindingSha256']);m=load(Path(binding['materializerPath']),config['materializerSha256'],'accepted_r6_readonly')
assert m.comparable(snap['immutable']['productionDependencies'])==m.comparable(snap['immutable']['copiedDependencies']);m.require_independent_inodes(snap['immutable']['productionDependencies'],snap['immutable']['copiedDependencies'])
counts=dict(collections.Counter(x['type'] for x in snap['immutable']['copiedDependencies'].values()));assert counts=={'regular':11060,'directory':1401,'symlink':24}
physical=snap['immutable']['physicalCheckout'];assert len(physical)==176 and sum(x['bytes'] for x in physical.values())==4803106
for row in snap['immutable']['strictRoots'].values():assert g.directory_identity(row['path'])==row
for name,rows in snap['immutable']['ancestry'].items():assert g.ancestry(rows[-1]['path'])==rows
w=j(D/'BINDING-DRAFT.json');pinned(D/'BINDING-DRAFT.json','5e1c3010c5369423cadb4cf46c1efc8b445890e52ed42ebb934d88e92834fba1');report=j(D/'DRAFT-REPORT.json');launch=j(O/'ADOPTED-LAUNCH-SPEC.json');pinned(O/'ADOPTED-LAUNCH-SPEC.json','b9dcfb46d2c9cbd465e028a2835a42ff0d01c7e0897e608fff45032543e2ffbe')
for role in launch['roles'].values():pinned(role['path'],role['sha256'])
source=Path(launch['roles']['witnessSourcePins']['path']).parent;sp=j(source/'SOURCE-PINS.json')
for n,pin in sp['files'].items():raw=pinned(source/n,pin['sha256']);assert len(raw)==pin['bytes']
for rel,record in report['actualFiles'].items():
 p=Path(w['repoRoot'])/rel;raw=pinned(p,record['sha256']);st=p.lstat();assert (st.st_dev,st.st_ino,format(stat.S_IMODE(st.st_mode),'04o'),st.st_nlink,len(raw))==(record['device'],record['inode'],record['mode'],record['links'],record['bytes'])
v=load(source/'supervise.py',w['observerSha256']['supervise.py'],'accepted_r9_inner_validators');outer=load(source/'outer-recorder.py',w['observerSha256']['outer-recorder.py'],'accepted_r9_outer_validators');v.validate_source_review(w,source);v.validate_bounds_roles(w);null=v.validate_null_device()
facts=j(HERE/'FRAME-FACTS-PENDING.json');pinned(O/'PARENT-TOOL-OUTCOME.json',facts['parentActualToolReceiptSha256']);actual=j(O/'PARENT-TOOL-OUTCOME.json');assert actual['actualToolExit']==actual['helperMetaExit']==actual['pipeline']['outerExit']==actual['pipeline']['sinkExit']==0
frame=pinned(facts['framePath'],facts['frameSha256']);v.validate_frame(frame,w);outer.validate_outer_frame(frame)
lane_path=Path(launch['argv'][3]);lane=pinned(lane_path,facts['laneSha256']);pinned(str(lane_path)+'.meta',facts['metaSha256']);lines=lane.splitlines(keepends=True);assert len(lines)==2 and lines[0]==frame and json.loads(lines[1])==actual['pipeline']
# Bounded current checks: accepted function performs no inventories or launch.
current=g.current(config,binding,m,Path(config['copiedRoot']),[66578,64755,94462]);current.pop('psRaw');current.pop('lsofRaw')
ps=g.command(['/bin/ps','-axo','comm=,args=']).stdout
markers=(str(source/'supervise.py'),str(source/'outer-recorder.py'),str(D/'BINDING-DRAFT.json'),launch['roles']['pipeAdapter']['path'],launch['roles']['boundedSink']['path'],'fixture_worker.py','witness.mts','vitest','/bin/tsc','/lib/tsc.js')
assert not any(any(marker in line for marker in markers) for line in ps.decode().splitlines())
current.update(exactR9ProcessMarkersAbsent=True,additionalProcessSha256=sha(ps),additionalProcessBytes=len(ps),actualR9Pgid=None,externalNumericR9GroupProbeClaim=False)
for row in snap['immutable']['strictRoots'].values():assert g.directory_identity(row['path'])==row
out={'status':'OBSERVED_FRAME_AND_FULL_POSTFLIGHT_ACCEPTED','utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'current':current,'fullPostflightSha256':pins['files']['SNAPSHOT.json'],'fullPostflightImmutableEqualsOriginalAndImmediatePreRun':True,'fullInventoryRepeated':False,'fullDependencyTypes':counts,'physicalFiles':len(physical),'physicalBytes':4803106,'actualFileReadbackCount':len(report['actualFiles']),'sourceFilePinsChecked':len(sp['files']),'nullDevice':null,'actualSuccessPathCleanupWarrant':facts['ownedGroupClearanceWarrant'],'externalNumericOwnedPgid':None,'externalNumericOwnedGroupCheckClaimed':False}
g.dump(HERE/'POSTFLIGHT-FACTS.json',out);print(json.dumps(out,sort_keys=True))
