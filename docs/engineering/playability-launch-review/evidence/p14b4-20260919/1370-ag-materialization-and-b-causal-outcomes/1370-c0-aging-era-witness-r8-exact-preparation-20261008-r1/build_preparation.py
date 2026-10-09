"""Scratch-only authoring from accepted r7 preparation; no proposed procedure execution."""
import pathlib,json,hashlib,os,ast,difflib
S=pathlib.Path('/Users/zacheryspector/studio-scratch');OLD=S/'1370-c0-aging-era-witness-r7-exact-preparation-20261008-r2';P=pathlib.Path(__file__).parent
SRC=S/'1370-c0-aging-era-employment-witness-source-r8-diagnostic-proposal-20261008-r1';CONTROLS=S/'1370-c0-aging-era-employment-witness-r8-diagnostic-controls-preparation-20261008-r1'
SOURCE_SHA='0d8e9d26fecfdf4765267b9e4a2708418870551a0a80b96abfaadc5290375715'
def sha(b):return hashlib.sha256(b).hexdigest()
def put(p,b):
 fd=os.open(p,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o644)
 with os.fdopen(fd,'wb') as f:os.fchmod(f.fileno(),0o644);f.write(b);f.flush();os.fsync(f.fileno())
def enc(v):return (json.dumps(v,sort_keys=True,indent=2)+'\n').encode()
oldpinsraw=(OLD/'PREPARATION-PINS.json').read_bytes();assert sha(oldpinsraw)=='bd5ed8745b5ebcbdc33f4b90230cfe983456f09eaf8c8b03114c95507cf89bd0'
for n,h in json.loads(oldpinsraw)['files'].items():assert sha((OLD/n).read_bytes())==h
srcpins=json.loads((SRC/'SOURCE-PINS.json').read_text());assert sha((SRC/'SOURCE-PINS.json').read_bytes())==SOURCE_SHA
old_source=S/'1370-c0-aging-era-employment-witness-source-r7'
newdraft=S/'1370-c0-aging-era-employment-witness-r8-exact-draft-20261008-r1'
replacements={
 str(old_source):str(SRC),
 str(S/'1370-c0-aging-era-employment-witness-r7-exact-draft-20261008-r2'):str(newdraft),
 str(S/'1370-c0-aging-era-employment-witness-r7-pre-adoption-archive-20261008-r2'):str(S/'1370-c0-aging-era-employment-witness-r8-pre-adoption-archive-20261008-r1'),
 str(S/'1370-c0-aging-era-employment-witness-r7-adoption-output-20261008-r2'):str(S/'1370-c0-aging-era-employment-witness-r8-adoption-output-20261008-r1'),
 str(S/'1370-c0-aging-era-employment-witness-r7-lane-20261008-r2'):str(S/'1370-c0-aging-era-employment-witness-r8-lane-20261008-r1'),
 'witness-r7.lane.log':'witness-r8.lane.log',
 '69ca5043bb533908f722126fbc93fd59ce84f0d7388180f3b60c5074076aebc2':SOURCE_SHA,
 str(S/'1370-c0-aging-era-witness-r7-readiness-20261008-r1/launch-pipeline.sh'):str(CONTROLS/'launch-pipeline-r8-proposed.sh'),
 '38f8bddc4aef317b4e83fe6e19e547b338bd3cd4fe0d86856f6a11e2b03fda50':'38afc47e8bcb834df333f2834fdf4a6f5bd3f3826d96c8fce02a9c72d164a16f',
 str(S/'1370-c0-aging-era-witness-r7-readiness-20261008-r1/bounded-sink.py'):str(CONTROLS/'bounded-sink-r8-proposed.py'),
 '6a7a91d482ddaf80c8ecb6fd0d1912da7add50917102178845a6fa37db675b9e':'0d9a5bf7e187e141bccc20a1b65740bedd3a67a926b6c7eb873f3df74c78982a',
 '1370-witness-r7-':'1370-witness-r8-',
 '1370-r7-':'1370-r8-',
}
def replace(t):
 for a,b in replacements.items():t=t.replace(a,b)
 return t
config=json.loads(replace((OLD/'CONFIG-PENDING.json').read_text()))
config['schema']='1370-witness-r8-exact-preparation-config-r1';config['status']='ACCEPTED_SOURCE_PENDING_EXACT_FILL_UNRUN'
config['roles']['adapterSourceControlsReceipt']=json.loads((OLD/'CONFIG-PENDING.json').read_text())['roles']['adapterSourceControlsReceipt']
config['roles']['witnessSourceReview']={'path':str(S/'1370-c0-aging-era-employment-witness-independent-static-review-r8/RECEIPT.json'),'sha256':'0df56d411ea22b65e3407b27abe161481acaa06ca4cc7dede11656faa41e8da0','mode':'0600'}
config['acceptedFrozenPostflight']={'path':str(S/'1370-c0-aging-era-witness-r7-parent-guard-preparation-20261008-r2/evidence/postflight-r1/SNAPSHOT.json'),'sha256':'6a1d17ea0ff855fe66fba0f6ce73eb3b2b51730b8ad97c10b8e3d335b167bc69','baselinePath':str(S/'1370-c0-aging-era-witness-r7-parent-guard-preparation-20261008-r2/evidence/before-fill-r1/SNAPSHOT.json'),'baselineSha256':'b087ec768c52328d142433555d8549e4d9e365fe4293810fe4fac5c042281a12'}
config['scope']={'productionFrozen':True,'noDetach':True,'noExternalProtectedRenamer':True,'declaredScratchOnlySinceFullPostflight':True,'fullInventoryReuse':'Parent authorized frozen postflight reuse; fresh exact files/roles/current roots/FD/worker/ref/AC/disk gates remain required.'}
binding=json.loads(replace((OLD/'BINDING-TEMPLATE-PENDING.json').read_text()))
binding['independentSourceReviewReceipt']={k:config['roles']['witnessSourceReview'][k] for k in ('path','sha256')}
binding['observerSha256']={n:srcpins['files'][n]['sha256'] for n in binding['observerSha256']}
bindingraw=enc(binding);put(P/'BINDING-TEMPLATE-PENDING.json',bindingraw);config['bindingTemplateSha256']=sha(bindingraw)
launch=json.loads(replace((OLD/'LAUNCH-SPEC-TEMPLATE.json').read_text()));launch['roles']=config['roles'];launch['claimLimit']='Unrun r8 diagnostic template only. No copied-root read or fill. Original bounds and success protocol remain; bounded failure diagnostics only. Source/wiring review and independent exact review/adoption/preflight remain required.'
launchraw=enc(launch);put(P/'LAUNCH-SPEC-TEMPLATE.json',launchraw);config['launchTemplateSha256']=sha(launchraw)
configraw=enc(config);put(P/'CONFIG-PENDING.json',configraw);configsha=sha(configraw)
gate='''
def source_review_gate(config,path,approved_sha):
 role_path=Path(path);require(role_path.is_absolute() and not str(role_path).startswith(config['materializedRoot']+os.sep),'new source review must be outside copied root')
 require(str(role_path)==config['roles']['witnessSourceReview']['path'] and approved_sha==config['roles']['witnessSourceReview']['sha256'],'configured accepted new source review role')
 raw,_=read(role_path);require(sha(raw)==approved_sha,'parent-approved new source review bytes');r=json.loads(raw)
 pinsraw,_=read(SOURCE/'SOURCE-PINS.json');require(sha(pinsraw)=='SOURCE_SHA_TOKEN','new source pins');pins=json.loads(pinsraw)
 require(r.get('schema')=='1370-c0-aging-era-employment-witness-independent-static-review-r8' and r.get('status')=='FROZEN_SOURCE_ONLY_UNRUN' and r.get('sourceDirectory')==str(SOURCE) and r.get('sourcePinsSha256')==sha(pinsraw) and r.get('sourceSha')=='3aaf55e0c06c4b745b0b722cc56913050b1ee229','new source review exact role')
 require(r.get('decision',{}).get('witnessSource')=='ACCEPT_SOURCE_ONLY_UNRUN' and r.get('decision',{}).get('launch')=='STOP_UNFILLED_UNRUN' and r.get('frozenHashes')=={n:p['sha256'] for n,p in pins['files'].items()},'new source-only acceptance and frozen hashes')
 require(r.get('adapterSha256')==config['roles']['pipeAdapter']['sha256'] and r.get('sinkSha256')==config['roles']['boundedSink']['sha256'],'new exact source-version adapter/sink wiring review')
 return {'path':str(role_path),'sha256':approved_sha,'mode':config['roles']['witnessSourceReview']['mode']}

def frozen_postflight_gate(config):
 p=config['acceptedFrozenPostflight'];raw,_=read(p['path']);require(sha(raw)==p['sha256'],'frozen full postflight bytes');snap=json.loads(raw)
 base_raw,_=read(p['baselinePath']);require(sha(base_raw)==p['baselineSha256'],'full baseline bytes');base=json.loads(base_raw)
 require(snap['status']=='GUARDS_ACCEPTED_READONLY' and snap['phase']=='postflight' and snap['immutable']==base['immutable'],'accepted full postflight immutable equality')
 require(all(config['scope'][k] is True for k in ('productionFrozen','noDetach','noExternalProtectedRenamer','declaredScratchOnlySinceFullPostflight')),'parent frozen reuse scope')
 for r in snap['immutable']['strictRoots'].values():
  path=Path(r['path']);require(path.resolve(strict=True)==path and path.is_dir() and not path.is_symlink(),'current physical root');st=path.lstat()
  require((st.st_dev,st.st_ino,stat.S_IMODE(st.st_mode),st.st_mtime_ns,st.st_ctime_ns)==(r['device'],r['inode'],r['mode'],r['mtimeNs'],r['ctimeNs']),'current strict root metadata drift '+str(path))

'''.replace('SOURCE_SHA_TOKEN',SOURCE_SHA)
fill=replace((OLD/'fill_actual_candidate.py').read_text()).replace("CONFIG_SHA='4b6bf16518e9ab7c472c9147376a9a9ed5ca15f79f0dc656af8175abd85a6bf5'","CONFIG_SHA="+repr(configsha))
fill=fill.replace('def main():',gate+'def main():',1)
fill=fill.replace("require(len(sys.argv)==4,'need approved observed receipt path/hash/decision')","require(len(sys.argv)==6,'need approved observed copy receipt path/hash/decision and new source review path/hash')")
needle="require(receipt.get('executionAuthorization') is not True,'observed receipt is not witness launch authority')"
assert needle in fill;fill=fill.replace(needle,needle+"\n config['roles']['witnessSourceReview']=source_review_gate(config,sys.argv[4],sys.argv[5])\n frozen_postflight_gate(config)")
needle="exactReview=None,repoRoot=str(root))";assert needle in fill;fill=fill.replace(needle,"exactReview=None,repoRoot=str(root),independentSourceReviewReceipt={k:config['roles']['witnessSourceReview'][k] for k in ('path','sha256')})")
fill=fill.replace("requiredEnvironment=report['launchEnvironment'])","requiredEnvironment=report['launchEnvironment'],roles=config['roles'])")
needle="module.assert_no_protected_writable_fds(materializer)";assert needle in fill;fill=fill.replace(needle,needle+";module.assert_no_protected_writable_fds(dict(materializer,productionRoot=str(root),commonGitRoot=str(root/'.git')))")
adopt=replace((OLD/'adopt_reviewed_candidate.py').read_text()).replace("CONFIG_SHA='4b6bf16518e9ab7c472c9147376a9a9ed5ca15f79f0dc656af8175abd85a6bf5'","CONFIG_SHA="+repr(configsha))
adopt=adopt.replace("SCRATCH=Path('/Users/zacheryspector/studio-scratch')","SCRATCH=Path('/Users/zacheryspector/studio-scratch')\nSOURCE=Path("+repr(str(SRC))+")",1)
adopt=adopt.replace('def main():',gate+'def main():',1)
needle="report=json.loads(originals['DRAFT-REPORT.json']);admission=report['materializationReceipt'];";assert needle in adopt
adopt=adopt.replace(needle,"report=json.loads(originals['DRAFT-REPORT.json']);src_review=report['sourceReviewReceipt'];config['roles']['witnessSourceReview']=source_review_gate(config,src_review['path'],src_review['sha256']);require(profile['independentSourceReviewReceipt']==src_review and report['roles']==config['roles'],'new filled source/wiring role drift');admission=report['materializationReceipt'];")
needle="require(profile['repoRoot']==str(root) and root.resolve(strict=True)==root and root.is_dir(),'completed physical root')";assert needle in adopt;adopt=adopt.replace(needle,needle+'\n frozen_postflight_gate(config)')
needle="module.assert_no_protected_writable_fds(m)";assert needle in adopt;adopt=adopt.replace(needle,needle+";module.assert_no_protected_writable_fds(dict(m,productionRoot=str(root),commonGitRoot=str(root/'.git')))")
for name,text in [('fill_actual_candidate.py',fill),('adopt_reviewed_candidate.py',adopt)]:ast.parse(text,filename=str(P/name));put(P/name,text.encode())
diff=''
for name in ('fill_actual_candidate.py','adopt_reviewed_candidate.py'):
 diff+=''.join(difflib.unified_diff((OLD/name).read_text().splitlines(True),(P/name).read_text().splitlines(True),fromfile='accepted-r7/'+name,tofile='prepared-r8/'+name))
put(P/'PROCEDURE-DIFF.patch',diff.encode())
print(json.dumps({'status':'AUTHORING_ONLY_UNRUN','configSha256':configsha,'fillProcedureSha256':sha(fill.encode()),'adoptionProcedureSha256':sha(adopt.encode()),'candidatePath':str(newdraft),'sourceReviewAccepted':False,'fillRun':False}))
