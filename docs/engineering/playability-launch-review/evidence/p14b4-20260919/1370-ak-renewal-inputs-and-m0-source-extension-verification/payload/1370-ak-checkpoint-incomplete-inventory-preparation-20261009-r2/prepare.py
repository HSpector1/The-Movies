from pathlib import Path
import hashlib,json,os,stat,datetime
S=Path('/Users/zacheryspector/studio-scratch');previous_dir=S/'1370-ak-checkpoint-incomplete-inventory-preparation-20261009-r1';P=Path(__file__).parent;REPO=Path('/Users/zacheryspector/The-Movies-headless-program')
AJ=REPO/'docs/engineering/playability-launch-review/evidence/p14b4-20260919/1370-aj-initial-salary-attribution-and-shared-workload-accounting/ARCHIVE-MANIFEST.json'
def sha(b):return hashlib.sha256(b).hexdigest()
def put(n,x):(P/n).write_text(x if isinstance(x,str) else json.dumps(x,indent=2,sort_keys=True)+'\n')
def info(path):
 a=path.lstat();assert path.resolve(strict=True)==path and stat.S_ISREG(a.st_mode) and a.st_nlink==1,path
 fd=os.open(path,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  parts=[]
  while True:
   chunk=os.read(fd,65536)
   if not chunk:break
   parts.append(chunk)
  b=b''.join(parts);sig=lambda x:(x.st_dev,x.st_ino,x.st_mode,x.st_nlink,x.st_size,x.st_mtime_ns,x.st_ctime_ns)
  assert len(b)==a.st_size and sig(os.fstat(fd))==sig(a)==sig(path.lstat()),path
 finally:os.close(fd)
 return b,{'bytes':len(b),'sha256':sha(b),'mode':format(stat.S_IMODE(a.st_mode),'04o'),'nlink':a.st_nlink}
ajraw=AJ.read_bytes();assert sha(ajraw)=='93b4acabfdd26a222266c350b87ed50f4751d5d9f5d08c654db3f16b19003133';aj=json.loads(ajraw);old={x['sourcePath']:x for x in aj['files']}
selected='''1370-c0-renewal208-premium-floor-source-obligations-after-aj-20261009-r1
1370-c0-renewal208-premium-floor-independent-review-after-aj-20261009-r1
1370-c0-renewal208-premium-floor-source-obligations-after-aj-20261009-r2
1370-c0-renewal208-premium-floor-independent-review-after-aj-20261009-r2
1370-c0-renewal208-premium-floor-parent-adoption-after-aj-20261009-r1
1370-c0-renewal208-r03-2-first-draw-after-aj-proposal-20261009-r1
1370-c0-renewal208-r03-2-first-draw-independent-source-review-after-aj-20261009-r1
1370-c0-renewal208-r03-2-first-draw-wrapper-independent-source-review-after-aj-20261009-r1
1370-c0-renewal208-r03-2-first-draw-parent-recorded-after-aj-20261009-r1
1370-c0-renewal208-r03-2-first-draw-after-aj-controls-output-20261009-r1
1370-c0-renewal208-r03-2-first-draw-after-aj-controls-lane-20261009-r1
1370-c0-renewal208-r03-2-first-draw-controls-independent-observed-review-after-aj-20261009-r1
1370-c0-renewal208-r03-2-first-draw-after-aj-witness-output-20261009-r1
1370-c0-renewal208-r03-2-first-draw-after-aj-witness-lane-20261009-r1
1370-c0-renewal208-r03-2-first-draw-witness-independent-observed-review-after-aj-20261009-r1
1370-c0-aging-era-settlement208-observer-after-aj-proposal-20261009-r1
1370-c0-aging-era-settlement208-observer-independent-source-review-after-aj-20261009-r1
1370-c0-renewal208-pure16-pricing-verifier-proposal-after-aj-20261009-r1
1370-c0-renewal208-pure16-pricing-verifier-independent-source-review-after-aj-20261009-r1
1370-c0-renewal208-pure16-pricing-verifier-proposal-after-aj-20261009-r2
1370-c0-renewal208-pure16-pricing-verifier-repair-preparation-after-aj-20261009-r1
1370-c0-renewal208-pure16-pricing-verifier-root-source-review-after-aj-20261009-r2
1370-c0-m0-current-aj-scope-parent-adoption-after-aj-20261009-r1
1370-c0-m0-additive-operational-full-guard-after-aj-proposal-20261009-r1
1370-c0-m0-additive-operational-full-guard-after-aj-proposal-20261009-r2
1370-c0-m0-additive-full-guard-root-source-review-after-aj-20261009-r1
1370-c0-m0-additive-full-guard-parent-recorded-after-aj-20261009-r1
1370-c0-m0-additive-full-guard-exact-setup-repair-independent-review-after-aj-20261009-r1
1370-c0-m0-additive-full-guard-parent-recorded-after-aj-20261009-r2
1370-c0-m0-additive-full-guard-observed-independent-review-after-aj-20261009-r1
1370-c0-m0-additive-recorded-route-proposal-20261009-r3
1370-c0-m0-additive-recorded-current-aj-independent-source-review-20261009-r3
1370-c0-m0-additive-recorded-route-proposal-20261009-r4
1370-c0-m0-additive-recorded-route-independent-source-review-after-aj-20261009-r4
1370-c0-m0-additive-exact-fill-mapping-after-aj-20261009-r1
1370-c0-a208-finite-recorded-controls-route-proposal-after-aj-20261009-r1
1370-c0-a208-finite-recorded-controls-route-independent-source-review-after-aj-20261009-r1
1370-c0-a208-finite-recorded-controls-route-proposal-after-aj-20261009-r2
1370-c0-a208-finite-recorded-controls-route-independent-source-review-after-aj-20261009-r2
1370-aj-checkpoint-root-finalization-20261009-r1
1370-aj-checkpoint-claims-independent-review-20261009-r1
1370-c0-m0-additive-recorded-controls-proposal-20261009-r2
1370-c0-m0-additive-recorded-independent-source-review-20261009-r2
1370-c0-m0-additive-controls-exact-independent-review-20261009-r2
1370-c0-m0-additive-controls-observed-independent-review-20261009-r2
1370-c0-m0-additive-controls-parent-recorded-20261009-r2'''.splitlines()
selected += ['1370-c0-m0-additive-afterfill-grant-preparation-after-aj-20261009-r1', '1370-c0-m0-additive-afterfill-exact-argv-independent-review-after-aj-20261009-r1', '1370-c0-m0-additive-exact-guard-core-fill-preparation-after-aj-20261009-r1', '1370-c0-m0-additive-exact-guard-core-candidate-after-aj-20261009-r1', '1370-c0-m0-additive-guard-core-independent-source-review-after-aj-20261009-r1', '1370-c0-m0-additive-preflight-independent-observed-review-after-aj-20261009-r1', '1370-c0-m0-additive-exact-final-candidate-after-aj-20261009-r1', '1370-c0-m0-additive-final-exact-independent-review-after-aj-20261009-r1', '1370-c0-m0-additive-exact-parent-adoption-after-aj-20261009-r1', '1370-c0-m0-additive-adopted-preflight-independent-review-after-aj-20261009-r1', '1370-c0-m0-additive-recorded-output-20261009-r2', '1370-c0-m0-additive-recorded-independent-observed-review-after-aj-20261009-r1', '1370-c0-m0-additive-expanded-readback-verifier-proposal-after-aj-20261009-r1', '1370-c0-m0-additive-expanded-readback-preparation-after-aj-20261009-r1', '1370-c0-m0-additive-expanded-readback-verifier-independent-source-review-after-aj-20261009-r1', '1370-c0-m0-additive-expanded-readback-verifier-filled-proposal-after-aj-20261009-r2', '1370-c0-m0-additive-expanded-readback-filled-independent-review-after-aj-20261009-r2', '1370-c0-a208-controls-prospective-parent-scope-after-aj-20261009-r1', '1370-c0-a208-controls-exact-fill-recipe-after-aj-20261009-r1', '1370-c0-a208-finite-recorded-controls-filled-source-after-aj-20261009-r1', '1370-c0-a208-finite-recorded-controls-filled-independent-source-review-after-aj-20261009-r1', '1370-c0-a208-parent-control-wrapper-independent-source-review-after-aj-20261009-r1', '1370-c0-a208-controls-node22-operational-amendment-proposal-after-aj-20261009-r1']
selected += ['1370-c0-m0-additive-exact-pre-adoption-archive-after-aj-20261009-r1', '1370-c0-m0-additive-postflight-grant-preparation-after-aj-20261009-r1', '1370-c0-m0-additive-postflight-wrapper-independent-source-review-after-aj-20261009-r1', '1370-c0-a208-original-controls-runtime-qualification-addendum-after-aj-20261009-r1', '1370-c0-a208-minimal-exact-launch-input-map-after-aj-20261009-r1']
paths=[];summaries=[];empty=[]
for name in selected:
 root=S/name;assert root.is_dir(),root
 files=sorted(x for x in root.iterdir() if x.is_file())
 for f in files:paths.append((name,f.name,f))
 summaries.append({'name':name,'selectedFlatFiles':len(files),'nestedPolicy':'No recursion into unrelated fixtures/private roots; only explicit sealed before-fill directory selected separately.'})
 if not files:empty.append(name)
# Only sealed actual before-fill snapshot; never traverse ongoing evidence siblings.
root=S/'1370-c0-m0-additive-operational-full-guard-after-aj-proposal-20261009-r2/evidence/before-fill-after-aj-r3'
for f in sorted(root.iterdir()):
 assert f.is_file();paths.append((root.parents[1].name,'evidence/before-fill-after-aj-r3/'+f.name,f))
standalone=['1370-ak-fill-final-candidate.py','1370-ak-adopt-final-candidate.py','1370-ak-grant-additive.py','1370-ak-grant-a208-controls.py','1370-ak-grant-readback.py','m0-additive-input-20261009-r2.lane.log','m0-additive-input-20261009-r2.lane.log.meta','1370-c0-pure16-r2-root-review.py','1370-c0-pure16-r2-root-review-STOP.json','1370-c0-pure16-r2-root-review-r2.py','author-m0-fullguard-adapter-20261009-r1.py','review_a208_route_source_neutral.py','1370-ak-root-lessons-after-aj-20261009-r1.md']
for name in standalone:
 f=S/name;assert f.is_file();paths.append(('standalone-after-aj',name,f))
paths.append((P.name,'prepare.py',P/'prepare.py'));paths.append((previous_dir.name,'AUTHORING-STOP.json',previous_dir/'AUTHORING-STOP.json'))
sealed=S/'1370-c0-m0-additive-operational-full-guard-after-aj-proposal-20261009-r2/evidence/after-fill-after-aj-r2'
for f in sorted(sealed.iterdir()):
 assert f.is_file();paths.append((sealed.parents[1].name,'evidence/after-fill-after-aj-r2/'+f.name,f))
originals=S/'1370-c0-m0-additive-expanded-readback-preparation-after-aj-20261009-r1/PREFINAL-SOURCE-PACKAGE'
for f in sorted(originals.iterdir()):
 assert f.is_file();paths.append((originals.parent.name,'PREFINAL-SOURCE-PACKAGE/'+f.name,f))
paths.append((P.name,'PREPARATION-STOP.json',P/'PREPARATION-STOP.json'))
archive=S/'1370-c0-m0-additive-exact-pre-adoption-archive-after-aj-20261009-r1/ARCHIVE-MANIFEST.json'
assert sha(archive.read_bytes())=='d93b83ce358c59c4ce44b9af262d0fb72c7e17e606f3433b843089c2de37b041'
for item in json.loads(archive.read_bytes())['files'].values():
 assert info(Path(item['archive']['path']))[1]['sha256']==item['archive']['sha256']
rows=[];prior=[];seen=set()
for package,rel,path in paths:
 if str(path) in seen:continue
 seen.add(str(path));raw,fields=info(path)
 archived=old.get(str(path))
 if archived and all(fields[x]==archived[x] for x in ['bytes','sha256','mode','nlink']):
  prior.append({'sourcePath':str(path),'sha256':fields['sha256'],'priorAJManifestEntry':archived,'action':'ALREADY_ARCHIVED_AJ_EXACT_ROLE_TRANSPORT_ONLY'});continue
 local=path.name in ['BEFORE-PS.txt','AFTER-PS.txt','BEFORE-LSOF.bin','AFTER-LSOF.bin']
 rows.append({**fields,'sourcePath':str(path),'package':package,'relativePath':rel,'preservationAction':'LOCAL_HASH_SIZE_ONLY' if local else 'COPY_FINITE_PAYLOAD','priorGitBlob':None if local else 'NOT_QUERIED_NO_GIT_OPERATIONS','reason':'Raw machine PS/FD stays local; bytes never copied' if local else 'Explicit finite after-AJ source/review/refine/failure/grant/actual evidence; original bytes preserved'})
pending=[{'role':'Root final checkpoint additions','status':'PENDING_FINAL_SCOPE_AND_CLAIMS'},{'role':'M0 physical expanded readback and full protected postflight','status':'PENDING_ACTUAL_AND_INDEPENDENT_ADOPTION'},{'role':'Node22 amendment derivative and actual A208 controls','status':'PENDING_REVIEW_ADOPTION_DERIVATIVE_GRANTS_AND_ACTUAL'},{'role':'A208 observer actual and pure16 observedinput/fill/run','status':'PENDING_A208_UNFILLED'}]
inv={'schema':'1370-ai-finite-checkpoint-inventory-r1','status':'INCOMPLETE_AFTER_AJ_PREPARATION_ONLY','utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'predecessor':{'head':'f0fb818fe7534c3e3784206d16728b015c7f059a','manifestPath':str(AJ),'manifestSha256':sha(ajraw)},'finalizerSourceRole':dict(sourcePath=str(S/'1370-ai-archive-finalization-source-20261009-r1/finalize_archive.py'),**info(S/'1370-ai-archive-finalization-source-20261009-r1/finalize_archive.py')[1]),'scopeLimit':'Bookkeeping only: exact finite explicitly selected files; no protected/Git mutation, scanner/runtime/source import, new archive/copy/finalization. Only sealed before-fill evidence directory traversed. Closed current candidate/afterfill/runtime retained; physicalreadback/postflight/Node22 future remains deferred.','selectedDirectoryNames':selected,'selectedDirectorySummaries':summaries,'files':rows,'priorArchiveRoleTransport':prior,'emptyActualTinyFixtureDirectoryRoles':empty,'pendingAdditions':pending,'semanticRoleWarnings':['Source-only accepted/held candidates and actual observations retain distinct roles. No runtime authority inferred.','Original r1/refine/setup failure and consumed pins remain preserved alongside fresh repairs.','AJ root final publication/inventory/readback/adoption roles not in AJ archive are selected; already archived source-identical roles transported only.','Machine-wide raw PS/FD is LOCAL_HASH_SIZE_ONLY. Future finalizer must not copy raw bytes or claim Git reuse.','Source Git blob mappings are predecessor manifest references only; no new Git query/readback was performed.','Inventory incomplete: qualified finalizer must refuse it.'],'summary':{'completeInventory':False,'closedWorkArtifactCoverageComplete':False,'regularFiniteFiles':len(rows),'selectedFiniteDirectories':len(selected),'payloadFiles':sum(x['preservationAction']=='COPY_FINITE_PAYLOAD' for x in rows),'payloadBytes':sum(x['bytes'] for x in rows if x['preservationAction']=='COPY_FINITE_PAYLOAD'),'localHashSizeOnlyFiles':sum(x['preservationAction']=='LOCAL_HASH_SIZE_ONLY' for x in rows),'localHashSizeOnlyBytes':sum(x['bytes'] for x in rows if x['preservationAction']=='LOCAL_HASH_SIZE_ONLY'),'alreadyArchivedAJExactRolesTransported':len(prior),'pendingAdditions':len(pending)},'rootFinalization':None}
inv['previousIncompleteDraft']={'path':str(previous_dir/'INVENTORY-DRAFT.json'),'sha256':sha((previous_dir/'INVENTORY-DRAFT.json').read_bytes())};inv['semanticRoleWarnings'].append('Final candidate current BINDING-DRAFT SHA35e596 is adopted; original PINS names prior binding. Original six files/afb binding preserved in explicit pre-adoption archive authenticated ARCHIVE-MANIFEST; never pair old PINS with current binding35e bytes.');put('INVENTORY-DRAFT.json',inv);put('PLAN.md','''Incomplete after-AJ inventory; do not finalize or stage. Root finishes pending candidate/afterfill/actual scopes and independently reconciles scope/claims before setting completeInventory true and removing pendingAdditions. Reuse qualified finalizer only then, with exact hash/HEAD/new target/root claim.

Files list exact finite after-AJ bytes and metadata. Prior AJ manifest entries are retained separately for already archived roles; no new Git authentication claimed. Source-identical prior Git reuse is finalizer work. Eight raw machine captures stay LOCAL_HASH_SIZE_ONLY; raw bytes remain local. Original setup/report/refine failures and all later repairs remain distinct.

Closed M0 candidate/afterfill/runtime outputs and archived originals are selected explicitly; actual physical readback and protected postflight remain pending. Future A208 actual controls/observation and pure16 input/fill/runtime remain pending. No source/runtime authority, cause closure or experimental success is inferred from this bookkeeping.
''');put('PINS.json',{'status':'INCOMPLETE_UNFINALIZED','files':{n:sha((P/n).read_bytes()) for n in ['prepare.py','PREPARATION-STOP.json','INVENTORY-DRAFT.json','PLAN.md']}})
print(json.dumps({'inventoryPath':str(P/'INVENTORY-DRAFT.json'),'inventorySha256':sha((P/'INVENTORY-DRAFT.json').read_bytes()),'summary':inv['summary']}))
